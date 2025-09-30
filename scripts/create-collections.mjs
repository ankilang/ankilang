#!/usr/bin/env node
import { Client, Databases, ID, Permission, Role } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('ankilang')
  .setKey('standard_0ba5c26e05d08e71e9975e37e56450731fb1e7478e3e8d4e51d744baf33089e568977cc84f850b37c24fbba751f6871bb8e0445d0802872f52299fea64be5fcfb13b8e1806aaf3abbd2e0ee76e39ed83e9818eb870de2529691f0d1afa044537e447a66ca24915492d5270fcd3ca09ad3962426047a54f580c68125cffcb26b1');

const databases = new Databases(client);
const DATABASE_ID = 'ankilang-main'; // Utiliser la vraie base

const COLLECTIONS = {
  themes: {
    id: 'themes',
    name: 'Themes',
    attributes: [
      { key: 'userId', type: 'string', size: 50, required: true },
      { key: 'name', type: 'string', size: 128, required: true },
      { key: 'targetLang', type: 'string', size: 10, required: true },
      { key: 'cardCount', type: 'integer', default: 0 },
      { key: 'shareStatus', type: 'string', size: 20, default: 'private' }
    ]
  },
  
  cards: {
    id: 'cards',
    name: 'Cards',
    attributes: [
      { key: 'userId', type: 'string', size: 50, required: true },
      { key: 'themeId', type: 'string', size: 50, required: true },
      { key: 'type', type: 'string', size: 10, required: true },
      { key: 'frontFR', type: 'string', size: 1000 },
      { key: 'backText', type: 'string', size: 1000 },
      { key: 'clozeTextTarget', type: 'string', size: 1000 },
      { key: 'extra', type: 'string', size: 1000 }
    ]
  }
};

async function createAttribute(databaseId, collectionId, attr) {
  try {
    if (attr.type === 'string') {
      await databases.createStringAttribute(
        databaseId,
        collectionId,
        attr.key,
        attr.size || 255,
        attr.required || false,
        attr.default,
        attr.array || false
      );
    } else if (attr.type === 'integer') {
      await databases.createIntegerAttribute(
        databaseId,
        collectionId,
        attr.key,
        attr.required || false,
        null,
        null,
        attr.default,
        attr.array || false
      );
    }
    
    console.log(`  ✅ Attribut ${attr.key} créé`);
  } catch (error) {
    if (error.code === 409) {
      console.log(`  ℹ️  Attribut ${attr.key} existe déjà`);
    } else {
      console.error(`  ❌ Erreur attribut ${attr.key}:`, error.message);
    }
  }
}

async function createCollection(collectionConfig) {
  console.log(`📋 Création de la collection ${collectionConfig.name}...`);
  
  try {
    await databases.createCollection(
      DATABASE_ID,
      collectionConfig.id,
      collectionConfig.name,
      [Permission.read(Role.users())],
      [Permission.create(Role.users()), Permission.update(Role.users()), Permission.delete(Role.users())],
      true // documentSecurity
    );
    
    console.log(`✅ Collection ${collectionConfig.name} créée`);
    
    // Attendre avant de créer les attributs
    console.log(`⏳ Création des attributs...`);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    for (const attr of collectionConfig.attributes) {
      await createAttribute(DATABASE_ID, collectionConfig.id, attr);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`🎉 Collection ${collectionConfig.name} terminée\n`);
    
  } catch (error) {
    if (error.code === 409) {
      console.log(`ℹ️  Collection ${collectionConfig.name} existe déjà\n`);
    } else {
      console.error(`❌ Erreur collection ${collectionConfig.name}:`, error.message);
      console.error(`   Code: ${error.code}, Type: ${error.type}\n`);
    }
  }
}

async function main() {
  console.log('🚀 Création des collections essentielles...\n');
  
  for (const [key, collection] of Object.entries(COLLECTIONS)) {
    await createCollection(collection);
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log('🎉 Collections créées avec succès !');
  console.log('\n🔍 Vérification...');
  
  // Revérifier les collections
  try {
    const collections = await databases.listCollections(DATABASE_ID);
    console.log('\n📋 Collections disponibles :');
    collections.collections.forEach(collection => {
      console.log(`   ✅ ${collection.name} (${collection.$id})`);
    });
  } catch (error) {
    console.error('❌ Erreur vérification:', error.message);
  }
}

main();
