#!/usr/bin/env node
import { Client, Databases, Storage } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('ankilang')
  .setKey('standard_0ba5c26e05d08e71e9975e37e56450731fb1e7478e3e8d4e51d744baf33089e568977cc84f850b37c24fbba751f6871bb8e0445d0802872f52299fea64be5fcfb13b8e1806aaf3abbd2e0ee76e39ed83e9818eb870de2529691f0d1afa044537e447a66ca24915492d5270fcd3ca09ad3962426047a54f580c68125cffcb26b1');

const databases = new Databases(client);
const storage = new Storage(client);
const DATABASE_ID = 'ankilang-main';

console.log('🔍 Vérification de la configuration Appwrite...\n');

async function verifySetup() {
  let allGood = true;

  // 1. Vérifier les collections
  console.log('📋 Collections:');
  try {
    const collections = await databases.listCollections(DATABASE_ID);
    const themesColl = collections.collections.find(c => c.$id === 'themes');
    const cardsColl = collections.collections.find(c => c.$id === 'cards');
    
    if (themesColl) {
      console.log('  ✅ themes - OK');
    } else {
      console.log('  ❌ themes - MANQUANTE');
      allGood = false;
    }
    
    if (cardsColl) {
      console.log('  ✅ cards - OK');
      
      // Vérifier les attributs de cards
      const attrs = await databases.listAttributes(DATABASE_ID, 'cards');
      const requiredAttrs = ['imageUrl', 'audioUrl', 'tags'];
      const missingAttrs = requiredAttrs.filter(
        attr => !attrs.attributes.some(a => a.key === attr)
      );
      
      if (missingAttrs.length > 0) {
        console.log(`  ⚠️  Attributs manquants dans cards: ${missingAttrs.join(', ')}`);
        allGood = false;
      } else {
        console.log('  ✅ Tous les attributs média sont présents');
      }
    } else {
      console.log('  ❌ cards - MANQUANTE');
      allGood = false;
    }
  } catch (error) {
    console.error('  ❌ Erreur:', error.message);
    allGood = false;
  }
  
  // 2. Vérifier les permissions des collections
  console.log('\n🔒 Permissions des collections:');
  try {
    // Vérifier themes
    const themesAttrs = await databases.listAttributes(DATABASE_ID, 'themes');
    console.log('  ✅ themes - Attributs vérifiés');
    
    // Vérifier cards
    const cardsAttrs = await databases.listAttributes(DATABASE_ID, 'cards');
    console.log('  ✅ cards - Attributs vérifiés');
    
    // Vérifier les index pour les requêtes fréquentes
    console.log('\n📊 Index des collections:');
    try {
      const themesIndexes = await databases.listIndexes(DATABASE_ID, 'themes');
      const cardsIndexes = await databases.listIndexes(DATABASE_ID, 'cards');
      
      const hasUserIdIndex = (indexes) => indexes.indexes.some(idx => 
        idx.key === 'userId' || idx.attributes.includes('userId')
      );
      
      if (hasUserIdIndex(themesIndexes)) {
        console.log('  ✅ themes - Index userId présent');
      } else {
        console.log('  ⚠️  themes - Index userId recommandé pour les requêtes');
      }
      
      if (hasUserIdIndex(cardsIndexes)) {
        console.log('  ✅ cards - Index userId présent');
      } else {
        console.log('  ⚠️  cards - Index userId recommandé pour les requêtes');
      }
    } catch (indexError) {
      console.log('  ℹ️  Index non vérifiables (peut nécessiter des permissions admin)');
    }
  } catch (error) {
    console.error('  ❌ Erreur permissions:', error.message);
    allGood = false;
  }
  
  // 3. Vérifier le bucket
  console.log('\n💾 Bucket de stockage:');
  try {
    const bucket = await storage.getBucket('flashcard-images');
    console.log('  ✅ flashcard-images - OK');
    console.log(`     - Taille max: ${bucket.maximumFileSize / 1000000} MB`);
    console.log(`     - Extensions: ${bucket.allowedFileExtensions.join(', ')}`);
    console.log(`     - Sécurité fichiers: ${bucket.fileSecurity ? 'Activée' : 'Désactivée'}`);
    console.log(`     - Chiffrement: ${bucket.encryption ? 'Activé' : 'Désactivé'}`);
    
    // Vérifications de sécurité
    const securityIssues = [];
    
    if (!bucket.fileSecurity) {
      securityIssues.push('Sécurité fichiers désactivée');
    }
    
    if (bucket.maximumFileSize > 10000000) { // 10MB
      securityIssues.push('Taille max trop élevée (>10MB)');
    }
    
    const allowedExts = bucket.allowedFileExtensions;
    const expectedExts = ['webp', 'jpg', 'jpeg', 'png', 'gif', 'mp3', 'wav', 'ogg', 'm4a'];
    const unexpectedExts = allowedExts.filter(ext => !expectedExts.includes(ext));
    if (unexpectedExts.length > 0) {
      securityIssues.push(`Extensions inattendues: ${unexpectedExts.join(', ')}`);
    }
    
    if (securityIssues.length > 0) {
      console.log('  ⚠️  Problèmes de sécurité détectés:');
      securityIssues.forEach(issue => console.log(`     - ${issue}`));
      allGood = false;
    } else {
      console.log('  ✅ Configuration de sécurité OK');
    }
  } catch (error) {
    if (error.code === 404) {
      console.log('  ❌ flashcard-images - MANQUANT');
      console.log('     Exécutez: node scripts/create-flashcard-images-bucket.mjs');
      allGood = false;
    } else {
      console.error('  ❌ Erreur:', error.message);
      allGood = false;
    }
  }
  
  // Résultat final
  console.log('\n' + '='.repeat(50));
  if (allGood) {
    console.log('✅ Configuration complète ! Vous pouvez commencer les tests.');
  } else {
    console.log('⚠️  Configuration incomplète. Corrigez les problèmes ci-dessus.');
  }
  console.log('='.repeat(50) + '\n');
  
  return allGood;
}

verifySetup().then(success => {
  process.exit(success ? 0 : 1);
});

