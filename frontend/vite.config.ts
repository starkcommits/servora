import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/assets/servora/frontend/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '^/(app|api|assets|files|private)': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        ws: true,
        headers: {
          'Host': 'servio.local'
        }
      },
    },
  },
  build: {
    outDir: '../servora/public/frontend',
    emptyOutDir: true,
    target: 'es2020',
  },
});
