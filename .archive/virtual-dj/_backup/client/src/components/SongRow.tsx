import { memo, type KeyboardEvent } from 'react';
import { useLiveTiming } from '../hooks/useLiveTiming';
import { countdown, mmss } from '../lib/format';
import { cueStatus, type SongPhase } from '../lib/timing';
import type { KnownSong } from '../protocol';
import { t } from '../strings';

interface RowProps {
   song: KnownSong;
   /** Index of the song in the Automix list. */
   index: number;
   phase: SongPhase;
   open: boolean;
   /** Longest song in the list, seconds: bars are drawn relative to it. */
   maxDuration: number;
   onToggle: (index: number) => void;
}

interface RowViewProps extends RowProps {
   /** Song position in seconds; null for songs that are not playing. */
   elapsed: number | null;
   /** Length used for the progress bar (the clock's length for the current song). */
   barDuration: number;
}

function SongRowView({ song, index, phase, open, maxDuration, onToggle, elapsed, barDuration }: RowViewProps) {
   const duration = song.duration;
   const progress = phase === 'past' ? 1 : elapsed !== null && barDuration > 0 ? Math.min(1, elapsed / barDuration) : 0;

   const toggleOnKey = (event: KeyboardEvent<HTMLDivElement>): void => {
      if (event.key === 'Enter' || event.key === ' ') {
         event.preventDefault();
         onToggle(index);
      }
   };

   return (
      <div className={`song ${phase}${open ? ' open' : ''}`}>
         <div
            className="song-head"
            role="button"
            tabIndex={0}
            aria-expanded={open}
            onClick={() => onToggle(index)}
            onKeyDown={toggleOnKey}
         >
            <svg className="chev" viewBox="0 0 10 10">
               <path d="M3 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            <span className="song-title">{song.title || t.unknownTrack}</span>
            <span className="song-dur">{mmss(duration)}</span>
         </div>
         <div className="bar-wrap" style={{ width: `${Math.max(25, (duration / maxDuration) * 100)}%` }}>
            <div className="bar">
               <div className="fill" style={{ width: `${progress * 100}%` }} />
               {song.cues.map((cue) => (
                  <div
                     key={cue.n}
                     className="tick"
                     style={{ left: `${duration > 0 ? (cue.pos / duration) * 100 : 0}%` }}
                  />
               ))}
            </div>
         </div>
         <div className="cues">
            {song.cues.map((cue, k) => {
               const { isNow, done } = cueStatus(song.cues, k, phase, elapsed ?? 0);
               const showCountdown = phase === 'cur' && elapsed !== null && !done && !isNow;
               return (
                  <div key={cue.n} className={`cue${isNow ? ' now' : ''}${done ? ' done' : ''}`}>
                     <span>{cue.name}</span>
                     <span className="t">{showCountdown ? countdown(cue.pos - elapsed) : mmss(cue.pos)}</span>
                  </div>
               );
            })}
         </div>
      </div>
   );
}

/** A song that is not playing: static, only re-renders when its own props change. */
export const SongRow = memo(function SongRow(props: RowProps) {
   return <SongRowView {...props} elapsed={null} barDuration={props.song.duration} />;
});

/** The playing song: follows the clock on every display frame. */
export function LiveSongRow(props: RowProps) {
   const { elapsed, duration } = useLiveTiming();
   return <SongRowView {...props} elapsed={elapsed} barDuration={duration} />;
}
