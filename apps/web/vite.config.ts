import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  base: '/', // IMPORTANT pour les routes profondes
  plugins: [
    react(),
    VitePWA({
      disable: false, // ✅ PWA réactivée (regression corrigée)
      registerType: 'autoUpdate', // ✅ SW se met à jour automatiquement
      injectRegister: 'auto',
      manifest: false, // Utilise le manifest externe
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm}'], // ✅ Inclure les fichiers WASM
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [
          /^\/api\//,                    // ✅ Évite les fallbacks sur API
          /^\/sqljs\/.*$/,              // ✅ Protection complète du dossier sqljs
          /^\/assets\/.*\.wasm$/,       // ✅ Protection fichiers WASM
          /^\/manifest\.webmanifest(\?.*)?$/,   // ✅ Protection manifest avec query params
        ],
        // ✅ Cache ID fixe pour éviter les conflits
        cacheId: 'ankilang-v1', // Version statique, incrémente manuellement si besoin de purge cache
        navigationPreload: true, // ✅ Réactivé pour meilleures perfs
        cleanupOutdatedCaches: true, // ✅ Nettoie les anciens caches
        skipWaiting: true, // ✅ Prend effet immédiatement
        clientsClaim: true, // ✅ Contrôle toutes les pages ouvertes
        runtimeCaching: [
          {
            // ✅ Configuration spécifique pour les fichiers SQL.js
            urlPattern: /^\/sqljs\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'sqljs-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 jours
              }
            }
          },
          {
            // ✅ Cache-first pour les médias Appwrite Storage
            urlPattern: ({ url }) => url.pathname.startsWith('/v1/storage/buckets/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'appwrite-media',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 90 // 90 jours
              }
            }
          },
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
  optimizeDeps: {
    include: ['sql.js']
  },
  assetsInclude: ['**/*.wasm'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Alias direct vers le code source du package partagé (évite le pré-build)
      '@ankilang/shared-cache': path.resolve(__dirname, '../../packages/shared-cache/src/index.ts'),
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
        },
        // ✅ Optimisation des performances : chunking manuel
        manualChunks: {
          // Vendor chunks pour les dépendances externes
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'query': ['@tanstack/react-query'],
          'forms': ['react-hook-form', 'zod'],
          // Fonctionnalités spécifiques
          'export': ['sql.js', 'jszip'],
          'cache': ['localforage'],
          'pwa': ['workbox-window']
        },
        // Optimisation pour les gros chunks
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    }
  },
  publicDir: 'public'
})
