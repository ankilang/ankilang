#!/usr/bin/env node

/**
 * Script pour ajouter les champs audioFileId et audioMime à la collection cards
 * Utilise l'API REST Appwrite directement
 */

const API_KEY = 'standard_0ba5c26e05d08e71e9975e37e56450731fb1e7478e3e8d4e51d744baf33089e568977cc84f850b37c24fbba751f6871bb8e0445d0802872f52299fea64be5fcfb13b8e1806aaf3abbd2e0ee76e39ed83e9818eb870de2529691f0d1afa044537e447a66ca24915492d5270fcd3ca09ad3962426047a54f580c68125cffcb26b1';
const PROJECT_ID = 'ankilang';
const DATABASE_ID = 'ankilang-main';
const COLLECTION_ID = 'cards';
const ENDPOINT = 'https://fra.cloud.appwrite.io/v1';

async function makeRequest(method, path, data = null) {
  const url = `${ENDPOINT}${path}`;
  const options = {
    method,
    headers: {
      'X-Appwrite-Project': PROJECT_ID,
      'X-Appwrite-Key': API_KEY,
      'Content-Type': 'application/json',
    },
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }
  
  return await response.json();
}

async function addAudioFields() {
  try {
    console.log('🔍 Vérification de la collection cards...');
    
    // Récupérer la collection
    const collection = await makeRequest('GET', `/databases/${DATABASE_ID}/collections/${COLLECTION_ID}`);
    console.log('✅ Collection trouvée:', collection.name);
    
    console.log('📝 Ajout du champ audioFileId...');
    await makeRequest('POST', `/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/attributes/string`, {
      key: 'audioFileId',
      size: 255,
      required: false,
      default: '',
      array: false
    });
    console.log('✅ Champ audioFileId ajouté');
    
    console.log('📝 Ajout du champ audioMime...');
    await makeRequest('POST', `/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/attributes/string`, {
      key: 'audioMime',
      size: 100,
      required: false,
      default: '',
      array: false
    });
    console.log('✅ Champ audioMime ajouté');
    
    console.log('🎉 Tous les champs audio ont été ajoutés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des champs:', error);
    
    if (error.message.includes('409') || error.message.includes('already exists')) {
      console.log('⚠️  Les champs existent peut-être déjà. Vérification...');
      try {
        const collection = await makeRequest('GET', `/databases/${DATABASE_ID}/collections/${COLLECTION_ID}`);
        const attributes = collection.attributes || [];
        
        const hasAudioFileId = attributes.some(attr => attr.key === 'audioFileId');
        const hasAudioMime = attributes.some(attr => attr.key === 'audioMime');
        
        console.log('📊 État des champs:');
        console.log(`  - audioFileId: ${hasAudioFileId ? '✅ Présent' : '❌ Manquant'}`);
        console.log(`  - audioMime: ${hasAudioMime ? '✅ Présent' : '❌ Manquant'}`);
        
        if (hasAudioFileId && hasAudioMime) {
          console.log('🎉 Tous les champs sont déjà présents !');
        } else {
          console.log('⚠️  Certains champs manquent encore. Veuillez les ajouter manuellement via la console Appwrite.');
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
