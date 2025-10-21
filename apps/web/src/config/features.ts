/**
 * Configuration des fonctionnalités activables/désactivables
 * Permet de contrôler facilement l'affichage de certaines pages
 */

export const FEATURES = {
  // Page de tarification et abonnement
  PRICING_PAGE_ENABLED: false,
  
  // Features premium désactivées
  PREMIUM_FEATURES_ENABLED: false, // Pas de distinction premium
  WORKSHOP_ENABLED: true,          // Accessible à tous
  LIBRARY_ENABLED: true,          // Accessible à tous
} as const

export type FeatureFlags = typeof FEATURES
