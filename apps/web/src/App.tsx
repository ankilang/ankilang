import { useEffect } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { PWAProvider } from './contexts/PWAContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'
import { ErrorBoundary } from './components/error/ErrorBoundary'
import InstallPrompt from './components/ui/InstallPrompt'
import UpdatePrompt from './components/ui/UpdatePrompt'
import { AppRoutes } from './routes/AppRoutes'
import { ProtectedRoutes } from './routes/ProtectedRoutes'


function App() {
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
            {/* Barre d'installation PWA */}
            <InstallPrompt />
            {/* Notification de mise à jour PWA */}
            <UpdatePrompt />
            {/* ✅ Routes organisées en modules pour une meilleure maintenabilité */}
            <AppRoutes />
            <ProtectedRoutes />
          </PWAProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
