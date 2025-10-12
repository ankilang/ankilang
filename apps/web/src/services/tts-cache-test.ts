// Test rapide du module de cache partagé
import { BrowserIDBCache, buildCacheKey } from '@ankilang/shared-cache';

const idb = new BrowserIDBCache('ankilang', 'tts-cache');

export async function testCachedTTS(params: {
  text: string;
  lang: string;
  voice?: string;
  speed?: number;
}) {
  const key = await buildCacheKey({
    namespace: 'tts',
    lang: params.lang,
    voice: params.voice ?? 'default',
    speed: params.speed ?? 0.8,
    text: params.text
  });

  console.log('🔑 [Cache Test] Key générée:', key);

  const cached = await idb.get<Blob>(key);
  if (cached) {
    console.log('✅ [Cache Test] HIT - Audio trouvé en cache');
    return URL.createObjectURL(cached);
  }

  console.log('❌ [Cache Test] MISS - Génération nécessaire');
  
  // Simuler un blob audio (pour le test)
  const testBlob = new Blob(['fake audio data'], { type: 'audio/mpeg' });
  
  await idb.set(key, testBlob, { 
    ttlMs: 1000 * 60 * 60 * 24 * 7, // 7 jours
    contentType: 'audio/mpeg' 
  });

  console.log('💾 [Cache Test] Audio mis en cache');
  return URL.createObjectURL(testBlob);
}

// Test d'usage
export async function runCacheTest() {
  console.log('🧪 [Cache Test] Démarrage du test...');
  
  // Premier appel (MISS)
  await testCachedTTS({
    text: 'Bonjour le monde',
    lang: 'fr',
    voice: 'Rachel',
    speed: 0.8
  });

  // Deuxième appel (HIT)
  await testCachedTTS({
    text: 'Bonjour le monde',
    lang: 'fr', 
    voice: 'Rachel',
    speed: 0.8
  });

  console.log('✅ [Cache Test] Test terminé - Vérifiez les logs ci-dessus');
}
