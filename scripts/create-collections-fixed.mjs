#!/usr/bin/env node
import { Client, Databases, ID, Permission, Role } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('ankilang')
  .setKey('standard_0ba5c26e05d08e71e9975e37e56450731fb1e7478e3e8d4e51d744baf33089e568977cc84f850b37c24fbba751f6871bb8e0445d0802872f52299fea64be5fcfb13b8e1806aaf3abbd2e0ee76e39ed83e9818eb870de2529691f0d1afa044537e447a66ca24915492d5270fcd3ca09ad3962426047a54f580c68125cffcb26b1');

const databases = new Databases(client);
const DATABASE_ID = 'ankilang-main';

async function createCollection(id, name) {
  console.log(`📋 Création de la collection ${name}...`);
  
  try {
    const collection = await databases.createCollection(
      DATABASE_ID,
      id,
      name
    );
    
    console.log(`✅ Collection ${name} créée: ${collection.$id}`);
    return collection;
    
  } catch (error) {
    if (error.code === 409) {
      console.log(`ℹ️  Collection ${name} existe déjà`);
    } else {
      console.error(`❌ Erreur collection ${name}:`, error.message);
      throw error;
    }
  }
}

async function createStringAttribute(collectionId, key, size, required = false, defaultValue = null) {
  try {
    await databases.createStringAttribute(
      DATABASE_ID,
      collectionId,
      key,
      size,
      required,
      defaultValue
    );
    console.log(`  ✅ Attribut string ${key} créé`);
  } catch (error) {
    if (error.code === 409) {
      console.log(`  ℹ️  Attribut ${key} existe déjà`);
    } else {
      console.error(`  ❌ Erreur attribut ${key}:`, error.message);
    }
  }
}

async function createIntegerAttribute(collectionId, key, required = false, defaultValue = null) {
  try {
    await databases.createIntegerAttribute(
      DATABASE_ID,
      collectionId,
      key,
      required,
      null, // min
      null, // max  
      defaultValue
    );
    console.log(`  ✅ Attribut integer ${key} créé`);
  } catch (error) {
    if (error.code === 409) {
      console.log(`  ℹ️  Attribut ${key} existe déjà`);
    } else {
      console.error(`  ❌ Erreur attribut ${key}:`, error.message);
    }
  }
}

async function main() {
  console.log('🚀 Création des collections essentielles...\n');
  
  try {
    // 1. COLLECTION THEMES
    await createCollection('themes', 'Themes');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('⏳ Création des attributs themes...');
    await createStringAttribute('themes', 'userId', 50, true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await createStringAttribute('themes', 'name', 128, true);  
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await createStringAttribute('themes', 'targetLang', 10, true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await createIntegerAttribute('themes', 'cardCount', false, 0);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await createStringAttribute('themes', 'shareStatus', 20, false, 'private');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('🎉 Collection themes terminée\n');
    
    // 2. COLLECTION CARDS
    await createCollection('cards', 'Cards');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('⏳ Création des attributs cards...');
    await createStringAttribute('cards', 'userId', 50, true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await createStringAttribute('cards', 'themeId', 50, true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await createStringAttribute('cards', 'type', 10, true);  
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await createStringAttribute('cards', 'frontFR', 1000, false);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await createStringAttribute('cards', 'backText', 1000, false);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await createStringAttribute('cards', 'clozeTextTarget', 1000, false);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await createStringAttribute('cards', 'extra', 1000, false);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('🎉 Collection cards terminée\n');
    
    // 3. VÉRIFICATION FINALE
    console.log('🔍 Vérification finale...');
    const collections = await databases.listCollections(DATABASE_ID);
    console.log('\n📋 Collections créées :');
    collections.collections.forEach(collection => {
      console.log(`   ✅ ${collection.name} (${collection.$id})`);
    });
    
    console.log('\n🎉 TOUTES LES COLLECTIONS SONT PRÊTES !');
    console.log('👉 Tu peux maintenant tester la création de thèmes');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

main();
