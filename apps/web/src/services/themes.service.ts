import { databaseService, DatabaseService } from './database.service';
import type { CreateTheme } from '../types/shared';

// Interface pour les thèmes avec métadonnées Appwrite
export interface AppwriteTheme {
  $id: string;
  $createdAt: string;  
  $updatedAt: string;
  userId: string;
  name: string;
  targetLang: string;
  tags?: string[];
  cardCount: number;
  shareStatus: 'private' | 'community';
}

export class ThemesService {
  private collectionId = 'themes';

  // Créer un nouveau thème
  async createTheme(userId: string, themeData: CreateTheme): Promise<AppwriteTheme> {
    try {
      // Filtrer les champs non reconnus par la base de données actuelle
      const { category, ...legacyData } = themeData;
      
      const dataWithUserId = {
        ...legacyData,
        userId,
        cardCount: 0, // Nouveau thème = 0 carte
        shareStatus: 'private' as const, // Par défaut privé
        // Ajouter targetLang par défaut si manquant (pour les thèmes "autres")
        targetLang: legacyData.targetLang || 'general'
      };

      console.log('[ThemesService] Creating theme with data:', dataWithUserId);

      const theme = await databaseService.create<AppwriteTheme>(
        this.collectionId, 
        dataWithUserId,
        userId // Passer userId pour permissions owner-only
      );

      return theme;
    } catch (error) {
      console.error('[ThemesService] Error creating theme:', error);
      throw error;
    }
  }

  // Lister les thèmes de l'utilisateur (optimisé pour React Query)
  async getUserThemes(userId: string): Promise<AppwriteTheme[]> {
    try {
      const { documents } = await databaseService.list<AppwriteTheme>(
        this.collectionId,
        [
          DatabaseService.queries.equal('userId', userId),
          DatabaseService.queries.orderDesc('$createdAt'),
          DatabaseService.queries.limit(100),
          // 🚀 OPTIMISATION: Ne récupérer que les champs nécessaires pour la liste
          // DatabaseService.queries.select(['$id', 'userId', 'name', 'targetLang', 'cardCount', 'shareStatus', '$createdAt', '$updatedAt']) // Non disponible dans DatabaseService
        ]
      );

      return documents;
    } catch (error) {
      console.error('[ThemesService] Error fetching user themes:', error);
      throw error;
    }
  }

  // Récupérer un thème par ID
  async getThemeById(themeId: string, userId?: string): Promise<AppwriteTheme> {
    try {
      const theme = await databaseService.getById<AppwriteTheme>(
        this.collectionId,
        themeId
      );

      // Vérifier que l'utilisateur est propriétaire (si userId fourni)
      if (userId && theme.userId !== userId) {
        throw new Error('Accès non autorisé à ce thème');
      }

      return theme;
    } catch (error) {
      console.error('[ThemesService] Error fetching theme by ID:', error);
      throw error;
    }
  }

  // Mettre à jour un thème
  async updateTheme(themeId: string, userId: string, updates: Partial<AppwriteTheme>): Promise<AppwriteTheme> {
    try {
      // Vérifier les droits d'accès
      await this.getThemeById(themeId, userId);
      
      const updatedTheme = await databaseService.update<AppwriteTheme>(
        this.collectionId,
        themeId,
        updates
      );

      return updatedTheme;
    } catch (error) {
      console.error('[ThemesService] Error updating theme:', error);
      throw error;
    }
  }

  // Supprimer un thème (avec suppression en cascade des cartes)
  async deleteTheme(themeId: string, userId: string): Promise<void> {
    try {
      // Vérifier les droits d'accès
      await this.getThemeById(themeId, userId);
      
      // 1️⃣ Supprimer toutes les cartes associées en cascade
      const { cardsService } = await import('./cards.service');
      const deletedCardsCount = await cardsService.deleteCardsByThemeId(themeId, userId);
      
      // 2️⃣ Supprimer le thème
      await databaseService.delete(this.collectionId, themeId);
      
      console.log(`✅ Thème ${themeId} supprimé avec ${deletedCardsCount} carte(s) en cascade`);
    } catch (error) {
      console.error('[ThemesService] Error deleting theme:', error);
      throw error;
    }
  }

  // Incrémenter le compteur de cartes
  async incrementCardCount(themeId: string, userId: string): Promise<AppwriteTheme> {
    try {
      const theme = await this.getThemeById(themeId, userId);
      return await this.updateTheme(themeId, userId, { 
        cardCount: (theme.cardCount || 0) + 1 
      });
    } catch (error) {
      console.error('[ThemesService] Error incrementing card count:', error);
      throw error;
    }
  }

  // Décrémenter le compteur de cartes  
  async decrementCardCount(themeId: string, userId: string): Promise<AppwriteTheme> {
    try {
      const theme = await this.getThemeById(themeId, userId);
      const newCount = Math.max(0, (theme.cardCount || 0) - 1);
      return await this.updateTheme(themeId, userId, { cardCount: newCount });
    } catch (error) {
      console.error('[ThemesService] Error decrementing card count:', error);
      throw error;
    }
  }
}

// Instance singleton
export const themesService = new ThemesService();
