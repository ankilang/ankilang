import { type CardAdapter, type CardTemplate } from './types'
import { type CreateCard, type Theme } from '../../types/shared'

/**
 * Adapter pour les thèmes de langues
 * Gère la traduction, TTS et images Pexels
 */
export class LanguageCardAdapter implements CardAdapter {
  canTranslate(): boolean {
    return true
  }

  canGenerateAudio(): boolean {
    return true
  }

  getImageSource(): 'pexels' {
    return 'pexels'
  }

  async createCard(data: CreateCard, theme: Theme): Promise<CreateCard> {
    // Pour les langues, on garde le comportement actuel
    // La traduction et TTS seront gérées par les services existants
    return {
      ...data,
      targetLanguage: theme.targetLang, // Assure la cohérence
    }
  }

  getTemplates(): CardTemplate[] {
    return [
      {
        id: 'vocabulary',
        name: 'Vocabulaire',
        description: 'Mots et expressions de base',
        front: 'Comment dit-on "{{mot}}" en {{langue}} ?',
        back: '{{traduction}}',
        extra: 'Prononciation: {{prononciation}}',
        tags: ['vocabulaire', 'débutant']
      },
      {
        id: 'grammar',
        name: 'Grammaire',
        description: 'Règles grammaticales',
        front: 'Conjuguez le verbe "{{verbe}}" au {{temps}}',
        back: '{{conjugaison}}',
        extra: 'Règle: {{règle}}',
        tags: ['grammaire', 'conjugaison']
      },
      {
        id: 'conversation',
        name: 'Conversation',
        description: 'Expressions utiles',
        front: 'Comment dire "{{expression}}" ?',
        back: '{{traduction}}',
        extra: 'Contexte: {{contexte}}',
        tags: ['conversation', 'pratique']
      },
      {
        id: 'culture',
        name: 'Culture',
        description: 'Aspects culturels',
        front: 'Que signifie "{{expression}}" dans la culture {{pays}} ?',
        back: '{{explication}}',
        extra: 'Origine: {{origine}}',
        tags: ['culture', 'civilisation']
      }
    ]
  }

  getContentSuggestions(theme: Theme): string[] {
    const language = theme.targetLang
    const suggestions: Record<string, string[]> = {
      'en': [
        'Vocabulaire de base anglais',
        'Verbes irréguliers anglais',
        'Expressions idiomatiques anglaises',
        'Grammaire anglaise essentielle'
      ],
      'es': [
        'Vocabulaire espagnol quotidien',
        'Conjugaisons espagnoles',
        'Expressions espagnoles courantes',
        'Culture hispanique'
      ],
      'de': [
        'Vocabulaire allemand de base',
        'Déclinaisons allemandes',
        'Expressions allemandes utiles',
        'Culture germanique'
      ],
      'oc': [
        'Vocabulaire occitan traditionnel',
        'Expressions occitanes régionales',
        'Culture occitane',
        'Prononciation occitane'
      ]
    }

    return suggestions[language || ''] || [
      'Vocabulaire de base',
      'Grammaire essentielle',
      'Expressions courantes',
      'Culture et traditions'
    ]
  }
}
