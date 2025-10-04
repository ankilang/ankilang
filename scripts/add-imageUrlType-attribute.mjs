#!/usr/bin/env node

/**
 * Script pour ajouter l'attribut imageUrlType à la collection cards d'Appwrite
 */

import { Client, Databases } from 'node-appwrite'

// Configuration Appwrite
const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('ankilang')
  .setKey('standard_0ba5c26e05d08e71e9975e37e56450731fb1e7478e3e8d4e51d744baf33089e568977cc84f850b37c24fbba751f6871bb8e0445d0802872f52299fea64be5fcfb13b8e1806aaf3abbd2e0ee76e39ed83e9818eb870de2529691f0d1afa044537e447a66ca24915492d5270fcd3ca09ad3962426047a54f580c68125cffcb26b1')

const databases = new Databases(client)

async function addImageUrlTypeAttribute() {
  try {
    console.log('🔧 Ajout de l\'attribut imageUrlType à la collection cards...')
    
    // Ajouter l'attribut imageUrlType
    await databases.createStringAttribute(
      'ankilang-main', // databaseId
      'cards',         // collectionId
      'imageUrlType',  // key
      16,              // size (suffisant pour "appwrite"/"external")
      false,           // required
      'external'       // default
    )
    
    console.log('✅ Attribut imageUrlType ajouté avec succès !')
    console.log('   - Type: string')
    console.log('   - Taille: 16 caractères')
    console.log('   - Requis: non')
    console.log('   - Valeur par défaut: "external"')
    
  } catch (error) {
    if (error.code === 409) {
      console.log('⚠️  L\'attribut imageUrlType existe déjà dans la collection cards')
    } else {
      console.error('❌ Erreur lors de l\'ajout de l\'attribut:', error.message)
      console.error('   Code:', error.code)
      console.error('   Type:', error.type)
      throw error
    }
  }
}

// Exécuter le script
addImageUrlTypeAttribute()
  .then(() => {
    console.log('🎉 Script terminé avec succès !')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Échec du script:', error.message)
    process.exit(1)
  })