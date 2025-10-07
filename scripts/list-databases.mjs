#!/usr/bin/env node

/**
 * Script pour lister les bases de données disponibles
 */

const API_KEY = 'standard_0ba5c26e05d08e71e9975e37e56450731fb1e7478e3e8d4e51d744baf33089e568977cc84f850b37c24fbba751f6871bb8e0445d0802872f52299fea64be5fcfb13b8e1806aaf3abbd2e0ee76e39ed83e9818eb870de2529691f0d1afa044537e447a66ca24915492d5270fcd3ca09ad3962426047a54f580c68125cffcb26b1';
const PROJECT_ID = 'ankilang';
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

async function listDatabases() {
  try {
    console.log('🔍 Liste des bases de données disponibles...');
    
    const databases = await makeRequest('GET', '/databases');
    console.log('📊 Bases de données trouvées:');
    
    databases.databases.forEach(db => {
      console.log(`  - ID: ${db.$id}`);
      console.log(`    Nom: ${db.name}`);
      console.log(`    Créée: ${new Date(db.$createdAt).toLocaleString()}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des bases de données:', error);
  }
}

// Exécution
listDatabases();
