import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import lingoCompiler from 'lingo.dev/compiler';

export default defineConfig(() =>
  lingoCompiler.vite({
    sourceLocale: "en",
    targetLocales: ["es", "pt"],
    sourceRoot: "src",
    lingoDir: "lingo",
    prompt: `You are a professional translator specializing in Brazilian Portuguese and Spanish. 
    Translate from {SOURCE_LOCALE} to {TARGET_LOCALE} with these guidelines:
    - Use Brazilian Portuguese (pt-BR) for Portuguese translations
    - Maintain casual, beach-friendly tone
    - Keep brand names untranslated
    - Use consistent terminology for beach-related terms
    - Preserve the original meaning and context`,
    models: {
      "*:*": "groq:mistral-saba-24b",
    },
  })({
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
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
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
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
    ],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  })
);