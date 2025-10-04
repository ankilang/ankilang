import { useEffect, useState } from 'react'
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom'
import { User, Menu, X, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import AnkilangLogo from '../ui/AnkilangLogo'
import SafeArea from '../ui/SafeArea'
import { usePWAContext } from '../../contexts/PWAContext'
import { useSubscription, TESTER_ID } from '../../contexts/SubscriptionContext'
import { useAuth } from '../../hooks/useAuth'
import { useTabBarVisibility } from '../../hooks/useTabBarVisibility'
import TabBar from '../navigation/TabBar'
import ConfirmModal from '../ui/ConfirmModal'

export default function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const { isInstalled } = usePWAContext()
  const { plan, toggleTestMode } = useSubscription()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isPro = plan !== 'free'
  const { isVisible: isTabBarVisible } = useTabBarVisibility()
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handler = () => setIsMobileViewport(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const hasBottomNav = (isInstalled || isMobileViewport) && isTabBarVisible

  // Déterminer si le header doit être masqué/compacté
  const shouldHideHeader = hasBottomNav

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - masqué en PWA mobile standalone quand TabBar visible */}
      <SafeArea top={true}>
        <header className={`bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300 ${shouldHideHeader ? 'hidden md:block' : ''}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Logo */}
              <Link to="/app" className="flex items-center gap-3">
                <AnkilangLogo size="default" animated={true} />
                <span className="font-playfair text-xl font-bold bg-gradient-to-r from-violet-600 to-violet-800 bg-clip-text text-transparent">
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
                {isPro && (
                  <>
                    <NavLink
                      to="/app/learning"
                      className={({ isActive }) =>
                        `text-sm font-medium transition-colors ${
                          isActive
                            ? "text-blue-600"
                            : "text-gray-600 hover:text-gray-900"
                        }`
                      }
                    >
                      Apprentissage
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
                  </>
                )}
              </nav>
            </div>

            {/* Actions utilisateur */}
            <div className="flex items-center gap-4">
              {/* Bouton de test pour basculer entre modes gratuit/premium */}
              {(process.env.NODE_ENV === 'development' || user?.$id === TESTER_ID) && (
                <motion.button
                  onClick={toggleTestMode}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    plan !== 'free'
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}
                  title={`Actuellement en mode ${plan !== 'free' ? 'Premium' : 'Gratuit'} - Cliquer pour basculer`}
                >
                  {plan !== 'free' ? '👑 Premium' : '🔒 Gratuit'}
                </motion.button>
              )}

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
                {isPro && (
                  <>
                    <NavLink
                      to="/app/learning"
                      onClick={closeMobileMenu}
                      className={({ isActive }) =>
                        isActive
                          ? "text-blue-600 font-medium py-2"
                          : "text-gray-600 hover:text-gray-900 py-2"
                      }
                    >
                      Apprentissage
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
                  </>
                )}
                
                {/* Bouton de déconnexion */}
                <button
                  onClick={() => {
                    closeMobileMenu()
                    setShowLogoutModal(true)
                  }}
                  className="flex items-center gap-2 text-red-600 hover:text-red-800 py-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Se déconnecter
                </button>
              </nav>
            </div>
          </div>
        )}
        </header>
      </SafeArea>

      {/* Contenu principal avec padding conditionnel pour TabBar */}
      <main 
        className="app-content"
        style={{
          paddingBottom: hasBottomNav
            ? 'calc(64px + env(safe-area-inset-bottom, 0px))' 
            : '0',
          paddingTop: isInstalled ? 'var(--safe-top)' : '0' // Ajout pour la safe area du haut
        }}
      >
        {/* Supprimer le container mx-auto px-4 py-6 pour laisser les pages gérer leur propre layout */}
        <Outlet />
      </main>

      {/* TabBar - affichée uniquement en PWA installée et sur les routes appropriées */}
      {isInstalled && <TabBar />}

      {/* Modal de confirmation de déconnexion */}
      <ConfirmModal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          handleLogout()
          setShowLogoutModal(false)
        }}
        title="Se déconnecter"
        description="Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à vos thèmes et flashcards."
        confirmLabel="Se déconnecter"
        isDanger={true}
      />
    </div>
  )
}
