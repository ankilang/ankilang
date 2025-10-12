/**
 * Script de test manuel pour la console du navigateur
 * Copier-coller dans la console après déploiement en production
 */

// Test 1: Service Worker Denylist
async function testSWDenylist() {
  console.log('🧪 Test Service Worker Denylist...');
  
  const urls = [
    '/assets/sql-wasm.wasm',
    '/manifest.webmanifest',
    '/manifest.webmanifest?v=4',
    '/api/test',
    '/sqljs/test.js'
  ];
  
  for (const url of urls) {
    try {
      const response = await fetch(url, { method: 'HEAD', cache: 'no-cache' });
      const source = response.headers.get('x-sw-cache') || 'network';
      const intercepted = source !== 'network';
      console.log(`${intercepted ? '❌' : '✅'} ${url}: ${source}`);
    } catch (error) {
      console.log(`⚠️ ${url}: error`);
    }
  }
}

// Test 2: Cache TTS
async function testTTSCache() {
  console.log('🔊 Test TTS Cache...');
  
  try {
    // Import dynamique du service TTS
    const { generateTTS } = await import('/src/services/tts.ts');
    
    const start = performance.now();
    const result1 = await generateTTS({ text: 'Test cache', language_code: 'fr' });
    const time1 = performance.now() - start;
    
    const start2 = performance.now();
    const result2 = await generateTTS({ text: 'Test cache', language_code: 'fr' });
    const time2 = performance.now() - start2;
    
    console.log(`Premier appel: ${time1.toFixed(0)}ms`);
    console.log(`Deuxième appel: ${time2.toFixed(0)}ms ${time2 < 50 ? '(HIT!)' : '(MISS)'}`);
    
    // Nettoyer les URLs
    if (result1.url.startsWith('blob:')) URL.revokeObjectURL(result1.url);
    if (result2.url.startsWith('blob:')) URL.revokeObjectURL(result2.url);
    
  } catch (error) {
    console.error('❌ Test TTS failed:', error);
  }
}

// Test 3: Métriques
function testMetrics() {
  console.log('📊 Test Métriques...');
  
  try {
    // Vérifier si les métriques sont disponibles
    if (window.getMetricsStats) {
      const stats = window.getMetricsStats();
      console.log('Métriques:', stats);
    } else {
      console.log('⚠️ Métriques non disponibles');
    }
  } catch (error) {
    console.error('❌ Test métriques failed:', error);
  }
}

// Test 4: Storage Info
async function testStorageInfo() {
  console.log('💾 Test Storage Info...');
  
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const usageMB = (estimate.usage || 0) / 1024 / 1024;
      const quotaMB = (estimate.quota || 0) / 1024 / 1024;
      console.log(`Stockage: ${usageMB.toFixed(2)} MB / ${quotaMB.toFixed(2)} MB`);
    }
  } catch (error) {
    console.error('❌ Test storage failed:', error);
  }
}

// Test 5: Cache Clear
async function testCacheClear() {
  console.log('🧹 Test Cache Clear...');
  
  try {
    const { CacheManager } = await import('/src/services/cache-manager.ts');
    const result = await CacheManager.clearAllCaches();
    console.log('Résultat:', result);
  } catch (error) {
    console.error('❌ Test cache clear failed:', error);
  }
}

// Test complet
async function runAllTests() {
  console.log('🚀 Début des tests complets...');
  
  await testSWDenylist();
  await testTTSCache();
  testMetrics();
  await testStorageInfo();
  
  console.log('\n🎯 Tests terminés!');
  console.log('Pour tester le cache clear, exécutez: testCacheClear()');
}

// Exposer les fonctions
window.testSWDenylist = testSWDenylist;
window.testTTSCache = testTTSCache;
window.testMetrics = testMetrics;
window.testStorageInfo = testStorageInfo;
window.testCacheClear = testCacheClear;
window.runAllTests = runAllTests;

console.log('✅ Scripts de test chargés!');
console.log('Exécutez: runAllTests() pour lancer tous les tests');
console.log('Ou testez individuellement: testSWDenylist(), testTTSCache(), etc.');
