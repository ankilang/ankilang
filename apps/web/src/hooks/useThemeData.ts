import { useQuery, useQueryClient } from '@tanstack/react-query'
import { themesService } from '../services/themes.service'
import { cardsService } from '../services/cards.service'
import { queryKeys } from './queryKeys'

/**
 * Hook principal pour charger les données d'un thème
 * Charge en parallèle le thème et ses cartes
 */
export function useThemeData(themeId: string, userId: string) {
  const queryClient = useQueryClient()

  // Chargement du thème
  const themeQuery = useQuery({
    queryKey: queryKeys.theme(themeId, userId),
    queryFn: () => themesService.getThemeById(themeId, userId),
    enabled: Boolean(themeId && userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (anciennement cacheTime)
    retry: 2,
    refetchOnWindowFocus: false,
    // 🚀 OPTIMISATION: Garder les données précédentes pour éviter les flashes
    // keepPreviousData: true, // Remplacé par placeholderData dans React Query v5
  })

  // Chargement des cartes
  const cardsQuery = useQuery({
    queryKey: queryKeys.cards(themeId),
    queryFn: () => cardsService.getCardsByThemeId(themeId, userId),
    enabled: Boolean(themeId && userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (anciennement cacheTime)
    retry: 2,
    refetchOnWindowFocus: false,
    // 🚀 OPTIMISATION: Garder les données précédentes pour éviter les flashes
    // keepPreviousData: true, // Remplacé par placeholderData dans React Query v5
  })

  // Fonction de refetch combinée
  const refetch = () => {
    themeQuery.refetch()
    cardsQuery.refetch()
  }

  // Fonction pour invalider le cache
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.theme(themeId, userId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.cards(themeId) })
  }

  return {
    // Données
    theme: themeQuery.data,
    cards: cardsQuery.data,
    
    // États de chargement
    isLoading: themeQuery.isLoading || cardsQuery.isLoading,
    isFetching: themeQuery.isFetching || cardsQuery.isFetching,
    isRefetching: themeQuery.isRefetching || cardsQuery.isRefetching,
    
    // États individuels
    themeLoading: themeQuery.isLoading,
    cardsLoading: cardsQuery.isLoading,
    
    // Erreurs
    error: themeQuery.error || cardsQuery.error,
    themeError: themeQuery.error,
    cardsError: cardsQuery.error,
    
    // Actions
    refetch,
    invalidate,
    
    // Métadonnées
    isSuccess: themeQuery.isSuccess && cardsQuery.isSuccess,
    isError: themeQuery.isError || cardsQuery.isError,
  }
}

/**
 * Hook pour charger uniquement les thèmes d'un utilisateur
 */
export function useThemes(userId: string) {
  return useQuery({
    queryKey: queryKeys.themes(userId),
    queryFn: () => themesService.getUserThemes(userId),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (anciennement cacheTime)
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook pour charger uniquement un thème
 */
export function useTheme(themeId: string, userId: string) {
  return useQuery({
    queryKey: queryKeys.theme(themeId, userId),
    queryFn: () => themesService.getThemeById(themeId, userId),
    enabled: Boolean(themeId && userId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook pour charger uniquement les cartes d'un thème
 */
export function useCards(themeId: string, userId: string) {
  return useQuery({
    queryKey: queryKeys.cards(themeId),
    queryFn: () => cardsService.getCardsByThemeId(themeId, userId),
    enabled: Boolean(themeId && userId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}
