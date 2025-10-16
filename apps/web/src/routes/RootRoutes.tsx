import { Routes, Route } from 'react-router-dom'
import { Suspense } from 'react'

// Layouts
import PublicLayout from '../components/layout/PublicLayout'
import AuthLayout from '../components/layout/AuthLayout'
import LegalLayout from '../components/layout/LegalLayout'
import AppLayout from '../components/layout/AppLayout'

// Pages publiques
import Landing from '../pages/Landing'
import Abonnement from '../pages/Abonnement'
import Offline from '../pages/Offline'
import NotFound from '../pages/NotFound'

// Auth
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import ForgotPassword from '../pages/auth/ForgotPassword'
import VerifyEmail from '../pages/auth/VerifyEmail'

// Légal
import Terms from '../pages/legal/Terms'
import Privacy from '../pages/legal/Privacy'

// Protégées
import ProtectedRoute from '../components/auth/ProtectedRoute'
import ProOnly from '../components/auth/ProOnly'
import Dashboard from '../pages/app/Dashboard'
import ThemesIndex from '../pages/app/themes/Index'
import NewTheme from '../pages/app/themes/New'
import ThemeDetail from '../pages/app/themes/Detail'
import ThemeExport from '../pages/app/themes/Export'
import BaseTips from '../pages/app/resources/BaseTips'
import FlashcardWorkshop from '../pages/app/resources/FlashcardWorkshop'
import ProLibrary from '../pages/app/resources/ProLibrary'
import AccountIndex from '../pages/app/account/Index'
import AudioTest from '../pages/test/AudioTest'

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
      <Route index element={<Landing />} />
      <Route path="abonnement" element={<Abonnement />} />
      <Route path="offline" element={<Offline />} />
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
    <Route path="*" element={<NotFound />} />
  </Routes>
)

