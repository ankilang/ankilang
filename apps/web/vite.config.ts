import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      disable: false, // ✅ PWA activée en production
      registerType: 'autoUpdate', // ✅ SW se met à jour automatiquement
      injectRegister: 'auto',
      manifest: false, // Utilise le manifest externe
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//], // ✅ Évite les fallbacks sur API
        navigationPreload: true,
        cleanupOutdatedCaches: true, // ✅ Nettoie les anciens caches
        skipWaiting: true, // ✅ Prend effet immédiatement
        clientsClaim: true, // ✅ Contrôle toutes les pages ouvertes
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          }
        ]
      },
      devOptions: { enabled: false }, // ✅ Pas de SW en dev
      minify: false
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    strictPort: true, // Forcer le port 5173, ne pas utiliser d'alternative
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Garder les drapeaux dans un dossier flags/
          if (assetInfo.name && assetInfo.name.endsWith('.svg') && assetInfo.name.includes('flag')) {
            return 'assets/flags/[name].[ext]'
          }
          return 'assets/[name]-[hash].[ext]'
        }
      }
    }
  },
  publicDir: 'public'
})
