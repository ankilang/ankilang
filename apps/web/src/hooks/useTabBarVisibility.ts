import { useState, useEffect, useCallback, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const TABBAR_VISIBLE_PATHS = [
  '/app',
  '/app/themes',
  '/app/community',
  '/app/lessons',
  '/app/account'
]

const TABBAR_HIDDEN_PATHS = [
  '/',
  '/auth',
  '/legal',
  '/abonnement',
  '/offline',
  '/app/themes/new',
  '/app/themes/:id/export'
]

function shouldShowTabBar(pathname: string): boolean {
  const isHidden = TABBAR_HIDDEN_PATHS.some(pattern => {
    if (pattern.includes(':')) {
      const regexPattern = pattern.replace(/:[^/]+/g, '[^/]+')
      return new RegExp(`^${regexPattern}$`).test(pathname)
    }
    return pathname.startsWith(pattern)
  })

  if (isHidden) return false

  return TABBAR_VISIBLE_PATHS.some(pattern => {
    if (pattern.includes(':')) {
      const regexPattern = pattern.replace(/:[^/]+/g, '[^/]+')
      return new RegExp(`^${regexPattern}$`).test(pathname)
    }
    return pathname.startsWith(pattern)
  })
}

interface TabBarVisibilityState {
  isVisible: boolean
  isCompact: boolean
  isKeyboardOpen: boolean
}

export function useTabBarVisibility(): TabBarVisibilityState {
  const location = useLocation()
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  const [isCompact, setIsCompact] = useState(false)
  const lastViewportHeight = useRef<number>(0)
  const debounceTimer = useRef<NodeJS.Timeout>()

  const handleVisualViewportChange = useCallback(() => {
    if (typeof window !== 'undefined' && window.visualViewport) {
      const viewport = window.visualViewport
      const windowHeight = window.innerHeight
      const viewportHeight = viewport.height
      const keyboardThreshold = windowHeight * 0.3
      const isOpen = (windowHeight - viewportHeight) > keyboardThreshold
      
      // Éviter les changements de state inutiles
      if (isOpen !== isKeyboardOpen) {
        setIsKeyboardOpen(isOpen)
        setIsCompact(isOpen)
      }
      
      lastViewportHeight.current = viewportHeight
    }
  }, [isKeyboardOpen])

  const handleFocusChange = useCallback(() => {
    if (typeof document !== 'undefined') {
      const activeElement = document.activeElement
      const isInputFocused = activeElement?.tagName === 'INPUT' ||
                             activeElement?.tagName === 'TEXTAREA' ||
                             activeElement?.getAttribute('contenteditable') === 'true'
      
      if (isInputFocused && !isKeyboardOpen) {
        // Debounce pour éviter les changements rapides
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current)
        }
        debounceTimer.current = setTimeout(() => {
          setIsKeyboardOpen(true)
          setIsCompact(true)
        }, 300)
      }
    }
  }, [isKeyboardOpen])

  const handleBlur = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    debounceTimer.current = setTimeout(() => {
      setIsKeyboardOpen(false)
      setIsCompact(false)
    }, 100)
  }, [])

  // Gestion de la rotation et du zoom
  const handleResize = useCallback(() => {
    // Réinitialiser l'état du clavier lors de la rotation
    if (typeof window !== 'undefined' && window.visualViewport) {
      const viewport = window.visualViewport
      const currentHeight = viewport.height
      
      // Si la hauteur a changé significativement (rotation)
      if (Math.abs(currentHeight - lastViewportHeight.current) > 50) {
        setIsKeyboardOpen(false)
        setIsCompact(false)
        lastViewportHeight.current = currentHeight
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialisation
      if (window.visualViewport) {
        lastViewportHeight.current = window.visualViewport.height
      }

      // Écouteurs pour visualViewport (moderne)
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', handleVisualViewportChange)
        window.visualViewport.addEventListener('scroll', handleVisualViewportChange)
      }

      // Écouteurs pour focus/blur (fallback)
      document.addEventListener('focusin', handleFocusChange)
      document.addEventListener('focusout', handleBlur)

      // Écouteurs pour resize/rotation
      window.addEventListener('resize', handleResize)
      window.addEventListener('orientationchange', handleResize)

      // Cleanup
      return () => {
        if (window.visualViewport) {
          window.visualViewport.removeEventListener('resize', handleVisualViewportChange)
          window.visualViewport.removeEventListener('scroll', handleVisualViewportChange)
        }
        document.removeEventListener('focusin', handleFocusChange)
        document.removeEventListener('focusout', handleBlur)
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('orientationchange', handleResize)
        
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current)
        }
      }
    }
    
    // Cleanup par défaut si window n'existe pas
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [handleVisualViewportChange, handleFocusChange, handleBlur, handleResize])

  const isVisible = shouldShowTabBar(location.pathname)

  return {
    isVisible,
    isCompact,
    isKeyboardOpen
  }
}
