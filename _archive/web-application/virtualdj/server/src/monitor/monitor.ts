import type { Config } from '../config.js';
import { createLogger } from '../logger.js';
import { toMessage, type Emit } from '../messages.js';
import type {
   AutomixPayload,
   ClockEventReason,
   ClockPayload,
   ClockReason,
   MixEstimate,
   ServerMessage,
   StatusPayload,
} from '../protocol.js';
import { errorMessage } from '../util.js';
import { EMPTY_AUTOMIX, readAutomix } from '../vdj/automix.js';
import type { VdjClient } from '../vdj/client.js';
import { num } from '../vdj/script.js';
import {
   MAX_LEAD_SEC,
   MAX_TAIL_SEC,
   MAX_UNCONFIRMED,
   SEEK_CONFIRM_SEC,
   classify,
   isOn,
   median,
   project,
   trackIndexOf,
   type ClockAnchor,
} from './clock-math.js';

export interface MonitorDeps {
   vdj: VdjClient;
   config: Config;
   emit: Emit;
}

export interface Monitor {
   start(): void;
   stop(): void;
   pollOnce(): Promise<void>;
   /** What a newly connected browser needs to catch up. */
   snapshot(): ServerMessage[];
   getAutomix(): AutomixPayload;
}

/** Raw values of one poll. */
interface Sample {
   at: number;
   elapsed: number;
   duration: number;
   title: string;
   playing: boolean;
   count: number;
   position: number;
}

interface Overlap {
   lead: number;
   tail: number;
}

/**
 * Watches VirtualDJ and calls emit(type, payload) ONLY when something changes:
 *   'status'  { connected, error, fps }
 *   'automix' { count, position, songs }
 *   'clock'   { reason, trackIndex, title, elapsed, duration, playing, mix }   <- anchor for the browser timer
 */
