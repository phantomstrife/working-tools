import { ConnectionStatus } from './ConnectionStatus';
import { CurrentSongName } from './CurrentSongName';
import { NextSong } from './NextSong';
import { SetTimecode } from './SetTimecode';
import { SongCountdown } from './SongCountdown';

export function LeftPanel() {
   return (
      <section className="left">
         <ConnectionStatus />
         <CurrentSongName />
         <SongCountdown />
         <SetTimecode />
         <NextSong />
      </section>
   );
}
