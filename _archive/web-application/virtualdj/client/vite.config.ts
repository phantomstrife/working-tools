import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// In development the UI runs on :5173 and forwards API + WebSocket traffic to the Node server.
// Change the target if you start the server with a different PORT.
const SERVER = 'http://localhost:3000';

export default defineConfig({
   plugins: [react()],
   server: {
      proxy: {
         '/api': SERVER,
         '/ws': { target: SERVER, ws: true },
      },
   },
   test: {
      environment: 'node',
   },
});
