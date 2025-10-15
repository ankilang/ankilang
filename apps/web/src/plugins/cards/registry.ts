import { type CardAdapter } from './types'
import { type ThemeCategory } from '../../types/shared'
import { type CreateCard, type Theme } from '../../types/shared'
import { LanguageCardAdapter } from './language'
import { OtherCardAdapter } from './other'

/**
 * Registry central pour les adapters de cartes
 * Gère la logique conditionnelle selon la catégorie de thème
 */
class CardAdapterRegistry {
  private adapters: Map<ThemeCategory, CardAdapter> = new Map()

  constructor() {
    // Initialisation des adapters
    this.adapters.set('language', new LanguageCardAdapter())
    this.adapters.set('other', new OtherCardAdapter())
  }

  /**
   * Récupère l'adapter pour une catégorie donnée
   */
  getAdapter(category: ThemeCategory): CardAdapter {
    const adapter = this.adapters.get(category)
    if (!adapter) {
      console.warn(`[CardAdapterRegistry] No adapter found for category: ${category}. Falling back to LanguageAdapter.`)
      return this.adapters.get('language')! // Fallback to language for safety
    }
    return adapter
  }

  /**
   * Crée une carte avec l'adapter approprié
   */
  async createCard(data: CreateCard, theme: Theme): Promise<CreateCard> {
    const adapter = this.getAdapter(theme.category)
    return adapter.createCard(data, theme)
  }

  /**
   * Vérifie si la traduction est disponible pour une catégorie
   */
  canTranslate(category: ThemeCategory): boolean {
    const adapter = this.getAdapter(category)
    return adapter.canTranslate()
  }

  /**
   * Vérifie si le TTS est disponible pour une catégorie
   */
  canGenerateAudio(category: ThemeCategory): boolean {
    const adapter = this.getAdapter(category)
    return adapter.canGenerateAudio()
  }

  /**
   * Récupère le type d'images pour une catégorie
   */
  getImageSource(category: ThemeCategory): 'pexels' | 'specialized' | 'general' | 'none' {
    const adapter = this.getAdapter(category)
    return adapter.getImageSource()
  }

  /**
   * Récupère les templates pour une catégorie
   */
  getTemplates(category: ThemeCategory) {
    const adapter = this.getAdapter(category)
    return adapter.getTemplates()
  }

  /**
   * Récupère les suggestions de contenu pour un thème
   */
  getContentSuggestions(theme: Theme): string[] {
    const adapter = this.getAdapter(theme.category)
    return adapter.getContentSuggestions(theme)
  }

  /**
   * Enregistre un nouvel adapter (pour extensions futures)
   */
  registerAdapter(category: ThemeCategory, adapter: CardAdapter): void {
    this.adapters.set(category, adapter)
  }

  /**
   * Récupère la configuration des services pour une catégorie
   */
  getServicesConfig(category: ThemeCategory) {
    const adapter = this.getAdapter(category)
    return {
      translation: adapter.canTranslate(),
      tts: adapter.canGenerateAudio(),
      images: adapter.getImageSource(),
      templates: adapter.getTemplates().length > 0,
      suggestions: adapter.getContentSuggestions({ category } as Theme).length > 0
    }
  }
}

// Instance singleton du registry
export const cardAdapterRegistry = new CardAdapterRegistry()

// Export des fonctions utilitaires
export const createAdaptiveCard = (data: CreateCard, theme: Theme) => 
  cardAdapterRegistry.createCard(data, theme)

export const getServicesForCategory = (category: ThemeCategory) => 
  cardAdapterRegistry.getServicesConfig(category)

export const getTemplatesForCategory = (category: ThemeCategory) => 
  cardAdapterRegistry.getTemplates(category)

export const getSuggestionsForTheme = (theme: Theme) => 
  cardAdapterRegistry.getContentSuggestions(theme)
