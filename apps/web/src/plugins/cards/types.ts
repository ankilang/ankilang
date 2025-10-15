import { type CreateCard, type Theme } from '../../types/shared'

/**
 * Interface pour les adapters de cartes par catégorie
 * Chaque adapter gère la logique spécifique à son domaine
 */
export interface CardAdapter {
  /**
   * Crée une carte avec la logique spécifique à la catégorie
   */
  createCard(data: CreateCard, theme: Theme): Promise<CreateCard>

  /**
   * Détermine si la traduction est disponible pour cette catégorie
   */
  canTranslate(): boolean

  /**
   * Détermine si le TTS est disponible pour cette catégorie
   */
  canGenerateAudio(): boolean

  /**
   * Détermine le type d'images à utiliser
   */
  getImageSource(): 'pexels' | 'specialized' | 'general' | 'none'

  /**
   * Retourne les templates de cartes prédéfinis pour cette catégorie
   */
  getTemplates(): CardTemplate[]

  /**
   * Retourne les suggestions de contenu pour cette catégorie
   */
  getContentSuggestions(theme: Theme): string[]
}

/**
 * Template de carte prédéfini
 */
export interface CardTemplate {
  id: string
  name: string
  description: string
  front: string
  back: string
  extra?: string
  tags: string[]
}

/**
 * Configuration des services par catégorie
 */
export interface CategoryServices {
  translation: boolean
  tts: boolean
  images: 'pexels' | 'specialized' | 'general' | 'none'
  templates: boolean
  suggestions: boolean
}
