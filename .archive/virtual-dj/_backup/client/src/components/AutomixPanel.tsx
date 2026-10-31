import { useRowExpansion } from '../hooks/useRowExpansion';
import { isKnown } from '../lib/songs';
import { phaseOf } from '../lib/timing';
import { useShowState } from '../state/contexts';
import { t } from '../strings';
import { CueCountdown } from './CueCountdown';
import { LiveSongRow, SongRow } from './SongRow';

export function AutomixPanel() {
   const { songs, track } = useShowState();
   const { isOpen, toggle } = useRowExpansion(track.index);

   const known = songs.filter(isKnown);
   const maxDuration = Math.max(...known.map((song) => song.duration || 1), 1);

   return (
      <section className="right">
         <h2>AUTOMIX</h2>
         <div className="cue-cd-label">{t.nextCue}</div>
         <CueCountdown />
         <div>
            {known.length === 0 ? (
               <div className="empty">{t.emptyList}</div>
            ) : (
               songs.map((song, index) => {
                  if (song.unknown) return null; // played before we connected: nothing to show, index kept
                  const phase = phaseOf(index, track.index);
                  const Row = phase === 'cur' ? LiveSongRow : SongRow;
                  return (
                     <Row
                        key={song.offset}
                        song={song}
                        index={index}
                        phase={phase}
                        open={isOpen(index)}
                        maxDuration={maxDuration}
                        onToggle={toggle}
                     />
                  );
               })
            )}
         </div>
      </section>
   );
}
