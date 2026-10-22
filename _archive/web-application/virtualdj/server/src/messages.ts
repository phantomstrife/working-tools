import type { ServerMessage, ServerMessageType, ServerPayloads } from './protocol.js';

/** Sends one typed payload to every connected browser. */
export type Emit = <K extends ServerMessageType>(type: K, payload: ServerPayloads[K]) => void;

/** Builds the object that goes over the wire: the payload fields plus the `type` tag. */
export function toMessage<K extends ServerMessageType>(type: K, payload: ServerPayloads[K]): ServerMessage {
   // TypeScript cannot see that `{ type: K } & ServerPayloads[K]` is one member of the union for a generic K.
   return { type, ...payload } as ServerMessage;
}
