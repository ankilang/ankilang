import { useState, useEffect, useCallback } from 'react'

interface PWAState {
  isStandalone: boolean
  isInstalled: boolean
}

export function usePWA(): PWAState {
  const [pwaState, setPwaState] = useState<PWAState>({
    isStandalone: false,
    isInstalled: false
  })

  // Détection combinée PWA standalone
  const detectStandalone = useCallback((): boolean => {
    // 1. Détection principale : display-mode standalone
    if (typeof window !== 'undefined' && window.matchMedia) {
      const standaloneQuery = window.matchMedia('(display-mode: standalone)')
      if (standaloneQuery.matches) {
        return true
      }
    }

    // 2. Détection iOS : navigator.standalone
    if (typeof navigator !== 'undefined' && 'standalone' in navigator) {
      return navigator.standalone === true
    }

    // 3. Fallback : User Agent iOS (dernier recours)
    if (typeof navigator !== 'undefined' && navigator.userAgent) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      const isStandalone = navigator.userAgent.includes('standalone')
      if (isIOS && isStandalone) {
        return true
      }
    }

    return false
  }, [])

  // Détection installation PWA
  const detectInstalled = useCallback((): boolean => {
    // Vérifier si l'app est installée via display-mode
    if (typeof window !== 'undefined' && window.matchMedia) {
      const standaloneQuery = window.matchMedia('(display-mode: standalone)')
      const fullscreenQuery = window.matchMedia('(display-mode: fullscreen)')
      const minimalUIQuery = window.matchMedia('(display-mode: minimal-ui)')
      
      return standaloneQuery.matches || fullscreenQuery.matches || minimalUIQuery.matches
    }

    return false
  }, [])

  // Mise à jour de l'état PWA
  const updatePWAState = useCallback(() => {
    const isStandalone = detectStandalone()
    const isInstalled = detectInstalled()
    
    setPwaState({ isStandalone, isInstalled })
    
    // Synchroniser la classe CSS sur <body>
    if (typeof document !== 'undefined') {
      const body = document.body
      if (isStandalone) {
        body.classList.add('pwa-standalone')
      } else {
        body.classList.remove('pwa-standalone')
      }
    }
  }, [detectStandalone, detectInstalled])

  useEffect(() => {
    // État initial
    updatePWAState()

    // Écouteurs d'événements pour les changements
    const handleAppInstalled = () => {
      console.log('[PWA] App installed')
      updatePWAState()
    }

    const handleDisplayModeChange = (event: MediaQueryListEvent) => {
      console.log('[PWA] Display mode changed:', event.media, event.matches)
      updatePWAState()
    }

    const handleOrientationChange = () => {
      // Corriger les glitchs Android post-rotation
      setTimeout(updatePWAState, 100)
    }

    const handleVisualViewportResize = () => {
      // Corriger les glitchs Android post-rotation
      setTimeout(updatePWAState, 100)
    }

    // Ajouter les écouteurs
    if (typeof window !== 'undefined') {
      // Installation PWA
      window.addEventListener('appinstalled', handleAppInstalled)
      
      // Changement de mode d'affichage
      const standaloneQuery = window.matchMedia('(display-mode: standalone)')
      const fullscreenQuery = window.matchMedia('(display-mode: fullscreen)')
      const minimalUIQuery = window.matchMedia('(display-mode: minimal-ui)')
      
      standaloneQuery.addEventListener('change', handleDisplayModeChange)
      fullscreenQuery.addEventListener('change', handleDisplayModeChange)
      minimalUIQuery.addEventListener('change', handleDisplayModeChange)
      
      // Correction des glitchs Android
      window.addEventListener('orientationchange', handleOrientationChange)
      
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', handleVisualViewportResize)
      }
    }

    // Cleanup
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('appinstalled', handleAppInstalled)
        
        const standaloneQuery = window.matchMedia('(display-mode: standalone)')
        const fullscreenQuery = window.matchMedia('(display-mode: fullscreen)')
        const minimalUIQuery = window.matchMedia('(display-mode: minimal-ui)')
        
        standaloneQuery.removeEventListener('change', handleDisplayModeChange)
        fullscreenQuery.removeEventListener('change', handleDisplayModeChange)
        minimalUIQuery.removeEventListener('change', handleDisplayModeChange)
        
        window.removeEventListener('orientationchange', handleOrientationChange)
        
        if (window.visualViewport) {
          window.visualViewport.removeEventListener('resize', handleVisualViewportResize)
        }
      }
    }
  }, [updatePWAState])

  return pwaState
}
