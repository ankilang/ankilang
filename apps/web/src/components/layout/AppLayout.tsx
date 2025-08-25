import { useState } from 'react'
import { Outlet, Link, NavLink } from 'react-router-dom'
import { BookOpen, Settings, User, Menu, X } from 'lucide-react'
import { usePWAContext } from '../../contexts/PWAContext'
import { useTabBarVisibility } from '../../hooks/useTabBarVisibility'
import TabBar from '../navigation/TabBar'

export default function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isStandalone } = usePWAContext()
  const { isVisible: isTabBarVisible } = useTabBarVisibility()

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // Déterminer si le header doit être masqué/compacté
  const shouldHideHeader = isStandalone && isTabBarVisible

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - masqué en PWA mobile standalone quand TabBar visible */}
      <header className={`bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300 ${shouldHideHeader ? 'hidden md:block' : ''}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Logo */}
              <Link to="/app" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pastel-purple to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="font-playfair text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                  Ankilang
                </span>
              </Link>

              {/* Navigation desktop */}
              <nav className="hidden md:flex items-center gap-6">
                <NavLink
                  to="/app/themes"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors ${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`
                  }
                >
                  Mes thèmes
                </NavLink>
                <NavLink
                  to="/app/community"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors ${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`
                  }
                >
                  Communauté
                </NavLink>
                <NavLink
                  to="/app/lessons"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors ${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`
                  }
                >
                  Leçons
                </NavLink>
              </nav>
            </div>

            {/* Actions utilisateur */}
            <div className="flex items-center gap-4">
              <Link
                to="/app/settings"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Paramètres"
              >
                <Settings className="w-5 h-5" />
              </Link>
              <Link
                to="/app/account"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Mon compte"
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Bouton menu mobile */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Menu principal"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Menu mobile */}
        {isMobileMenuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden border-t bg-white"
            role="navigation"
            aria-label="Menu mobile"
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col gap-4">
                <NavLink
                  to="/app/themes"
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    isActive
                      ? "text-blue-600 font-medium py-2"
                      : "text-gray-600 hover:text-gray-900 py-2"
                  }
                >
                  Mes thèmes
                </NavLink>
                <NavLink
                  to="/app/community"
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    isActive
                      ? "text-blue-600 font-medium py-2"
                      : "text-gray-600 hover:text-gray-900 py-2"
                  }
                >
                  Communauté
                </NavLink>
                <NavLink
                  to="/app/lessons"
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    isActive
                      ? "text-blue-600 font-medium py-2"
                      : "text-gray-600 hover:text-gray-900 py-2"
                  }
                >
                  Leçons
                </NavLink>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Contenu principal avec padding conditionnel pour TabBar */}
      <main 
        className={`app-content ${isStandalone ? 'pt-0' : ''}`}
        style={{
          // Padding bas conditionnel pour éviter que le contenu soit masqué par la TabBar
          paddingBottom: isTabBarVisible 
            ? 'calc(64px + var(--safe-bottom))' 
            : '0'
        }}
      >
        <div className="container mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>

      {/* TabBar - affichée uniquement en PWA standalone et sur les routes appropriées */}
      {isStandalone && <TabBar />}
    </div>
  )
}
