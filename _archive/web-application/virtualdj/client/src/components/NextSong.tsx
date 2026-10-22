import { titleOf } from '../lib/songs';
import { useShowState } from '../state/contexts';
import { t } from '../strings';

export function NextSong() {
   const { songs, track } = useShowState();
   return (
      <div className="next">
         <small>{t.nextSong}</small>
         <b>{titleOf(songs[track.index + 1]) || '—'}</b>
      </div>
   );
}
