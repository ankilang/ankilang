import { DatabaseService } from './database.service';
import { StorageService } from './storage.service';
import { Query } from 'appwrite';
import type { Card, CreateCard, Theme } from '../types/shared';
import { createAdaptiveCard, getServicesForCategory } from '../plugins/cards';

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

  // Récupérer toutes les cartes d'un thème (optimisé pour React Query)
  async getCardsByThemeId(themeId: string, userId: string): Promise<AppwriteCard[]> {
    try {
      const response = await databaseService.list<AppwriteCard>(
        this.collectionId,
        [
          Query.equal('themeId', themeId),
          Query.equal('userId', userId),
          Query.orderDesc('$createdAt'),
          Query.limit(1000), // 🚀 OPTIMISATION: Limiter le nombre de résultats
          // 🚀 OPTIMISATION: Ne récupérer que les champs nécessaires
          // Query.select(['$id', 'userId', 'themeId', 'type', 'frontFR', 'backText', 'clozeTextTarget', 'extra', 'imageUrl', 'imageUrlType', 'audioUrl', 'tags', '$createdAt', '$updatedAt']) // À implémenter côté Appwrite
        ]
      );
      return response.documents;
    } catch (error) {
      console.error('[CardsService] Error fetching cards:', error);
      throw error;
    }
  }

  // 🚀 NOUVEAU: Récupérer les cartes avec pagination (pour useInfiniteQuery)
  async getCardsByThemeIdPaginated(
    themeId: string, 
    userId: string, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<{ documents: AppwriteCard[]; total: number }> {
    try {
      const response = await databaseService.list<AppwriteCard>(
        this.collectionId,
        [
          Query.equal('themeId', themeId),
          Query.equal('userId', userId),
          Query.orderDesc('$createdAt'),
          Query.limit(limit),
          Query.offset(offset),
          // 🚀 OPTIMISATION: Ne récupérer que les champs nécessaires
          // Query.select(['$id', 'userId', 'themeId', 'type', 'frontFR', 'backText', 'clozeTextTarget', 'extra', 'imageUrl', 'imageUrlType', 'audioUrl', 'tags', '$createdAt', '$updatedAt']) // À implémenter côté Appwrite
        ]
      );
      
      return {
        documents: response.documents,
        total: response.total
      };
    } catch (error) {
      console.error('[CardsService] Error fetching paginated cards:', error);
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
  private async uploadAudioToStorage(audioDataUrl: string, userId: string): Promise<{ fileId: string; mimeType: string }> {
    try {
      // Extraire les données base64 et le type MIME
      const [header, base64Data] = audioDataUrl.split(',');
      if (!base64Data) {
        throw new Error('Données base64 invalides');
      }
      
      // Extraire le type MIME du header (ex: "data:audio/mpeg;base64")
      const mimeType = header?.match(/data:([^;]+)/)?.[1] || 'audio/mpeg';
      
      const binaryData = atob(base64Data);
      const arrayBuffer = new ArrayBuffer(binaryData.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      
      for (let i = 0; i < binaryData.length; i++) {
        uint8Array[i] = binaryData.charCodeAt(i);
      }
      
      // Créer un blob avec le bon type MIME
      const blob = new Blob([arrayBuffer], { type: mimeType });
      
      // Générer un nom de fichier unique avec la bonne extension
      const timestamp = Date.now().toString(36);
      const userIdShort = userId.substring(0, 8);
      const extension = mimeType.includes('wav') ? 'wav' : 'mp3';
      const filename = `audio-${userIdShort}-${timestamp}.${extension}`;
      
      // Uploader vers Appwrite Storage
      const file = await storageService.uploadFile('flashcard-images', filename, blob, userId);
      
      console.log(`✅ Audio uploadé vers Appwrite Storage:`, {
        fileId: file.$id,
        filename: file.name,
        mimeType: mimeType,
        size: file.sizeOriginal
      });
      
      return { fileId: file.$id, mimeType };
    } catch (error) {
      console.error('[CardsService] Error uploading audio:', error);
      throw error;
    }
  }

  // Créer une nouvelle carte
  async createCard(userId: string, themeId: string, cardData: Omit<Card, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<AppwriteCard> {
    try {
      
      let audioUrl = cardData.audioUrl || '';
      
      let audioFileId: string | null = null;
      let audioMime: string | null = null;
      
      // Si l'audio est un blob base64, essayer de l'uploader vers Appwrite Storage
      if (audioUrl.startsWith('data:audio/')) {
        console.log('📤 Tentative d\'upload de l\'audio vers Appwrite Storage...');
        try {
          const uploadResult = await this.uploadAudioToStorage(audioUrl, userId);
          audioFileId = uploadResult.fileId;
          audioMime = uploadResult.mimeType;
          
          // 🔧 PATCH EXPRESS : Remplacer la data URL par une URL courte Appwrite
          if (audioFileId) {
            try {
              const audioUrlShort = await storageService.getFileView('flashcard-images', audioFileId);
              // Vérifier que l'URL est courte (< 2048 caractères)
              if (audioUrlShort && audioUrlShort.length <= 2048) {
                audioUrl = audioUrlShort;
                console.log('✅ URL audio courte générée:', audioUrlShort.length, 'caractères');
              } else {
                // Si l'URL est trop longue, ne pas la stocker
                audioUrl = '';
                console.warn('⚠️ URL audio trop longue, non stockée');
              }
            } catch (urlError) {
              console.warn('⚠️ Impossible de générer l\'URL courte, audio sans URL:', urlError);
              audioUrl = '';
            }
          }
          
          console.log('✅ Audio uploadé avec succès vers Appwrite Storage:', {
            fileId: audioFileId,
            mimeType: audioMime,
            audioUrlLength: audioUrl.length
          });
        } catch (uploadError) {
          console.warn('⚠️ Échec de l\'upload vers Appwrite Storage:', uploadError instanceof Error ? uploadError.message : String(uploadError));
          // En cas d'échec d'upload, ne pas stocker la data URL
          audioUrl = '';
        }
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
        imageUrlType: cardData.imageUrlType || 'external',
        audioUrl: audioUrl,
        audioFileId: audioFileId,
        audioMime: audioMime,
        tags: cardData.tags || [],
        
      };

      return await databaseService.create<AppwriteCard>(this.collectionId, data, userId);
    } catch (error) {
      console.error('[CardsService] Error creating card:', error);
      throw error;
    }
  }

  // Créer une carte adaptative selon la catégorie du thème
  async createAdaptiveCard(userId: string, theme: Theme, cardData: CreateCard): Promise<AppwriteCard> {
    try {
      // Utiliser l'adapter approprié pour la catégorie
      const adaptedCardData = await createAdaptiveCard(cardData, theme);
      
      // Vérifier les services disponibles pour cette catégorie
      const services = getServicesForCategory(theme.category);
      
      console.log(`[CardsService] Création de carte adaptative pour catégorie: ${theme.category}`, {
        services,
        theme: theme.name,
        subject: theme.subject
      });
      
      // Créer la carte avec les données adaptées
      return await this.createCard(userId, theme.id, adaptedCardData);
    } catch (error) {
      console.error('[CardsService] Error creating adaptive card:', error);
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
      // Récupérer la carte pour nettoyer les fichiers associés
      const card = await this.getCardById(cardId, userId);
      
      // Nettoyer les fichiers Appwrite associés
      await this.cleanupCardFiles(card);
      
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
      
      // Supprimer toutes les cartes avec leurs médias en parallèle
      await Promise.all(
        cards.map(async (card) => {
          // Nettoyer les fichiers Storage (audio + image) avant de supprimer le document
          await this.cleanupCardFiles(card);
          // Supprimer le document de la base de données
          await databaseService.delete(this.collectionId, card.$id);
        })
      );

      console.log(`✅ ${cards.length} carte(s) supprimée(s) avec leurs médias d'Appwrite`);
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

  /**
   * Nettoie les fichiers Appwrite associés à une carte
   */
  private async cleanupCardFiles(card: AppwriteCard): Promise<void> {
    try {
      // Nettoyer l'image si elle est stockée dans Appwrite
      if (card.imageUrl && card.imageUrlType === 'appwrite') {
        try {
          // Extraire l'ID du fichier depuis l'URL Appwrite
          const imageFileId = this.extractFileIdFromUrl(card.imageUrl);
          if (imageFileId) {
            await storageService.deleteFile('flashcard-images', imageFileId);
            console.log(`🗑️ Image ${imageFileId} supprimée d'Appwrite Storage`);
          }
        } catch (error) {
          console.warn(`⚠️ Impossible de supprimer l'image ${card.imageUrl}:`, error);
        }
      }

      // Nettoyer l'audio si il est stocké dans Appwrite
      if (card.audioFileId) {
        try {
          await storageService.deleteFile('flashcard-images', card.audioFileId);
          console.log(`🗑️ Audio ${card.audioFileId} supprimé d'Appwrite Storage`);
        } catch (error) {
          console.warn(`⚠️ Impossible de supprimer l'audio ${card.audioFileId}:`, error);
        }
      }
    } catch (error) {
      console.warn('⚠️ Erreur lors du nettoyage des fichiers:', error);
      // Ne pas faire échouer la suppression de la carte si le nettoyage échoue
    }
  }

  /**
   * Extrait l'ID du fichier depuis une URL Appwrite Storage
   * Format: https://cloud.appwrite.io/v1/storage/buckets/{bucketId}/files/{fileId}/view?project={projectId}
   */
  private extractFileIdFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const fileIdIndex = pathParts.indexOf('files') + 1;
      return fileIdIndex > 0 && fileIdIndex < pathParts.length ? pathParts[fileIdIndex] || null : null;
    } catch (error) {
      console.warn('⚠️ Impossible d\'extraire l\'ID du fichier depuis l\'URL:', url);
      return null;
    }
  }

  // Récupérer l'URL de visualisation d'un fichier audio
  async getAudioViewUrl(fileId: string): Promise<string> {
    try {
      const url = await storageService.getFileView('flashcard-images', fileId);
      return url;
    } catch (error) {
      console.error('[CardsService] Error getting audio view URL:', error);
      throw error;
    }
  }
}

// Instance singleton
export const cardsService = new CardsService();

