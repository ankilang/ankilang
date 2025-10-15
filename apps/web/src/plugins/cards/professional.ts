import { type CardAdapter, type CardTemplate } from './types'
import { type CreateCard, type Theme } from '../../types/shared'

/**
 * Adapter pour les thèmes professionnels
 * Gère les compétences métier comme IT, marketing, finance, etc.
 */
export class ProfessionalCardAdapter implements CardAdapter {
  canTranslate(): boolean {
    return false // Pas de traduction pour les compétences professionnelles
  }

  canGenerateAudio(): boolean {
    return false // Pas de TTS pour les compétences professionnelles
  }

  getImageSource(): 'general' {
    return 'general' // Images générales pour les domaines professionnels
  }

  async createCard(data: CreateCard, _theme: Theme): Promise<CreateCard> {
    // Pour les compétences professionnelles, on se concentre sur le contenu pratique
    return {
      ...data,
      // Pas de targetLanguage pour les compétences professionnelles
    }
  }

  getTemplates(): CardTemplate[] {
    return [
      {
        id: 'command',
        name: 'Commande/Outils',
        description: 'Commandes et outils techniques',
        front: 'Comment {{action}} avec {{outil}} ?',
        back: '{{commande}}',
        extra: 'Exemple: {{exemple}}',
        tags: ['commande', 'outil']
      },
      {
        id: 'concept',
        name: 'Concept métier',
        description: 'Concepts et terminologie professionnelle',
        front: 'Qu\'est-ce que {{concept}} ?',
        back: '{{définition}}',
        extra: 'Utilisation: {{utilisation}}',
        tags: ['concept', 'terminologie']
      },
      {
        id: 'process',
        name: 'Processus métier',
        description: 'Procédures et workflows',
        front: 'Quelles sont les étapes de {{processus}} ?',
        back: '{{étapes}}',
        extra: 'Outils: {{outils}}',
        tags: ['processus', 'workflow']
      },
      {
        id: 'best-practice',
        name: 'Bonnes pratiques',
        description: 'Meilleures pratiques et standards',
        front: 'Quelle est la meilleure pratique pour {{situation}} ?',
        back: '{{pratique}}',
        extra: 'Avantages: {{avantages}}',
        tags: ['bonnes-pratiques', 'standards']
      }
    ]
  }

  getContentSuggestions(theme: Theme): string[] {
    const subject = theme.subject
    const suggestions: Record<string, string[]> = {
      'it': [
        'Commandes Git essentielles',
        'Frameworks JavaScript',
        'Concepts de base de données',
        'Architecture logicielle',
        'Outils de développement'
      ],
      'marketing': [
        'Stratégies marketing digital',
        'Métriques et KPIs',
        'Outils de marketing automation',
        'SEO et référencement',
        'Réseaux sociaux'
      ],
      'finance': [
        'Formules financières',
        'Ratios financiers',
        'Concepts de comptabilité',
        'Analyse financière',
        'Réglementation financière'
      ],
      'hr': [
        'Procédures RH',
        'Droit du travail',
        'Gestion des talents',
        'Formation et développement',
        'Évaluation des performances'
      ],
      'sales': [
        'Techniques de vente',
        'Gestion de pipeline',
        'Négociation commerciale',
        'CRM et outils de vente',
        'Objectifs et quotas'
      ]
    }

    return suggestions[subject || ''] || [
      'Concepts fondamentaux',
      'Outils essentiels',
      'Processus clés',
      'Bonnes pratiques'
    ]
  }
}
