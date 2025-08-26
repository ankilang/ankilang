import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { PWAProvider } from './contexts/PWAContext'
import PublicLayout from './components/layout/PublicLayout'
import AppLayout from './components/layout/AppLayout'
import AuthLayout from './components/layout/AuthLayout'
import LegalLayout from './components/layout/LegalLayout'
import InstallPrompt from './components/ui/InstallPrompt'
import UpdatePrompt from './components/ui/UpdatePrompt'
import Landing from './pages/Landing'
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
const CommunityIndex = lazy(() => import('./pages/app/community/Index'))
const CommunityDeck = lazy(() => import('./pages/app/community/Deck'))
const LessonsIndex = lazy(() => import('./pages/app/lessons/Index'))
const LessonDetail = lazy(() => import('./pages/app/lessons/Lesson'))
const AccountIndex = lazy(() => import('./pages/app/account/Index'))
const SettingsIndex = lazy(() => import('./pages/app/settings/Index'))

// Fallback pour Suspense
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-dvh">
    <div className="text-gray-600">Chargement...</div>
  </div>
)

function App() {
  return (
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

        {/* Routes de l'application */}
        <Route path="/app" element={<AppLayout />}>
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
          
          {/* Communauté */}
          <Route path="community" element={
            <Suspense fallback={<LoadingFallback />}>
              <CommunityIndex />
            </Suspense>
          } />
          <Route path="community/:deckId" element={
            <Suspense fallback={<LoadingFallback />}>
              <CommunityDeck />
            </Suspense>
          } />
          
          {/* Leçons */}
          <Route path="lessons" element={
            <Suspense fallback={<LoadingFallback />}>
              <LessonsIndex />
            </Suspense>
          } />
          <Route path="lessons/:lessonId" element={
            <Suspense fallback={<LoadingFallback />}>
              <LessonDetail />
            </Suspense>
          } />
          
          {/* Compte */}
          <Route path="account" element={
            <Suspense fallback={<LoadingFallback />}>
              <AccountIndex />
            </Suspense>
          } />
          
          {/* Paramètres */}
          <Route path="settings" element={
            <Suspense fallback={<LoadingFallback />}>
              <SettingsIndex />
            </Suspense>
          } />
        </Route>
      </Routes>
    </PWAProvider>
  )
}

export default App
