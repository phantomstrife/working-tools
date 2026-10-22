import { useLiveTiming } from '../hooks/useLiveTiming';
import { countdown } from '../lib/format';
import { cuesOf } from '../lib/songs';
import { useShowState } from '../state/contexts';

/** Time until the next cue of the current song, or until its mix-out point when no cue is left. */
export function CueCountdown() {
   const { songs, track } = useShowState();
   const { elapsed, duration, mixOut } = useLiveTiming();

   let text = '--:--';
   if (duration > 0) {
      const nextCue = cuesOf(songs[track.index]).find((cue) => cue.pos > elapsed);
      text = countdown(Math.max(0, (nextCue?.pos ?? mixOut) - elapsed));
   }
   return <div className="cue-cd">{text}</div>;
}
