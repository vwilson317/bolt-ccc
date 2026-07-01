// vite.config.ts
import { sentryVitePlugin } from "file:///sessions/brave-affectionate-brown/mnt/bolt-ccc/node_modules/@sentry/vite-plugin/dist/esm/index.mjs";
import { defineConfig } from "file:///sessions/brave-affectionate-brown/mnt/bolt-ccc/node_modules/vite/dist/node/index.js";
import react from "file:///sessions/brave-affectionate-brown/mnt/bolt-ccc/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { VitePWA } from "file:///sessions/brave-affectionate-brown/mnt/bolt-ccc/node_modules/vite-plugin-pwa/dist/index.js";
var vite_config_default = defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8889",
        changeOrigin: true
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "white_circle_360x360.png"],
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
            src: "white_circle_360x360.png",
            sizes: "360x360",
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
    }),
    // Only upload source maps in production builds when SENTRY_AUTH_TOKEN is available
    ...process.env.SENTRY_AUTH_TOKEN ? [
      sentryVitePlugin({
        org: process.env.SENTRY_ORG || "carioca-coastal-club",
        project: process.env.SENTRY_PROJECT || "javascript-react",
        authToken: process.env.SENTRY_AUTH_TOKEN,
        // Upload source maps for production builds
        sourcemaps: {
          assets: "./dist/**"
        },
        // Create release and associate commits
        release: {
          name: process.env.NETLIFY_BUILD_ID || `release-${Date.now()}`,
          create: true,
          finalize: true
        }
      })
    ] : []
  ],
  optimizeDeps: {
    exclude: ["lucide-react"]
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — tiny, always needed
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // Supabase client is large; isolate so it can be cached independently
          "vendor-supabase": ["@supabase/supabase-js"],
          // Analytics SDKs are non-critical; defer their cache invalidation
          "vendor-analytics": ["posthog-js", "@sentry/react"],
          // i18n libraries
          "vendor-i18n": ["i18next", "react-i18next"]
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvc2Vzc2lvbnMvYnJhdmUtYWZmZWN0aW9uYXRlLWJyb3duL21udC9ib2x0LWNjY1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL3Nlc3Npb25zL2JyYXZlLWFmZmVjdGlvbmF0ZS1icm93bi9tbnQvYm9sdC1jY2Mvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL3Nlc3Npb25zL2JyYXZlLWFmZmVjdGlvbmF0ZS1icm93bi9tbnQvYm9sdC1jY2Mvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBzZW50cnlWaXRlUGx1Z2luIH0gZnJvbSBcIkBzZW50cnkvdml0ZS1wbHVnaW5cIjtcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tICd2aXRlLXBsdWdpbi1wd2EnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBzZXJ2ZXI6IHtcbiAgICBwcm94eToge1xuICAgICAgJy9hcGknOiB7XG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODg4OScsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcblxuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSwgXG4gICAgVml0ZVBXQSh7XG4gICAgICByZWdpc3RlclR5cGU6ICdhdXRvVXBkYXRlJyxcbiAgICAgIGluY2x1ZGVBc3NldHM6IFsnZmF2aWNvbi5pY28nLCAnd2hpdGVfY2lyY2xlXzM2MHgzNjAucG5nJ10sXG4gICAgICBtYW5pZmVzdDoge1xuICAgICAgICBuYW1lOiAnQ2FyaW9jYSBDb2FzdGFsIENsdWInLFxuICAgICAgICBzaG9ydF9uYW1lOiAnQ0NDJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdEaXNjb3ZlciB0aGUgYmVzdCBiZWFjaCB2ZW5kb3JzIChiYXJyYWNhcykgaW4gUmlvIGRlIEphbmVpcm8nLFxuICAgICAgICB0aGVtZV9jb2xvcjogJyMwRUE1RTknLFxuICAgICAgICBiYWNrZ3JvdW5kX2NvbG9yOiAnI2ZmZmZmZicsXG4gICAgICAgIGRpc3BsYXk6ICdzdGFuZGFsb25lJyxcbiAgICAgICAgb3JpZW50YXRpb246ICdwb3J0cmFpdCcsXG4gICAgICAgIHNjb3BlOiAnLycsXG4gICAgICAgIHN0YXJ0X3VybDogJy8nLFxuICAgICAgICBpY29uczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogJ3doaXRlX2NpcmNsZV8zNjB4MzYwLnBuZycsXG4gICAgICAgICAgICBzaXplczogJzM2MHgzNjAnLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZydcbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB3b3JrYm94OiB7XG4gICAgICAgIGdsb2JQYXR0ZXJuczogWycqKi8qLntqcyxjc3MsaHRtbCxpY28scG5nLHN2Z30nXSxcbiAgICAgICAgcnVudGltZUNhY2hpbmc6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICB1cmxQYXR0ZXJuOiAvXmh0dHBzOlxcL1xcL2FwaVxcLm9wZW53ZWF0aGVybWFwXFwub3JnXFwvLiovaSxcbiAgICAgICAgICAgIGhhbmRsZXI6ICdDYWNoZUZpcnN0JyxcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgY2FjaGVOYW1lOiAnd2VhdGhlci1jYWNoZScsXG4gICAgICAgICAgICAgIGV4cGlyYXRpb246IHtcbiAgICAgICAgICAgICAgICBtYXhFbnRyaWVzOiAxMCxcbiAgICAgICAgICAgICAgICBtYXhBZ2VTZWNvbmRzOiA2MCAqIDYwICogMSwgLy8gMSBob3VyXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgIH0pLFxuICAgIC8vIE9ubHkgdXBsb2FkIHNvdXJjZSBtYXBzIGluIHByb2R1Y3Rpb24gYnVpbGRzIHdoZW4gU0VOVFJZX0FVVEhfVE9LRU4gaXMgYXZhaWxhYmxlXG4gICAgLi4uKHByb2Nlc3MuZW52LlNFTlRSWV9BVVRIX1RPS0VOID8gW1xuICAgICAgc2VudHJ5Vml0ZVBsdWdpbih7XG4gICAgICAgIG9yZzogcHJvY2Vzcy5lbnYuU0VOVFJZX09SRyB8fCBcImNhcmlvY2EtY29hc3RhbC1jbHViXCIsXG4gICAgICAgIHByb2plY3Q6IHByb2Nlc3MuZW52LlNFTlRSWV9QUk9KRUNUIHx8IFwiamF2YXNjcmlwdC1yZWFjdFwiLFxuICAgICAgICBhdXRoVG9rZW46IHByb2Nlc3MuZW52LlNFTlRSWV9BVVRIX1RPS0VOLFxuICAgICAgICAvLyBVcGxvYWQgc291cmNlIG1hcHMgZm9yIHByb2R1Y3Rpb24gYnVpbGRzXG4gICAgICAgIHNvdXJjZW1hcHM6IHtcbiAgICAgICAgICBhc3NldHM6ICcuL2Rpc3QvKionLFxuICAgICAgICB9LFxuICAgICAgICAvLyBDcmVhdGUgcmVsZWFzZSBhbmQgYXNzb2NpYXRlIGNvbW1pdHNcbiAgICAgICAgcmVsZWFzZToge1xuICAgICAgICAgIG5hbWU6IHByb2Nlc3MuZW52Lk5FVExJRllfQlVJTERfSUQgfHwgYHJlbGVhc2UtJHtEYXRlLm5vdygpfWAsXG4gICAgICAgICAgY3JlYXRlOiB0cnVlLFxuICAgICAgICAgIGZpbmFsaXplOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICBdIDogW10pXG4gIF0sXG5cbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZXhjbHVkZTogWydsdWNpZGUtcmVhY3QnXSxcbiAgfSxcblxuICBidWlsZDoge1xuICAgIHNvdXJjZW1hcDogdHJ1ZSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgLy8gQ29yZSBSZWFjdCBydW50aW1lIFx1MjAxNCB0aW55LCBhbHdheXMgbmVlZGVkXG4gICAgICAgICAgJ3ZlbmRvci1yZWFjdCc6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlYWN0LXJvdXRlci1kb20nXSxcbiAgICAgICAgICAvLyBTdXBhYmFzZSBjbGllbnQgaXMgbGFyZ2U7IGlzb2xhdGUgc28gaXQgY2FuIGJlIGNhY2hlZCBpbmRlcGVuZGVudGx5XG4gICAgICAgICAgJ3ZlbmRvci1zdXBhYmFzZSc6IFsnQHN1cGFiYXNlL3N1cGFiYXNlLWpzJ10sXG4gICAgICAgICAgLy8gQW5hbHl0aWNzIFNES3MgYXJlIG5vbi1jcml0aWNhbDsgZGVmZXIgdGhlaXIgY2FjaGUgaW52YWxpZGF0aW9uXG4gICAgICAgICAgJ3ZlbmRvci1hbmFseXRpY3MnOiBbJ3Bvc3Rob2ctanMnLCAnQHNlbnRyeS9yZWFjdCddLFxuICAgICAgICAgIC8vIGkxOG4gbGlicmFyaWVzXG4gICAgICAgICAgJ3ZlbmRvci1pMThuJzogWydpMThuZXh0JywgJ3JlYWN0LWkxOG5leHQnXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfVxufSk7Il0sCiAgIm1hcHBpbmdzIjogIjtBQUErVCxTQUFTLHdCQUF3QjtBQUNoVyxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFdBQVc7QUFDbEIsU0FBUyxlQUFlO0FBRXhCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFFBQVE7QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxRQUNOLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFFQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsTUFDTixjQUFjO0FBQUEsTUFDZCxlQUFlLENBQUMsZUFBZSwwQkFBMEI7QUFBQSxNQUN6RCxVQUFVO0FBQUEsUUFDUixNQUFNO0FBQUEsUUFDTixZQUFZO0FBQUEsUUFDWixhQUFhO0FBQUEsUUFDYixhQUFhO0FBQUEsUUFDYixrQkFBa0I7QUFBQSxRQUNsQixTQUFTO0FBQUEsUUFDVCxhQUFhO0FBQUEsUUFDYixPQUFPO0FBQUEsUUFDUCxXQUFXO0FBQUEsUUFDWCxPQUFPO0FBQUEsVUFDTDtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFVBQ1I7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLE1BQ0EsU0FBUztBQUFBLFFBQ1AsY0FBYyxDQUFDLGdDQUFnQztBQUFBLFFBQy9DLGdCQUFnQjtBQUFBLFVBQ2Q7QUFBQSxZQUNFLFlBQVk7QUFBQSxZQUNaLFNBQVM7QUFBQSxZQUNULFNBQVM7QUFBQSxjQUNQLFdBQVc7QUFBQSxjQUNYLFlBQVk7QUFBQSxnQkFDVixZQUFZO0FBQUEsZ0JBQ1osZUFBZSxLQUFLLEtBQUs7QUFBQTtBQUFBLGNBQzNCO0FBQUEsWUFDRjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBO0FBQUEsSUFFRCxHQUFJLFFBQVEsSUFBSSxvQkFBb0I7QUFBQSxNQUNsQyxpQkFBaUI7QUFBQSxRQUNmLEtBQUssUUFBUSxJQUFJLGNBQWM7QUFBQSxRQUMvQixTQUFTLFFBQVEsSUFBSSxrQkFBa0I7QUFBQSxRQUN2QyxXQUFXLFFBQVEsSUFBSTtBQUFBO0FBQUEsUUFFdkIsWUFBWTtBQUFBLFVBQ1YsUUFBUTtBQUFBLFFBQ1Y7QUFBQTtBQUFBLFFBRUEsU0FBUztBQUFBLFVBQ1AsTUFBTSxRQUFRLElBQUksb0JBQW9CLFdBQVcsS0FBSyxJQUFJLENBQUM7QUFBQSxVQUMzRCxRQUFRO0FBQUEsVUFDUixVQUFVO0FBQUEsUUFDWjtBQUFBLE1BQ0YsQ0FBQztBQUFBLElBQ0gsSUFBSSxDQUFDO0FBQUEsRUFDUDtBQUFBLEVBRUEsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLGNBQWM7QUFBQSxFQUMxQjtBQUFBLEVBRUEsT0FBTztBQUFBLElBQ0wsV0FBVztBQUFBLElBQ1gsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBO0FBQUEsVUFFWixnQkFBZ0IsQ0FBQyxTQUFTLGFBQWEsa0JBQWtCO0FBQUE7QUFBQSxVQUV6RCxtQkFBbUIsQ0FBQyx1QkFBdUI7QUFBQTtBQUFBLFVBRTNDLG9CQUFvQixDQUFDLGNBQWMsZUFBZTtBQUFBO0FBQUEsVUFFbEQsZUFBZSxDQUFDLFdBQVcsZUFBZTtBQUFBLFFBQzVDO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
