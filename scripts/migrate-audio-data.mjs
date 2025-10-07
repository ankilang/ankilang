#!/usr/bin/env node

/**
 * Script pour migrer les données audio existantes
 * - Convertit les audioUrl base64 en fichiers Appwrite Storage
 * - Met à jour les champs audioFileId et audioMime
 */

import { Client, Databases, Storage, Query } from 'appwrite';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('ankilang');

const databases = new Databases(client);
const storage = new Storage(client);

async function migrateAudioData() {
  try {
    console.log('🔄 Migration des données audio existantes...');
    
    // Récupérer toutes les cartes avec audio base64
    const response = await databases.listDocuments('ankilang-main', 'cards', [
      Query.isNotNull('audioUrl'),
      Query.limit(100) // Traiter par lots
    ]);
    
    console.log(`📊 ${response.total} cartes trouvées avec audio`);
    
    let migrated = 0;
    let errors = 0;
    
    for (const card of response.documents) {
      try {
        // Vérifier si c'est un audio base64
        if (card.audioUrl && card.audioUrl.startsWith('data:audio/')) {
          console.log(`🔄 Migration de la carte ${card.$id}...`);
          
          // Extraire les données base64 et le type MIME
          const [header, base64Data] = card.audioUrl.split(',');
          const mimeType = header?.match(/data:([^;]+)/)?.[1] || 'audio/mpeg';
          
          // Convertir base64 en blob
          const binaryData = atob(base64Data);
          const arrayBuffer = new ArrayBuffer(binaryData.length);
          const uint8Array = new Uint8Array(arrayBuffer);
          
          for (let i = 0; i < binaryData.length; i++) {
            uint8Array[i] = binaryData.charCodeAt(i);
          }
          
          const blob = new Blob([arrayBuffer], { type: mimeType });
          
          // Générer un nom de fichier unique
          const timestamp = Date.now().toString(36);
          const userIdShort = card.userId.substring(0, 8);
          const extension = mimeType.includes('wav') ? 'wav' : 'mp3';
          const filename = `audio-${userIdShort}-${timestamp}.${extension}`;
          
          // Uploader vers Appwrite Storage
          const file = await storage.createFile(
            'flashcard-images', // Bucket
            filename,
            blob,
            [card.userId] // Permissions
          );
          
          // Mettre à jour la carte avec les nouveaux champs
          await databases.updateDocument(
            'ankilang-main',
            'cards',
            card.$id,
            {
              audioFileId: file.$id,
              audioMime: mimeType,
              // Garder l'audioUrl pour compatibilité
            }
          );
          
          console.log(`✅ Carte ${card.$id} migrée: ${file.$id}`);
          migrated++;
          
        } else {
          console.log(`⏭️ Carte ${card.$id} ignorée (pas de base64)`);
        }
        
      } catch (error) {
        console.error(`❌ Erreur migration carte ${card.$id}:`, error.message);
        errors++;
      }
    }
    
    console.log('');
    console.log('📊 Résumé de la migration:');
    console.log(`✅ ${migrated} cartes migrées avec succès`);
    console.log(`❌ ${errors} erreurs`);
    console.log('');
    console.log('🎉 Migration terminée !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

// Exécuter le script
migrateAudioData();
