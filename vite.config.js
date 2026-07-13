import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Don't try to serve the SW from a subpath — Capacitor uses file:// anyway
      // and on web the root scope is what we want.
      scope: '/',
      base: '/',
      includeAssets: ['favicon.svg', 'pwa-192.png', 'pwa-512.png'],
      manifest: {
        name: 'CareCircle',
        short_name: 'CareCircle',
        description: 'Family caregiving, coordinated',
        theme_color: '#050510',
        background_color: '#050510',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        // Cache the app shell and Supabase auth JS
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // Supabase REST API — network-first, fall back to cache for offline reads
            urlPattern: ({ url }) => url.hostname.endsWith('.supabase.co') && url.pathname.startsWith('/rest/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-rest',
              expiration: { maxAgeSeconds: 60 * 60 * 24 },
              networkTimeoutSeconds: 5,
            },
          },
          {
            // Google Fonts
            urlPattern: ({ url }) => url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com',
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
    }),
  ],
  // Capacitor requires relative asset paths (file:// serving)
  base: './',
  test: {
    // Unit tests only — Playwright owns tests/**, which uses its own
    // test()/expect() and would otherwise collide with vitest's globs.
    include: ['src/**/*.test.{js,jsx}'],
  },
})
