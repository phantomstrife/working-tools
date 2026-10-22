import type { AutomixSong, Cue, MixEstimate } from '../protocol';
import { durationOf } from './songs';

/**
 * Automix timing: songs are not played to their end. The next song fades in while the current one still has
 * `tail` seconds left, and when it becomes master the deck is already `lead` seconds into it. So:
 *   - the current song's countdown runs to its mix-out point (duration - tail), where the display switches;
 *   - a future song only adds (duration - lead - tail) to the set total (no tail for the very last song).
 * `mix` (lead/tail) is measured by the server at every song change.
 */

export type SongPhase = 'past' | 'cur' | 'next' | 'fut';

export const phaseOf = (index: number, trackIndex: number): SongPhase =>
   index < trackIndex ? 'past' : index === trackIndex ? 'cur' : index === trackIndex + 1 ? 'next' : 'fut';

/** How much of the set timeline song `index` fills once it is master. */
export function mixedLength(songs: readonly AutomixSong[], index: number, mix: MixEstimate): number {
   const isLast = index >= songs.length - 1;
   return Math.max(0, durationOf(songs[index]) - mix.leadSec - (isLast ? 0 : mix.tailSec));
}

/** result[i] = set time added by all songs after i. */
export function remainingAfter(songs: readonly AutomixSong[], mix: MixEstimate): number[] {
   const result = new Array<number>(songs.length).fill(0);
   for (let i = songs.length - 2; i >= 0; i--) result[i] = (result[i + 1] ?? 0) + mixedLength(songs, i + 1, mix);
   return result;
}

/** Where the display switches to the next song: its mix-out point (the very last song plays to the end). */
export function mixOutAt(duration: number, hasNext: boolean, mix: MixEstimate): number {
   return duration > 0 ? Math.max(0, duration - (hasNext ? mix.tailSec : 0)) : 0;
}

export interface CueStatus {
   isNow: boolean;
   done: boolean;
}

/** State of cue `k` of a song in the given phase. Cues must be sorted by position. */
export function cueStatus(cues: readonly Cue[], k: number, phase: SongPhase, elapsed: number): CueStatus {
   const cue = cues[k];
   if (!cue) return { isNow: false, done: false };
   const nextPos = cues[k + 1]?.pos ?? Infinity;
   return {
      isNow: phase === 'cur' && elapsed >= cue.pos && elapsed < nextPos,
      done: phase === 'past' || (phase === 'cur' && elapsed >= nextPos),
   };
}
