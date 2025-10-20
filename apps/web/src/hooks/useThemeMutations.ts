import { useMutation, useQueryClient } from '@tanstack/react-query'
import { themesService, type AppwriteTheme } from '../services/themes.service'
import { cardsService, type AppwriteCard } from '../services/cards.service'
import { queryKeys } from './queryKeys'
import type { CreateTheme, CreateCard } from '../types/shared'

/**
 * Hook pour créer un thème avec optimistic update
 */
export function useCreateTheme() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ userId, themeData }: { userId: string; themeData: CreateTheme }) =>
      themesService.createTheme(userId, themeData),
    
    onSuccess: (newTheme) => {
      // Optimistic update de la liste des thèmes
      queryClient.setQueryData(queryKeys.themes(newTheme.userId), (old: AppwriteTheme[] | undefined) => 
        old ? [newTheme, ...old] : [newTheme]
      )
      
      // Précharger les données du nouveau thème
      queryClient.setQueryData(queryKeys.theme(newTheme.$id, newTheme.userId), newTheme)
      queryClient.setQueryData(queryKeys.cards(newTheme.$id), [])
    },
    
    onError: (error) => {
      console.error('[useCreateTheme] Error creating theme:', error)
    },
  })
}

/**
 * Hook pour créer une carte avec optimistic update
 */
export function useCreateCard() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ userId, themeId, cardData }: { 
      userId: string; 
      themeId: string; 
      cardData: Omit<CreateCard, 'id' | 'userId' | 'createdAt' | 'updatedAt'> 
    }) => cardsService.createCard(userId, themeId, cardData),
    
    onMutate: async ({ userId, themeId, cardData }) => {
      const queryKey = queryKeys.cards(themeId)
      
      // Annuler les requêtes en cours pour éviter les conflits
      await queryClient.cancelQueries({ queryKey })
      
      // Sauvegarder l'état précédent pour rollback
      const previousCards = queryClient.getQueryData<AppwriteCard[]>(queryKey)
      
      // Créer la carte optimiste
      const optimisticId = `tmp-${Date.now()}`
      const optimisticCard: AppwriteCard = {
        ...cardData,
        $id: optimisticId,
        id: optimisticId, // Ajouter la propriété id manquante
        userId: userId,
        themeId,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        $permissions: [],
      }
      
      // Mettre à jour le cache optimistiquement
      queryClient.setQueryData(queryKey, (old: AppwriteCard[] | undefined) => 
        old ? [...old, optimisticCard] : [optimisticCard]
      )
      
      return { previousCards, queryKey, optimisticId }
    },
    
    onSuccess: (newCard, { themeId }, context) => {
      const queryKey = queryKeys.cards(themeId)
      
      // Remplacer la carte optimiste par la vraie carte
      queryClient.setQueryData(queryKey, (old: AppwriteCard[] | undefined) => 
        old?.map((card) => 
          card.$id === context?.optimisticId ? newCard : card
        ) || [newCard]
      )
      
      // Invalider le compteur de cartes du thème
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.theme(themeId, newCard.userId) 
      })
    },
    
    onError: (error, _variables, context) => {
      console.error('[useCreateCard] Error creating card:', error)
      
      // Rollback en cas d'erreur
      if (context?.previousCards) {
        queryClient.setQueryData(context.queryKey, context.previousCards)
      }
    },
    
    onSettled: (_data, _error, variables) => {
      // S'assurer que les données sont cohérentes
      queryClient.invalidateQueries({ queryKey: queryKeys.cards(variables.themeId) })
    },
  })
}

/**
 * Hook pour mettre à jour une carte
 */
