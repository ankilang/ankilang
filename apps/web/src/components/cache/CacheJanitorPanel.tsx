import { useState } from 'react';
import { runCacheJanitor, type CacheJanitorResult } from '@/services/cache-janitor.function';

export function CacheJanitorPanel() {
  const [loading, setLoading] = useState<null | 'dry' | 'real'>(null);
  const [lastResult, setLastResult] = useState<CacheJanitorResult | null>(null);

  async function handleClick(dryRun: boolean) {
    try {
      setLoading(dryRun ? 'dry' : 'real');
      const res = await runCacheJanitor({ 
        dryRun, 
        batchSize: 100, 
        maxExecutionMs: 30000 
      });
      setLastResult(res);
      
      // Afficher un message de succès
      const message = `✅ Nettoyage ${dryRun ? 'test (dry-run)' : 'réel'} terminé !\n` +
        `📊 Scannés: ${res.scanned}, Supprimés: ${res.deleted}, Erreurs: ${res.errors}\n` +
        `⏱️ Temps d'exécution: ${res.executionTimeMs}ms`;
      
      alert(message);
    } catch (e: any) {
      console.error('[CacheJanitorPanel] Erreur:', e);
      alert(`❌ Échec du nettoyage: ${e?.message ?? e}`);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3 border border-gray-200 p-4 rounded-xl bg-white shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        <h3 className="font-semibold text-gray-900">Nettoyage du cache (Appwrite Function)</h3>
      </div>
      
      <p className="text-sm text-gray-600">
        Nettoie automatiquement les fichiers cache TTS et Pexels expirés dans le bucket Appwrite Storage.
      </p>

      <div className="flex gap-2">
        <button
          onClick={() => handleClick(true)}
          disabled={!!loading}
          className="px-3 py-2 rounded-md bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading === 'dry' ? '⏳ Test…' : '🧪 Test (dry-run)'}
        </button>
        <button
          onClick={() => handleClick(false)}
          disabled={!!loading}
          className="px-3 py-2 rounded-md bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading === 'real' ? '⏳ Nettoyage…' : '🗑️ Nettoyage réel'}
        </button>
      </div>

      {loading && (
        <div className="text-sm text-gray-500">
          ⏳ Exécution en cours... (peut prendre jusqu'à 30 secondes)
        </div>
      )}

      {lastResult && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Dernier résultat :</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 p-2 rounded">
              <div className="font-medium">📊 Statistiques</div>
              <div>Scannés: {lastResult.scanned}</div>
              <div>Supprimés: {lastResult.deleted}</div>
              <div>Erreurs: {lastResult.errors}</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="font-medium">⚙️ Configuration</div>
              <div>Mode: {lastResult.dryRun ? 'Test' : 'Réel'}</div>
              <div>Bucket: {lastResult.bucket}</div>
              <div>Temps: {lastResult.executionTimeMs}ms</div>
            </div>
          </div>
          
          <details className="mt-2">
            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
              Voir les détails complets
            </summary>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">
              {JSON.stringify(lastResult, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
