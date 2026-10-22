import { titleOf } from '../lib/songs';
import { useShowState } from '../state/contexts';

export function CurrentSongName() {
   const { songs, track } = useShowState();
   return <div className="song-name">{titleOf(songs[track.index]) || track.title || '—'}</div>;
}
