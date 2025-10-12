import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trash2, CheckCircle, AlertCircle, BarChart3, HardDrive } from 'lucide-react'
import { CacheManager } from '../../services/cache-manager'
import { metric, getMetricsStats } from '../../services/cache/metrics'
import { FLAGS } from '../../config/flags'

interface CacheClearButtonProps {
  className?: string
}

export default function CacheClearButton({ className = '' }: CacheClearButtonProps) {
  const [isClearing, setIsClearing] = useState(false)
  const [cacheInfo, setCacheInfo] = useState<{
    size: string
    entries: number
  } | null>(null)
  const [metrics, setMetrics] = useState<{
    totalEvents: number
    averageResponseTime: number
    errorRate: number
  } | null>(null)
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
    details?: string[]
  } | null>(null)

  // Charger les informations du cache au montage
  useEffect(() => {
    loadCacheInfo()
    if (FLAGS.CACHE_METRICS) {
      loadMetrics()
    }
  }, [])

  const loadCacheInfo = async () => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        const sizeMB = ((estimate.usage || 0) / 1024 / 1024).toFixed(2)
        const quotaMB = ((estimate.quota || 0) / 1024 / 1024).toFixed(2)
        setCacheInfo({
          size: `${sizeMB} MB / ${quotaMB} MB`,
          entries: Math.floor((estimate.usage || 0) / 1024) // Estimation approximative
        })
      }
    } catch (error) {
      console.warn('[Cache] Impossible de charger les infos de stockage:', error)
    }
  }

  const loadMetrics = () => {
    try {
      const stats = getMetricsStats()
      setMetrics({
        totalEvents: stats.totalEvents,
        averageResponseTime: stats.averageResponseTime,
        errorRate: stats.errorRate
      })
    } catch (error) {
      console.warn('[Cache] Impossible de charger les métriques:', error)
    }
  }

  const handleClearCache = async () => {
    if (isClearing) return

    // Confirmation avec informations sur la taille
    const confirmMessage = cacheInfo 
      ? `Vider le cache local (${cacheInfo.size}) ?\n\nCela supprimera tous les fichiers audio et images mis en cache.`
      : 'Vider le cache local ?\n\nCela supprimera tous les fichiers audio et images mis en cache.'
    
    if (!confirm(confirmMessage)) return

    setIsClearing(true)
    setStatus(null)

    try {
      const result = await CacheManager.clearAllCaches()
      
      if (result.success) {
        // Enregistrer la métrique de nettoyage
        metric('Cache.clear', { 
          success: true, 
          clearedCount: result.cleared.length,
          cacheSize: cacheInfo?.size || 'unknown'
        })
        
        setStatus({
          type: 'success',
          message: `Cache vidé avec succès ! ${result.cleared.length} caches nettoyés.`,
          details: result.cleared
        })
        
        // Recharger les informations du cache
        await loadCacheInfo()
        if (FLAGS.CACHE_METRICS) {
          loadMetrics()
        }
      } else {
        metric('Cache.clear', { 
          success: false, 
          errorCount: result.errors.length,
          cacheSize: cacheInfo?.size || 'unknown'
        })
        
        setStatus({
          type: 'error',
          message: `Erreur lors du nettoyage du cache. ${result.errors.length} erreur(s) rencontrée(s).`,
          details: result.errors
        })
      }
    } catch (error) {
      metric('Cache.clear', { 
        success: false, 
        error: (error as Error).message,
        cacheSize: cacheInfo?.size || 'unknown'
      })
      
      setStatus({
        type: 'error',
        message: 'Erreur inattendue lors du nettoyage du cache.',
        details: [error instanceof Error ? error.message : 'Erreur inconnue']
      })
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm">
        <h3 className="font-display text-lg font-semibold text-dark-charcoal">
          Gestion du cache local
        </h3>
        <p className="mt-1 text-sm text-dark-charcoal/70">
          Videz le cache local pour libérer de l'espace ou résoudre des problèmes d'affichage.
          Cela supprimera les fichiers audio et images mis en cache.
        </p>

        {/* Informations du cache */}
        {cacheInfo && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-dark-charcoal/70">
              <HardDrive className="h-4 w-4" />
              <span>Stockage: {cacheInfo.size}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-dark-charcoal/70">
              <BarChart3 className="h-4 w-4" />
              <span>~{cacheInfo.entries} entrées</span>
            </div>
          </div>
        )}

        {/* Métriques de performance */}
        {FLAGS.CACHE_METRICS && metrics && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Métriques de performance</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-blue-700">
              <div>
                <span className="font-medium">{metrics.totalEvents}</span> événements
              </div>
              <div>
                <span className="font-medium">{metrics.averageResponseTime}ms</span> temps moyen
              </div>
              <div>
                <span className="font-medium">{metrics.errorRate}%</span> taux d'erreur
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={handleClearCache}
          disabled={isClearing}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isClearing ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-300 border-t-orange-600" />
              Nettoyage en cours...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              Vider le cache local
            </>
          )}
        </button>
      </div>

      {status && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl border p-4 ${
            status.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {status.type === 'success' ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-medium">{status.message}</p>
              {status.details && status.details.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm opacity-75 hover:opacity-100">
                    Détails ({status.details.length})
                  </summary>
                  <ul className="mt-2 space-y-1 text-sm">
                    {status.details.map((detail, index) => (
                      <li key={index} className="font-mono text-xs opacity-75">
                        {detail}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
