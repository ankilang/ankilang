#!/usr/bin/env node

/**
 * Script de vérification de la configuration Leitner+
 * Vérifie les permissions, index et valeurs par défaut
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
 * Vérifier les permissions des collections
 */
async function verifyPermissions() {
  console.log('🔐 Vérification des permissions...');
  
  try {
    // Vérifier les permissions de cards
    const cardsCollection = await makeRequest('GET', `/databases/${DATABASE_ID}/collections/${CARDS_COLLECTION_ID}`);
    console.log('✅ Collection cards accessible');
    
    // Vérifier les permissions de review_logs
    const reviewLogsCollection = await makeRequest('GET', `/databases/${DATABASE_ID}/collections/${REVIEW_LOGS_COLLECTION_ID}`);
    console.log('✅ Collection review_logs accessible');
    
    // Note: Les permissions détaillées nécessiteraient une API différente
    console.log('⚠️ Permissions détaillées non vérifiables via API REST');
    console.log('   → Vérifiez manuellement dans la console Appwrite');
    console.log('   → cards: lecture/écriture par userId');
    console.log('   → review_logs: owner-only');
    
    return {
      cardsAccessible: true,
      reviewLogsAccessible: true
    };
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des permissions:', error.message);
    throw error;
  }
}

/**
 * Vérifier et créer les index utiles
 */
