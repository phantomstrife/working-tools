import { useEffect, useRef } from 'react';

// You can adjust these types based on your actual protocol schema
export interface SubscribePayload {
   action: 'subscribe';
   channels: string[];
}

export interface WebSocketHandlers {
   onOpen?: () => void;
   onClose?: () => void;
   onMessage?: (message: unknown) => void;
   onError?: (error: Event) => void;
}

const RECONNECT_MS = 1500;

export function useWebsocket(channels: string[], handlers: WebSocketHandlers) {
   // Use refs to ensure we always call the latest handlers without triggering re-connects
   const handlersRef = useRef(handlers);
   const channelsRef = useRef(channels);
   const socketRef = useRef<WebSocket | null>(null);

   useEffect(() => {
      handlersRef.current = handlers;
      channelsRef.current = channels;
   });

   // If the channels array changes while connected, resend the subscription
   useEffect(() => {
      const socket = socketRef.current;
      if (socket && socket.readyState === WebSocket.OPEN) {
         socket.send(
            JSON.stringify({
               action: 'subscribe',
               channels: channelsRef.current,
            }),
         );
      }
   }, [channels]); // Deep comparison might be needed here depending on how you pass `channels`

   useEffect(() => {
      let disposed = false;
      let retryTimer: number | undefined;

      const connect = () => {
         // Automatically determine wss vs ws based on current protocol
         const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
         // Adjust the port/path to match your specific backend setup
         const wsUrl = `${scheme}://${window.location.host}/ws`;

         const ws = new WebSocket(wsUrl);
         socketRef.current = ws;

         ws.onopen = () => {
            if (disposed) return;

            // Immediately subscribe to the requested channels upon connecting
            ws.send(
               JSON.stringify({
                  action: 'subscribe',
                  channels: channelsRef.current,
               }),
            );

            if (handlersRef.current.onOpen) {
               handlersRef.current.onOpen();
            }
         };

         ws.onmessage = (event) => {
            if (disposed) return;
            try {
               const parsedData = JSON.parse(event.data);
               if (handlersRef.current.onMessage) {
                  handlersRef.current.onMessage(parsedData);
               }
            } catch (e) {
               console.error('WebSocket parsing error:', e);
            }
         };

         ws.onerror = (error) => {
            if (disposed) return;
            if (handlersRef.current.onError) {
               handlersRef.current.onError(error);
            }
         };

         ws.onclose = () => {
            if (disposed) return;

            if (handlersRef.current.onClose) {
               handlersRef.current.onClose();
            }

            // Attempt to auto-reconnect
            retryTimer = window.setTimeout(connect, RECONNECT_MS);
         };
      };

      connect();

      return () => {
         disposed = true;
         window.clearTimeout(retryTimer);
         if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
         }
      };
   }, []); // Only run the connection logic once on mount

   return socketRef;
}
