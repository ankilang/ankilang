import { Routes, Route } from 'react-router-dom'
import { Suspense } from 'react'
import PublicLayout from '../components/layout/PublicLayout'
import AuthLayout from '../components/layout/AuthLayout'
import LegalLayout from '../components/layout/LegalLayout'
import Landing from '../pages/Landing'
import Abonnement from '../pages/Abonnement'
import Offline from '../pages/Offline'
import NotFound from '../pages/NotFound'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import ForgotPassword from '../pages/auth/ForgotPassword'
import VerifyEmail from '../pages/auth/VerifyEmail'
import Terms from '../pages/legal/Terms'
import Privacy from '../pages/legal/Privacy'

// Composants de loading optimisés (importés depuis App.tsx)
export const PageLoadingFallback = ({ type }: { type: 'auth' | 'app' | 'legal' }) => {
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
 * Routes principales de l'application
 * Contient les routes publiques, d'authentification et légales
 */
export const AppRoutes = () => (
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

    {/* Routes légales */}
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
  </Routes>
)
