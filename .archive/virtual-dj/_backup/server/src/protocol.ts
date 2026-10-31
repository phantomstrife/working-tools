/**
 * Wire protocol between the Node server and the browser UI.
 *
 * Types only: no runtime code, no Node or DOM imports. The client re-exports this file
 * (client/src/protocol.ts) with `export type *`, so both sides are checked against one definition.
 *
 * To add a message: add its payload to `ServerPayloads`, emit it from the server, and handle it in the
 * client reducer. The compiler points at every place that still needs updating.
 */

/** A cue point of a song. `pos` is in seconds. */
export interface Cue {
   n: number;
   name: string;
   pos: number;
}

/** A song whose details were read from VirtualDJ. */
export interface KnownSong {
   unknown: false;
   /** Absolute place in the Automix list (0-based). */
   offset: number;
   path: string;
   artist: string;
   title: string;
   remix: string;
   /** Seconds. */
   duration: number;
   key: string;
   /** Reserved for the upcoming cue feature. */
   cues: Cue[];
}

/** A song that was already played before we connected: it keeps the indexes aligned but is not drawn. */
export interface UnknownSong {
   unknown: true;
   offset: number;
}

export type AutomixSong = KnownSong | UnknownSong;

/**
 * Automix overlap: `leadSec` is how far into the NEW song the deck is when it becomes master,
 * `tailSec` is how much of the OLD song is left at that moment.
 */
export interface MixEstimate {
   leadSec: number;
   tailSec: number;
}

/** Why a new clock anchor was sent. 'sync' is only used to catch up a newly connected browser. */
export type ClockEventReason = 'init' | 'track' | 'play' | 'pause' | 'duration' | 'seek';
export type ClockReason = ClockEventReason | 'sync';

export interface StatusPayload {
   connected: boolean;
   error: string | null;
   fps: number;
}

export interface AutomixPayload {
   count: number;
   /** 1-based position of the playing song, 0 when Automix is stopped. */
   position: number;
   songs: AutomixSong[];
}

/** Anchor for the browser timer: sent only when something happens, never as a ticking time. */
export interface ClockPayload {
   reason: ClockReason;
   trackIndex: number;
   title: string;
   /** Seconds, already projected to "now". */
   elapsed: number;
   /** Seconds. */
   duration: number;
   playing: boolean;
   mix: MixEstimate;
}

/** Every server -> browser message, keyed by its `type`. */
export interface ServerPayloads {
   status: StatusPayload;
   automix: AutomixPayload;
   clock: ClockPayload;
}

export type ServerMessageType = keyof ServerPayloads;

/** What actually travels over the WebSocket: the payload fields plus the `type` tag. */
export type ServerMessage = {
   [K in ServerMessageType]: { type: K } & ServerPayloads[K];
}[ServerMessageType];
