import { DatabaseService } from './database.service';
import { StorageService } from './storage.service';
import { Query } from 'appwrite';
import type { Card } from '@ankilang/shared';

const databaseService = new DatabaseService();
const storageService = new StorageService();

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

  // Uploader un fichier audio base64 vers Appwrite Storage
  private async uploadAudioToStorage(audioDataUrl: string, userId: string): Promise<string> {
    try {
      // Extraire les données base64
      const base64Data = audioDataUrl.split(',')[1];
      if (!base64Data) {
        throw new Error('Données base64 invalides');
      }
      const binaryData = atob(base64Data);
      const arrayBuffer = new ArrayBuffer(binaryData.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      
      for (let i = 0; i < binaryData.length; i++) {
        uint8Array[i] = binaryData.charCodeAt(i);
      }
      
      // Créer un blob
      const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
      
      // Générer un nom de fichier unique (max 36 chars, alphanumeric + underscore/hyphen)
      const timestamp = Date.now().toString(36); // Base36 pour raccourcir
      const userIdShort = userId.substring(0, 8); // Premiers 8 caractères
      const filename = `audio-${userIdShort}-${timestamp}.wav`;
      
      // Uploader vers Appwrite Storage (utiliser le bucket flashcard-images existant)
      const file = await storageService.uploadFile('flashcard-images', filename, blob);
      
      console.log(`✅ Audio uploadé vers Appwrite Storage: ${file.$id}`);
      return file.$id;
    } catch (error) {
      console.error('[CardsService] Error uploading audio:', error);
      throw error;
    }
  }

  // Créer une nouvelle carte
  async createCard(userId: string, themeId: string, cardData: Omit<Card, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<AppwriteCard> {
    try {
      let audioUrl = cardData.audioUrl || '';
      
      // Si l'audio est un blob base64, l'uploader vers Appwrite Storage
      if (audioUrl.startsWith('data:audio/')) {
        console.log('📤 Upload de l\'audio vers Appwrite Storage...');
        const fileId = await this.uploadAudioToStorage(audioUrl, userId);
        audioUrl = fileId; // Stocker l'ID du fichier au lieu de l'URL base64
      }
      
      const data = {
        userId,
        themeId,
        type: cardData.type,
        frontFR: cardData.frontFR || '',
        backText: cardData.backText || '',
        clozeTextTarget: cardData.clozeTextTarget || '',
        extra: cardData.extra || '',
        imageUrl: cardData.imageUrl || '',
        audioUrl: audioUrl,
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

