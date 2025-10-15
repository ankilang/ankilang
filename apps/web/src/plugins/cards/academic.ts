import { type CardAdapter, type CardTemplate } from './types'
import { type CreateCard, type Theme } from '../../types/shared'

/**
 * Adapter pour les thèmes académiques
 * Gère les matières comme médecine, histoire, sciences, etc.
 */
export class AcademicCardAdapter implements CardAdapter {
  canTranslate(): boolean {
    return false // Pas de traduction pour les matières académiques
  }

  canGenerateAudio(): boolean {
    return false // Pas de TTS pour les matières académiques
  }

  getImageSource(): 'specialized' {
    return 'specialized' // Images spécialisées selon la matière
  }

  async createCard(data: CreateCard, _theme: Theme): Promise<CreateCard> {
    // Pour les matières académiques, on se concentre sur le contenu
    return {
      ...data,
      // Pas de targetLanguage pour les matières académiques
    }
  }

  getTemplates(): CardTemplate[] {
    return [
      {
        id: 'definition',
        name: 'Définition',
        description: 'Définir un concept ou terme',
        front: 'Qu\'est-ce que {{concept}} ?',
        back: '{{définition}}',
        extra: 'Exemple: {{exemple}}',
        tags: ['définition', 'concept']
      },
      {
        id: 'date',
        name: 'Date/Événement',
        description: 'Mémoriser des dates importantes',
        front: 'Quand a eu lieu {{événement}} ?',
        back: '{{date}}',
        extra: 'Contexte: {{contexte}}',
        tags: ['date', 'événement']
      },
      {
        id: 'classification',
        name: 'Classification',
        description: 'Classer ou catégoriser',
        front: 'À quelle catégorie appartient {{élément}} ?',
        back: '{{catégorie}}',
        extra: 'Caractéristiques: {{caractéristiques}}',
        tags: ['classification', 'catégorie']
      },
      {
        id: 'process',
        name: 'Processus',
        description: 'Étapes d\'un processus',
        front: 'Quelles sont les étapes de {{processus}} ?',
        back: '{{étapes}}',
        extra: 'Ordre: {{ordre}}',
        tags: ['processus', 'étapes']
      }
    ]
  }

  getContentSuggestions(theme: Theme): string[] {
    const subject = theme.subject
    const suggestions: Record<string, string[]> = {
      'medicine': [
        'Anatomie humaine',
        'Physiologie des systèmes',
        'Pathologies courantes',
        'Pharmacologie de base',
        'Terminologie médicale'
      ],
      'history': [
        'Dates importantes de l\'histoire',
        'Personnages historiques',
        'Événements marquants',
        'Civilisations anciennes',
        'Guerres et conflits'
      ],
      'science': [
        'Lois scientifiques fondamentales',
        'Formules chimiques',
        'Classification des espèces',
        'Théories physiques',
        'Découvertes scientifiques'
      ],
      'law': [
        'Articles de loi importants',
        'Procédures juridiques',
        'Jurisprudence',
        'Droits fondamentaux',
        'Institutions juridiques'
      ],
      'literature': [
        'Auteurs et œuvres',
        'Mouvements littéraires',
        'Figures de style',
        'Citations célèbres',
        'Genres littéraires'
      ]
    }

    return suggestions[subject || ''] || [
      'Concepts fondamentaux',
      'Définitions importantes',
      'Dates clés',
      'Classifications essentielles'
    ]
  }
}
