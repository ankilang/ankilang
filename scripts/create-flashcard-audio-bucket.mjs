#!/usr/bin/env node

import { Client, Storage, Permission, Role } from 'appwrite';

const client = new Client();
client
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('ankilang')
  .setKey('standard_0ba5c26e05d08e71e9975e37e56450731fb1e7478e3e8d4e51d744baf33089e568977cc84f850b37c24fbba751f6871bb8e0445d0802872f52299fea64be5fcfb13b8e1806aaf3abbd2e0ee76e39ed83e9818eb870de2529691f0d1afa044537e447a66ca24915492d5270fcd3ca09ad3962426047a54f580c68125cffcb26b1');

const storage = new Storage(client);

async function createAudioBucket() {
  try {
    console.log('🎵 Création du bucket flashcard-audio...');
    
    await storage.createBucket(
      'flashcard-audio',
      'Flashcard Audio',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
      true, // enabled
      true, // file security
      10000000, // max file size: 10MB
      ['wav', 'mp3', 'ogg', 'm4a'], // allowed extensions
      'gzip', // compression
      true, // encryption
      true // antivirus
    );
    
    console.log('✅ Bucket flashcard-audio créé avec succès !');
    console.log('📋 Configuration:');
    console.log('  - Taille max: 10MB');
    console.log('  - Extensions: wav, mp3, ogg, m4a');
    console.log('  - Sécurité: activée');
    console.log('  - Compression: gzip');
    console.log('  - Chiffrement: activé');
    console.log('  - Antivirus: activé');
    
  } catch (error) {
    if (error.code === 409) {
      console.log('ℹ️  Le bucket flashcard-audio existe déjà');
    } else {
      console.error('❌ Erreur lors de la création du bucket:', error.message);
      throw error;
    }
  }
}

createAudioBucket();
