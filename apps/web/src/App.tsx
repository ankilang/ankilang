import { useEffect } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { PWAProvider } from './contexts/PWAContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'
import { ErrorBoundary } from './components/error/ErrorBoundary'
import InstallPrompt from './components/ui/InstallPrompt'
import UpdatePrompt from './components/ui/UpdatePrompt'
import Analytics from './components/Analytics'
import { initSentry } from './lib/sentry'
import { initWebVitals } from './lib/web-vitals'
import { initPerformanceOptimizations, measurePerformance } from './lib/performance'
import { RootRoutes } from './routes/RootRoutes'


function App() {
  // Initialisation du monitoring et des optimisations
  useEffect(() => {
    // Initialiser Sentry
    initSentry()
    
    // Initialiser Web Vitals
    initWebVitals()
    
    // Initialiser les optimisations de performance
    initPerformanceOptimizations()
    
    // Mesurer les performances
    measurePerformance()
  }, [])

  // ✅ PREFETCH SOPHISTIQUÉ PRÉSERVÉ - Logique de prefetch des sections utilisées fréquemment
  useEffect(() => {
    const conn = (navigator as any).connection as {
      saveData?: boolean;
      effectiveType?: string;
    } | undefined

    const isSlow = conn?.effectiveType && /(^2g$|^3g$)/.test(conn.effectiveType)
    const shouldSkip = conn?.saveData || isSlow
    if (shouldSkip) return

    const idle = (cb: () => void) => {
      if ('requestIdleCallback' in window) {
        ;(window as any).requestIdleCallback(cb, { timeout: 3000 })
      } else {
        setTimeout(cb, 1500)
      }
    }

    idle(() => {
      // Charger en arrière-plan sans bloquer le thread principal
      import('./pages/app/themes/Index')
      import('./pages/app/themes/Detail')
      import('./pages/app/account/Index')
    })
  }, [])

  return (
    <ErrorBoundary>
      <AuthProvider>
        <SubscriptionProvider>
          <PWAProvider>
            {/* Analytics respectueux de la vie privée */}
            <Analytics domain="ankilang.com" enabled={process.env.NODE_ENV === 'production'} />
            {/* Barre d'installation PWA */}
            <InstallPrompt />
            {/* Notification de mise à jour PWA */}
            <UpdatePrompt />
            {/* ✅ Arbre unique de routes (public + protégé) */}
            <RootRoutes />
          </PWAProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
