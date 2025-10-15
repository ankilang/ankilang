#!/usr/bin/env node

/**
 * Script de migration pour passer de 4 catégories à 2 catégories
 * 
 * Ce script :
 * 1. Met à jour tous les thèmes existants pour ajouter le champ 'category'
 * 2. Les thèmes existants deviennent automatiquement 'language' (rétrocompatibilité)
 * 3. Rend le champ 'targetLang' optionnel dans la collection
 * 
 * Usage: node scripts/migrate-themes-to-2-categories.mjs
 */

import { Client, Databases, Query } from 'node-appwrite'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config({ path: '.env' })

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '')

const databases = new Databases(client)

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'ankilang'
const THEMES_COLLECTION_ID = process.env.APPWRITE_THEMES_COLLECTION_ID || 'themes'

async function migrateThemes() {
  try {
    console.log('🚀 Début de la migration des thèmes vers 2 catégories...')
    
    // 1. Récupérer tous les thèmes existants
    console.log('📋 Récupération des thèmes existants...')
    const themesResponse = await databases.listDocuments(
      DATABASE_ID,
      THEMES_COLLECTION_ID,
      [Query.limit(100)] // Limite pour éviter les timeouts
    )
    
    const themes = themesResponse.documents
    console.log(`📊 ${themes.length} thèmes trouvés`)
    
    if (themes.length === 0) {
      console.log('✅ Aucun thème à migrer')
      return
    }
    
    // 2. Analyser les thèmes existants
    const themesWithoutCategory = themes.filter(theme => !theme.category)
    const themesWithOldCategory = themes.filter(theme => 
      theme.category && !['language', 'other'].includes(theme.category)
    )
    
    console.log(`📈 Analyse des thèmes :`)
    console.log(`   - Sans catégorie : ${themesWithoutCategory.length}`)
    console.log(`   - Avec ancienne catégorie : ${themesWithOldCategory.length}`)
    
    // 3. Migrer les thèmes sans catégorie
    console.log('🔄 Migration des thèmes sans catégorie...')
    for (const theme of themesWithoutCategory) {
      try {
        await databases.updateDocument(
          DATABASE_ID,
          THEMES_COLLECTION_ID,
          theme.$id,
          {
            category: 'language', // Tous les thèmes existants deviennent 'language'
            // targetLang reste inchangé (déjà présent)
          }
        )
        console.log(`   ✅ Thème "${theme.name}" migré vers 'language'`)
      } catch (error) {
        console.error(`   ❌ Erreur pour le thème "${theme.name}":`, error.message)
      }
    }
    
    // 4. Migrer les thèmes avec ancienne catégorie
    console.log('🔄 Migration des thèmes avec ancienne catégorie...')
    for (const theme of themesWithOldCategory) {
      try {
        // Mapper les anciennes catégories vers 'other'
        const newCategory = ['academic', 'professional', 'personal'].includes(theme.category) 
          ? 'other' 
          : 'language'
        
        await databases.updateDocument(
          DATABASE_ID,
          THEMES_COLLECTION_ID,
          theme.$id,
          {
            category: newCategory,
            // Conserver subject si présent
            ...(theme.subject && { subject: theme.subject })
          }
        )
        console.log(`   ✅ Thème "${theme.name}" migré de '${theme.category}' vers '${newCategory}'`)
      } catch (error) {
        console.error(`   ❌ Erreur pour le thème "${theme.name}":`, error.message)
      }
    }
    
    console.log('✅ Migration terminée avec succès !')
    console.log('')
    console.log('📋 Résumé de la migration :')
    console.log(`   - Thèmes migrés vers 'language' : ${themesWithoutCategory.length}`)
    console.log(`   - Thèmes migrés vers 'other' : ${themesWithOldCategory.length}`)
    console.log('')
    console.log('🎯 Prochaines étapes :')
    console.log('   1. Vérifier que la collection "themes" a bien les attributs :')
    console.log('      - category (string, required, default: "language")')
    console.log('      - targetLang (string, optional)')
    console.log('      - subject (string, optional)')
    console.log('   2. Tester la création de nouveaux thèmes')
    console.log('   3. Vérifier que les thèmes existants s\'affichent correctement')
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration :', error)
    process.exit(1)
  }
}

// Fonction pour vérifier la structure de la collection
async function checkCollectionStructure() {
  try {
    console.log('🔍 Vérification de la structure de la collection...')
    
    const collection = await databases.getCollection(DATABASE_ID, THEMES_COLLECTION_ID)
    const attributes = collection.attributes
    
    console.log('📋 Attributs actuels de la collection "themes" :')
    attributes.forEach(attr => {
      console.log(`   - ${attr.key}: ${attr.type} (${attr.required ? 'required' : 'optional'})`)
    })
    
    // Vérifier les attributs requis
    const hasCategory = attributes.some(attr => attr.key === 'category')
    const hasTargetLang = attributes.some(attr => attr.key === 'targetLang')
    const hasSubject = attributes.some(attr => attr.key === 'subject')
    
    console.log('')
    console.log('✅ Vérifications :')
    console.log(`   - Attribut 'category' : ${hasCategory ? '✅ Présent' : '❌ Manquant'}`)
    console.log(`   - Attribut 'targetLang' : ${hasTargetLang ? '✅ Présent' : '❌ Manquant'}`)
    console.log(`   - Attribut 'subject' : ${hasSubject ? '✅ Présent' : '❌ Manquant'}`)
    
    if (!hasCategory) {
      console.log('')
      console.log('⚠️  ATTENTION : L\'attribut "category" est manquant !')
      console.log('   Vous devez l\'ajouter manuellement dans Appwrite Console :')
      console.log('   1. Aller dans Database > themes > Attributes')
      console.log('   2. Ajouter un attribut "category" (String, Required, Default: "language")')
      console.log('   3. Relancer ce script')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification :', error)
  }
}

// Exécution du script
async function main() {
  console.log('🎯 Script de migration vers 2 catégories de thèmes')
  console.log('================================================')
  console.log('')
  
  // Vérifier la structure d'abord
  await checkCollectionStructure()
  console.log('')
  
  // Demander confirmation
  const readline = await import('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  const answer = await new Promise((resolve) => {
    rl.question('Voulez-vous continuer avec la migration ? (y/N) ', resolve)
  })
  
  rl.close()
  
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    await migrateThemes()
  } else {
    console.log('❌ Migration annulée')
  }
}

main().catch(console.error)
