import { useEffect, useRef, useState, useCallback } from 'react'

type AnimationState = 'idle' | 'scheduling' | 'sliding' | 'resetting'

interface UseRotatingAnimationOptions {
  items: React.ReactNode[]
  /** Durée d'affichage immobile de chaque mot (en ms) */
  holdMs?: number
  /** Durée de la transition du slide (en ms) */
  slideMs?: number
  /** Démarrer automatiquement l'animation */
  autoStart?: boolean
}

interface UseRotatingAnimationReturn {
  currentIndex: number
  animationState: AnimationState
  isSliding: boolean
  duplicatedItems: React.ReactNode[]
  transform: string
  transition: string
  handleTransitionEnd: () => void
  start: () => void
  stop: () => void
  reset: () => void
}

/**
 * Hook personnalisé pour gérer l'animation de rotation de texte
 * 
 * @param options - Options de configuration de l'animation
 * @returns Objet contenant l'état et les méthodes de contrôle de l'animation
 * 
 * @example
 * ```tsx
 * const { transform, transition, handleTransitionEnd } = useRotatingAnimation({
 *   items: ['Item 1', 'Item 2', 'Item 3'],
 *   holdMs: 3000,
 *   slideMs: 500,
 *   autoStart: true
 * })
 * ```
 */
export function useRotatingAnimation({
  items,
  holdMs = 3600,
  slideMs = 700,
  autoStart = true,
}: UseRotatingAnimationOptions): UseRotatingAnimationReturn {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [animationState, setAnimationState] = useState<AnimationState>('idle')
  
  const cycleTimerRef = useRef<number | null>(null)
  const safetyTimerRef = useRef<number | null>(null)
  const prefersReducedRef = useRef(false)

  // Duplique le premier item à la fin pour une boucle fluide
  const duplicatedItems = items.length > 1 ? [...items, items[0]] : items

  // Détection des préférences de mouvement réduit
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedRef.current = mediaQuery.matches

    const handleChange = () => {
      prefersReducedRef.current = mediaQuery.matches
      if (mediaQuery.matches) {
        stop()
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => { mediaQuery.removeEventListener('change', handleChange); }
  }, [])

  // Cleanup des timers
  const clearTimers = useCallback(() => {
    if (cycleTimerRef.current) {
      window.clearTimeout(cycleTimerRef.current)
      cycleTimerRef.current = null
    }
    if (safetyTimerRef.current) {
      window.clearTimeout(safetyTimerRef.current)
      safetyTimerRef.current = null
    }
  }, [])

  // Programmer le prochain cycle
  const scheduleNextCycle = useCallback(() => {
    if (prefersReducedRef.current || items.length <= 1) return

    clearTimers()
    setAnimationState('scheduling')

    cycleTimerRef.current = window.setTimeout(() => {
      setAnimationState('sliding')
      setCurrentIndex(prev => prev + 1)
    }, holdMs) as unknown as number

    // Timer de sécurité pour éviter les blocages
    safetyTimerRef.current = window.setTimeout(() => {
      if (animationState === 'sliding') {
        console.warn('[RotatingLanguage] Animation safety timeout triggered')
        handleTransitionEnd()
      }
    }, holdMs + slideMs + 1000) as unknown as number
  }, [holdMs, slideMs, items.length, animationState, clearTimers])

  // Gestion de la fin de transition
  const handleTransitionEnd = useCallback(() => {
    clearTimers()

    if (animationState === 'sliding') {
      if (currentIndex >= items.length) {
        // Reset invisible à l'index 0
        setAnimationState('resetting')
        setCurrentIndex(0)
        // Petit délai pour s'assurer que le reset est invisible
        setTimeout(() => {
          setAnimationState('idle')
          scheduleNextCycle()
        }, 50)
      } else {
        // Continuer le cycle
        setAnimationState('idle')
        scheduleNextCycle()
      }
    }
  }, [animationState, currentIndex, items.length, clearTimers, scheduleNextCycle])

  // Démarrer l'animation
  const start = useCallback(() => {
    if (prefersReducedRef.current || items.length <= 1) return
    setAnimationState('idle')
    scheduleNextCycle()
  }, [items.length, scheduleNextCycle])

  // Arrêter l'animation
  const stop = useCallback(() => {
    clearTimers()
    setAnimationState('idle')
  }, [clearTimers])

  // Reset de l'animation
  const reset = useCallback(() => {
    clearTimers()
    setCurrentIndex(0)
    setAnimationState('idle')
  }, [clearTimers])

  // Auto-start si activé
  useEffect(() => {
    if (autoStart && !prefersReducedRef.current && items.length > 1) {
      start()
    }
    return clearTimers
  }, [autoStart, items.length, start, clearTimers])

  // Cleanup au démontage
  useEffect(() => {
    return clearTimers
  }, [clearTimers])

  // Calcul des styles CSS
  const transform = `translateY(-${currentIndex * 100}%)`
  const transition = animationState === 'sliding'
    ? `transform ${slideMs}ms cubic-bezier(0.22, 1, 0.36, 1)`
    : 'none'

  const isSliding = animationState === 'sliding'

  return {
    currentIndex,
    animationState,
    isSliding,
    duplicatedItems,
    transform,
    transition,
    handleTransitionEnd,
    start,
    stop,
    reset,
  }
}
