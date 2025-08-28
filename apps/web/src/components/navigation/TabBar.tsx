import { memo, useCallback, useRef } from 'react'
import { Home, BookOpen, Users, GraduationCap, User } from 'lucide-react'
import { usePWAContext } from '../../contexts/PWAContext'
import { useTabNavigation } from '../../hooks/useTabNavigation'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { useTabBarVisibility } from '../../hooks/useTabBarVisibility'
import FAB from './FAB'
import { useSubscription } from '../../contexts/SubscriptionContext'

interface TabItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  ariaLabel: string
}

const TAB_ITEMS: TabItem[] = [
  {
    id: 'dashboard',
    label: 'Accueil',
    icon: Home,
    ariaLabel: 'Accéder au tableau de bord'
  },
  {
    id: 'themes',
    label: 'Thèmes',
    icon: BookOpen,
    ariaLabel: 'Accéder aux thèmes'
  },
  {
    id: 'community',
    label: 'Communauté',
    icon: Users,
    ariaLabel: 'Accéder à la communauté'
  },
  {
    id: 'lessons',
    label: 'Leçons',
    icon: GraduationCap,
    ariaLabel: 'Accéder aux leçons'
  },
  {
    id: 'account',
    label: 'Compte',
    icon: User,
    ariaLabel: 'Accéder à mon compte'
  }
]

// Composant Tab individuel mémorisé pour éviter les re-rendus
const TabButton = memo(({ item, isActive, onClick, isCompact }: {
  item: TabItem
  isActive: boolean
  onClick: () => void
  isCompact: boolean
}) => {
  const Icon = item.icon
  const buttonRef = useRef<HTMLButtonElement>(null)
  
  // Gestion du focus pour l'accessibilité
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick()
    }
  }, [onClick])

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
    <button
      ref={buttonRef}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label={item.ariaLabel}
      className={`
        flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-2 py-1 rounded-lg
        transition-[opacity,transform] duration-150 ease-out
        ${isActive 
          ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-slate-800/50'
        }
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
        active:scale-95
        touch-manipulation
      `}
      style={{
        // Respecter prefers-reduced-motion
        transition: window.matchMedia('(prefers-reduced-motion: reduce)').matches 
          ? 'none' 
          : 'opacity 150ms ease-out, transform 150ms ease-out',
        // Optimisation pour les devices haute densité
        WebkitTapHighlightColor: 'transparent'
      }}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon 
        className={`${isCompact ? 'w-5 h-5' : 'w-6 h-6'} mb-1`} 
        aria-hidden="true" 
      />
      {!isCompact && (
        <span className="text-xs font-medium leading-tight select-none">
          {item.label}
        </span>
      )}
    </button>
  )
})

TabButton.displayName = 'TabButton'

function TabBar() {
  const { isInstalled } = usePWAContext()
  const { plan } = useSubscription()
  const isPro = plan !== 'free'
  const { isTabActive, navigateToTab } = useTabNavigation()
  const isOnline = useOnlineStatus()
  const { isVisible, isCompact, isKeyboardOpen } = useTabBarVisibility()
  const navRef = useRef<HTMLElement>(null)

  // Ne pas afficher la TabBar si pas en mode PWA installée
  if (!isInstalled) {
    return null
  }

  // Ne pas afficher la TabBar si elle doit être masquée
  if (!isVisible) {
    return null
  }

  // Optimisation pour les foldables et écrans larges
  const isWideScreen = typeof window !== 'undefined' && window.innerWidth >= 768

  return (
    <>
      {/* FAB - masqué quand le clavier est ouvert */}
      {!isKeyboardOpen && <FAB />}
      
      {/* TabBar */}
      <nav
        ref={navRef}
        role="navigation"
        aria-label="Navigation principale"
        className={`
          fixed bottom-0 left-0 right-0 z-50 
          bg-white/80 backdrop-blur-md shadow-lg shadow-black/10 border-t border-white/20 
          dark:bg-slate-900/70 dark:border-slate-700/30
          transition-all duration-300 ease-out
          ${isCompact ? 'h-12' : 'h-16'}
          ${isKeyboardOpen ? 'transform translate-y-full' : 'transform translate-y-0'}
          ${isWideScreen ? 'max-w-md mx-auto' : ''}
        `}
        style={{
          paddingBottom: isCompact 
            ? 'calc(48px + env(safe-area-inset-bottom, 0px))'
            : 'calc(64px + env(safe-area-inset-bottom, 0px))',
          // Respecter prefers-reduced-motion
          transition: window.matchMedia('(prefers-reduced-motion: reduce)').matches 
            ? 'none' 
            : 'all 300ms ease-out',
          // Optimisation pour les devices haute densité
          WebkitBackdropFilter: 'blur(12px)',
          backdropFilter: 'blur(12px)'
        }}
      >
        {/* Badge Offline discret */}
        {!isOnline && (
          <div 
            className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"
            style={{
              animation: window.matchMedia('(prefers-reduced-motion: reduce)').matches 
                ? 'none' 
                : 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}
            aria-label="Hors ligne"
            role="status"
          />
        )}
        
        <div className="flex items-center justify-around h-full px-2">
          {TAB_ITEMS.filter(item =>
            isPro ? true : (item.id !== 'community' && item.id !== 'lessons')
          ).map((item) => (
            <TabButton
              key={item.id}
              item={item}
              isActive={isTabActive(item.id)}
              onClick={() => navigateToTab(item.id)}
              isCompact={isCompact}
            />
          ))}
        </div>
      </nav>
    </>
  )
}

export default memo(TabBar)
