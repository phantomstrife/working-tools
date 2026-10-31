import type { Server as HTTPServer } from 'http';
import type { Server as HTTPSServer } from 'https';
import type { WebSocket, WebSocketServer } from 'ws';

export type Instance = WebSocketServer | null;
export type Action = 'subscribe' | 'unsubscribe';

export interface Properties {
   server: HTTPServer | HTTPSServer;
   path: string;
}

export interface Client extends WebSocket {
   subscriptions: Set<string>;
}

export interface Message {
   action: Action;
   channels?: string[];
}

export type CreateWebSocket = (properties: Properties) => void;
export type EmitMessage = (type: string, payload: unknown) => void;
