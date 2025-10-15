import { useRef, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { Card } from '../types/shared'

/**
 * Hook pour virtualiser les listes de cartes
 * Optimise le rendu pour les listes longues (>100 cartes)
 */
export function useVirtualizedCards(cards: Card[]) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: cards.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // Hauteur estimée d'une carte (px)
    overscan: 5, // Nombre de cartes supplémentaires à rendre
  })

  const virtualItems = virtualizer.getVirtualItems()

  // Mémoisation des cartes virtuelles pour éviter les re-renders
  const virtualCards = useMemo(() => {
    return virtualItems.map((virtualItem) => ({
      ...cards[virtualItem.index],
      virtualIndex: virtualItem.index,
      virtualStart: virtualItem.start,
      virtualSize: virtualItem.size,
    }))
  }, [cards, virtualItems])

  return {
    parentRef,
    virtualizer,
    virtualItems,
    virtualCards,
    totalSize: virtualizer.getTotalSize(),
    isVirtualized: cards.length > 50, // Activer la virtualisation pour >50 cartes
  }
}

/**
 * Hook pour virtualiser les listes de thèmes
 * Optimise le rendu pour les grilles de thèmes
 */
export function useVirtualizedThemes(themes: any[], itemsPerRow = 3) {
  const parentRef = useRef<HTMLDivElement>(null)

  // Calculer le nombre de lignes pour la virtualisation
  const rowCount = Math.ceil(themes.length / itemsPerRow)

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // Hauteur estimée d'une ligne de thèmes (px)
    overscan: 2, // Nombre de lignes supplémentaires à rendre
  })

  const virtualItems = virtualizer.getVirtualItems()

  // Mémoisation des thèmes virtuels par ligne
  const virtualThemes = useMemo(() => {
    return virtualItems.map((virtualItem) => {
      const startIndex = virtualItem.index * itemsPerRow
      const endIndex = Math.min(startIndex + itemsPerRow, themes.length)
      const rowThemes = themes.slice(startIndex, endIndex)

      return {
        rowIndex: virtualItem.index,
        themes: rowThemes,
        virtualStart: virtualItem.start,
        virtualSize: virtualItem.size,
      }
    })
  }, [themes, virtualItems, itemsPerRow])

  return {
    parentRef,
    virtualizer,
    virtualItems,
    virtualThemes,
    totalSize: virtualizer.getTotalSize(),
    isVirtualized: themes.length > 20, // Activer la virtualisation pour >20 thèmes
  }
}

/**
 * Hook pour mesurer les performances de virtualisation
 */
export function useVirtualizationMetrics() {
  const measurePerformance = (action: string, startTime: number) => {
    const duration = performance.now() - startTime
    
    if (process.env.NODE_ENV === 'development' && window.localStorage?.getItem('PERF_DEBUG') === 'true') {
      console.info(`[Virtualization] ${action}: ${Math.round(duration)}ms`)
    }
  }

  return { measurePerformance }
}
