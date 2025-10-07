#!/usr/bin/env node

/**
 * Script pour ajouter les attributs audio via l'API REST Appwrite
 * Nécessite une API Key avec les permissions appropriées
 */

const APPWRITE_ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
const PROJECT_ID = 'ankilang';
const COLLECTION_ID = 'cards';

// Remplacez par votre API Key avec permissions Database
const API_KEY = process.env.APPWRITE_API_KEY;

if (!API_KEY) {
  console.error('❌ APPWRITE_API_KEY manquante');
  console.log('Ajoutez votre API Key dans les variables d\'environnement :');
  console.log('export APPWRITE_API_KEY="votre_api_key_ici"');
  process.exit(1);
}

async function addAudioAttributes() {
  try {
    console.log('🔧 Ajout des attributs audio via API REST...');
    
    const headers = {
      'X-Appwrite-Project': PROJECT_ID,
      'X-Appwrite-Key': API_KEY,
      'Content-Type': 'application/json'
    };
    
    // Ajouter audioFileId
    console.log('📝 Ajout de l\'attribut audioFileId...');
    const audioFileIdResponse = await fetch(
      `${APPWRITE_ENDPOINT}/databases/ankilang-main/collections/${COLLECTION_ID}/attributes/string`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          key: 'audioFileId',
          size: 255,
          required: false,
          default: null
        })
      }
    );
    
    if (!audioFileIdResponse.ok) {
      const error = await audioFileIdResponse.text();
      console.error('❌ Erreur audioFileId:', error);
    } else {
      console.log('✅ audioFileId ajouté');
    }
    
    // Ajouter audioMime
    console.log('📝 Ajout de l\'attribut audioMime...');
    const audioMimeResponse = await fetch(
      `${APPWRITE_ENDPOINT}/databases/ankilang-main/collections/${COLLECTION_ID}/attributes/string`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          key: 'audioMime',
          size: 100,
          required: false,
          default: null
        })
      }
    );
    
    if (!audioMimeResponse.ok) {
      const error = await audioMimeResponse.text();
      console.error('❌ Erreur audioMime:', error);
    } else {
      console.log('✅ audioMime ajouté');
    }
    
    console.log('');
    console.log('🎉 Attributs ajoutés avec succès !');
    console.log('Vous pouvez maintenant exécuter :');
    console.log('node scripts/migrate-audio-data.mjs');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des attributs:', error);
    process.exit(1);
  }
}

// Exécuter le script
addAudioAttributes();
