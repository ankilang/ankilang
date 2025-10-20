import { useState, useEffect } from 'react'

/**
 * Hook pour détecter les breakpoints responsive
 * @param query - Media query CSS (ex: '(max-width: 767px)')
 * @returns boolean - true si la query correspond
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    // Initialisation synchrone pour éviter les re-renders
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches
    }
    return false
  })

  useEffect(() => {
    const media = window.matchMedia(query)
    
    // Écouter les changements de taille d'écran
    const listener = () => { setMatches(media.matches); }
    
    // Support moderne
    if (media.addEventListener) {
      media.addEventListener('change', listener)
      return () => { media.removeEventListener('change', listener); }
    } 
    // Support legacy
    media.addListener(listener)
    return () => { media.removeListener(listener); }
  }, [query]) // Supprimer 'matches' des dépendances

  return matches
}

/**
 * Hook spécialisé pour détecter les écrans mobiles
 * @returns boolean - true si l'écran est mobile (< 768px)
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)')
}

/**
 * Hook spécialisé pour détecter les écrans desktop
 * @returns boolean - true si l'écran est desktop (≥ 768px)
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 768px)')
}