async function verifyAndCreateIndexes() {
  console.log('🔍 Vérification et création des index...');
  
  const requiredIndexes = {
    cards: [
      { key: 'themeId_due', attributes: ['themeId', 'due'] },
      { key: 'userId_due', attributes: ['userId', 'due'] },
      { key: 'due', attributes: ['due'] },
      { key: 'box', attributes: ['box'] },
      { key: 'themeId_box_due', attributes: ['themeId', 'box', 'due'] }
    ],
    review_logs: [
      { key: 'userId_createdAt', attributes: ['userId', '$createdAt'] },
      { key: 'cardId_createdAt', attributes: ['cardId', '$createdAt'] },
      { key: 'userId_rating_createdAt', attributes: ['userId', 'rating', '$createdAt'] }
    ]
  };
  
  const results = {
    cards: { created: 0, existing: 0, errors: 0 },
    review_logs: { created: 0, existing: 0, errors: 0 }
  };
  
  // Vérifier les index de cards
  console.log('📊 Vérification des index de cards...');
  try {
    const cardsIndexes = await makeRequest('GET', `/databases/${DATABASE_ID}/collections/${CARDS_COLLECTION_ID}/indexes`);
    const existingCardsIndexes = cardsIndexes.indexes.map(idx => idx.key);
    
    for (const index of requiredIndexes.cards) {
      try {
        if (existingCardsIndexes.includes(index.key)) {
          console.log(`⏭️ Index cards.${index.key} existe déjà`);
          results.cards.existing++;
        } else {
          await makeRequest('POST', `/databases/${DATABASE_ID}/collections/${CARDS_COLLECTION_ID}/indexes`, {
            key: index.key,
            type: 'key',
            attributes: index.attributes
          });
          console.log(`✅ Index cards.${index.key} créé`);
          results.cards.created++;
        }
      } catch (error) {
        console.error(`❌ Erreur pour l'index cards.${index.key}:`, error.message);
        results.cards.errors++;
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des index cards:', error.message);
  }
  
  // Vérifier les index de review_logs
  console.log('📊 Vérification des index de review_logs...');
  try {
    const reviewLogsIndexes = await makeRequest('GET', `/databases/${DATABASE_ID}/collections/${REVIEW_LOGS_COLLECTION_ID}/indexes`);
    const existingReviewLogsIndexes = reviewLogsIndexes.indexes.map(idx => idx.key);
    
    for (const index of requiredIndexes.review_logs) {
      try {
        if (existingReviewLogsIndexes.includes(index.key)) {
          console.log(`⏭️ Index review_logs.${index.key} existe déjà`);
          results.review_logs.existing++;
        } else {
          await makeRequest('POST', `/databases/${DATABASE_ID}/collections/${REVIEW_LOGS_COLLECTION_ID}/indexes`, {
            key: index.key,
            type: 'key',
            attributes: index.attributes
          });
          console.log(`✅ Index review_logs.${index.key} créé`);
          results.review_logs.created++;
        }
      } catch (error) {
        console.error(`❌ Erreur pour l'index review_logs.${index.key}:`, error.message);
        results.review_logs.errors++;
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des index review_logs:', error.message);
  }
  
  return results;
}

/**
 * Vérifier les valeurs par défaut
 */
async function verifyDefaultValues() {
  console.log('🔧 Vérification des valeurs par défaut...');
  
  try {
    // Vérifier les attributs de cards
    const cardsAttributes = await makeRequest('GET', `/databases/${DATABASE_ID}/collections/${CARDS_COLLECTION_ID}/attributes`);
    
    const expectedDefaults = {
      box: 1,
      ease: 2.5,
      lapses: 0,
      streak: 0,
      leech: false
    };
    
    const results = {
      correct: [],
      incorrect: [],
      missing: []
    };
    
    for (const [field, expectedDefault] of Object.entries(expectedDefaults)) {
      const attribute = cardsAttributes.attributes.find(attr => attr.key === field);
      
      if (!attribute) {
        results.missing.push(field);
        console.log(`❌ Champ ${field} manquant`);
      } else if (attribute.default === expectedDefault) {
        results.correct.push(field);
        console.log(`✅ Champ ${field}: valeur par défaut correcte (${attribute.default})`);
      } else {
        results.incorrect.push({ field, expected: expectedDefault, actual: attribute.default });
        console.log(`⚠️ Champ ${field}: valeur par défaut incorrecte (attendu: ${expectedDefault}, actuel: ${attribute.default})`);
      }
    }
    
    // Vérifier le champ 'due' (pas de valeur par défaut)
    const dueAttribute = cardsAttributes.attributes.find(attr => attr.key === 'due');
    if (dueAttribute && dueAttribute.default) {
      console.log(`⚠️ Champ due: ne devrait pas avoir de valeur par défaut (actuel: ${dueAttribute.default})`);
    } else {
      console.log(`✅ Champ due: pas de valeur par défaut (correct)`);
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des valeurs par défaut:', error.message);
    throw error;
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🔎 Vérification de la configuration Leitner+');
  console.log('==========================================');
  
  try {
    // 1. Vérifier les permissions
    const permissions = await verifyPermissions();
    
    // 2. Vérifier et créer les index
    const indexes = await verifyAndCreateIndexes();
    
    // 3. Vérifier les valeurs par défaut
    const defaults = await verifyDefaultValues();
    
    console.log('\n🎉 Vérification terminée !');
    console.log('==========================');
    
    console.log('\n📊 Résumé des permissions:');
    console.log(`• Collection cards: ${permissions.cardsAccessible ? '✅' : '❌'}`);
    console.log(`• Collection review_logs: ${permissions.reviewLogsAccessible ? '✅' : '❌'}`);
    
    console.log('\n📊 Résumé des index:');
    console.log(`• Cards: ${indexes.cards.created} créés, ${indexes.cards.existing} existants, ${indexes.cards.errors} erreurs`);
    console.log(`• Review_logs: ${indexes.review_logs.created} créés, ${indexes.review_logs.existing} existants, ${indexes.review_logs.errors} erreurs`);
    
    console.log('\n📊 Résumé des valeurs par défaut:');
    console.log(`• Correctes: ${defaults.correct.join(', ') || 'aucune'}`);
    console.log(`• Incorrectes: ${defaults.incorrect.map(i => `${i.field}(${i.actual})`).join(', ') || 'aucune'}`);
    console.log(`• Manquantes: ${defaults.missing.join(', ') || 'aucune'}`);
    
    // Recommandations
    console.log('\n💡 Recommandations:');
    if (defaults.incorrect.length > 0 || defaults.missing.length > 0) {
      console.log('• Corriger les valeurs par défaut incorrectes');
    }
    if (indexes.cards.errors > 0 || indexes.review_logs.errors > 0) {
      console.log('• Vérifier les erreurs d\'index');
    }
    console.log('• Vérifier manuellement les permissions dans la console Appwrite');
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la vérification:', error.message);
    process.exit(1);
  }
}

// Exécuter le script
main();
