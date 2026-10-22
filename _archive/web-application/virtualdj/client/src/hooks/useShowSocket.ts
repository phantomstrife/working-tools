import { useEffect, useRef } from 'react';
import { parseServerMessage } from '../lib/parseMessage';
import type { ServerMessage } from '../protocol';

const RECONNECT_MS = 1500;

export interface ShowSocketHandlers {
   onOpen: () => void;
   onClose: () => void;
   onMessage: (message: ServerMessage) => void;
}

/** WebSocket to the server with auto-reconnect. Handlers may change on every render without reconnecting. */
export function useShowSocket(handlers: ShowSocketHandlers): void {
   const latest = useRef(handlers);
   useEffect(() => {
      latest.current = handlers;
   });

   useEffect(() => {
      let disposed = false;
      let socket: WebSocket | null = null;
      let retry: number | undefined;

      const connect = (): void => {
         const scheme = location.protocol === 'https:' ? 'wss' : 'ws';
         const ws = new WebSocket(`${scheme}://${location.host}/ws`);
         socket = ws;
         ws.onopen = () => latest.current.onOpen();
         ws.onmessage = (event: MessageEvent<unknown>) => {
            const message = parseServerMessage(event.data);
            if (message) latest.current.onMessage(message);
         };
         ws.onclose = () => {
            if (disposed) return;
            latest.current.onClose();
            retry = window.setTimeout(connect, RECONNECT_MS);
         };
      };

      connect();
      return () => {
         disposed = true;
         window.clearTimeout(retry);
         socket?.close();
      };
   }, []);
}
