import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  base: '/assets/servora/frontend/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      strategies: 'generateSW',
      outDir: '../servora/public/frontend',
      workbox: {
        swDest: '../servora/public/frontend/sw.js',
        inlineWorkboxRuntime: true,
        navigateFallback: '/assets/servora/frontend/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/app\//, /^\/private\//, /^\/files\//],
        globDirectory: '../servora/public/frontend/',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,ttf}'],
        modifyURLPrefix: {
          '': '/assets/servora/frontend/'
        },
        manifestTransforms: [
          async (manifestEntries) => {
            const manifest = manifestEntries.filter(entry => entry.url !== 'manifest.webmanifest');
            return { manifest, warnings: [] };
          }
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/checkout\.razorpay\.com\/.*/i,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /\/api\//i,
            handler: 'NetworkOnly',
          }
        ]
      },
      manifest: {
        name: 'Servora',
        short_name: 'Servora',
        description: 'Professional Home Services at Your Doorstep',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#0f766e',
        background_color: '#ffffff',
        start_url: '/frontend',
        scope: '/frontend',
        icons: [
          {
            src: '/assets/servora/frontend/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/assets/servora/frontend/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
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
