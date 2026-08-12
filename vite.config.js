import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

import { contentPlugin } from './plugins/content.js';

export default defineConfig({
  // set to '/treasure_hunt/' if you ever host it on a GitHub Pages subpath
  base: '/',

  plugins: [
    contentPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'photos/**/*'],
      manifest: {
        name: 'Kőporosi Pincesor — Kincsvadászat',
        short_name: 'Kincsvadászat',
        description: 'Treasure hunt along the Kőporosi Pincesor',
        lang: 'hu',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#100c0b',
        theme_color: '#100c0b',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // the whole game is small; precache it so the row works with no signal
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,webp,jpg}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        navigateFallback: 'index.html',
      },
      devOptions: { enabled: false },
    }),
  ],

  build: {
    target: 'es2020',
    cssTarget: 'safari14',
    assetsInlineLimit: 2048,
  },
});
