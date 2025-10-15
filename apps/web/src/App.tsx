import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { PWAProvider } from './contexts/PWAContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'
import { ErrorBoundary } from './components/error/ErrorBoundary'
import PublicLayout from './components/layout/PublicLayout'
import AppLayout from './components/layout/AppLayout'
import AuthLayout from './components/layout/AuthLayout'
import LegalLayout from './components/layout/LegalLayout'
import InstallPrompt from './components/ui/InstallPrompt'
import UpdatePrompt from './components/ui/UpdatePrompt'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Landing from './pages/Landing'
import ProOnly from './components/auth/ProOnly'
import Dashboard from './pages/app/Dashboard'
import Abonnement from './pages/Abonnement'
import Offline from './pages/Offline'
import NotFound from './pages/NotFound'

// Lazy imports pour les sections lourdes
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'))

const Terms = lazy(() => import('./pages/legal/Terms'))
const Privacy = lazy(() => import('./pages/legal/Privacy'))

const ThemesIndex = lazy(() => import('./pages/app/themes/Index'))
const NewTheme = lazy(() => import('./pages/app/themes/New'))
const ThemeDetail = lazy(() => import('./pages/app/themes/Detail'))
const ThemeExport = lazy(() => import('./pages/app/themes/Export'))
const AccountIndex = lazy(() => import('./pages/app/account/Index'))
const BaseTips = lazy(() => import('./pages/app/resources/BaseTips'))

// Test components (dev only)
const AudioTest = lazy(() => import('./pages/test/AudioTest'))
const FlashcardWorkshop = lazy(() => import('./pages/app/resources/FlashcardWorkshop'))
const ProLibrary = lazy(() => import('./pages/app/resources/ProLibrary'))


// Fallback pour Suspense
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-dvh">
    <div className="text-gray-600">Chargement...</div>
  </div>
)

function App() {
  // Prefetch des sections utilisées fréquemment (themes, account)
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
            <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Landing />} />
          <Route path="abonnement" element={<Abonnement />} />
          <Route path="offline" element={<Offline />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Routes d'authentification */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={
            <Suspense fallback={<LoadingFallback />}>
              <Login />
            </Suspense>
          } />
          <Route path="register" element={
            <Suspense fallback={<LoadingFallback />}>
              <Register />
            </Suspense>
          } />
          <Route path="forgot-password" element={
            <Suspense fallback={<LoadingFallback />}>
              <ForgotPassword />
            </Suspense>
          } />
          <Route path="verify-email" element={
            <Suspense fallback={<LoadingFallback />}>
              <VerifyEmail />
            </Suspense>
          } />
        </Route>

        {/* Routes légales */}
        <Route path="/legal" element={<LegalLayout />}>
          <Route path="terms" element={
            <Suspense fallback={<LoadingFallback />}>
              <Terms />
            </Suspense>
          } />
          <Route path="privacy" element={
            <Suspense fallback={<LoadingFallback />}>
              <Privacy />
            </Suspense>
          } />
        </Route>

        {/* Routes de l'application - Protégées par authentification */}
        <Route path="/app" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          
          {/* Thèmes */}
          <Route path="themes" element={
            <Suspense fallback={<LoadingFallback />}>
              <ThemesIndex />
            </Suspense>
          } />
          <Route path="themes/new" element={
            <Suspense fallback={<LoadingFallback />}>
              <NewTheme />
            </Suspense>
          } />
          <Route path="themes/:id" element={
            <Suspense fallback={<LoadingFallback />}>
              <ThemeDetail />
            </Suspense>
          } />
          <Route path="themes/:id/export" element={
            <Suspense fallback={<LoadingFallback />}>
              <ThemeExport />
            </Suspense>
          } />
          
          {/* Ressources */}
          <Route path="tips" element={
            <Suspense fallback={<LoadingFallback />}>
              <BaseTips />
            </Suspense>
          } />
          <Route path="workshop" element={
            <Suspense fallback={<LoadingFallback />}>
              <ProOnly>
                <FlashcardWorkshop />
              </ProOnly>
            </Suspense>
          } />
          <Route path="library" element={
            <Suspense fallback={<LoadingFallback />}>
              <ProOnly>
                <ProLibrary />
              </ProOnly>
            </Suspense>
          } />
          
          {/* Compte */}
          <Route path="account" element={
            <Suspense fallback={<LoadingFallback />}>
              <AccountIndex />
            </Suspense>
          } />
          
          
          {/* Route de test audio (dev only) */}
          {process.env.NODE_ENV === 'development' && (
            <Route path="test/audio" element={
              <Suspense fallback={<LoadingFallback />}>
                <AudioTest />
              </Suspense>
            } />
          )}
        </Route>
      </Routes>
        </PWAProvider>
      </SubscriptionProvider>
    </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
