#!/usr/bin/env node

/**
 * Script pour ajouter les nouveaux champs audio à la collection cards
 * - audioFileId (string, nullable)
 * - audioMime (string, nullable)
 */

import { Client, Databases, Query } from 'appwrite';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('ankilang');

const databases = new Databases(client);

async function addAudioFields() {
  try {
    console.log('🔧 Ajout des champs audio à la collection cards...');
    
    // Note: Les champs doivent être ajoutés manuellement dans l'interface Appwrite
    // car l'API ne permet pas de modifier le schéma d'une collection existante
    
    console.log('📋 Instructions pour ajouter les champs dans Appwrite Console:');
    console.log('');
    console.log('1. Allez dans Appwrite Console > Database > ankilang-main > Collections > cards');
    console.log('2. Cliquez sur "Add Attribute"');
    console.log('3. Ajoutez les attributs suivants:');
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
    console.log('✅ Une fois les champs ajoutés, les nouvelles cartes pourront utiliser ces champs');
    console.log('📝 Les cartes existantes auront ces champs à null par défaut');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des champs:', error);
    process.exit(1);
  }
}

// Exécuter le script
addAudioFields();
