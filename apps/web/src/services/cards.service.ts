import { DatabaseService } from './database.service';
import { Query } from 'appwrite';
import type { Card } from '@ankilang/shared';

const databaseService = new DatabaseService();

// Type Appwrite pour les cartes (avec métadonnées)
export interface AppwriteCard extends Card {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
}

export class CardsService {
  private collectionId = 'cards';

  // Récupérer toutes les cartes d'un thème
  async getCardsByThemeId(themeId: string, userId: string): Promise<AppwriteCard[]> {
    try {
      const response = await databaseService.list<AppwriteCard>(
        this.collectionId,
        [
          Query.equal('themeId', themeId),
          Query.equal('userId', userId),
          Query.orderDesc('$createdAt')
        ]
      );
      return response.documents;
    } catch (error) {
      console.error('[CardsService] Error fetching cards:', error);
      throw error;
    }
  }

  // Récupérer une carte par son ID
  async getCardById(cardId: string, userId: string): Promise<AppwriteCard> {
    try {
      const card = await databaseService.getById<AppwriteCard>(this.collectionId, cardId);
      
      // Vérifier que l'utilisateur est propriétaire
      if (card.userId !== userId) {
        throw new Error('Access denied: card does not belong to user');
      }
      
      return card;
    } catch (error) {
      console.error('[CardsService] Error fetching card:', error);
      throw error;
    }
  }

  // Créer une nouvelle carte
  async createCard(userId: string, themeId: string, cardData: Omit<Card, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<AppwriteCard> {
    try {
      const data = {
        userId,
        themeId,
        type: cardData.type,
        frontFR: cardData.frontFR || '',
        backText: cardData.backText || '',
        clozeTextTarget: cardData.clozeTextTarget || '',
        extra: cardData.extra || '',
        imageUrl: cardData.imageUrl || '',
        audioUrl: cardData.audioUrl || '',
        tags: cardData.tags || []
      };

      return await databaseService.create<AppwriteCard>(this.collectionId, data);
    } catch (error) {
      console.error('[CardsService] Error creating card:', error);
      throw error;
    }
  }

  // Mettre à jour une carte
  async updateCard(cardId: string, userId: string, updates: Partial<Card>): Promise<AppwriteCard> {
    try {
      // Vérifier les droits d'accès
      await this.getCardById(cardId, userId);
      
      return await databaseService.update<AppwriteCard>(this.collectionId, cardId, updates);
    } catch (error) {
      console.error('[CardsService] Error updating card:', error);
      throw error;
    }
  }

  // Supprimer une carte
  async deleteCard(cardId: string, userId: string): Promise<void> {
    try {
      // Vérifier les droits d'accès
      await this.getCardById(cardId, userId);
      
      await databaseService.delete(this.collectionId, cardId);
      console.log(`✅ Carte ${cardId} supprimée d'Appwrite`);
    } catch (error) {
      console.error('[CardsService] Error deleting card:', error);
      throw error;
    }
  }

  // Supprimer toutes les cartes d'un thème (pour suppression en cascade)
  async deleteCardsByThemeId(themeId: string, userId: string): Promise<number> {
    try {
      const cards = await this.getCardsByThemeId(themeId, userId);
      
      if (cards.length === 0) {
        console.log(`ℹ️ Aucune carte à supprimer pour le thème ${themeId}`);
        return 0;
      }

      console.log(`🗑️ Suppression de ${cards.length} carte(s) du thème ${themeId}...`);
      
      // Supprimer toutes les cartes en parallèle pour plus de rapidité
      await Promise.all(
        cards.map(card => databaseService.delete(this.collectionId, card.$id))
      );

      console.log(`✅ ${cards.length} carte(s) supprimée(s) d'Appwrite`);
      return cards.length;
    } catch (error) {
      console.error('[CardsService] Error deleting cards by theme:', error);
      throw error;
    }
  }

  // Compter les cartes d'un thème
  async countCardsByThemeId(themeId: string, userId: string): Promise<number> {
    try {
      const response = await databaseService.list<AppwriteCard>(
        this.collectionId,
        [
          Query.equal('themeId', themeId),
          Query.equal('userId', userId),
          Query.limit(1) // On veut juste le total
        ]
      );
      return response.total;
    } catch (error) {
      console.error('[CardsService] Error counting cards:', error);
      throw error;
    }
  }
}

// Instance singleton
export const cardsService = new CardsService();

