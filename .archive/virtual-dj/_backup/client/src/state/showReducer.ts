import type { AutomixSong, MixEstimate, ServerMessage, StatusPayload } from '../protocol';

export const DEFAULT_FPS = 25;

export interface TrackState {
   index: number;
   title: string;
   /** Seconds, as reported by the last clock anchor. */
   duration: number;
}

export interface ShowState {
   /** WebSocket to our server is open. */
   serverUp: boolean;
   /** The socket closed and we are retrying: shown instead of the VirtualDJ status. */
   serverLost: boolean;
   /** Last status from the server; null until the first one arrives. */
   status: StatusPayload | null;
   songs: readonly AutomixSong[];
   track: TrackState;
   mix: MixEstimate;
}

export const initialShowState: ShowState = {
   serverUp: false,
   serverLost: false,
   status: null,
   songs: [],
   track: { index: 0, title: '', duration: 0 },
   mix: { leadSec: 0, tailSec: 0 },
};

export type ShowAction =
   { type: 'socket-open' } | { type: 'socket-close' } | { type: 'message'; message: ServerMessage };

const sameMix = (a: MixEstimate, b: MixEstimate): boolean => a.leadSec === b.leadSec && a.tailSec === b.tailSec;

const sameSongs = (a: readonly AutomixSong[], b: readonly AutomixSong[]): boolean =>
   JSON.stringify(a) === JSON.stringify(b);

function assertNever(value: never): never {
   throw new Error(`Unhandled value: ${JSON.stringify(value)}`);
}

function applyMessage(state: ShowState, message: ServerMessage): ShowState {
   switch (message.type) {
      case 'status':
         return {
            ...state,
            serverLost: false,
            status: { connected: message.connected, error: message.error, fps: message.fps },
         };
      case 'automix':
         // Keep the same array when nothing changed, so memoized rows do not re-render.
         return sameSongs(state.songs, message.songs) ? state : { ...state, songs: message.songs };
      case 'clock':
         return {
            ...state,
            track: { index: message.trackIndex, title: message.title, duration: message.duration },
            mix: sameMix(state.mix, message.mix) ? state.mix : message.mix,
         };
      default:
         return assertNever(message);
   }
}

export function showReducer(state: ShowState, action: ShowAction): ShowState {
   switch (action.type) {
      case 'socket-open':
         return { ...state, serverUp: true };
      case 'socket-close':
         return { ...state, serverUp: false, serverLost: true };
      case 'message':
         return applyMessage(state, action.message);
      default:
         return assertNever(action);
   }
}
