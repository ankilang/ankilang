import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { themesService } from '../services/themes.service'
import { cardsService } from '../services/cards.service'
import { queryKeys } from './queryKeys'
import { useAuth } from './useAuth'

/**
 * Hook pour le prefetching intelligent des données
 */
export function usePrefetch() {
  const queryClient = useQueryClient()
  
  /**
   * Précharger un thème
   */
  const prefetchTheme = useCallback((themeId: string, userId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.theme(themeId, userId),
      queryFn: () => themesService.getThemeById(themeId, userId),
      staleTime: 5 * 60 * 1000,
    })
  }, [queryClient])
  
  /**
   * Précharger les cartes d'un thème
   */
  const prefetchCards = useCallback((themeId: string, userId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.cards(themeId),
      queryFn: () => cardsService.getCardsByThemeId(themeId, userId),
      staleTime: 5 * 60 * 1000,
    })
  }, [queryClient])
  
  /**
   * Précharger toutes les données d'un thème (thème + cartes)
   */
  const prefetchThemeData = useCallback((themeId: string, userId: string) => {
    prefetchTheme(themeId, userId)
    prefetchCards(themeId, userId)
  }, [prefetchTheme, prefetchCards])
  
  /**
   * Précharger la liste des thèmes d'un utilisateur
   */
  const prefetchThemes = useCallback((userId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.themes(userId),
      queryFn: () => themesService.getUserThemes(userId),
      staleTime: 5 * 60 * 1000,
    })
  }, [queryClient])
  
  return {
    prefetchTheme,
    prefetchCards,
    prefetchThemeData,
    prefetchThemes,
  }
}

/**
 * Hook pour les métriques de performance
 */
export function usePerformanceMetrics() {
  const queryClient = useQueryClient()
  
  const logQueryPerformance = useCallback((queryKey: string[], startTime: number) => {
    const endTime = performance.now()
    const duration = Math.round(endTime - startTime)
    
    console.log(`[Perf] Query ${queryKey.join('.')} completed in ${duration}ms`)
    
    // Log des métriques de cache
    const query = queryClient.getQueryState(queryKey)
    if (query) {
      console.log(`[Perf] Cache state: ${query.status}`)
    }
  }, [queryClient])
  
  const measureQuery = useCallback((queryKey: string[], queryFn: () => Promise<any>) => {
    const startTime = performance.now()
    
    return queryFn().finally(() => {
      logQueryPerformance(queryKey, startTime)
    })
  }, [logQueryPerformance])
  
  return {
    logQueryPerformance,
    measureQuery,
  }
}

/**
 * Hook pour prefetch on hover des thèmes
 * Améliore la navigation en préchargeant les données au survol
 */
export function useThemePrefetch() {
  const { prefetchThemeData } = usePrefetch()
  const { user } = useAuth()
  
  const handleMouseEnter = useCallback((themeId: string) => {
    if (!user?.$id) return

    // Délai pour éviter les prefetch trop agressifs
    const timeoutId = setTimeout(() => {
      prefetchThemeData(themeId, user.$id)
    }, 200) // 200ms de délai

    return () => clearTimeout(timeoutId)
  }, [prefetchThemeData, user?.$id])

  const handleMouseLeave = useCallback(() => {
    // Nettoyage si nécessaire
  }, [])

  return { 
    handleMouseEnter, 
    handleMouseLeave,
    prefetchThemeData 
  }
}
