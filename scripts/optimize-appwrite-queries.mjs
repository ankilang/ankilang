#!/usr/bin/env node
/**
 * Script pour optimiser les requêtes Appwrite
 * Teste les performances avant/après optimisation des index
 */

import { Client, Databases, Query } from 'node-appwrite'

// Configuration Appwrite
const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1'
const APPWRITE_PROJECT = process.env.APPWRITE_PROJECT || 'ankilang'
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || 'YOUR_API_KEY'

const DATABASE_ID = process.env.APPWRITE_DB_ID || 'ankilang-main'
const THEMES_COLLECTION_ID = process.env.APPWRITE_THEMES_COLLECTION_ID || 'themes'
const CARDS_COLLECTION_ID = process.env.APPWRITE_CARDS_COLLECTION_ID || 'cards'

if (!APPWRITE_API_KEY || APPWRITE_API_KEY === 'YOUR_API_KEY') {
  console.error('❌ Erreur: Veuillez définir APPWRITE_API_KEY dans vos variables d\'environnement.')
  process.exit(1)
}

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT)
  .setKey(APPWRITE_API_KEY)

const databases = new Databases(client)

/**
 * Mesurer le temps d'exécution d'une requête
 */
async function measureQuery(queryName, queryFn) {
  const startTime = performance.now()
  
  try {
    const result = await queryFn()
    const endTime = performance.now()
    const duration = Math.round(endTime - startTime)
    
    console.log(`✅ ${queryName}: ${duration}ms (${result.documents?.length || result.length || 1} résultats)`)
    return { success: true, duration, count: result.documents?.length || result.length || 1 }
    
  } catch (error) {
    const endTime = performance.now()
    const duration = Math.round(endTime - startTime)
    
    console.log(`❌ ${queryName}: ${duration}ms (ERREUR: ${error.message})`)
    return { success: false, duration, error: error.message }
  }
}

/**
 * Tests de performance pour les requêtes React Query
 */
async function testQueryPerformance() {
  console.log('🚀 Tests de performance des requêtes React Query\n')
  
  // Récupérer un userId de test
  let testUserId = null
  try {
    const themes = await databases.listDocuments(DATABASE_ID, THEMES_COLLECTION_ID, [Query.limit(1)])
    if (themes.documents.length > 0) {
      testUserId = themes.documents[0].userId
      console.log(`👤 Utilisateur de test: ${testUserId}\n`)
    } else {
      console.log('⚠️ Aucun thème trouvé pour les tests\n')
      return
    }
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du userId de test:', error.message)
    return
  }
  
  const results = []
  
  // === TEST 1: useThemes() - Liste des thèmes utilisateur ===
  console.log('📊 Test 1: useThemes() - Liste des thèmes utilisateur')
  const themesResult = await measureQuery(
    'Liste des thèmes (userId + orderDesc createdAt)',
    () => databases.listDocuments(DATABASE_ID, THEMES_COLLECTION_ID, [
      Query.equal('userId', testUserId),
      Query.orderDesc('$createdAt'),
      Query.limit(100)
    ])
  )
  results.push(themesResult)
  
  // === TEST 2: useThemeData() - Thème spécifique ===
  console.log('\n📊 Test 2: useThemeData() - Thème spécifique')
  let testThemeId = null
  try {
    const theme = await databases.listDocuments(DATABASE_ID, THEMES_COLLECTION_ID, [
      Query.equal('userId', testUserId),
      Query.limit(1)
    ])
    if (theme.documents.length > 0) {
      testThemeId = theme.documents[0].$id
    }
  } catch (error) {
    console.log('⚠️ Impossible de récupérer un thème de test')
  }
  
  if (testThemeId) {
    const themeResult = await measureQuery(
      'Thème par ID',
      () => databases.getDocument(DATABASE_ID, THEMES_COLLECTION_ID, testThemeId)
    )
    results.push(themeResult)
    
    // === TEST 3: useCards() - Cartes d'un thème ===
    console.log('\n📊 Test 3: useCards() - Cartes d\'un thème')
    const cardsResult = await measureQuery(
      'Cartes par themeId (themeId + orderDesc createdAt)',
      () => databases.listDocuments(DATABASE_ID, CARDS_COLLECTION_ID, [
        Query.equal('themeId', testThemeId),
        Query.orderDesc('$createdAt'),
        Query.limit(100)
      ])
    )
    results.push(cardsResult)
    
    // === TEST 4: Requête composite - Sécurité ===
    console.log('\n📊 Test 4: Requête composite - Sécurité')
    const securityResult = await measureQuery(
      'Cartes par userId + themeId (sécurité)',
      () => databases.listDocuments(DATABASE_ID, CARDS_COLLECTION_ID, [
        Query.equal('userId', testUserId),
        Query.equal('themeId', testThemeId),
        Query.orderDesc('$createdAt'),
        Query.limit(100)
      ])
    )
    results.push(securityResult)
  }
  
  // === TEST 5: Filtres avancés ===
  console.log('\n📊 Test 5: Filtres avancés')
  const filtersResult = await measureQuery(
    'Thèmes par shareStatus',
    () => databases.listDocuments(DATABASE_ID, THEMES_COLLECTION_ID, [
      Query.equal('userId', testUserId),
      Query.equal('shareStatus', 'private'),
      Query.orderDesc('$createdAt'),
      Query.limit(50)
    ])
  )
  results.push(filtersResult)
  
  // === RÉSUMÉ DES PERFORMANCES ===
  console.log('\n📈 Résumé des performances:')
  const successfulResults = results.filter(r => r.success)
  const avgDuration = successfulResults.length > 0 
    ? Math.round(successfulResults.reduce((sum, r) => sum + r.duration, 0) / successfulResults.length)
    : 0
  
  console.log(`✅ ${successfulResults.length}/${results.length} requêtes réussies`)
  console.log(`⏱️ Temps moyen: ${avgDuration}ms`)
  
  // Évaluation des performances
  if (avgDuration < 100) {
    console.log('🚀 EXCELLENT: Performances optimales (< 100ms)')
  } else if (avgDuration < 300) {
    console.log('✅ BON: Performances acceptables (< 300ms)')
  } else if (avgDuration < 1000) {
    console.log('⚠️ MOYEN: Performances dégradées (< 1s)')
  } else {
    console.log('❌ MAUVAIS: Performances critiques (> 1s)')
  }
  
  return results
}

