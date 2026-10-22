import type { ClockEventReason } from '../protocol.js';

/** A second reading must agree with the first within this many seconds to confirm a seek. */
export const SEEK_CONFIRM_SEC = 0.75;
/**
 * If readings keep disagreeing with the clock this many polls in a row, stop waiting for agreement and
 * re-sync anyway: the clock is plainly wrong, and a frozen/wrong display is worse than a visible correction.
 */
export const MAX_UNCONFIRMED = 3;
/** Plausible ranges for a measured Automix overlap; anything else was a manual load/jump, not a mix. */
export const MAX_TAIL_SEC = 90;
export const MAX_LEAD_SEC = 60;

/** One reading of the master deck. `at` is the epoch ms it was taken. */
export interface ClockAnchor {
   trackIndex: number;
   title: string;
   /** Seconds. */
   elapsed: number;
   /** Seconds. */
   duration: number;
   playing: boolean;
   at: number;
}

export const isOn = (value: string): boolean => /^(on|true|1|yes)$/i.test(value);

export const trackIndexOf = (position: number): number => (position > 0 ? position - 1 : 0);

/** Where the song should be at time `at`, given the last anchor we told clients about. */
export const project = (anchor: Pick<ClockAnchor, 'playing' | 'elapsed' | 'at'>, at: number): number =>
   anchor.playing ? anchor.elapsed + (at - anchor.at) / 1000 : anchor.elapsed;

export function median(values: readonly number[]): number {
   const sorted = [...values].sort((x, y) => x - y);
   const mid = sorted.length >> 1;
   if (sorted.length === 0) return 0;
   if (sorted.length % 2) return sorted[mid] ?? 0;
   return ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
}

/**
 * Returns why a new clock anchor may be needed, or null if clients can keep running their own timer.
 * Order matters: a track change beats everything, play/pause beats seek.
 */
export function classify(anchor: ClockAnchor | null, cur: ClockAnchor, toleranceSec: number): ClockEventReason | null {
   if (!anchor) return 'init';
   if (cur.trackIndex !== anchor.trackIndex || cur.title !== anchor.title) return 'track';
   if (cur.playing !== anchor.playing) return cur.playing ? 'play' : 'pause';
   if (Math.abs(cur.duration - anchor.duration) > 0.5) return 'duration';
   if (Math.abs(cur.elapsed - project(anchor, cur.at)) > toleranceSec) return 'seek';
   return null;
}
