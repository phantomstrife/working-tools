import { useLiveTiming } from '../hooks/useLiveTiming';
import { countdown } from '../lib/format';
import { t } from '../strings';

/** Time left in the current song, up to its mix-out point. */
export function SongCountdown() {
   const { duration, left } = useLiveTiming();
   return (
      <div className="row">
         <span className="label">{t.countdown}</span>
         <span className="pill">{duration > 0 ? countdown(left) : '-00:00'}</span>
      </div>
   );
}
