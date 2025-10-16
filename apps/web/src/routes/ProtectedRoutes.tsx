import { Routes, Route } from 'react-router-dom'
import { Suspense } from 'react'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import ProOnly from '../components/auth/ProOnly'
import AppLayout from '../components/layout/AppLayout'
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

// Composants de loading optimisés (importés depuis App.tsx)
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
 * Routes protégées de l'application
 * Nécessitent une authentification pour y accéder
 */
export const ProtectedRoutes = () => (
  <Routes>
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

      {/* Route de test audio (dev only) */}
      {process.env.NODE_ENV === 'development' && (
        <Route path="test/audio" element={
          <Suspense fallback={<PageLoadingFallback type="app" />}>
            <AudioTest />
          </Suspense>
        } />
      )}
    </Route>
  </Routes>
)
