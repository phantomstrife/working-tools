import { WebSocket, WebSocketServer } from 'ws';

import type * as Types from './type';

let websocket: Types.Instance = null;

function rawDataToString(data: WebSocket.RawData): string {
   if (typeof data === 'string') {
      return data;
   }

   if (Buffer.isBuffer(data)) {
      return data.toString('utf8');
   }

   if (Array.isArray(data)) {
      return Buffer.concat(data).toString('utf8');
   }

   return Buffer.from(data).toString('utf8');
}

export const createWebsocket: Types.CreateWebSocket = (properties) => {
   if (websocket) {
      return;
   }

   const { server, path } = properties;

   websocket = new WebSocketServer({
      server,
      path,
   });

   websocket.on('connection', (client: Types.Client) => {
      client.subscriptions = new Set<string>();

      client.on('message', (message) => {
         try {
            const { action, channels } = JSON.parse(rawDataToString(message)) as Types.Message;

            switch (action) {
               case 'subscribe': {
                  client.subscriptions = new Set(channels);
                  break;
               }

               case 'unsubscribe': {
                  client.subscriptions.clear();
                  break;
               }
            }
         } catch {
            // Ignore invalid JSON
         }
      });
   });
};

export const emitMessage: Types.EmitMessage = (type, payload) => {
   if (!websocket) {
      return;
   }

   const data = JSON.stringify({
      type,
      payload,
   });

   for (const client of websocket.clients as Set<Types.Client>) {
      if (client.readyState !== WebSocket.OPEN) {
         continue;
      }

      if (client.subscriptions.has(type)) {
         client.send(data);
      }
   }
};
