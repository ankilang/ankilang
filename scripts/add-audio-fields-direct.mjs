#!/usr/bin/env node

/**
 * Script pour ajouter les champs audioFileId et audioMime à la collection cards
 * Utilise directement l'API REST Appwrite
 */

import { Client, Databases } from 'appwrite';

// Configuration Appwrite
const client = new Client();
client
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('ankilang')
  .setKey('standard_0ba5c26e05d08e71e9975e37e56450731fb1e7478e3e8d4e51d744baf33089e568977cc84f850b37c24fbba751f6871bb8e0445d0802872f52299fea64be5fcfb13b8e1806aaf3abbd2e0ee76e39ed83e9818eb870de2529691f0d1afa044537e447a66ca24915492d5270fcd3ca09ad3962426047a54f580c68125cffcb26b1');

const databases = new Databases(client);

const DATABASE_ID = 'ankilang';
const COLLECTION_ID = 'cards';

async function addAudioFields() {
  try {
    console.log('🔍 Recherche de la collection cards...');
    
    // Récupérer la collection
    const collection = await databases.getCollection(DATABASE_ID, COLLECTION_ID);
    console.log('✅ Collection trouvée:', collection.name);
    
    console.log('📝 Ajout du champ audioFileId...');
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTION_ID,
      'audioFileId',
      255, // taille max
      false, // required
      '', // default value
      false // array
    );
    console.log('✅ Champ audioFileId ajouté');
    
    console.log('📝 Ajout du champ audioMime...');
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTION_ID,
      'audioMime',
      100, // taille max
      false, // required
      '', // default value
      false // array
    );
    console.log('✅ Champ audioMime ajouté');
    
    console.log('🎉 Tous les champs audio ont été ajoutés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des champs:', error);
    
    if (error.code === 409) {
      console.log('⚠️  Les champs existent peut-être déjà. Vérification...');
      try {
        const collection = await databases.getCollection(DATABASE_ID, COLLECTION_ID);
        const attributes = collection.attributes || [];
        
        const hasAudioFileId = attributes.some(attr => attr.key === 'audioFileId');
        const hasAudioMime = attributes.some(attr => attr.key === 'audioMime');
        
        console.log('📊 État des champs:');
        console.log(`  - audioFileId: ${hasAudioFileId ? '✅ Présent' : '❌ Manquant'}`);
        console.log(`  - audioMime: ${hasAudioMime ? '✅ Présent' : '❌ Manquant'}`);
        
        if (hasAudioFileId && hasAudioMime) {
          console.log('🎉 Tous les champs sont déjà présents !');
        }
      } catch (checkError) {
        console.error('❌ Erreur lors de la vérification:', checkError);
      }
    }
    
    process.exit(1);
  }
}

// Exécution
addAudioFields();
