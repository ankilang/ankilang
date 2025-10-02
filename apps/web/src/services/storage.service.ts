import { Storage, Permission, Role } from 'appwrite';
import client from './appwrite';

export class StorageService {
  private storage: Storage;

  constructor() {
    this.storage = new Storage(client);
  }

  // Uploader un fichier vers Appwrite Storage avec permissions owner-only
  async uploadFile(bucketId: string, filename: string, file: Blob, userId?: string): Promise<any> {
    try {
      console.log(`📤 Upload du fichier ${filename} vers le bucket ${bucketId}...`);
      
      // Convertir Blob en File pour Appwrite
      const fileObj = new File([file], filename, { type: file.type });
      
      // Permissions owner-only si userId fourni
      const permissions = userId ? [
        Permission.read(Role.user(userId)),
        Permission.write(Role.user(userId)),
        Permission.delete(Role.user(userId))
      ] : undefined;
      
      const result = await this.storage.createFile(
        bucketId,
        filename,
        fileObj,
        permissions
      );
      
      console.log(`✅ Fichier uploadé avec succès: ${result.$id}`);
      return result;
    } catch (error) {
      console.error('[StorageService] Error uploading file:', error);
      throw error;
    }
  }

  // Télécharger un fichier depuis Appwrite Storage
  async downloadFile(bucketId: string, fileId: string): Promise<Blob> {
    try {
      console.log(`📥 Téléchargement du fichier ${fileId} depuis le bucket ${bucketId}...`);
      
      const result = await this.storage.getFileDownload(
        bucketId,
        fileId
      );
      
      console.log(`✅ Fichier téléchargé avec succès`);
      return result as unknown as Blob;
    } catch (error) {
      console.error('[StorageService] Error downloading file:', error);
      throw error;
    }
  }

  // Obtenir l'URL de téléchargement d'un fichier
  getFileView(bucketId: string, fileId: string): string {
    return this.storage.getFileView(bucketId, fileId).toString();
  }

  // Supprimer un fichier
  async deleteFile(bucketId: string, fileId: string): Promise<void> {
    try {
      console.log(`🗑️ Suppression du fichier ${fileId} du bucket ${bucketId}...`);
      
      await this.storage.deleteFile(bucketId, fileId);
      
      console.log(`✅ Fichier supprimé avec succès`);
    } catch (error) {
      console.error('[StorageService] Error deleting file:', error);
      throw error;
    }
  }
}
