#!/usr/bin/env node
import { Client, Databases } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('ankilang')
  .setKey('standard_0ba5c26e05d08e71e9975e37e56450731fb1e7478e3e8d4e51d744baf33089e568977cc84f850b37c24fbba751f6871bb8e0445d0802872f52299fea64be5fcfb13b8e1806aaf3abbd2e0ee76e39ed83e9818eb870de2529691f0d1afa044537e447a66ca24915492d5270fcd3ca09ad3962426047a54f580c68125cffcb26b1');

const databases = new Databases(client);
const DATABASE_ID = 'ankilang-main';
const COLLECTION_ID = 'cards';

async function addMediaAttributes() {
  console.log('🔧 Ajout des attributs média à la collection cards...\n');
  
  try {
    // Ajouter imageUrl
    console.log('📸 Ajout de imageUrl...');
    try {
      await databases.createStringAttribute(
        DATABASE_ID,
        COLLECTION_ID,
        'imageUrl',
        2048, // URL longue pour les images
        false, // non requis
        null,
        false
      );
      console.log('✅ imageUrl créé avec succès');
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ️  imageUrl existe déjà');
      } else {
        throw error;
      }
    }
    
    // Attendre pour éviter les conflits
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Ajouter audioUrl
    console.log('\n🔊 Ajout de audioUrl...');
    try {
      await databases.createStringAttribute(
        DATABASE_ID,
        COLLECTION_ID,
        'audioUrl',
        2048, // URL longue pour l'audio
        false, // non requis
        null,
        false
      );
      console.log('✅ audioUrl créé avec succès');
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ️  audioUrl existe déjà');
      } else {
        throw error;
      }
    }
    
    // Attendre pour éviter les conflits
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Ajouter tags (array de strings)
    console.log('\n🏷️  Ajout de tags...');
    try {
      await databases.createStringAttribute(
        DATABASE_ID,
        COLLECTION_ID,
        'tags',
        50, // Taille max par tag
        false, // non requis
        null,
        true // array
      );
      console.log('✅ tags créé avec succès');
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ️  tags existe déjà');
      } else {
        throw error;
      }
    }
    
    console.log('\n🎉 Tous les attributs média ont été ajoutés avec succès !');
    console.log('\n✅ Vous pouvez maintenant créer des cartes avec images et audio.');
    
  } catch (error) {
    console.error('\n❌ Erreur lors de l\'ajout des attributs:', error.message);
    console.error('   Code:', error.code);
    console.error('   Type:', error.type);
    process.exit(1);
  }
}

addMediaAttributes();

