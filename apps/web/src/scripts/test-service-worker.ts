/**
 * Script de test pour valider le Service Worker en production
 * À exécuter dans la console du navigateur après déploiement
 */

export async function testServiceWorkerDenylist(): Promise<{
  success: boolean;
  results: { url: string; intercepted: boolean; source: string }[];
}> {
  const results: { url: string; intercepted: boolean; source: string }[] = [];
  
  // URLs critiques à tester
  const criticalUrls = [
    '/assets/sql-wasm.wasm',
    '/manifest.webmanifest',
    '/manifest.webmanifest?v=4',
    '/api/test', // API route
    '/sqljs/test.js', // SQL.js
  ];

  console.log('🧪 [SW Test] Début des tests de denylist...');

  for (const url of criticalUrls) {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        cache: 'no-cache' 
      });
      
      // Vérifier la source de la réponse
      const source = response.headers.get('x-sw-cache') || 'network';
      const intercepted = source !== 'network';
      
      results.push({ url, intercepted, source });
      
      console.log(`${intercepted ? '❌' : '✅'} ${url}: ${source}`);
      
    } catch (error) {
      results.push({ url, intercepted: false, source: 'error' });
      console.log(`⚠️ ${url}: error (${error})`);
    }
  }

  // Test des médias Appwrite (doivent être interceptés)
  const appwriteUrl = '/v1/storage/buckets/flashcard-images/files/test/view';
  try {
    const response = await fetch(appwriteUrl, { method: 'HEAD' });
    const source = response.headers.get('x-sw-cache') || 'network';
    const intercepted = source !== 'network';
    
    results.push({ url: appwriteUrl, intercepted, source });
    console.log(`${intercepted ? '✅' : '❌'} ${appwriteUrl}: ${source} (doit être intercepté)`);
  } catch (error) {
    results.push({ url: appwriteUrl, intercepted: false, source: 'error' });
    console.log(`⚠️ ${appwriteUrl}: error (${error})`);
  }

  const success = results.every(r => {
    if (r.url.includes('/assets/') || r.url.includes('/manifest') || r.url.includes('/api/') || r.url.includes('/sqljs/')) {
      return !r.intercepted; // Ne doivent PAS être interceptés
    }
    if (r.url.includes('/v1/storage/buckets/')) {
      return r.intercepted; // Doivent être interceptés
    }
    return true;
  });

  console.log(`\n🎯 [SW Test] Résultat: ${success ? '✅ SUCCÈS' : '❌ ÉCHEC'}`);
  console.log('📊 [SW Test] Détails:', results);

  return { success, results };
}

/**
 * Test de performance du cache
 */
export async function testCachePerformance(): Promise<{
  ttsHit: boolean;
  ttsTime: number;
  pexelsHit: boolean;
  pexelsTime: number;
}> {
  console.log('⚡ [Cache Test] Test de performance...');

  // Test TTS
  const ttsStart = performance.now();
  try {
    // Simuler un appel TTS (nécessite l'import du service)
    const { generateTTS } = await import('../services/tts');
    await generateTTS({ text: 'Test cache', language_code: 'fr' });
  } catch (error) {
    console.warn('[Cache Test] TTS test failed:', error);
  }
  const ttsTime = performance.now() - ttsStart;

  // Test Pexels (now uses Vercel API, no caching needed)
  const pexelsStart = performance.now();
  try {
    const { pexelsSearchPhotos } = await import('../services/pexels');
    // Test search
    await pexelsSearchPhotos('test', { per_page: 1 });
  } catch (error) {
    console.warn('[Cache Test] Pexels test failed:', error);
  }
  const pexelsTime = performance.now() - pexelsStart;

  return {
    ttsHit: ttsTime < 100, // Si < 100ms, probablement un hit
    ttsTime,
    pexelsHit: pexelsTime < 200,
    pexelsTime
  };
}

/**
 * Test complet du système de cache
 */
export async function runFullCacheTest(): Promise<void> {
  console.log('🚀 [Cache Test] Début des tests complets...');
  
  // 1. Test Service Worker
  const swResult = await testServiceWorkerDenylist();
  
  // 2. Test performance
  const perfResult = await testCachePerformance();
  
  // 3. Test métriques
  try {
    const { getMetricsStats } = await import('../services/cache/metrics');
    const stats = getMetricsStats();
    console.log('📊 [Cache Test] Métriques:', stats);
  } catch (error) {
    console.warn('[Cache Test] Métriques non disponibles:', error);
  }

  // 4. Résumé final
  console.log('\n🎯 [Cache Test] RÉSUMÉ FINAL:');
  console.log(`Service Worker: ${swResult.success ? '✅' : '❌'}`);
  console.log(`TTS Performance: ${perfResult.ttsTime.toFixed(0)}ms ${perfResult.ttsHit ? '(hit)' : '(miss)'}`);
  console.log(`Pexels Performance: ${perfResult.pexelsTime.toFixed(0)}ms ${perfResult.pexelsHit ? '(hit)' : '(miss)'}`);
  
  const overallSuccess = swResult.success && perfResult.ttsTime < 1000 && perfResult.pexelsTime < 2000;
  console.log(`\n🏆 [Cache Test] RÉSULTAT GLOBAL: ${overallSuccess ? '✅ SUCCÈS' : '❌ ÉCHEC'}`);
}

// Exposer les fonctions globalement pour la console
if (typeof window !== 'undefined') {
  (window as any).testServiceWorkerDenylist = testServiceWorkerDenylist;
  (window as any).testCachePerformance = testCachePerformance;
  (window as any).runFullCacheTest = runFullCacheTest;
}
