#!/usr/bin/env node
import { Client, Databases, ID, Permission, Role } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('ankilang')
  .setKey('standard_0ba5c26e05d08e71e9975e37e56450731fb1e7478e3e8d4e51d744baf33089e568977cc84f850b37c24fbba751f6871bb8e0445d0802872f52299fea64be5fcfb13b8e1806aaf3abbd2e0ee76e39ed83e9818eb870de2529691f0d1afa044537e447a66ca24915492d5270fcd3ca09ad3962426047a54f580c68125cffcb26b1');

const databases = new Databases(client);

// Utiliser la base de données par défaut (gratuite)
const DATABASE_ID = 'default';

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
  },

  user_profiles: {
    id: 'user_profiles',
    name: 'User Profiles',
    attributes: [
      { key: 'userId', type: 'string', size: 50, required: true },
      { key: 'displayName', type: 'string', size: 100 },
      { key: 'username', type: 'string', size: 50 }
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
      true
    );
    
    console.log(`✅ Collection ${collectionConfig.name} créée`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    for (const attr of collectionConfig.attributes) {
      await createAttribute(DATABASE_ID, collectionConfig.id, attr);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`🎉 Collection ${collectionConfig.name} terminée\n`);
    
  } catch (error) {
    if (error.code === 409) {
      console.log(`ℹ️  Collection ${collectionConfig.name} existe déjà\n`);
    } else {
      console.error(`❌ Erreur collection ${collectionConfig.name}:`, error);
    }
  }
}

async function main() {
  try {
    console.log('🚀 Configuration des collections Ankilang (base par défaut)...\n');
    
    for (const [key, collection] of Object.entries(COLLECTIONS)) {
      await createCollection(collection);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('🎉 Collections Ankilang configurées !');
    console.log('\n📋 Collections créées :');
    Object.keys(COLLECTIONS).forEach(key => {
      console.log(`   ✅ ${COLLECTIONS[key].name} (${key})`);
    });
    
    console.log('\n🌐 Console : https://fra.cloud.appwrite.io/console/project-ankilang/databases/database-default');
    
  } catch (error) {
    console.error('❌ Erreur :', error);
  }
}

main();
