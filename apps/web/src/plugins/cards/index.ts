// Export des types
export type { CardAdapter, CardTemplate, CategoryServices } from './types'

// Export des adapters
export { LanguageCardAdapter } from './language'
export { AcademicCardAdapter } from './academic'
export { ProfessionalCardAdapter } from './professional'
export { PersonalCardAdapter } from './personal'

// Export du registry et des fonctions utilitaires
export {
  cardAdapterRegistry,
  createAdaptiveCard,
  getServicesForCategory,
  getTemplatesForCategory,
  getSuggestionsForTheme
} from './registry'
