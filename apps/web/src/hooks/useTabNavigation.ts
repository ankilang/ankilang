import { useCallback, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

interface TabConfig {
  id: string
  path: string
  rootPath: string
}

const TAB_CONFIGS: TabConfig[] = [
  { id: 'dashboard', path: '/app', rootPath: '/app' },
  { id: 'themes', path: '/app/themes', rootPath: '/app/themes' },
  { id: 'tips', path: '/app/tips', rootPath: '/app/tips' },
  { id: 'workshop', path: '/app/workshop', rootPath: '/app/workshop' },
  { id: 'library', path: '/app/library', rootPath: '/app/library' },
  { id: 'account', path: '/app/account', rootPath: '/app/account' }
]

export function useTabNavigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const scrollPositions = useRef<Record<string, number>>({})
  const lastVisitedTab = useRef<string>('')

  // Déterminer l'onglet actif basé sur le path actuel
  const getActiveTab = useCallback((): string => {
    const currentPath = location.pathname
    
    // Vérifier si on est sur une route d'onglet
    for (const tab of TAB_CONFIGS) {
      if (currentPath === tab.path || currentPath.startsWith(tab.path + '/')) {
        return tab.id
      }
    }
    
    return 'dashboard' // fallback
  }, [location.pathname])

  // Navigation vers un onglet avec gestion du scroll
  const navigateToTab = useCallback((tabId: string) => {
    const tab = TAB_CONFIGS.find(t => t.id === tabId)
    if (!tab) return

    const currentTab = getActiveTab()
    const targetPath = tab.rootPath

    // Sauvegarder la position de scroll actuelle
    if (currentTab && currentTab !== tabId) {
      scrollPositions.current[currentTab] = window.scrollY
    }

    // Si on clique sur l'onglet actif
    if (currentTab === tabId) {
      // Si on est sur une sous-route, revenir à la racine
      if (location.pathname !== targetPath) {
        navigate(targetPath)
        return
      }
      
      // Sinon, scroll to top
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
      return
    }

    // Navigation vers un nouvel onglet
    lastVisitedTab.current = currentTab
    navigate(targetPath)
  }, [location.pathname, navigate, getActiveTab])

  // Restaurer la position de scroll après navigation
  const restoreScrollPosition = useCallback((tabId: string) => {
    const savedPosition = scrollPositions.current[tabId]
    if (savedPosition !== undefined) {
      // Petit délai pour laisser le DOM se mettre à jour
      setTimeout(() => {
        window.scrollTo({
          top: savedPosition,
          behavior: 'instant' // Pas d'animation pour la restauration
        })
      }, 100)
    }
  }, [])

  // Vérifier si un onglet est actif (avec matching par préfixe)
  const isTabActive = useCallback((tabId: string): boolean => {
    const tab = TAB_CONFIGS.find(t => t.id === tabId)
    if (!tab) return false

    const currentPath = location.pathname
    return currentPath === tab.path || currentPath.startsWith(tab.path + '/')
  }, [location.pathname])

  // Obtenir le path racine d'un onglet
  const getTabRootPath = useCallback((tabId: string): string => {
    const tab = TAB_CONFIGS.find(t => t.id === tabId)
    return tab?.rootPath || '/app'
  }, [])

  return {
    getActiveTab,
    navigateToTab,
    restoreScrollPosition,
    isTabActive,
    getTabRootPath,
    lastVisitedTab: lastVisitedTab.current
  }
}
