import React, { useEffect, useRef, useState } from 'react'
import { useRotatingAnimation } from '../../hooks/useRotatingAnimation'

interface Props {
  items: React.ReactNode[]
  /** Libellé large pour réserver la largeur et éviter les sauts de mise en page (CLS) */
  reserveLabel: string
  /** Durée d'affichage immobile de chaque mot (en ms) */
  holdMs?: number
  /** Durée de la transition du slide (en ms) */
  slideMs?: number
  /** Démarrer automatiquement l'animation */
  autoStart?: boolean
}

/**
 * Composant d'animation de rotation de texte avec prévention du CLS
 * 
 * Affiche une liste d'éléments en rotation verticale avec une animation fluide.
 * Duplique automatiquement le premier élément pour créer une boucle infinie.
 * 
 * @param props - Propriétés du composant
 * @returns Élément React avec animation de rotation
 * 
 * @example
 * ```tsx
 * <RotatingLanguage
 *   items={['Item 1', 'Item 2', 'Item 3']}
 *   reserveLabel="Item 1"
 *   holdMs={3000}
 *   slideMs={500}
 *   autoStart={true}
 * />
 * ```
 */
export default function RotatingLanguage({
  items,
  reserveLabel,
  holdMs = 3600,
  slideMs = 700,
  autoStart = true,
}: Props) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const [maxHeight, setMaxHeight] = useState<number>(0)

  // Utilisation du hook d'animation
  const {
    duplicatedItems,
    transform,
    transition,
    handleTransitionEnd,
    isSliding,
  } = useRotatingAnimation({
    items,
    holdMs,
    slideMs,
    autoStart,
  })

  // Mesure de la hauteur maximale pour éviter le CLS
  useEffect(() => {
    if (!containerRef.current) return

    const measureHeight = () => {
      const container = containerRef.current
      if (!container) return

      try {
        // Créer un élément temporaire pour mesurer chaque item
        const tempContainer = document.createElement('span')
        tempContainer.style.position = 'absolute'
        tempContainer.style.visibility = 'hidden'
        tempContainer.style.whiteSpace = 'nowrap'
        tempContainer.className = container.className
        document.body.appendChild(tempContainer)

        let maxH = 0

        // Mesurer chaque item
        items.forEach((item) => {
          if (typeof item === 'string') {
            tempContainer.textContent = item
          } else {
            // Pour les éléments React, on utilise une approximation
            tempContainer.innerHTML = '<span style="display: inline-block; vertical-align: baseline;">' + 
              (typeof item === 'object' && item !== null && 'type' in item ? 'Item' : String(item)) + 
              '</span>'
          }
          
          const height = tempContainer.offsetHeight
          maxH = Math.max(maxH, height)
        })

        document.body.removeChild(tempContainer)
        setMaxHeight(Math.max(maxH, 24)) // Minimum 24px (1.5em)
      } catch (error) {
        console.warn('[RotatingLanguage] Error measuring height:', error)
        setMaxHeight(24) // Fallback
      }
    }

    measureHeight()

    // Re-mesurer si la fenêtre change de taille
    const handleResize = () => { measureHeight(); }
    window.addEventListener('resize', handleResize)
    return () => { window.removeEventListener('resize', handleResize); }
  }, [items])

  // Si pas d'items ou un seul item, affichage statique
  if (items.length <= 1) {
    return <span>{items[0] || ''}</span>
  }

  return (
    <span 
      ref={containerRef}
      className="rotating-language-container"
      style={{ 
        height: maxHeight > 0 ? `${maxHeight}px` : '1.6em',
        minHeight: '1.6em'
      }}
      aria-hidden="true"
    >
      {/* Réserve la largeur pour éviter le CLS */}
      <span className="rotating-language-reserve">
        {reserveLabel || ''}
      </span>
      
      {/* Container de l'animation */}
      <span className="rotating-language-animation">
        <span
          className={`rotating-language-slider ${isSliding ? 'rotating-language-transition' : 'rotating-language-no-transition'}`}
          style={{ transform, transition }}
          onTransitionEnd={handleTransitionEnd}
          aria-live="polite"
          aria-busy={isSliding}
        >
          {duplicatedItems.map((node, i) => (
            <span 
              key={i} 
              className="rotating-language-item"
              style={{ height: maxHeight > 0 ? `${maxHeight}px` : '1.6em' }}
            >
              {node}
            </span>
          ))}
        </span>
      </span>
    </span>
  )
}