/**
 * Vérifier l'utilisation des index
 */
async function checkIndexUsage() {
  console.log('\n🔍 Vérification de l\'utilisation des index...')
  
  try {
    // Vérifier les index des thèmes
    const themesIndexes = await databases.listIndexes(DATABASE_ID, THEMES_COLLECTION_ID)
    console.log(`\n🏷️ Index ${THEMES_COLLECTION_ID}:`)
    themesIndexes.indexes.forEach(idx => {
      console.log(`  - ${idx.key}: [${idx.attributes.join(', ')}]`)
    })
    
    // Vérifier les index des cartes
    const cardsIndexes = await databases.listIndexes(DATABASE_ID, CARDS_COLLECTION_ID)
    console.log(`\n🃏 Index ${CARDS_COLLECTION_ID}:`)
    cardsIndexes.indexes.forEach(idx => {
      console.log(`  - ${idx.key}: [${idx.attributes.join(', ')}]`)
    })
    
    // Vérifier les index critiques
    const criticalIndexes = [
      { collection: THEMES_COLLECTION_ID, key: 'userId_createdAt', indexes: themesIndexes.indexes },
      { collection: CARDS_COLLECTION_ID, key: 'themeId_createdAt', indexes: cardsIndexes.indexes },
      { collection: CARDS_COLLECTION_ID, key: 'userId_themeId', indexes: cardsIndexes.indexes }
    ]
    
    console.log('\n🎯 Index critiques:')
    criticalIndexes.forEach(({ collection, key, indexes }) => {
      const exists = indexes.some(idx => idx.key === key)
      console.log(`  ${exists ? '✅' : '❌'} ${collection}.${key}`)
    })
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des index:', error.message)
  }
}

/**
 * Recommandations d'optimisation
 */
function printOptimizationRecommendations() {
  console.log('\n💡 Recommandations d\'optimisation:')
  console.log('')
  console.log('1. 🚀 Index critiques (OBLIGATOIRES):')
  console.log('   - themes.userId_createdAt (pour useThemes)')
  console.log('   - cards.themeId_createdAt (pour useCards)')
  console.log('   - cards.userId_themeId (pour la sécurité)')
  console.log('')
  console.log('2. ⚡ Index de performance (RECOMMANDÉS):')
  console.log('   - themes.userId_shareStatus (pour les filtres)')
  console.log('   - cards.userId_createdAt (pour les listes globales)')
  console.log('   - cards.themeId_type (pour les filtres par type)')
  console.log('')
  console.log('3. 🔧 Optimisations des requêtes:')
  console.log('   - Utiliser Query.limit() pour éviter les gros datasets')
  console.log('   - Préférer les requêtes composées aux requêtes multiples')
  console.log('   - Utiliser Query.select() pour ne récupérer que les champs nécessaires')
  console.log('')
  console.log('4. 📊 Monitoring:')
  console.log('   - Surveiller les temps de réponse dans les logs')
  console.log('   - Utiliser les métriques React Query (staleTime, cacheTime)')
  console.log('   - Tester régulièrement les performances')
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🚀 Test de performance des requêtes Appwrite\n')
  console.log(`📊 Base: ${DATABASE_ID}`)
  console.log(`🏷️ Thèmes: ${THEMES_COLLECTION_ID}`)
  console.log(`🃏 Cartes: ${CARDS_COLLECTION_ID}\n`)
  
  try {
    // 1. Vérifier les index
    await checkIndexUsage()
    
    // 2. Tester les performances
    await testQueryPerformance()
    
    // 3. Afficher les recommandations
    printOptimizationRecommendations()
    
    console.log('\n✨ Test terminé')
    
  } catch (error) {
    console.error('\n❌ Erreur fatale:', error.message)
    process.exit(1)
  }
}

// Exécution
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then(() => {
      console.log('\n🎉 Script terminé avec succès')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Erreur:', error)
      process.exit(1)
    })
}
