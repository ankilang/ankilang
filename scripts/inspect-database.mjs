#!/usr/bin/env node

import sdk from 'node-appwrite'

const client = new sdk.Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('ankilang')
  .setKey('standard_0ba5c26e05d08e71e9975e37e56450731fb1e7478e3e8d4e51d744baf33089e568977cc84f850b37c24fbba751f6871bb8e0445d0802872f52299fea64be5fcfb13b8e1806aaf3abbd2e0ee76e39ed83e9818eb870de2529691f0d1afa044537e447a66ca24915492d5270fcd3ca09ad3962426047a54f580c68125cffcb26b1')

const db = new sdk.Databases(client)
const DB_ID = process.env.DB_ID || 'ankilang-main'
const CARDS_COL = process.env.CARDS_COL || 'cards'
const THEMES_COL = process.env.THEMES_COL || 'themes'

async function inspectDatabase() {
  console.log('🔍 Inspection de la base de données Appwrite')
  console.log('==========================================')
  
  try {
    // 1. Informations sur la base de données
    console.log('\n📊 Base de données:', DB_ID)
    
    // 2. Collections disponibles
    console.log('\n📚 Collections disponibles:')
    const collections = await db.listCollections(DB_ID)
    for (const col of collections.collections) {
      console.log(`  • ${col.name} (${col.$id})`)
    }
    
    // 3. Structure de la collection cards
    console.log('\n🃏 Structure de la collection CARDS:')
    const cardsAttributes = await db.listAttributes(DB_ID, CARDS_COL)
    console.log('  Attributs:')
    for (const attr of cardsAttributes.attributes) {
      console.log(`    • ${attr.key}: ${attr.type} (requis: ${attr.required})`)
    }
    
    // 4. Index de la collection cards
    console.log('\n📇 Index de la collection CARDS:')
    const cardsIndexes = await db.listIndexes(DB_ID, CARDS_COL)
    console.log('  Index:')
    for (const idx of cardsIndexes.indexes) {
      console.log(`    • ${idx.key}: ${idx.type}`)
    }
    
    // 5. Exemple de cartes (3 premières)
    console.log('\n📄 Exemples de cartes (3 premières):')
    const cards = await db.listDocuments(DB_ID, CARDS_COL, [], 3)
    for (let i = 0; i < cards.documents.length; i++) {
      const card = cards.documents[i]
      console.log(`\n  Carte ${i + 1}:`)
      console.log(`    ID: ${card.$id}`)
      console.log(`    Type: ${card.type}`)
      console.log(`    UserId: ${card.userId}`)
      console.log(`    ThemeId: ${card.themeId}`)
      console.log(`    TargetLang: ${card.targetLang || 'NON DÉFINI'}`)
      console.log(`    FrontFR: ${card.frontFR || 'VIDE'}`)
      console.log(`    BackText: ${card.backText || 'VIDE'}`)
      console.log(`    Front: ${card.front || 'VIDE'}`)
      console.log(`    Back: ${card.back || 'VIDE'}`)
      console.log(`    ClozeTextTarget: ${card.clozeTextTarget || 'VIDE'}`)
      console.log(`    Box: ${card.box || 'NON DÉFINI'}`)
      console.log(`    Ease: ${card.ease || 'NON DÉFINI'}`)
      console.log(`    Due: ${card.due || 'NON DÉFINI'}`)
      console.log(`    Lapses: ${card.lapses || 'NON DÉFINI'}`)
      console.log(`    Streak: ${card.streak || 'NON DÉFINI'}`)
      console.log(`    Leech: ${card.leech || 'NON DÉFINI'}`)
    }
    
    // 6. Structure de la collection themes
    console.log('\n🎨 Structure de la collection THEMES:')
    const themesAttributes = await db.listAttributes(DB_ID, THEMES_COL)
    console.log('  Attributs:')
    for (const attr of themesAttributes.attributes) {
      console.log(`    • ${attr.key}: ${attr.type} (requis: ${attr.required})`)
    }
    
    // 7. Exemple de thèmes (2 premiers)
    console.log('\n📚 Exemples de thèmes (2 premiers):')
    const themes = await db.listDocuments(DB_ID, THEMES_COL, [], 2)
    for (let i = 0; i < themes.documents.length; i++) {
      const theme = themes.documents[i]
      console.log(`\n  Thème ${i + 1}:`)
      console.log(`    ID: ${theme.$id}`)
      console.log(`    Nom: ${theme.name}`)
      console.log(`    TargetLang: ${theme.targetLang || 'NON DÉFINI'}`)
      console.log(`    UserId: ${theme.userId}`)
    }
    
    console.log('\n✅ Inspection terminée !')
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'inspection:', error.message)
    if (error.code) {
      console.error('Code d\'erreur:', error.code)
    }
  }
}

inspectDatabase()
