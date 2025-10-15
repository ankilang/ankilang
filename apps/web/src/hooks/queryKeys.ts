/**
 * Clés de requête canonisées pour React Query
 * Standardise les clés pour éviter les refetch globaux
 */

export const queryKeys = {
  // Thèmes
  themes: (userId: string) => ['themes', userId] as const,
  theme: (themeId: string, userId: string) => ['theme', themeId, userId] as const,
  
  // Cartes
  cards: (themeId: string) => ['cards', themeId] as const,
  card: (cardId: string) => ['card', cardId] as const,
  
  // Données combinées
  themeData: (themeId: string, userId: string) => ['themeData', themeId, userId] as const,
} as const

/**
 * Utilitaires pour les clés de requête
 */
export const getQueryKey = {
  themes: (userId: string) => queryKeys.themes(userId),
  theme: (themeId: string, userId: string) => queryKeys.theme(themeId, userId),
  cards: (themeId: string) => queryKeys.cards(themeId),
  card: (cardId: string) => queryKeys.card(cardId),
  themeData: (themeId: string, userId: string) => queryKeys.themeData(themeId, userId),
} as const
