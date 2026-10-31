import type { ClockReason } from '../protocol';

/** While playing, a correction smaller than this is ignored so the display never twitches. */
const DEADBAND_SEC = 1;

export interface ClockSync {
   /** Seconds. */
   elapsed: number;
   /** Seconds. */
   duration: number;
   playing: boolean;
   reason: ClockReason;
}

/**
 * Browser-side song clock.
 *
 * The server never sends a ticking time. It sends an anchor { elapsed, duration, playing } only when
 * something happens (play, pause, seek, track change). Between anchors the clock advances by itself using
 * performance.now(), which is monotonic, so the display can never jump backwards or stutter.
 */
export class Clock {
   private elapsed0 = 0; // song position at the moment of the last anchor (seconds)
   private perf0 = performance.now(); // performance.now() at that moment
   private duration = 0;
   private playing = false;
   private suspended = false; // true while the server or VirtualDJ is unreachable: freeze instead of guessing

   sync({ elapsed, duration, playing, reason }: ClockSync): void {
      const isSoftCorrection = reason !== 'track' && reason !== 'play' && reason !== 'pause';
      if (isSoftCorrection && playing && this.playing && Math.abs(elapsed - this.now()) < DEADBAND_SEC) {
         this.duration = duration;
         return;
      }
      this.elapsed0 = elapsed;
      this.perf0 = performance.now();
      this.duration = duration;
      this.playing = playing;
   }

   setSuspended(value: boolean): void {
      if (value === this.suspended) return;
      this.elapsed0 = this.now(); // freeze at the current value (or resume from it until the next anchor)
      this.perf0 = performance.now();
      this.suspended = value;
   }

   /** Current song position in seconds. */
   now(perf: number = performance.now()): number {
      let t = this.elapsed0;
      if (this.playing && !this.suspended) t += (perf - this.perf0) / 1000;
      return this.duration > 0 ? Math.min(t, this.duration) : t;
   }
}
