import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
   const env = loadEnv(mode, process.cwd(), '');
   const SERVER = `http://localhost:${env.SERVER_PORT || 3000}`;

   return {
      plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
      server: {
         port: 5173,
         proxy: {
            '/api': SERVER,
            '/ws': {
               target: SERVER,
               ws: true,
            },
         },
      },
   };
});
