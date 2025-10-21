import { Outlet, Link, useLocation } from 'react-router-dom'
import AnkilangLogo from '../ui/AnkilangLogo'

export default function PublicLayout() {
  const location = useLocation()
  const isLandingPage = location.pathname === '/'
  const isAbonnementPage = location.pathname === '/abonnement'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header conditionnel - pas affiché sur la landing page ni la page abonnement */}
      {!isLandingPage && !isAbonnementPage && (
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link 
                to="/" 
                className="flex items-center gap-3 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
              >
                <AnkilangLogo size="default" animated={true} />
                <span className="font-display bg-gradient-to-r from-violet-600 to-violet-800 bg-clip-text text-transparent">
                  Ankilang
                </span>
              </Link>
              <nav className="flex items-center gap-4">
                <Link 
                  to="/app" 
                  className="btn-primary text-sm"
                >
                  Tableau de bord
                </Link>
              </nav>
            </div>
          </div>
        </header>
      )}

      <main className="min-h-dvh">
        <Outlet />
      </main>
    </div>
  )
}
