#!/usr/bin/env node

/**
 * Script pour ajouter le champ targetLang et les index nécessaires
 * pour le système Leitner+ multi-langues
 */

// Utilisation de l'API fetch native de Node.js (disponible depuis Node 18+)

// Configuration Appwrite
const APPWRITE_ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = 'ankilang';
const APPWRITE_API_KEY = 'standard_0ba5c26e05d08e71e9975e37e56450731fb1e7478e3e8d4e51d744baf33089e568977cc84f850b37c24fbba751f6871bb8e0445d0802872f52299fea64be5fcfb13b8e1806aaf3abbd2e0ee76e39ed83e9818eb870de2529691f0d1afa044537e447a66ca24915492d5270fcd3ca09ad3962426047a54f580c68125cffcb26b1';

const DATABASE_ID = 'ankilang-main';
const CARDS_COLLECTION_ID = 'cards';
const REVIEW_LOGS_COLLECTION_ID = 'review_logs';

// Headers pour les requêtes Appwrite
const headers = {
  'Content-Type': 'application/json',
  'X-Appwrite-Project': APPWRITE_PROJECT_ID,
  'X-Appwrite-Key': APPWRITE_API_KEY
};

/**
 * Faire une requête à l'API Appwrite
 */
async function makeRequest(method, path, data = null) {
  const url = `${APPWRITE_ENDPOINT}${path}`;
  const options = {
    method,
    headers,
    ...(data && { body: JSON.stringify(data) })
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`API Error ${response.status}: ${result.message || 'Unknown error'}`);
    }
    
    return result;
  } catch (error) {
    console.error(`❌ Erreur ${method} ${path}:`, error.message);
    throw error;
  }
}

/**
 * Ajouter le champ targetLang à la collection cards
 */
async function addTargetLangField() {
  console.log('🔧 Ajout du champ targetLang à la collection cards...');
  
  try {
    // Vérifier si le champ existe déjà
    const attributes = await makeRequest('GET', `/databases/${DATABASE_ID}/collections/${CARDS_COLLECTION_ID}/attributes`);
    const existingFields = attributes.attributes.map(attr => attr.key);
    
    if (existingFields.includes('targetLang')) {
      console.log('⏭️ Champ targetLang existe déjà');
      return;
    }
    
    // Ajouter le champ targetLang
    await makeRequest('POST', `/databases/${DATABASE_ID}/collections/${CARDS_COLLECTION_ID}/attributes/string`, {
      key: 'targetLang',
      size: 10,
      required: false, // Temporairement false pour le backfill
      default: ''
    });
    
    console.log('✅ Champ targetLang ajouté');
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('⏭️ Champ targetLang existe déjà');
    } else {
      console.error('❌ Erreur lors de l\'ajout du champ targetLang:', error.message);
      throw error;
    }
  }
}

/**
 * Créer les index nécessaires
 */
async function createIndexes() {
  console.log('🔍 Création des index...');
  
  const indexes = [
    // Index pour cards
    {
      collection: CARDS_COLLECTION_ID,
      key: 'userId_targetLang_due',
      attributes: ['userId', 'targetLang', 'due']
    },
    {
      collection: CARDS_COLLECTION_ID,
      key: 'userId_targetLang_createdAt',
      attributes: ['userId', 'targetLang', '$createdAt']
    },
    // Index pour review_logs
    {
      collection: REVIEW_LOGS_COLLECTION_ID,
      key: 'userId_targetLang_createdAt',
      attributes: ['userId', 'targetLang', '$createdAt']
    }
  ];
  
  for (const index of indexes) {
    try {
      console.log(`📝 Création de l'index ${index.collection}.${index.key}...`);
      
      await makeRequest('POST', `/databases/${DATABASE_ID}/collections/${index.collection}/indexes`, {
        key: index.key,
        type: 'key',
        attributes: index.attributes
      });
      
      console.log(`✅ Index ${index.key} créé`);
      
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`⏭️ Index ${index.key} existe déjà`);
      } else {
        console.error(`❌ Erreur pour l'index ${index.key}:`, error.message);
      }
    }
  }
}

/**
 * Vérifier la configuration
 */
async function verifyConfiguration() {
  console.log('🔍 Vérification de la configuration...');
  
  try {
    // Vérifier le champ targetLang
    const cardsAttributes = await makeRequest('GET', `/databases/${DATABASE_ID}/collections/${CARDS_COLLECTION_ID}/attributes`);
    const targetLangField = cardsAttributes.attributes.find(attr => attr.key === 'targetLang');
    
    if (targetLangField) {
      console.log('✅ Champ targetLang présent');
    } else {
      console.log('❌ Champ targetLang manquant');
    }
    
    // Vérifier les index
    const cardsIndexes = await makeRequest('GET', `/databases/${DATABASE_ID}/collections/${CARDS_COLLECTION_ID}/indexes`);
    const reviewLogsIndexes = await makeRequest('GET', `/databases/${DATABASE_ID}/collections/${REVIEW_LOGS_COLLECTION_ID}/indexes`);
    
    const expectedIndexes = [
      'userId_targetLang_due',
      'userId_targetLang_createdAt'
    ];
    
    const foundIndexes = [
      ...cardsIndexes.indexes.map(idx => idx.key),
      ...reviewLogsIndexes.indexes.map(idx => idx.key)
    ];
    
    const missingIndexes = expectedIndexes.filter(idx => !foundIndexes.includes(idx));
    
    if (missingIndexes.length === 0) {
      console.log('✅ Tous les index sont présents');
    } else {
      console.log(`⚠️ Index manquants: ${missingIndexes.join(', ')}`);
    }
    
    return {
      targetLangField: !!targetLangField,
      indexes: expectedIndexes.length - missingIndexes.length,
      totalIndexes: expectedIndexes.length
    };
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    throw error;
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🚀 Ajout du champ targetLang et des index');
  console.log('==========================================');
  
  try {
    // 1. Ajouter le champ targetLang
    await addTargetLangField();
    
    // 2. Créer les index
    await createIndexes();
    
    // 3. Vérifier la configuration
    const verification = await verifyConfiguration();
    
    console.log('\n🎉 Configuration terminée !');
    console.log('============================');
    console.log(`📊 Champ targetLang: ${verification.targetLangField ? '✅' : '❌'}`);
    console.log(`📊 Index créés: ${verification.indexes}/${verification.totalIndexes}`);
    
    console.log('\n📋 Prochaines étapes:');
    console.log('• Exécuter le script de backfill targetLang');
    console.log('• Implémenter les services Leitner+');
    console.log('• Créer les pages de révision');
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la configuration:', error.message);
    process.exit(1);
  }
}

// Exécuter le script
main();
