import http from 'node:http';

import express from 'express';
import 'dotenv/config';

import { createWebsocket } from '@client-server/adapters/websocket';

import { SERVER } from './constants';
import { createInstance } from '@client-server/adapters/virtual-dj';

const app = express();
const server = http.createServer(app);

function serverStart() {
   createWebsocket({ server, path: '/ws' });

   setTimeout(() => {
      console.log('Attempting to connect to Virtual DJ...');
      createInstance();
   }, 5000);
}

function serverStop() {
   server.close(() => {
      process.exit(0);
   });
}

server.listen(SERVER.PORT);
serverStart();

process.on('SIGINT', serverStop);
process.on('SIGTERM', serverStop);
