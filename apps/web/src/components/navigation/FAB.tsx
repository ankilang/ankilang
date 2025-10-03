import { memo, useCallback, useRef } from 'react'
import { Plus } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { usePWAContext } from '../../contexts/PWAContext'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'

// Pages où le FAB ne doit pas s'afficher
const FAB_HIDDEN_PATHS = [
  '/app/themes/new', // Page de création de thème
  '/app/themes/:id/export', // Page d'export
  '/app/community/:deckId', // Détail deck
  '/app/lessons/:lessonId', // Détail leçon
  '/app/account', // Compte utilisateur
  '/', // Landing page
  '/auth', // Pages d'auth
  '/legal', // Pages légales
  '/abonnement', // Page abonnement
  '/offline' // Page offline
]

// Vérifier si le FAB doit être masqué sur la route actuelle
function shouldHideFAB(pathname: string): boolean {
  return FAB_HIDDEN_PATHS.some(pattern => {
    // Gestion des paramètres dynamiques
    if (pattern.includes(':')) {
      const regexPattern = pattern.replace(/:[^/]+/g, '[^/]+')
      return new RegExp(`^${regexPattern}$`).test(pathname)
    }
    return pathname.startsWith(pattern)
  })
}

interface FABProps {
  className?: string
}

const FAB = memo(({ className = '' }: FABProps) => {
  const { isInstalled } = usePWAContext()
  const location = useLocation()
  const navigate = useNavigate()
  const isOnline = useOnlineStatus()
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Ne pas afficher le FAB si pas en mode PWA installée
  if (!isInstalled) {
    return null
  }

  // Masquer le FAB sur certaines pages
  if (shouldHideFAB(location.pathname)) {
    return null
  }

  const handleClick = useCallback(() => {
    // Navigation vers la page de création de thème
    navigate('/app/themes/new')
  }, [navigate])

  // Gestion du focus pour l'accessibilité
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick()
    }
  }, [handleClick])

  // Optimisation pour les devices tactiles
  const handleTouchStart = useCallback(() => {
    if (buttonRef.current) {
      buttonRef.current.style.transform = 'scale(0.95)'
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (buttonRef.current) {
      buttonRef.current.style.transform = ''
    }
  }, [])

  return (
    <div className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40 ${className}`}>
      {/* Badge Offline */}
      {!isOnline && (
        <div 
          className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"
          style={{
            animation: window.matchMedia('(prefers-reduced-motion: reduce)').matches 
              ? 'none' 
              : 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
          aria-label="Hors ligne"
          role="status"
        />
      )}
      
      {/* Bouton FAB */}
      <button
        ref={buttonRef}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label="Créer un nouveau thème"
        className={`
          w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg
          flex items-center justify-center
          transition-[opacity,transform] duration-150 ease-out
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
          active:scale-95
          touch-manipulation
          ${!isOnline ? 'opacity-75' : ''}
        `}
        style={{
          // Respecter prefers-reduced-motion
          transition: window.matchMedia('(prefers-reduced-motion: reduce)').matches 
            ? 'none' 
            : 'opacity 150ms ease-out, transform 150ms ease-out',
          // Optimisation pour les devices haute densité
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        <Plus className="w-6 h-6" aria-hidden="true" />
      </button>
    </div>
  )
})

FAB.displayName = 'FAB'

export default FAB
