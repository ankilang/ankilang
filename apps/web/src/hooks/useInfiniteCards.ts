import { useInfiniteQuery } from '@tanstack/react-query'
import { cardsService } from '../services/cards.service'
import { queryKeys } from './queryKeys'

/**
 * Hook pour charger les cartes avec pagination infinie
 * Optimisé pour les listes longues (>1000 cartes) avec virtualisation
 */
export function useInfiniteCards(themeId: string, userId: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.cards(themeId),
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }: { pageParam: number }) => {
      const limit = 50 // Taille de page optimisée pour la virtualisation
      const offset = pageParam * limit
      
      // Utiliser le service existant avec pagination
      const response = await cardsService.getCardsByThemeIdPaginated(
        themeId, 
        userId, 
        limit, 
        offset
      )
      
      return {
        cards: response.documents,
        hasMore: response.documents.length === limit,
        nextOffset: offset + limit
      }
    },
    getNextPageParam: (lastPage: any, allPages: any[]) => {
      return lastPage.hasMore ? allPages.length : undefined
    },
    enabled: Boolean(themeId && userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    // 🚀 OPTIMISATION: Garder les données précédentes pour éviter les flashes
    // keepPreviousData: true, // Non disponible dans useInfiniteQuery
    // 🚀 OPTIMISATION: Ne pas refetch automatiquement
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}

/**
 * Hook pour obtenir toutes les cartes aplaties (pour compatibilité)
 */
export function useInfiniteCardsFlattened(themeId: string, userId: string) {
  const query = useInfiniteCards(themeId, userId)
  
  const allCards = query.data?.pages.flatMap((page: any) => page.cards) ?? []
  
  return {
    ...query,
    cards: allCards,
    totalCards: allCards.length,
  }
}

/**
 * Hook pour la virtualisation avec @tanstack/react-virtual
 * Nécessite l'installation de @tanstack/react-virtual
 */
export function useVirtualizedCardsInfinite(themeId: string, userId: string) {
  const infiniteQuery = useInfiniteCards(themeId, userId)
  
  // Flatten toutes les cartes chargées
  const allCards = infiniteQuery.data?.pages.flatMap((page: any) => page.cards) ?? []
  
  return {
    ...infiniteQuery,
    cards: allCards,
    totalCards: allCards.length,
    // Méthodes pour la virtualisation
    loadMore: () => {
      if (infiniteQuery.hasNextPage && !infiniteQuery.isFetchingNextPage) {
        infiniteQuery.fetchNextPage()
      }
    },
    hasMore: infiniteQuery.hasNextPage,
    isLoadingMore: infiniteQuery.isFetchingNextPage,
  }
}

/**
 * Hook pour les métriques de performance des cartes infinies
 */
export function useInfiniteCardsMetrics(themeId: string, userId: string) {
  const query = useInfiniteCards(themeId, userId)
  
  const metrics = {
    totalPages: query.data?.pages.length ?? 0,
    totalCards: query.data?.pages.reduce((acc: number, page: any) => acc + page.cards.length, 0) ?? 0,
    averagePageSize: query.data?.pages.length 
      ? query.data.pages.reduce((acc: number, page: any) => acc + page.cards.length, 0) / query.data.pages.length 
      : 0,
    isFullyLoaded: !query.hasNextPage,
    cacheHitRate: query.isStale ? 0 : 1, // Simplifié
  }
  
  // Log des métriques si PERF_DEBUG est activé
  if (process.env.NODE_ENV === 'development' && window.localStorage?.getItem('PERF_DEBUG') === 'true') {
    console.info('[InfiniteCards] Metrics:', {
      themeId,
      ...metrics,
      queryTime: query.dataUpdatedAt
    })
  }
  
  return {
    ...query,
    metrics
  }
}
