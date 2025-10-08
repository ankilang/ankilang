import type { Card } from '../types/shared'

export type CardStatus = 'complete' | 'incomplete' | 'error'

/**
 * Détermine le statut d'une carte basé sur son contenu et ses médias
 */
export function getCardStatus(card: Card): CardStatus {
  // Vérifier si la carte est complète selon son type
  if (card.type === 'basic') {
    if (!card.frontFR || !card.backText) {
      return 'incomplete'
    }
  } else if (card.type === 'cloze') {
    if (!card.clozeTextTarget) {
      return 'incomplete'
    }
  }

  // Vérifier les médias pour détecter des erreurs
  if (card.audioUrl && !isValidAudio(card.audioUrl)) {
    return 'error'
  }
  
  if (card.imageUrl && !isValidImage(card.imageUrl)) {
    return 'error'
  }

  return 'complete'
}

/**
 * Vérifie si une URL audio est valide
 */
export function isValidAudio(url: string): boolean {
  if (!url) return false
  
  // URLs data: et blob: sont toujours valides
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return true
  }
  
  // Vérifier les URLs HTTP/HTTPS
  if (/^https?:\/\//.test(url)) {
    return true
  }
  
  return false
}

/**
 * Vérifie si une URL image est valide
 */
export function isValidImage(url: string): boolean {
  if (!url) return false
  
  // URLs data: sont toujours valides
  if (url.startsWith('data:')) {
    return true
  }
  
  // Vérifier les URLs HTTP/HTTPS
  if (/^https?:\/\//.test(url)) {
    return true
  }
  
  return false
}

/**
 * Obtient le message d'erreur pour un statut donné
 */
export function getStatusMessage(card: Card, status: CardStatus): string {
  switch (status) {
    case 'incomplete':
      if (card.type === 'basic') {
        return !card.frontFR ? 'Question manquante' : 'Réponse manquante'
      } else {
        return 'Texte à trous manquant'
      }
    
    case 'error':
      if (card.audioUrl && !isValidAudio(card.audioUrl)) {
        return 'Audio introuvable'
      }
      if (card.imageUrl && !isValidImage(card.imageUrl)) {
        return 'Image introuvable'
      }
      return 'Erreur inconnue'
    
    case 'complete':
    default:
      return 'Carte complète'
  }
}