export function useUpdateCard() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ cardId, userId, updates }: { 
      cardId: string; 
      userId: string; 
      updates: Partial<CreateCard> 
    }) => cardsService.updateCard(cardId, userId, updates),
    
    onMutate: async ({ cardId, updates }) => {
      // Trouver le thème de cette carte
      const allQueries = queryClient.getQueryCache().findAll()
      const cardsQuery = allQueries.find(q => 
        q.queryKey[0] === 'cards' && 
        q.state.data && 
        Array.isArray(q.state.data) &&
        (q.state.data as AppwriteCard[]).some(card => card.$id === cardId)
      )
      
      if (!cardsQuery) return
      
      const queryKey = cardsQuery.queryKey
      await queryClient.cancelQueries({ queryKey })
      
      const previousCards = queryClient.getQueryData<AppwriteCard[]>(queryKey)
      
      // Mise à jour optimiste
      queryClient.setQueryData(queryKey, (old: AppwriteCard[] | undefined) => 
        old?.map((card) => 
          card.$id === cardId 
            ? { ...card, ...updates, $updatedAt: new Date().toISOString() }
            : card
        ) || []
      )
      
      return { previousCards, queryKey }
    },
    
    onError: (error, variables, context) => {
      console.error('[useUpdateCard] Error updating card:', error)
      const message = (error instanceof Error ? error.message : String(error)).toLowerCase()
      if (message.includes('not found')) {
        // Si la carte n'existe plus, la retirer du cache pour garder une UI cohérente
        if (context?.queryKey) {
          queryClient.setQueryData(context.queryKey, (old: AppwriteCard[] | undefined) => 
            old?.filter((c) => c.$id !== variables.cardId) || []
          )
        }
        return
      }
      // Autres erreurs: rollback
      if (context?.previousCards) {
        queryClient.setQueryData(context.queryKey, context.previousCards)
      }
    },
    
    onSettled: () => {
      // Invalider toutes les requêtes de cartes pour s'assurer de la cohérence
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}

/**
 * Hook pour supprimer une carte
 */
export function useDeleteCard() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ cardId, userId }: { cardId: string; userId: string }) =>
      cardsService.deleteCard(cardId, userId),
    
    onMutate: async ({ cardId }) => {
      // Trouver le thème de cette carte
      const allQueries = queryClient.getQueryCache().findAll()
      const cardsQuery = allQueries.find(q => 
        q.queryKey[0] === 'cards' && 
        q.state.data && 
        Array.isArray(q.state.data) &&
        (q.state.data as AppwriteCard[]).some(card => card.$id === cardId)
      )
      
      if (!cardsQuery) return
      
      const queryKey = cardsQuery.queryKey
      await queryClient.cancelQueries({ queryKey })
      
      const previousCards = queryClient.getQueryData<AppwriteCard[]>(queryKey)
      
      // Suppression optimiste
      queryClient.setQueryData(queryKey, (old: AppwriteCard[] | undefined) => 
        old?.filter((card) => card.$id !== cardId) || []
      )
      
      return { previousCards, queryKey }
    },
    
    onError: (error, variables, context) => {
      console.error('[useDeleteCard] Error deleting card:', error)
      const message = (error instanceof Error ? error.message : String(error)).toLowerCase()
      if (message.includes('not found')) {
        // Déjà supprimée côté serveur: conserver la suppression optimiste
        console.info('[useDeleteCard] 404 détecté: suppression déjà effectuée côté serveur, pas de rollback')
        return
      }
      // Autres erreurs: rollback
      if (context?.previousCards) {
        queryClient.setQueryData(context.queryKey, context.previousCards)
      }
    },
    
    onSettled: () => {
      // Invalider toutes les requêtes de cartes
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}

/**
 * Hook pour supprimer un thème
 */
export function useDeleteTheme() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ themeId, userId }: { themeId: string; userId: string }) =>
      themesService.deleteTheme(themeId, userId),
    
    onSuccess: (_data, variables) => {
      // Supprimer le thème de la liste
      queryClient.setQueryData(queryKeys.themes(variables.userId), (old: AppwriteTheme[] | undefined) => 
        old?.filter((theme) => theme.$id !== variables.themeId) || []
      )
      
      // Supprimer les données du thème du cache
      queryClient.removeQueries({ queryKey: queryKeys.theme(variables.themeId, variables.userId) })
      queryClient.removeQueries({ queryKey: queryKeys.cards(variables.themeId) })
    },
    
    onError: (error) => {
      console.error('[useDeleteTheme] Error deleting theme:', error)
    },
  })
}
