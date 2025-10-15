import { type CardAdapter, type CardTemplate } from './types'
import { type CreateCard, type Theme } from '../../types/shared'

/**
 * Adapter pour les thèmes personnels
 * Gère la culture générale, le développement personnel, etc.
 */
export class PersonalCardAdapter implements CardAdapter {
  canTranslate(): boolean {
    return false // Pas de traduction pour le développement personnel
  }

  canGenerateAudio(): boolean {
    return false // Pas de TTS pour le développement personnel
  }

  getImageSource(): 'general' {
    return 'general' // Images générales pour la culture générale
  }

  async createCard(data: CreateCard, _theme: Theme): Promise<CreateCard> {
    // Pour le développement personnel, on se concentre sur le contenu inspirant
    return {
      ...data,
      // Pas de targetLanguage pour le développement personnel
    }
  }

  getTemplates(): CardTemplate[] {
    return [
      {
        id: 'fact',
        name: 'Fait/Curiosité',
        description: 'Faits intéressants et curiosités',
        front: 'Saviez-vous que {{fait}} ?',
        back: '{{explication}}',
        extra: 'Source: {{source}}',
        tags: ['fait', 'curiosité']
      },
      {
        id: 'quote',
        name: 'Citation',
        description: 'Citations inspirantes',
        front: 'Qui a dit : "{{citation}}" ?',
        back: '{{auteur}}',
        extra: 'Contexte: {{contexte}}',
        tags: ['citation', 'inspiration']
      },
      {
        id: 'knowledge',
        name: 'Culture générale',
        description: 'Connaissances générales',
        front: '{{question}}',
        back: '{{réponse}}',
        extra: 'Détail: {{détail}}',
        tags: ['culture', 'général']
      },
      {
        id: 'tip',
        name: 'Conseil/Astuce',
        description: 'Conseils pratiques',
        front: 'Comment {{objectif}} ?',
        back: '{{conseil}}',
        extra: 'Astuce: {{astuce}}',
        tags: ['conseil', 'astuce']
      }
    ]
  }

  getContentSuggestions(_theme: Theme): string[] {
    return [
      'Citations inspirantes',
      'Faits étonnants',
      'Conseils de développement personnel',
      'Curiosités du monde',
      'Histoire et géographie',
      'Sciences et nature',
      'Art et culture',
      'Philosophie et sagesse',
      'Technologies et innovation',
      'Santé et bien-être'
    ]
  }
}
