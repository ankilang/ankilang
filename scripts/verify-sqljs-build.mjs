#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, statSync, readFileSync } from 'fs';
import { join } from 'path';

console.log('🔍 Vérification du build SQL.js...\n');

// 1. Build
console.log('📦 Building...');
try {
  execSync('pnpm -C apps/web build', { stdio: 'inherit' });
  console.log('✅ Build réussi\n');
} catch (error) {
  console.error('❌ Erreur lors du build:', error.message);
  process.exit(1);
}

// 2. Vérifier les fichiers
console.log('🔍 Vérification des fichiers SQL.js...');
const distPath = 'apps/web/dist/sqljs';
const files = [
  { name: 'sql-wasm.js', expectedSize: 48000 }, // ~48KB
  { name: 'sql-wasm.wasm', expectedSize: 650000 } // ~650KB
];

let allPresent = true;

files.forEach(file => {
  const path = join(distPath, file.name);
  if (existsSync(path)) {
    const stats = statSync(path);
    const sizeKB = Math.round(stats.size / 1024);
    const expectedSizeKB = Math.round(file.expectedSize / 1024);
    
    if (stats.size >= file.expectedSize * 0.8) { // Tolérance de 20%
      console.log(`✅ ${file.name} présent (${sizeKB}KB)`);
    } else {
      console.log(`⚠️  ${file.name} présent mais taille suspecte (${sizeKB}KB, attendu ~${expectedSizeKB}KB)`);
    }
  } else {
    console.log(`❌ ${file.name} MANQUANT`);
    allPresent = false;
  }
});

// 3. Vérifier le Service Worker
console.log('\n🔍 Vérification du Service Worker...');
const swPath = 'apps/web/dist/sw.js';
if (existsSync(swPath)) {
  const swContent = readFileSync(swPath, 'utf8');
  if (swContent.includes('sqljs')) {
    console.log('✅ Service Worker contient des références à sqljs');
  } else {
    console.log('⚠️  Service Worker ne contient pas de références à sqljs');
  }
} else {
  console.log('❌ Service Worker manquant');
}

// 4. Résumé
console.log('\n📊 Résumé:');
if (allPresent) {
  console.log('✅ Tous les fichiers SQL.js sont présents dans le build');
  console.log('🎯 Le problème devrait être résolu après déploiement');
  console.log('\n📋 Prochaines étapes:');
  console.log('1. Déployer le nouveau build');
  console.log('2. Tester les URLs en production:');
  console.log('   - https://ankilang.appwrite.network/sqljs/sql-wasm.js');
  console.log('   - https://ankilang.appwrite.network/sqljs/sql-wasm.wasm');
  console.log('3. Réinitialiser le Service Worker dans le navigateur');
} else {
  console.log('❌ Des fichiers SQL.js sont manquants');
  console.log('🔧 Vérifiez que les fichiers sont dans apps/web/public/sqljs/');
}

console.log('\n🎯 Vérification terminée');
