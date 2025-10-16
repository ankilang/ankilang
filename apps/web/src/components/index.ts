/**
 * Index principal des composants
 * Export organisé de tous les composants par catégorie fonctionnelle
 */

// Composants d'authentification
export * from './auth'

// Composants de gestion des cartes
export * from './cards'

// Composants de layout
export * from './layout'

// Composants de la landing page
export * from './landing'

// Composants UI de base
export * from './ui'

// Composants du tableau de bord
export * from './dashboard'

// Composants de navigation
export * from './navigation'

// Composants liés aux thèmes
export * from './themes'

// Composants de cache
export * from './cache'

// Composants d'erreur
export * from './error'

// Composants SEO
export * from './seo'

// Composants de typographie
export * from './typography'

// Composants restants (pas encore indexés)
export { AnkiExporter } from './AnkiExporter'
export { AudioPreviewButton } from './AudioPreviewButton'
export { default as OccitanParticles } from './effects/OccitanParticles'
export { default as LegalContent } from './legal/LegalContent'
export { default as PremiumTeaser } from './PremiumTeaser'
export { AudioPreviewTest } from './test/AudioPreviewTest'
export { default as TranslateDemo } from './TranslateDemo'

// Re-export des types les plus utilisés depuis shared
// TODO: Réactiver quand le chemin d'import sera résolu
// export type {
//   Card, CreateCard, UpdateCard,
//   Theme, CreateTheme, UpdateTheme,
//   User, LoginData, SignupData
// } from '../../../packages/shared'