export function createMonitor({ vdj, config, emit }: MonitorDeps): Monitor {
   const scripts = config.scripts;
   const log = createLogger('monitor', config.debug);

   let status: StatusPayload = { connected: false, error: null, fps: config.fps };
   let automix: AutomixPayload = EMPTY_AUTOMIX;
   let anchor: ClockAnchor | null = null; // last clock state we sent; null = (re)connect pending
   let pendingSeek: ClockAnchor | null = null; // a deviating reading waiting for a second reading to confirm it
   let pendingCount = 0; // consecutive polls that deviated from the clock
   let failures = 0; // consecutive failed polls
   let listError: string | null = null;
   let listDirty = false;
   let listRetryAt = 0;
   let refreshing = false;
   let lastListAt = 0;
   let running = false;
   let timer: ReturnType<typeof setTimeout> | undefined;
   const overlaps: Overlap[] = []; // measured lead/tail of recent song changes

   // ---------- Automix overlap ----------
   const mixEstimate = (): MixEstimate =>
      overlaps.length
         ? { leadSec: median(overlaps.map((o) => o.lead)), tailSec: median(overlaps.map((o) => o.tail)) }
         : { leadSec: config.mix.leadSec, tailSec: config.mix.tailSec };

   // Called when the master moved from song `prev` (our last anchor) to the song described by `cur`.
   function learnOverlap(prev: ClockAnchor | null, cur: ClockAnchor): void {
      if (config.mix.history <= 0) return; // measuring is turned off: lead/tail stay at the configured values
      if (!prev || !prev.playing || !cur.playing || cur.trackIndex !== prev.trackIndex + 1) return;
      const tail = prev.duration - project(prev, cur.at); // what was left of the old song
      const lead = cur.elapsed; // how far into the new song we already are
      if (tail < 0 || tail > MAX_TAIL_SEC || lead < 0 || lead > MAX_LEAD_SEC) {
         log(`ignored song change as an Automix overlap (lead ${lead.toFixed(1)}s, tail ${tail.toFixed(1)}s)`);
         return;
      }
      overlaps.push({ lead, tail });
      while (overlaps.length > config.mix.history) overlaps.shift();
      const m = mixEstimate();
      log(
         `Automix overlap measured: lead ${lead.toFixed(1)}s, tail ${tail.toFixed(1)}s -> using lead ${m.leadSec.toFixed(1)}s, tail ${m.tailSec.toFixed(1)}s`,
      );
   }

   function setStatus(connected: boolean, error: string | null = null): void {
      if (status.connected === connected && status.error === error) return;
      status = { ...status, connected, error };
      emit('status', status);
   }

   const clockPayload = (reason: ClockReason, a: ClockAnchor): ClockPayload => ({
      reason,
      trackIndex: a.trackIndex,
      title: a.title,
      elapsed: project(a, Date.now()), // projected to "now" so late joiners start in the right place
      duration: a.duration,
      playing: a.playing,
      mix: mixEstimate(),
   });

   async function sample(): Promise<Sample> {
      const urgent = (script: string) => vdj.query(script, 'high');
      const optional = (script: string) => urgent(script).catch(() => null); // e.g. no position while Automix is stopped
      const [elapsed, length, title, play, count, position] = await Promise.all([
         vdj.queryAt(scripts.elapsedMs, 'high'), // queued first, so it is read first
         urgent(scripts.lengthSec),
         urgent(scripts.title),
         urgent(scripts.playing),
         optional(scripts.automixCount),
         optional(scripts.automixPosition),
      ]);
      return {
         at: elapsed.at,
         elapsed: num(elapsed.text) / 1000,
         duration: num(length),
         title,
         playing: isOn(play),
         count: Math.round(num(count)),
         position: Math.round(num(position)),
      };
   }

   const toCur = (s: Sample): ClockAnchor => ({
      trackIndex: trackIndexOf(s.position),
      title: s.title,
      elapsed: s.elapsed,
      duration: s.duration,
      playing: s.playing,
      at: s.at,
   });

   async function refreshAutomix(): Promise<void> {
      refreshing = true;
      try {
         automix = await readAutomix({ vdj, scripts, log }, automix);
         listDirty = false;
         listError = null;
         lastListAt = Date.now();
         emit('automix', automix);
      } catch (e) {
         listDirty = true;
         listRetryAt = Date.now() + config.automixRetryMs;
         listError = 'Automix: ' + errorMessage(e);
         log('automix read failed:', errorMessage(e));
      } finally {
         refreshing = false;
      }
   }

   async function pollOnce(): Promise<void> {
      let s: Sample;
      try {
         s = await sample();
      } catch (e) {
         failures++;
         log(`poll failed (${failures}/${config.maxFailures}):`, errorMessage(e));
         // A single bad reply is not a disconnect: keep the clock running and wait for more evidence.
         if (failures >= config.maxFailures) {
            anchor = null; // force a fresh anchor + list reload when VirtualDJ comes back
            pendingSeek = null;
            pendingCount = 0;
            setStatus(false, 'VirtualDJ: ' + errorMessage(e));
         }
         return;
      }
      failures = 0;

      const listChanged = s.count !== automix.count || s.position !== automix.position;
      const stale = Date.now() - lastListAt > config.automixRecheckMs;
      // Runs in the background so a slow list read never delays clock events.
      if (!refreshing && (anchor === null || listChanged || listDirty || stale) && Date.now() >= listRetryAt) {
         void refreshAutomix(); // handles its own errors
      }
      setStatus(true, listError);

      const prev = anchor;
      let cur = toCur(s);
      let reason: ClockEventReason | null = classify(prev, cur, config.seekToleranceSec);

      if (reason === 'track') {
         // The elapsed time, title and position are read one after another, and the master deck can switch in
         // between, giving a mix of old and new values. Read again so the new anchor is self-consistent.
         try {
            cur = toCur(await sample());
         } catch {
            /* keep the first reading */
         }
      }

      if (reason === 'seek' && prev !== null) {
         // One odd reading is not a seek. Act only when two readings in a row agree with each other.
         pendingCount++;
         const agrees =
            pendingSeek !== null && Math.abs(cur.elapsed - project(pendingSeek, cur.at)) <= SEEK_CONFIRM_SEC;
         if (cur.playing && pendingSeek !== null && cur.elapsed < pendingSeek.elapsed - 0.2) {
            log(
               'WARNING: the song position is going BACKWARDS while playing. The elapsed-time script is probably returning remaining time.',
            );
         }
         if (!agrees && pendingCount < MAX_UNCONFIRMED) {
            log(
               `possible seek, waiting for confirmation (reading ${cur.elapsed.toFixed(2)}s, expected ${project(prev, cur.at).toFixed(2)}s)`,
            );
            pendingSeek = cur;
            reason = null;
         }
      } else {
         pendingSeek = null;
         pendingCount = 0;
      }

      if (reason) {
         log(
            `clock event: ${reason}`,
            `| reading ${cur.elapsed.toFixed(2)}s`,
            `| browser had ${prev ? project(prev, cur.at).toFixed(2) + 's' : '-'}`,
            `| ${cur.playing ? 'playing' : 'paused'} | #${cur.trackIndex} ${cur.title.slice(0, 40)}`,
         );
         if (reason === 'track') learnOverlap(prev, cur);
         anchor = cur;
         pendingSeek = null;
         pendingCount = 0;
         emit('clock', clockPayload(reason, cur));
      }
   }

   function start(): void {
      if (running) return;
      running = true;
      const loop = async (): Promise<void> => {
         try {
            await pollOnce();
         } catch (e) {
            console.error('poll error:', e);
         }
         if (running) timer = setTimeout(() => void loop(), config.pollMs);
      };
      void loop();
   }

   function stop(): void {
      running = false;
      if (timer) clearTimeout(timer);
   }

   const snapshot = (): ServerMessage[] => [
      toMessage('status', status),
      toMessage('automix', automix),
      ...(anchor ? [toMessage('clock', clockPayload('sync', anchor))] : []),
   ];

   return { start, stop, pollOnce, snapshot, getAutomix: () => automix };
}
