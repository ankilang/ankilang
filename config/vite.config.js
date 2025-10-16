/**
 * Configuration Vite modulaire et documentée
 * Permet de centraliser et réutiliser la configuration
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

/**
 * Crée une configuration Vite optimisée pour Ankilang
 *
 * @param {Object} options - Options de configuration
 * @param {string} options.mode - Mode de build (development/production)
 * @param {boolean} options.enablePWA - Activer le PWA plugin
 * @returns {Object} Configuration Vite
 */
export function createViteConfig(options = {}) {
  const { mode = 'development', enablePWA = true } = options

  return defineConfig({
    base: '/',
    plugins: [
      react(),
      ...(enablePWA ? [createPWAConfig()] : [])
    ],
    optimizeDeps: {
      include: ['sql.js']
    },
    assetsInclude: ['**/*.wasm'],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../apps/web/src'),
        '@ankilang/shared-cache': path.resolve(__dirname, '../packages/shared-cache/src/index.ts'),
      },
    },
    server: {
      port: 5173,
      host: true,
      strictPort: true,
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
          // Optimisation des performances : chunking manuel
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
}

/**
 * Configuration PWA optimisée
 */
function createPWAConfig() {
  return VitePWA({
    disable: false,
    registerType: 'autoUpdate',
    injectRegister: 'auto',
    manifest: false, // Utilise le manifest externe
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm}'],
      navigateFallback: '/index.html',
      navigateFallbackDenylist: [
        /^\/api\//,
        /^\/sqljs\/.*$/,
        /^\/assets\/.*\.wasm$/,
        /^\/manifest\.webmanifest(\?.*)?$/
      ],
      cacheId: `ankilang-${process.env.VITE_SW_CACHE_VERSION ?? 'v4'}`,
      navigationPreload: false,
      cleanupOutdatedCaches: true,
      skipWaiting: true,
      clientsClaim: true,
      runtimeCaching: [
        {
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
    devOptions: { enabled: false },
    minify: false
  })
}

// Configuration par défaut
export default createViteConfig()
