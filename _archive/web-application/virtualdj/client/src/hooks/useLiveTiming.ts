import { useMemo } from 'react';
import { durationOf } from '../lib/songs';
import { mixOutAt, remainingAfter } from '../lib/timing';
import { useElapsed, useShowState } from '../state/contexts';

export interface LiveTiming {
   /** Song position, seconds. */
   elapsed: number;
   /** Length of the current song, seconds (0 while unknown). */
   duration: number;
   /** Where the display switches to the next song, seconds into the current song. */
   mixOut: number;
   /** Time left until the mix-out point, seconds. */
   left: number;
}

/** Timing of the current song. Re-renders its caller on every display frame: use it only in live widgets. */
export function useLiveTiming(): LiveTiming {
   const { songs, track, mix } = useShowState();
   const elapsed = useElapsed();
   const duration = track.duration || durationOf(songs[track.index]);
   const mixOut = mixOutAt(duration, track.index < songs.length - 1, mix);
   return { elapsed, duration, mixOut, left: Math.max(0, mixOut - elapsed) };
}

/** Set time added by all songs after the current one, seconds. Only changes when the list or mix changes. */
export function useRemainingAfterCurrent(): number {
   const { songs, track, mix } = useShowState();
   const table = useMemo(() => remainingAfter(songs, mix), [songs, mix]);
   return table[track.index] ?? 0;
}
