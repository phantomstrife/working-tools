import { useLiveTiming, useRemainingAfterCurrent } from '../hooks/useLiveTiming';
import { timecode } from '../lib/format';
import { useShowState } from '../state/contexts';
import { DEFAULT_FPS } from '../state/showReducer';
import { t } from '../strings';

/** Time left in the whole set: the rest of the current song plus everything queued after it. */
export function SetTimecode() {
   const { status } = useShowState();
   const { left } = useLiveTiming();
   const after = useRemainingAfterCurrent();
   const fps = status?.fps ?? DEFAULT_FPS;

   return (
      <div>
         <div className="tc-label">{t.setRemaining}</div>
         <div className="tc">{timecode(left + after, fps)}</div>
         <div className="fps">{fps} FPS</div>
      </div>
   );
}
