import { useEffect, useReducer, useState, type ReactNode } from 'react';
import { useClockTicker } from '../hooks/useClockTicker';
import { useShowSocket } from '../hooks/useShowSocket';
import { Clock } from '../lib/clock';
import { ElapsedContext, ShowStateContext } from './contexts';
import { DEFAULT_FPS, initialShowState, showReducer } from './showReducer';

/**
 * Owns the connection to the server, the show state and the song clock.
 * The clock is the only thing that ever touches the timer: it is fed by 'clock' messages and nothing else.
 */
export function ShowProvider({ children }: { children: ReactNode }) {
   const [clock] = useState(() => new Clock());
   const [state, dispatch] = useReducer(showReducer, initialShowState);

   useShowSocket({
      onOpen: () => dispatch({ type: 'socket-open' }),
      onClose: () => dispatch({ type: 'socket-close' }),
      onMessage: (message) => {
         if (message.type === 'clock') clock.sync(message);
         dispatch({ type: 'message', message });
      },
   });

   // Freeze the clock while the server or VirtualDJ is unreachable instead of guessing.
   const vdjUp = state.status?.connected ?? false;
   const suspended = !(state.serverUp && vdjUp);
   useEffect(() => {
      clock.setSuspended(suspended);
   }, [clock, suspended]);

   const elapsed = useClockTicker(clock, state.status?.fps ?? DEFAULT_FPS);

   return (
      <ShowStateContext value={state}>
         <ElapsedContext value={elapsed}>{children}</ElapsedContext>
      </ShowStateContext>
   );
}
