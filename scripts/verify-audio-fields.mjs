#!/usr/bin/env node

/**
 * Script pour vérifier que les champs audio ont été ajoutés
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

async function verifyAudioFields() {
  try {
    console.log('🔍 Vérification des champs audio...');
    
    const collection = await makeRequest('GET', `/databases/${DATABASE_ID}/collections/${COLLECTION_ID}`);
    console.log('✅ Collection trouvée:', collection.name);
    
    const attributes = collection.attributes || [];
    console.log(`📊 Nombre total d'attributs: ${attributes.length}`);
    
    const audioFields = attributes.filter(attr => 
      attr.key === 'audioFileId' || attr.key === 'audioMime'
    );
    
    console.log('\n🎵 Champs audio trouvés:');
    audioFields.forEach(attr => {
      console.log(`  - ${attr.key}: ${attr.type} (requis: ${attr.required}, taille: ${attr.size})`);
    });
    
    if (audioFields.length === 2) {
      console.log('\n🎉 Tous les champs audio sont présents !');
    } else {
      console.log('\n⚠️  Certains champs audio manquent encore.');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}

// Exécution
verifyAudioFields();
