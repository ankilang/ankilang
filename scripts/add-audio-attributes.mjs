#!/usr/bin/env node

/**
 * Script pour ajouter les attributs audio à la collection cards
 * Utilise le SDK Appwrite pour modifier la collection
 */

import { Client, Databases } from 'appwrite';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('ankilang');

const databases = new Databases(client);

async function addAudioAttributes() {
  try {
    console.log('🔧 Ajout des attributs audio à la collection cards...');
    
    // Note: L'API Appwrite ne permet pas de modifier les attributs d'une collection existante
    // via le SDK. Il faut utiliser l'interface Console ou l'API REST directement.
    
    console.log('❌ Impossible d\'ajouter les attributs via le SDK Appwrite');
    console.log('');
    console.log('📋 Instructions manuelles :');
    console.log('');
    console.log('1. Allez dans Appwrite Console : https://cloud.appwrite.io/console');
    console.log('2. Database → ankilang-main → Collections → cards');
    console.log('3. Cliquez sur "Add Attribute" (2 fois)');
    console.log('');
    console.log('   Attribut 1:');
    console.log('   - Key: audioFileId');
    console.log('   - Type: String');
    console.log('   - Size: 255');
    console.log('   - Required: No');
    console.log('   - Array: No');
    console.log('   - Default: null');
    console.log('');
    console.log('   Attribut 2:');
    console.log('   - Key: audioMime');
    console.log('   - Type: String');
    console.log('   - Size: 100');
    console.log('   - Required: No');
    console.log('   - Array: No');
    console.log('   - Default: null');
    console.log('');
    console.log('4. Sauvegardez les modifications');
    console.log('');
    console.log('✅ Une fois fait, vous pourrez exécuter :');
    console.log('   node scripts/migrate-audio-data.mjs');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Exécuter le script
addAudioAttributes();
