import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  base: './',
  build: {
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
    assetsDir: 'assets',
    // Mantener estructura de assets
    copyPublicDir: true,
  },
  server: {
    port: 5173,
  },
});