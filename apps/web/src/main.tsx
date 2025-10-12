import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
// Local fonts (self-hosted)
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/playfair-display/400.css'
import '@fontsource/playfair-display/700.css'
import '@fontsource/playfair-display/900.css'
import './index.css'

// Cache migration et configuration
import { migrateLegacyCache } from './services/cache/migrate-legacy'
import { logFlags, validateFlags } from './config/flags'

// ✅ Bootstrap anti-cache PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // Rechargement dur pour évacuer l'ancien bundle
    console.log('🔄 Service Worker updated, reloading...')
    window.location.reload()
  })
}

// ✅ Initialisation du cache et migration legacy
async function initializeCache() {
  try {
    // Valider la configuration des flags
    const { valid, errors } = validateFlags()
    if (!valid) {
      console.error('[Cache][init] Configuration invalide:', errors)
      return
    }

    // Logger la configuration (dev seulement)
    logFlags()

    // Migrer les anciens caches
    const { moved, errors: migrationErrors } = await migrateLegacyCache()
    if (moved > 0) {
      console.info(`[Cache][init] Migration terminée: ${moved} fichiers migrés`)
    }
    if (migrationErrors > 0) {
      console.warn(`[Cache][init] ${migrationErrors} erreurs lors de la migration`)
    }
  } catch (error) {
    console.error('[Cache][init] Erreur lors de l\'initialisation:', error)
  }
}

// Lancer l'initialisation du cache
initializeCache()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
