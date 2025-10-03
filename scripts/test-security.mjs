#!/usr/bin/env node

/**
 * Script de test de sécurité pour valider la configuration
 * Teste l'authentification JWT sur toutes les fonctions Netlify
 */

import fetch from 'node-fetch';

const FUNCTIONS = [
  {
    name: 'Revirada (Occitan)',
    url: 'https://ankilangrevirada.netlify.app/.netlify/functions/revirada',
    testData: { text: 'bonjour', sourceLang: 'fra', targetLang: 'oci' }
  },
  {
    name: 'Votz (TTS Occitan)',
    url: 'https://ankilangvotz.netlify.app/.netlify/functions/votz',
    testData: { text: 'bonjour', language: 'languedoc', mode: 'file' }
  },
  {
    name: 'TTS multilingue',
    url: 'https://ankilangtts.netlify.app/.netlify/functions/tts',
    testData: { lang: 'fr', text: 'bonjour' }
  },
  {
    name: 'DeepL (Traduction)',
    url: 'https://ankilangdeepl.netlify.app/.netlify/functions/translate',
    testData: { text: 'hello', targetLang: 'FR', sourceLang: 'EN' }
  },
  {
    name: 'Pexels (Images)',
    url: 'https://ankilangpexels.netlify.app/.netlify/functions/pexels',
    testData: { query: 'nature', page: 1 }
  }
];

const MEDIA_PROXY_URL = 'https://ankilang.netlify.app/.netlify/functions/media-proxy';

async function testFunction(name, url, testData) {
  console.log(`\n🧪 Test de ${name}...`);
  
  try {
    // Test 1: Sans JWT (doit échouer avec 401)
    console.log('  📝 Test sans authentification...');
    const responseNoAuth = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    if (responseNoAuth.status === 401) {
      console.log('  ✅ 401 Unauthorized (attendu) - Fonction sécurisée');
    } else {
      console.log(`  ❌ ${responseNoAuth.status} (attendu: 401) - Fonction non sécurisée !`);
      return false;
    }
    
    // Test 2: Avec JWT invalide (doit échouer avec 401)
    console.log('  📝 Test avec JWT invalide...');
    const responseInvalidAuth = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-jwt-token'
      },
      body: JSON.stringify(testData)
    });
    
    if (responseInvalidAuth.status === 401) {
      console.log('  ✅ 401 Unauthorized (attendu) - JWT invalide rejeté');
    } else {
      console.log(`  ❌ ${responseInvalidAuth.status} (attendu: 401) - JWT invalide accepté !`);
      return false;
    }
    
    console.log(`  ✅ ${name} est correctement sécurisé`);
    return true;
    
  } catch (error) {
    console.log(`  ❌ Erreur lors du test: ${error.message}`);
    return false;
  }
}

async function testMediaProxy() {
  console.log('\n🧪 Test du Media Proxy...');
  
  try {
    // Test avec origine autorisée
    console.log('  📝 Test avec origine autorisée...');
    const response = await fetch(`${MEDIA_PROXY_URL}?url=https://votz.eu/test.mp3`, {
      headers: {
        'Origin': 'https://ankilang.pages.dev'
      }
    });
    
    if (response.status === 200 || response.status === 400) { // 400 si URL invalide, mais CORS OK
      console.log('  ✅ CORS autorisé pour Cloudflare Pages');
    } else {
      console.log(`  ❌ ${response.status} - CORS non configuré`);
      return false;
    }
    
    // Test avec origine non autorisée
    console.log('  📝 Test avec origine non autorisée...');
    const responseUnauthorized = await fetch(`${MEDIA_PROXY_URL}?url=https://votz.eu/test.mp3`, {
      headers: {
        'Origin': 'https://malicious-site.com'
      }
    });
    
    if (responseUnauthorized.status === 403) {
      console.log('  ✅ 403 Forbidden (attendu) - Origine non autorisée bloquée');
    } else {
      console.log(`  ❌ ${responseUnauthorized.status} (attendu: 403) - CORS non sécurisé`);
      return false;
    }
    
    console.log('  ✅ Media Proxy est correctement sécurisé');
    return true;
    
  } catch (error) {
    console.log(`  ❌ Erreur lors du test Media Proxy: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔒 Test de sécurité des fonctions Netlify Ankilang');
  console.log('=' .repeat(60));
  
  let allPassed = true;
  
  // Tester chaque fonction
  for (const func of FUNCTIONS) {
    const passed = await testFunction(func.name, func.url, func.testData);
    if (!passed) allPassed = false;
  }
  
  // Tester le media proxy
  const mediaProxyPassed = await testMediaProxy();
  if (!mediaProxyPassed) allPassed = false;
  
  console.log('\n' + '=' .repeat(60));
  
  if (allPassed) {
    console.log('🎉 Tous les tests de sécurité sont passés !');
    console.log('✅ Ankilang est prêt pour le déploiement sur Cloudflare Pages');
  } else {
    console.log('❌ Certains tests ont échoué');
    console.log('⚠️  Vérifiez la configuration des fonctions Netlify');
  }
  
  console.log('\n📋 Prochaines étapes :');
  console.log('1. Déployer sur Cloudflare Pages');
  console.log('2. Configurer les variables d\'environnement');
  console.log('3. Tester l\'intégration complète');
  console.log('4. Configurer le monitoring');
}

main().catch(console.error);
