import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'

// Layouts
import PublicLayout from '../components/layout/PublicLayout'
import AuthLayout from '../components/layout/AuthLayout'
import LegalLayout from '../components/layout/LegalLayout'
import AppLayout from '../components/layout/AppLayout'

// Pages publiques (lazy)
const Landing = lazy(() => import('../pages/Landing'))
const Abonnement = lazy(() => import('../pages/Abonnement'))
const Offline = lazy(() => import('../pages/Offline'))
const NotFound = lazy(() => import('../pages/NotFound'))

// Auth (lazy)
const Login = lazy(() => import('../pages/auth/Login'))
const Register = lazy(() => import('../pages/auth/Register'))
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'))
const VerifyEmail = lazy(() => import('../pages/auth/VerifyEmail'))

// Légal (lazy)
const Terms = lazy(() => import('../pages/legal/Terms'))
const Privacy = lazy(() => import('../pages/legal/Privacy'))

// Protégées
import ProtectedRoute from '../components/auth/ProtectedRoute'
import ProOnly from '../components/auth/ProOnly'
// Pages protégées (lazy)
const Dashboard = lazy(() => import('../pages/app/Dashboard'))
const ThemesIndex = lazy(() => import('../pages/app/themes/Index'))
const NewTheme = lazy(() => import('../pages/app/themes/New'))
const ThemeDetail = lazy(() => import('../pages/app/themes/Detail'))
const ThemeExport = lazy(() => import('../pages/app/themes/Export'))
const BaseTips = lazy(() => import('../pages/app/resources/BaseTips'))
const FlashcardWorkshop = lazy(() => import('../pages/app/resources/FlashcardWorkshop'))
const ProLibrary = lazy(() => import('../pages/app/resources/ProLibrary'))
const AccountIndex = lazy(() => import('../pages/app/account/Index'))
const AudioTest = lazy(() => import('../pages/test/AudioTest'))

// Fallback de chargement léger
const PageLoadingFallback = ({ type }: { type: 'auth' | 'app' | 'legal' }) => {
  const messages = {
    auth: 'Connexion en cours...',
    app: 'Application en cours de chargement...',
    legal: 'Page légale en cours de chargement...'
  }

  return (
    <div className="flex items-center justify-center min-h-dvh bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="text-center p-8">
        <div className="animate-spin w-10 h-10 border-3 border-slate-300 border-t-slate-600 rounded-full mx-auto mb-4"></div>
        <div className="text-slate-600 font-medium">{messages[type]}</div>
      </div>
    </div>
  )
}

/**
 * Arbre unique de routing (public + auth + protégé)
 * Évite les conflits de wildcard et 404 intempestives.
 */
export const RootRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/" element={<PublicLayout />}>
      <Route index element={<Suspense fallback={<PageLoadingFallback type="app" />}><Landing /></Suspense>} />
      <Route path="abonnement" element={<Suspense fallback={<PageLoadingFallback type="app" />}><Abonnement /></Suspense>} />
      <Route path="offline" element={<Suspense fallback={<PageLoadingFallback type="app" />}><Offline /></Suspense>} />
      {/* Ne pas mettre de catch-all ici pour ne pas intercepter /app */}
    </Route>

    {/* Auth */}
    <Route path="/auth" element={<AuthLayout />}>
      <Route path="login" element={
        <Suspense fallback={<PageLoadingFallback type="auth" />}>
          <Login />
        </Suspense>
      } />
      <Route path="register" element={
        <Suspense fallback={<PageLoadingFallback type="auth" />}>
          <Register />
        </Suspense>
      } />
      <Route path="forgot-password" element={
        <Suspense fallback={<PageLoadingFallback type="auth" />}>
          <ForgotPassword />
        </Suspense>
      } />
      <Route path="verify-email" element={
        <Suspense fallback={<PageLoadingFallback type="auth" />}>
          <VerifyEmail />
        </Suspense>
      } />
    </Route>

    {/* Légal */}
    <Route path="/legal" element={<LegalLayout />}>
      <Route path="terms" element={
        <Suspense fallback={<PageLoadingFallback type="legal" />}>
          <Terms />
        </Suspense>
      } />
      <Route path="privacy" element={
        <Suspense fallback={<PageLoadingFallback type="legal" />}>
          <Privacy />
        </Suspense>
      } />
    </Route>

    {/* Protégé */}
    <Route path="/app" element={
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    }>
      <Route index element={<Dashboard />} />

      {/* Thèmes */}
      <Route path="themes" element={
        <Suspense fallback={<PageLoadingFallback type="app" />}>
          <ThemesIndex />
        </Suspense>
      } />
      <Route path="themes/new" element={
        <Suspense fallback={<PageLoadingFallback type="app" />}>
          <NewTheme />
        </Suspense>
      } />
      <Route path="themes/:id" element={
        <Suspense fallback={<PageLoadingFallback type="app" />}>
          <ThemeDetail />
        </Suspense>
      } />
      <Route path="themes/:id/export" element={
        <Suspense fallback={<PageLoadingFallback type="app" />}>
          <ThemeExport />
        </Suspense>
      } />

      {/* Ressources */}
      <Route path="tips" element={
        <Suspense fallback={<PageLoadingFallback type="app" />}>
          <BaseTips />
        </Suspense>
      } />
      <Route path="workshop" element={
        <Suspense fallback={<PageLoadingFallback type="app" />}>
          <ProOnly>
            <FlashcardWorkshop />
          </ProOnly>
        </Suspense>
      } />
      <Route path="library" element={
        <Suspense fallback={<PageLoadingFallback type="app" />}>
          <ProOnly>
            <ProLibrary />
          </ProOnly>
        </Suspense>
      } />

      {/* Compte */}
      <Route path="account" element={
        <Suspense fallback={<PageLoadingFallback type="app" />}>
          <AccountIndex />
        </Suspense>
      } />

      {/* Dev only */}
      {process.env.NODE_ENV === 'development' && (
        <Route path="test/audio" element={
          <Suspense fallback={<PageLoadingFallback type="app" />}>
            <AudioTest />
          </Suspense>
        } />
      )}
    </Route>

    {/* Catch-all global */}
    <Route path="*" element={<Suspense fallback={<PageLoadingFallback type="app" />}><NotFound /></Suspense>} />
  </Routes>
)
