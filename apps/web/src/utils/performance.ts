/**
 * Utilitaires pour le monitoring des performances
 * Active/désactive via localStorage.setItem('PERF_DEBUG', 'true')
 */

interface PerformanceMetrics {
  queryKey: string[]
  duration: number
  hit: boolean
  timestamp: number
  dataSize?: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private isEnabled = false

  constructor() {
    // Vérifier si PERF_DEBUG est activé
    this.isEnabled = this.checkDebugFlag()
    
    // Écouter les changements de localStorage
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'PERF_DEBUG') {
          this.isEnabled = this.checkDebugFlag()
        }
      })
    }
  }

  private checkDebugFlag(): boolean {
    if (typeof window === 'undefined') return false
    
    // Vérifier d'abord la variable d'environnement (staging/prod)
    if (import.meta.env.VITE_PERF_DEBUG === 'true') {
      return true
    }
    
    // Fallback sur localStorage (dev)
    return window.localStorage?.getItem('PERF_DEBUG') === 'true'
  }

  /**
   * Log une métrique de performance
   */
  log(metric: Omit<PerformanceMetrics, 'timestamp'>) {
    if (!this.isEnabled) return

    const fullMetric: PerformanceMetrics = {
      ...metric,
      timestamp: Date.now()
    }

    this.metrics.push(fullMetric)
    
    // Garder seulement les 100 dernières métriques
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100)
    }

    console.info('[PERF]', {
      key: metric.queryKey.join('.'),
      duration: `${metric.duration}ms`,
      hit: metric.hit ? '✅' : '❌',
      size: metric.dataSize ? `${metric.dataSize} items` : undefined
    })
  }

  /**
   * Obtenir les métriques agrégées
   */
  getMetrics() {
    if (!this.isEnabled) return null

    const totalQueries = this.metrics.length
    const avgDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0) / totalQueries
    const cacheHitRate = this.metrics.filter(m => m.hit).length / totalQueries
    const totalDataSize = this.metrics.reduce((sum, m) => sum + (m.dataSize || 0), 0)

    return {
      totalQueries,
      avgDuration: Math.round(avgDuration),
      cacheHitRate: Math.round(cacheHitRate * 100),
      totalDataSize,
      recentMetrics: this.metrics.slice(-10)
    }
  }

  /**
   * Exporter les métriques pour analyse
   */
  exportMetrics() {
    if (!this.isEnabled) return

    const data = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      summary: this.getMetrics()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `ankilang-perf-${Date.now()}.json`
    a.click()
    
    URL.revokeObjectURL(url)
  }

  /**
   * Nettoyer les métriques
   */
  clear() {
    this.metrics = []
    console.info('[PERF] Metrics cleared')
  }
}

// Instance singleton
export const perfMonitor = new PerformanceMonitor()

/**
 * Hook pour mesurer les performances des requêtes React Query
 */
export function usePerformanceMetrics() {
  const measureQuery = (queryKey: string[], queryFn: () => Promise<any>) => {
    const startTime = performance.now()
    
    return queryFn().then((data) => {
      const duration = Math.round(performance.now() - startTime)
      
      perfMonitor.log({
        queryKey,
        duration,
        hit: false, // Sera mis à jour par React Query
        dataSize: Array.isArray(data) ? data.length : 1
      })
      
      return data
    }).catch((error) => {
      const duration = Math.round(performance.now() - startTime)
      
      perfMonitor.log({
        queryKey,
        duration,
        hit: false,
        dataSize: 0
      })
      
      throw error
    })
  }

  return { measureQuery }
}

/**
 * Wrapper pour React Query avec métriques automatiques
 */
export function withPerformanceMetrics<T>(
  queryKey: string[],
  queryFn: () => Promise<T>
) {
  return async () => {
    const startTime = performance.now()
    
    try {
      const data = await queryFn()
      const duration = Math.round(performance.now() - startTime)
      
      perfMonitor.log({
        queryKey,
        duration,
        hit: false,
        dataSize: Array.isArray(data) ? data.length : 1
      })
      
      return data
    } catch (error) {
      const duration = Math.round(performance.now() - startTime)
      
      perfMonitor.log({
        queryKey,
        duration,
        hit: false,
        dataSize: 0
      })
      
      throw error
    }
  }
}

/**
 * Fonction pour activer/désactiver le debug
 */
export function togglePerfDebug() {
  const current = window.localStorage?.getItem('PERF_DEBUG') === 'true'
  const newValue = !current
  
  window.localStorage?.setItem('PERF_DEBUG', newValue.toString())
  
  console.info(`[PERF] Debug ${newValue ? 'enabled' : 'disabled'}`)
  
  if (newValue) {
    console.info('[PERF] Available commands:')
    console.info('  - perfMonitor.getMetrics() - View metrics')
    console.info('  - perfMonitor.exportMetrics() - Export metrics')
    console.info('  - perfMonitor.clear() - Clear metrics')
    console.info('  - togglePerfDebug() - Toggle debug mode')
  }
  
  return newValue
}

// Exposer les fonctions globalement en mode dev
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).perfMonitor = perfMonitor
  ;(window as any).togglePerfDebug = togglePerfDebug
}
