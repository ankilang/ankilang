import client from './appwrite';
import { Databases, ID, Query } from 'appwrite';

// Instance databases
const databases = new Databases(client);

// Helper générique pour les opérations CRUD Appwrite
export class DatabaseService {
  private databaseId = "ankilang-main"; // Base de données par défaut

  // CREATE - Créer un document
  async create<T>(collectionId: string, data: Record<string, any>): Promise<T> {
    try {
      const response = await databases.createDocument(
        this.databaseId,
        collectionId,
        ID.unique(),
        data
      );
      return response as T;
    } catch (error) {
      console.error(`[DatabaseService] Error creating document in ${collectionId}:`, error);
      throw error;
    }
  }

  // READ - Lire un document par ID
  async getById<T>(collectionId: string, documentId: string): Promise<T> {
    try {
      const response = await databases.getDocument(
        this.databaseId,
        collectionId,
        documentId
      );
      return response as T;
    } catch (error) {
      console.error(`[DatabaseService] Error reading document ${documentId} from ${collectionId}:`, error);
      throw error;
    }
  }

  // READ - Lister des documents avec requêtes
  async list<T>(collectionId: string, queries: string[] = []): Promise<{ documents: T[], total: number }> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        collectionId,
        queries
      );
      return {
        documents: response.documents as T[],
        total: response.total
      };
    } catch (error) {
      console.error(`[DatabaseService] Error listing documents from ${collectionId}:`, error);
      throw error;
    }
  }

  // UPDATE - Mettre à jour un document
  async update<T>(collectionId: string, documentId: string, data: Record<string, any>): Promise<T> {
    try {
      const response = await databases.updateDocument(
        this.databaseId,
        collectionId,
        documentId,
        data
      );
      return response as T;
    } catch (error) {
      console.error(`[DatabaseService] Error updating document ${documentId} in ${collectionId}:`, error);
      throw error;
    }
  }

  // DELETE - Supprimer un document
  async delete(collectionId: string, documentId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        this.databaseId,
        collectionId,
        documentId
      );
    } catch (error) {
      console.error(`[DatabaseService] Error deleting document ${documentId} from ${collectionId}:`, error);
      throw error;
    }
  }

  // Helper pour créer des requêtes
  static queries = {
    equal: (attribute: string, value: string | number | boolean) => Query.equal(attribute, value),
    notEqual: (attribute: string, value: string | number | boolean) => Query.notEqual(attribute, value),
    limit: (limit: number) => Query.limit(limit),
    offset: (offset: number) => Query.offset(offset),
    orderAsc: (attribute: string) => Query.orderAsc(attribute),
    orderDesc: (attribute: string) => Query.orderDesc(attribute),
    search: (attribute: string, value: string) => Query.search(attribute, value)
  };
}

// Instance singleton
export const databaseService = new DatabaseService();
