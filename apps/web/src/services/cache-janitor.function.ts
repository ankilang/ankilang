import { Functions } from 'appwrite';
import client from './appwrite';

const functions = new Functions(client);

const FUNCTION_ID =
  import.meta.env.VITE_APPWRITE_CACHE_JANITOR_FUNCTION_ID || 'ankilang-cache-janitor';

export interface CacheJanitorParams {
  dryRun?: boolean;
  batchSize?: number;
  maxExecutionMs?: number;
  ttsTtlDays?: number;
  pexelsTtlDays?: number;
  bucketId?: string;
}

export interface CacheJanitorResult {
  success: boolean;
  dryRun: boolean;
  executionTimeMs: number;
  scanned: number;
  deleted: number;
  errors: number;
  bucket: string;
  ttl: { tts: number; pexels: number };
}

/**
 * Lance le nettoyage du cache via la fonction Appwrite cache-janitor
 * 
 * @param params - Paramètres de configuration pour le nettoyage
 * @returns Résultat du nettoyage avec statistiques
 */
export async function runCacheJanitor(
  params: CacheJanitorParams = {}
): Promise<CacheJanitorResult> {
  const payload = {
    DRY_RUN: params.dryRun ?? true,
    BATCH_SIZE: params.batchSize ?? 100,
    MAX_EXECUTION_TIME: params.maxExecutionMs ?? 30000,
    TTS_TTL_DAYS: params.ttsTtlDays ?? 90,
    PEXELS_TTL_DAYS: params.pexelsTtlDays ?? 180,
    BUCKET_ID: params.bucketId ?? 'flashcard-images',
  };

  console.log('🧹 [Cache Janitor] Lancement du nettoyage:', {
    functionId: FUNCTION_ID,
    params: payload
  });

  // Créer l'exécution de la fonction
  const exec = await functions.createExecution(FUNCTION_ID, JSON.stringify(payload));

  console.log('📡 [Cache Janitor] Exécution créée:', {
    executionId: exec.$id,
    status: exec.status
  });

  // Polling pour attendre la completion (jusqu'à 30 secondes)
  let final = exec;
  if (exec.status !== 'completed' && exec.$id) {
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      final = await functions.getExecution(FUNCTION_ID, exec.$id);
      if (final.status === 'completed' || final.status === 'failed') break;
    }
  }

  if (final.status === 'failed') {
    throw new Error(`Cache janitor failed: ${(final as any).response || 'Pas de réponse'}`);
  }

  // Lecture tolérante de la réponse (response ou responseBody)
  const raw =
    (final as any).response !== undefined ? (final as any).response :
    (final as any).responseBody !== undefined ? (final as any).responseBody :
    '';

  const result = JSON.parse(raw);
  console.log('✅ [Cache Janitor] Nettoyage terminé:', result);
  
  return result;
}
