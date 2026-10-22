import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { WebSocket, WebSocketServer } from 'ws';
import { config } from './config.js';
import { toMessage, type Emit } from './messages.js';
import { createMonitor } from './monitor/monitor.js';
import { errorMessage } from './util.js';
import { createVdj } from './vdj/client.js';
import { readDeckCues } from './vdj/cues.js';

const here = path.dirname(fileURLToPath(import.meta.url));
// Production build of the React client. Works the same from src/ (tsx) and dist/ (compiled).
const clientDist = path.resolve(here, process.env['CLIENT_DIST'] ?? '../../client/dist');

const vdj = createVdj(config.vdj);

const app = express();
app.use(express.static(clientDist));

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const emit: Emit = (type, payload) => {
   const data = JSON.stringify(toMessage(type, payload));
   for (const client of wss.clients) if (client.readyState === WebSocket.OPEN) client.send(data);
};

const monitor = createMonitor({ vdj, config, emit });

wss.on('connection', (socket) => {
   for (const message of monitor.snapshot()) socket.send(JSON.stringify(message));
});

// ---------- HTTP API ----------
app.get('/api/automix', (_req, res) => {
   res.json(monitor.getAutomix());
});

// Cues of the master deck (not pushed to the UI yet).
app.get('/api/cues', async (_req, res) => {
   try {
      res.json(await readDeckCues(vdj, config.scripts));
   } catch (e) {
      res.status(502).json({ error: 'Cannot read VirtualDJ cues', message: errorMessage(e) });
   }
});

monitor.start();
server.listen(config.port, () => console.log(`VDJ Show Control on http://localhost:${config.port}`));

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
   process.on(signal, () => {
      monitor.stop();
      wss.close();
      server.close(() => process.exit(0));
   });
}
