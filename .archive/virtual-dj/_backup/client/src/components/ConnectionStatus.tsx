import { t } from '../strings';
import { useShowState } from '../state/contexts';

type Tone = 'idle' | 'ok' | 'bad';

export function ConnectionStatus() {
   const { status, serverLost } = useShowState();

   let tone: Tone;
   let text: string;
   if (serverLost) {
      tone = 'bad';
      text = t.serverLost;
   } else if (!status) {
      tone = 'idle';
      text = t.connecting;
   } else {
      tone = status.connected ? 'ok' : 'bad';
      text = status.error || (status.connected ? t.vdjConnected : t.vdjDisconnected);
   }

   return (
      <div className="status">
         <span className={tone === 'idle' ? 'dot' : `dot ${tone}`} />
         <span>{text}</span>
      </div>
   );
}
