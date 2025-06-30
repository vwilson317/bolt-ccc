// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { VitePWA } from "file:///home/project/node_modules/vite-plugin-pwa/dist/index.js";
import lingoCompiler from "file:///home/project/node_modules/lingo.dev/build/compiler.mjs";
var vite_config_default = defineConfig(
  () => lingoCompiler.vite({
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
      "*:*": "groq:mistral-saba-24b"
    }
  })({
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
        manifest: {
          name: "Carioca Coastal Club",
          short_name: "CCC",
          description: "Discover the best beach vendors (barracas) in Rio de Janeiro",
          theme_color: "#0EA5E9",
          background_color: "#ffffff",
          display: "standalone",
          orientation: "portrait",
          scope: "/",
          start_url: "/",
          icons: [
            {
              src: "pwa-192x192.png",
              sizes: "192x192",
              type: "image/png"
            },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png"
            }
          ]
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\.openweathermap\.org\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "weather-cache",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 1
                  // 1 hour
                }
              }
            }
          ]
        }
      })
    ],
    optimizeDeps: {
      exclude: ["lucide-react"]
    }
  })
);
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSAndml0ZS1wbHVnaW4tcHdhJztcbmltcG9ydCBsaW5nb0NvbXBpbGVyIGZyb20gJ2xpbmdvLmRldi9jb21waWxlcic7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoKSA9PlxuICBsaW5nb0NvbXBpbGVyLnZpdGUoe1xuICAgIHNvdXJjZUxvY2FsZTogXCJlblwiLFxuICAgIHRhcmdldExvY2FsZXM6IFtcImVzXCIsIFwicHRcIl0sXG4gICAgc291cmNlUm9vdDogXCJzcmNcIixcbiAgICBsaW5nb0RpcjogXCJsaW5nb1wiLFxuICAgIHByb21wdDogYFlvdSBhcmUgYSBwcm9mZXNzaW9uYWwgdHJhbnNsYXRvciBzcGVjaWFsaXppbmcgaW4gQnJhemlsaWFuIFBvcnR1Z3Vlc2UgYW5kIFNwYW5pc2guIFxuICAgIFRyYW5zbGF0ZSBmcm9tIHtTT1VSQ0VfTE9DQUxFfSB0byB7VEFSR0VUX0xPQ0FMRX0gd2l0aCB0aGVzZSBndWlkZWxpbmVzOlxuICAgIC0gVXNlIEJyYXppbGlhbiBQb3J0dWd1ZXNlIChwdC1CUikgZm9yIFBvcnR1Z3Vlc2UgdHJhbnNsYXRpb25zXG4gICAgLSBNYWludGFpbiBjYXN1YWwsIGJlYWNoLWZyaWVuZGx5IHRvbmVcbiAgICAtIEtlZXAgYnJhbmQgbmFtZXMgdW50cmFuc2xhdGVkXG4gICAgLSBVc2UgY29uc2lzdGVudCB0ZXJtaW5vbG9neSBmb3IgYmVhY2gtcmVsYXRlZCB0ZXJtc1xuICAgIC0gUHJlc2VydmUgdGhlIG9yaWdpbmFsIG1lYW5pbmcgYW5kIGNvbnRleHRgLFxuICAgIG1vZGVsczoge1xuICAgICAgXCIqOipcIjogXCJncm9xOm1pc3RyYWwtc2FiYS0yNGJcIixcbiAgICB9LFxuICB9KSh7XG4gICAgcGx1Z2luczogW1xuICAgICAgcmVhY3QoKSxcbiAgICAgIFZpdGVQV0Eoe1xuICAgICAgICByZWdpc3RlclR5cGU6ICdhdXRvVXBkYXRlJyxcbiAgICAgICAgaW5jbHVkZUFzc2V0czogWydmYXZpY29uLmljbycsICdhcHBsZS10b3VjaC1pY29uLnBuZycsICdtYXNrZWQtaWNvbi5zdmcnXSxcbiAgICAgICAgbWFuaWZlc3Q6IHtcbiAgICAgICAgICBuYW1lOiAnQ2FyaW9jYSBDb2FzdGFsIENsdWInLFxuICAgICAgICAgIHNob3J0X25hbWU6ICdDQ0MnLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnRGlzY292ZXIgdGhlIGJlc3QgYmVhY2ggdmVuZG9ycyAoYmFycmFjYXMpIGluIFJpbyBkZSBKYW5laXJvJyxcbiAgICAgICAgICB0aGVtZV9jb2xvcjogJyMwRUE1RTknLFxuICAgICAgICAgIGJhY2tncm91bmRfY29sb3I6ICcjZmZmZmZmJyxcbiAgICAgICAgICBkaXNwbGF5OiAnc3RhbmRhbG9uZScsXG4gICAgICAgICAgb3JpZW50YXRpb246ICdwb3J0cmFpdCcsXG4gICAgICAgICAgc2NvcGU6ICcvJyxcbiAgICAgICAgICBzdGFydF91cmw6ICcvJyxcbiAgICAgICAgICBpY29uczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBzcmM6ICdwd2EtMTkyeDE5Mi5wbmcnLFxuICAgICAgICAgICAgICBzaXplczogJzE5MngxOTInLFxuICAgICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgc3JjOiAncHdhLTUxMng1MTIucG5nJyxcbiAgICAgICAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcbiAgICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZydcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIHdvcmtib3g6IHtcbiAgICAgICAgICBnbG9iUGF0dGVybnM6IFsnKiovKi57anMsY3NzLGh0bWwsaWNvLHBuZyxzdmd9J10sXG4gICAgICAgICAgcnVudGltZUNhY2hpbmc6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdXJsUGF0dGVybjogL15odHRwczpcXC9cXC9hcGlcXC5vcGVud2VhdGhlcm1hcFxcLm9yZ1xcLy4qL2ksXG4gICAgICAgICAgICAgIGhhbmRsZXI6ICdDYWNoZUZpcnN0JyxcbiAgICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICAgIGNhY2hlTmFtZTogJ3dlYXRoZXItY2FjaGUnLFxuICAgICAgICAgICAgICAgIGV4cGlyYXRpb246IHtcbiAgICAgICAgICAgICAgICAgIG1heEVudHJpZXM6IDEwLFxuICAgICAgICAgICAgICAgICAgbWF4QWdlU2Vjb25kczogNjAgKiA2MCAqIDEsIC8vIDEgaG91clxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICBdLFxuICAgIG9wdGltaXplRGVwczoge1xuICAgICAgZXhjbHVkZTogWydsdWNpZGUtcmVhY3QnXSxcbiAgICB9LFxuICB9KVxuKTsiXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsb0JBQW9CO0FBQ3RQLE9BQU8sV0FBVztBQUNsQixTQUFTLGVBQWU7QUFDeEIsT0FBTyxtQkFBbUI7QUFFMUIsSUFBTyxzQkFBUTtBQUFBLEVBQWEsTUFDMUIsY0FBYyxLQUFLO0FBQUEsSUFDakIsY0FBYztBQUFBLElBQ2QsZUFBZSxDQUFDLE1BQU0sSUFBSTtBQUFBLElBQzFCLFlBQVk7QUFBQSxJQUNaLFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQU9SLFFBQVE7QUFBQSxNQUNOLE9BQU87QUFBQSxJQUNUO0FBQUEsRUFDRixDQUFDLEVBQUU7QUFBQSxJQUNELFNBQVM7QUFBQSxNQUNQLE1BQU07QUFBQSxNQUNOLFFBQVE7QUFBQSxRQUNOLGNBQWM7QUFBQSxRQUNkLGVBQWUsQ0FBQyxlQUFlLHdCQUF3QixpQkFBaUI7QUFBQSxRQUN4RSxVQUFVO0FBQUEsVUFDUixNQUFNO0FBQUEsVUFDTixZQUFZO0FBQUEsVUFDWixhQUFhO0FBQUEsVUFDYixhQUFhO0FBQUEsVUFDYixrQkFBa0I7QUFBQSxVQUNsQixTQUFTO0FBQUEsVUFDVCxhQUFhO0FBQUEsVUFDYixPQUFPO0FBQUEsVUFDUCxXQUFXO0FBQUEsVUFDWCxPQUFPO0FBQUEsWUFDTDtBQUFBLGNBQ0UsS0FBSztBQUFBLGNBQ0wsT0FBTztBQUFBLGNBQ1AsTUFBTTtBQUFBLFlBQ1I7QUFBQSxZQUNBO0FBQUEsY0FDRSxLQUFLO0FBQUEsY0FDTCxPQUFPO0FBQUEsY0FDUCxNQUFNO0FBQUEsWUFDUjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsUUFDQSxTQUFTO0FBQUEsVUFDUCxjQUFjLENBQUMsZ0NBQWdDO0FBQUEsVUFDL0MsZ0JBQWdCO0FBQUEsWUFDZDtBQUFBLGNBQ0UsWUFBWTtBQUFBLGNBQ1osU0FBUztBQUFBLGNBQ1QsU0FBUztBQUFBLGdCQUNQLFdBQVc7QUFBQSxnQkFDWCxZQUFZO0FBQUEsa0JBQ1YsWUFBWTtBQUFBLGtCQUNaLGVBQWUsS0FBSyxLQUFLO0FBQUE7QUFBQSxnQkFDM0I7QUFBQSxjQUNGO0FBQUEsWUFDRjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRixDQUFDO0FBQUEsSUFDSDtBQUFBLElBQ0EsY0FBYztBQUFBLE1BQ1osU0FBUyxDQUFDLGNBQWM7QUFBQSxJQUMxQjtBQUFBLEVBQ0YsQ0FBQztBQUNIOyIsCiAgIm5hbWVzIjogW10KfQo=
