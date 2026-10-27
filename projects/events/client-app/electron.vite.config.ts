import { resolve } from 'path';
import { defineConfig } from 'electron-vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
   main: {},
   preload: {},
   renderer: {
      resolve: {
         alias: {
            '@client-app': resolve('src/renderer/src'),
         },
      },
      plugins: [react(), tailwindcss(), basicSsl()],
      server: {
         host: true, // listen on 0.0.0.0
         port: 5173,
      },
   },
});
