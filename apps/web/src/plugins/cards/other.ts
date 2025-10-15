import { type CardAdapter, type CardTemplate } from './types'
import { type CreateCard, type Theme } from '../../types/shared'

/**
 * Adapter pour les thèmes "Autres"
 * Combine les fonctionnalités des anciens adapters academic, professional et personal
 * Pas de traduction/TTS automatique, images générales
 */
export class OtherCardAdapter implements CardAdapter {
  getCategory() {
    return 'other'
  }

  canTranslate() {
    return false
  }

  canGenerateAudio() {
    return false
  }

  getImageSource(): 'general' {
    return 'general' // Images générales pour tous les domaines "autres"
  }

  async createCard(data: CreateCard, _theme: Theme): Promise<CreateCard> {
    // Pour les thèmes "autres", on se concentre sur le contenu sans traduction/TTS
    return {
      ...data,
      // Pas de targetLanguage pour les thèmes "autres"
    }
  }

  getTemplates(): CardTemplate[] {
    return [
      // Templates académiques
      {
        id: 'definition',
        name: 'Définition',
        description: 'Définir un concept ou terme',
        front: 'Définir : Photosynthèse',
        back: 'Processus par lequel les plantes convertissent l\'énergie lumineuse en énergie chimique.',
        extra: 'Biologie végétale',
        tags: ['biologie', 'définition']
      },
      {
        id: 'date-event',
        name: 'Date/Événement',
        description: 'Associer une date à un événement',
        front: 'Quand a eu lieu la Révolution française ?',
        back: '1789',
        extra: 'Révolution qui a marqué la fin de l\'Ancien Régime',
        tags: ['histoire', 'date']
      },
      {
        id: 'formula',
        name: 'Formule',
        description: 'Mémoriser une formule mathématique ou scientifique',
        front: 'Formule de l\'aire d\'un cercle',
        back: 'A = π × r²',
        extra: 'où r est le rayon du cercle',
        tags: ['mathématiques', 'formule']
      },
      // Templates professionnels
      {
        id: 'command',
        name: 'Commande/Syntaxe',
        description: 'Mémoriser une commande ou syntaxe',
        front: 'Commande Git pour annuler le dernier commit',
        back: 'git reset --hard HEAD~1',
        extra: 'Attention: supprime l\'historique',
        tags: ['git', 'développement']
      },
      {
        id: 'concept',
        name: 'Concept',
        description: 'Expliquer un concept professionnel',
        front: 'Qu\'est-ce que le ROI ?',
        back: 'Return on Investment - Retour sur investissement',
        extra: 'Métrique financière pour évaluer la rentabilité',
        tags: ['finance', 'marketing']
      },
      // Templates personnels
      {
        id: 'fact',
        name: 'Fait intéressant',
        description: 'Mémoriser un fait étonnant',
        front: 'Quel est le plus grand désert du monde ?',
        back: 'L\'Antarctique',
        extra: 'Un désert est défini par ses faibles précipitations',
        tags: ['culture-g', 'géographie']
      },
      {
        id: 'quote',
        name: 'Citation',
        description: 'Mémoriser une citation inspirante',
        front: 'Qui a dit : "La vie est ce qui arrive pendant que vous êtes occupé à faire d\'autres projets" ?',
        back: 'John Lennon',
        extra: 'Citation sur la philosophie de vie',
        tags: ['citation', 'philosophie']
      },
      {
        id: 'tip',
        name: 'Conseil',
        description: 'Mémoriser un conseil pratique',
        front: 'Conseil pour améliorer la productivité',
        back: 'La technique Pomodoro : 25 min de travail + 5 min de pause',
        extra: 'Méthode de gestion du temps',
        tags: ['productivité', 'conseil']
      }
    ]
  }

  getContentSuggestions(_theme: Theme): string[] {
    return [
      // Suggestions académiques
      'Concepts clés en médecine',
      'Dates importantes en histoire',
      'Formules fondamentales en sciences',
      'Jurisprudence en droit',
      'Auteurs et œuvres en littérature',
      'Théories philosophiques',
      'Théorèmes mathématiques',
      'Capitales et pays en géographie',
      // Suggestions professionnelles
      'Commandes Linux essentielles',
      'Concepts de marketing digital',
      'Principes de gestion de projet',
      'Bonnes pratiques RH',
      'Méthodes de design UX/UI',
      'Stratégies de communication',
      'Outils de développement',
      'Techniques de vente',
      // Suggestions personnelles
      'Citations inspirantes',
      'Faits étonnants du monde',
      'Conseils de développement personnel',
      'Curiosités scientifiques',
      'Techniques de mémorisation',
      'Astuces de productivité',
      'Conseils de bien-être',
      'Découvertes culturelles'
    ]
  }
}
