import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8889',
        changeOrigin: true,
      },
    },
  },

  plugins: [
    react(), 
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'white_circle_360x360.png'],
      manifest: {
        name: 'Carioca Coastal Club',
        short_name: 'CCC',
        description: 'Discover the best beach vendors (barracas) in Rio de Janeiro',
        theme_color: '#0EA5E9',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'white_circle_360x360.png',
            sizes: '360x360',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        // Archived party-era flyer, unused by the live app, exceeds workbox's
        // default 2 MiB precache limit and fails the build otherwise.
        globIgnores: ['**/beach-party-flyer.png'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.openweathermap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'weather-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 1, // 1 hour
              },
            },
          },
        ],
      },
    }),
    // Only upload source maps in production builds when SENTRY_AUTH_TOKEN is available
    ...(process.env.SENTRY_AUTH_TOKEN ? [
      sentryVitePlugin({
        org: process.env.SENTRY_ORG || "carioca-coastal-club",
        project: process.env.SENTRY_PROJECT || "javascript-react",
        authToken: process.env.SENTRY_AUTH_TOKEN,
        // Upload source maps for production builds
        sourcemaps: {
          assets: './dist/**',
        },
        // Create release and associate commits
        release: {
          name: process.env.NETLIFY_BUILD_ID || `release-${Date.now()}`,
          create: true,
          finalize: true,
        },
      })
    ] : [])
  ],

  optimizeDeps: {
    exclude: ['lucide-react'],
  },

  build: {
    sourcemap: true,
    // No manual vendor chunking: the live app is now just the landing page,
    // the blog, and FLOW. (self-contained). There's no heavy shared vendor
    // (like the old Supabase data layer) left to isolate, so the bundler's
    // automatic chunking is sufficient — and it sidesteps Rolldown-vite's
    // different manualChunks API (object form isn't supported the way
    // Rollup's was).
  }
});