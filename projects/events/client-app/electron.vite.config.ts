import { resolve } from 'path';
import { defineConfig } from 'electron-vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
   main: {},
   preload: {},
   renderer: {
      server: {
         host: true,
         port: 5173,
      },
      resolve: {
         alias: {
            '@renderer': resolve('src/renderer/src'),
         },
      },
      plugins: [react(), basicSsl()],
   },
});
