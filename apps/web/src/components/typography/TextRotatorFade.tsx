import React, { useEffect, useRef, useState } from 'react'

interface Props {
  /** Liste des éléments à faire tourner */
  items: React.ReactNode[]
  /** Libellé pour réserver la largeur et éviter le CLS */
  reserveLabel: string
  /** Durée d'affichage de chaque élément (en ms) */
  displayMs?: number
  /** Durée de la transition de fondu (en ms) */
  fadeMs?: number
  /** Mettre en pause l'animation au survol */
  pauseOnHover?: boolean
}

/**
 * Composant de rotation de texte avec effet de fondu
 * 
 * Affiche une liste d'éléments en rotation avec des transitions d'opacité fluides.
 * Respecte les préférences de mouvement réduit et prévient le CLS.
 * 
 * @param props - Propriétés du composant
 * @returns Élément React avec animation de rotation
 * 
 * @example
 * ```tsx
 * <TextRotatorFade
 *   items={['Item 1', 'Item 2', 'Item 3']}
 *   reserveLabel="Item 1"
 *   displayMs={3800}
 *   fadeMs={900}
 *   pauseOnHover={false}
 * />
 * ```
 */
export default function TextRotatorFade({
  items,
  reserveLabel,
  displayMs = 3800,
  fadeMs = 900,
  pauseOnHover = false,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<number | null>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  // Si pas d'items ou un seul item, affichage statique
  if (items.length <= 1) {
    return <span>{items[0] || ''}</span>
  }

  // Fonction pour passer à l'élément suivant
  const nextItem = () => {
    if (prefersReducedMotion || isPaused) return

    setIsVisible(false)
    
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
      setIsVisible(true)
    }, fadeMs)
  }

  // Gestion de l'intervalle
  useEffect(() => {
    if (prefersReducedMotion || items.length <= 1) return

    const startInterval = () => {
      intervalRef.current = window.setInterval(nextItem, displayMs + fadeMs) as unknown as number
    }

    const stopInterval = () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    if (!isPaused) {
      startInterval()
    }

    return stopInterval
  }, [displayMs, fadeMs, items.length, prefersReducedMotion, isPaused])

  // Gestion du survol (si activé)
  const handleMouseEnter = () => {
    if (pauseOnHover && !prefersReducedMotion) {
      setIsPaused(true)
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }

  const handleMouseLeave = () => {
    if (pauseOnHover && !prefersReducedMotion) {
      setIsPaused(false)
    }
  }

  // Cleanup au démontage
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
      }
    }
  }, [])

  return (
    <span
      className="relative inline-block align-baseline whitespace-nowrap select-none"
      style={{ height: '1.6em', minHeight: '1.6em' }}
      aria-live="polite"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Réservation de largeur/hauteur pour stabiliser la ligne */}
      <span aria-hidden className="invisible block whitespace-nowrap">
        {reserveLabel}
      </span>

      {/* Container de l'animation */}
      <span className="absolute inset-0 flex items-center">
        <span
          className="whitespace-nowrap transition-opacity ease-out pointer-events-none"
          style={{
            opacity: isVisible ? 1 : 0,
            transitionDuration: `${fadeMs}ms`,
            willChange: 'opacity'
          }}
        >
          {items[currentIndex]}
        </span>
      </span>
    </span>
  )
}

/**
 * Hook pour détecter les préférences de mouvement réduit
 */
function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReduced(mediaQuery.matches)

    const handleChange = () => setPrefersReduced(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReduced
}
