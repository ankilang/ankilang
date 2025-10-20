import { nanoid } from 'nanoid'
import { FLAGS } from '@/config/flags'

// ID de session unique pour cette instance
const sessionId = nanoid(6)

// Stockage des métriques en mémoire (pour agrégation)
const metricsBuffer: { event: string; data: Record<string, unknown>; timestamp: number }[] = []

/**
 * Enregistre une métrique avec enrichissement automatique
 */
export function metric(event: string, data: Record<string, unknown> = {}): void {
  if (!FLAGS.CACHE_METRICS) return

  const enriched = {
    ...data,
    timestamp: Date.now(),
    sessionId,
    userAgent: navigator.userAgent.slice(0, 50),
    url: window.location.pathname,
  }

  // Ajouter au buffer pour agrégation
  metricsBuffer.push({ event, data: enriched, timestamp: Date.now() })

  // Logger dans la console
  console.info(`[METRIC] ${event}`, enriched)

  // Nettoyer le buffer si il devient trop grand
  if (metricsBuffer.length > 1000) {
    metricsBuffer.splice(0, 500) // Garder les 500 plus récents
  }
}

/**
 * Mesure le temps d'exécution d'une fonction asynchrone
 */
export async function time<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now()
  try {
    const res = await fn()
    const ms = performance.now() - start
    metric(label, { ms: Math.round(ms), success: true })
    return res
  } catch (err) {
    const ms = performance.now() - start
    metric(`${label}.error`, { 
      ms: Math.round(ms), 
      success: false,
      error: (err as Error).message 
    })
    throw err
  }
}

/**
 * Mesure le temps d'exécution d'une fonction synchrone
 */
export function timeSync<T>(label: string, fn: () => T): T {
  const start = performance.now()
  try {
    const res = fn()
    const ms = performance.now() - start
    metric(label, { ms: Math.round(ms), success: true })
    return res
  } catch (err) {
    const ms = performance.now() - start
    metric(`${label}.error`, { 
      ms: Math.round(ms), 
      success: false,
      error: (err as Error).message 
    })
    throw err
  }
}

/**
 * Compteur simple pour les événements
 */
export function counter(event: string, increment = 1): void {
  metric(event, { count: increment })
}

/**
 * Gauge pour les valeurs numériques (taille, etc.)
 */
export function gauge(event: string, value: number, unit?: string): void {
  metric(event, { value, unit })
}

/**
 * Timer pour mesurer des durées personnalisées
 */
export class Timer {
  private start: number
  private label: string

  constructor(label: string) {
    this.label = label
    this.start = performance.now()
  }

  end(additionalData: Record<string, unknown> = {}): number {
    const ms = performance.now() - this.start
    metric(this.label, { ms: Math.round(ms), ...additionalData })
    return ms
  }
}

/**
 * Obtient les métriques récentes (pour debugging)
 */
export function getRecentMetrics(limit = 50): { event: string; data: Record<string, unknown>; timestamp: number }[] {
  return metricsBuffer.slice(-limit)
}

/**
 * Obtient des statistiques sur les métriques
 */
export function getMetricsStats(): {
  totalEvents: number
  eventsByType: Record<string, number>
  averageResponseTime: number
  errorRate: number
} {
  const totalEvents = metricsBuffer.length
  const eventsByType: Record<string, number> = {}
  let totalResponseTime = 0
  let responseTimeCount = 0
  let errorCount = 0

  for (const { event, data } of metricsBuffer) {
    eventsByType[event] = (eventsByType[event] || 0) + 1
    
    if (typeof data.ms === 'number') {
      totalResponseTime += data.ms
      responseTimeCount++
    }
    
    if (data.success === false) {
      errorCount++
    }
  }

  return {
    totalEvents,
    eventsByType,
    averageResponseTime: responseTimeCount > 0 ? Math.round(totalResponseTime / responseTimeCount) : 0,
    errorRate: totalEvents > 0 ? Math.round((errorCount / totalEvents) * 100) : 0,
  }
}

/**
 * Exporte les métriques pour analyse externe
 */
export function exportMetrics(): string {
  return JSON.stringify({
    sessionId,
    timestamp: Date.now(),
    metrics: metricsBuffer,
    stats: getMetricsStats(),
  }, null, 2)
}
