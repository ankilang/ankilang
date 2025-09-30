#!/usr/bin/env node
import { Client, Databases } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('ankilang')
  .setKey('standard_0ba5c26e05d08e71e9975e37e56450731fb1e7478e3e8d4e51d744baf33089e568977cc84f850b37c24fbba751f6871bb8e0445d0802872f52299fea64be5fcfb13b8e1806aaf3abbd2e0ee76e39ed83e9818eb870de2529691f0d1afa044537e447a66ca24915492d5270fcd3ca09ad3962426047a54f580c68125cffcb26b1');

const databases = new Databases(client);

async function checkCollections() {
  try {
    console.log('🔍 Vérification des bases de données...\n');
    
    // Lister les bases de données
    const databasesList = await databases.list();
    console.log('📊 Bases de données disponibles:');
    databasesList.databases.forEach(db => {
      console.log(`  - ${db.name} (ID: ${db.$id})`);
    });
    
    console.log('\n🗂️ Vérification des collections dans chaque base...\n');
    
    for (const database of databasesList.databases) {
      try {
        console.log(`📋 Collections dans "${database.name}" :`);
        const collections = await databases.listCollections(database.$id);
        
        if (collections.collections.length === 0) {
          console.log('  ❌ Aucune collection trouvée\n');
        } else {
          collections.collections.forEach(collection => {
            console.log(`  ✅ ${collection.name} (ID: ${collection.$id})`);
            console.log(`      - Documents: ${collection.documentsecurity ? 'Sécurisés' : 'Non sécurisés'}`);
            console.log(`      - Créé: ${new Date(collection.$createdAt).toLocaleString()}`);
          });
          console.log('');
        }
      } catch (error) {
        console.log(`  ❌ Erreur lors de la lecture des collections: ${error.message}\n`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    
    if (error.message.includes('Project not found')) {
      console.log('\n💡 Solution: Vérifier APPWRITE_PROJECT_ID');
    } else if (error.message.includes('Invalid API key')) {
      console.log('\n💡 Solution: Vérifier APPWRITE_API_KEY');
    }
  }
}

checkCollections();
