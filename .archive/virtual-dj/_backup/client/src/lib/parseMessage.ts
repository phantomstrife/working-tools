import type { ServerMessage, ServerMessageType } from '../protocol';

/**
 * Every known message type. Typed as a Record so adding a message to the protocol breaks the build
 * here until the client knows about it.
 */
const KNOWN_TYPES: Record<ServerMessageType, true> = {
   status: true,
   automix: true,
   clock: true,
};

const isKnownType = (value: unknown): value is ServerMessageType =>
   typeof value === 'string' && Object.hasOwn(KNOWN_TYPES, value);

/** Parses one WebSocket frame. Returns null for anything that is not a known server message. */
export function parseServerMessage(data: unknown): ServerMessage | null {
   if (typeof data !== 'string') return null;
   try {
      const parsed: unknown = JSON.parse(data);
      if (typeof parsed !== 'object' || parsed === null) return null;
      // The payload comes from our own server, so only the type tag is checked.
      return isKnownType((parsed as { type?: unknown }).type) ? (parsed as ServerMessage) : null;
   } catch {
      return null;
   }
}
