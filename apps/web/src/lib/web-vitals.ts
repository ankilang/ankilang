import { useState, useEffect } from 'react'

// Types pour les métriques
interface WebVitalMetric {
  name: string
  value: number
  delta: number
  id: string
  rating: 'good' | 'needs-improvement' | 'poor'
}

// Configuration des seuils
const VITALS_THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
} as const

// Fonction pour évaluer la performance
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = VITALS_THRESHOLDS[name as keyof typeof VITALS_THRESHOLDS]
  if (!thresholds) return 'good'
  
  if (value <= thresholds.good) return 'good'
  if (value <= thresholds.poor) return 'needs-improvement'
  return 'poor'
}

// Fonction pour tracker une métrique
function trackMetric(metric: WebVitalMetric) {
  // Import dynamique pour éviter les erreurs de SSR
  const { captureMessage, addBreadcrumb } = typeof window !== 'undefined' ? 
    require('./sentry').useSentry() : { captureMessage: () => {}, addBreadcrumb: () => {} }
  
  // Log pour le développement
  if (import.meta.env.NODE_ENV === 'development') {
    console.log(`📊 Web Vital: ${metric.name}`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
    })
  }

  // Breadcrumb pour Sentry
  addBreadcrumb({
    message: `Web Vital: ${metric.name}`,
    category: 'performance',
    level: metric.rating === 'poor' ? 'error' : 'info',
    data: {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
    },
  })

  // Alert si performance critique
  if (metric.rating === 'poor') {
    captureMessage(`Poor ${metric.name}: ${metric.value}ms`, 'warning')
  }
}

// Fonction pour initialiser le monitoring simplifié
export function initWebVitals() {
  if (typeof window === 'undefined') return

  // Monitoring basique des performances
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'navigation') {
        const navEntry = entry as PerformanceNavigationTiming
        trackMetric({
          name: 'TTFB',
          value: navEntry.responseStart - navEntry.requestStart,
          delta: 0,
          id: 'navigation',
          rating: getRating('TTFB', navEntry.responseStart - navEntry.requestStart),
        })
      }
    }
  })

  observer.observe({ entryTypes: ['navigation'] })

  // Monitoring du LCP simplifié
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as PerformanceEntry
        trackMetric({
          name: 'LCP',
          value: lastEntry.startTime,
          delta: 0,
          id: 'lcp',
          rating: getRating('LCP', lastEntry.startTime),
        })
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (e) {
      // LCP non supporté
    }
  }
}

// Hook pour accéder aux métriques
export function useWebVitals() {
  const [metrics, setMetrics] = useState<WebVitalMetric[]>([])

  useEffect(() => {
    // Écouter les métriques personnalisées
    const handleMetric = (event: CustomEvent<WebVitalMetric>) => {
      setMetrics(prev => [...prev, event.detail])
    }

    window.addEventListener('web-vital', handleMetric as EventListener)
    return () => {
      window.removeEventListener('web-vital', handleMetric as EventListener)
    }
  }, [])

  return metrics
}

// Fonction pour mesurer les performances personnalisées
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  const start = performance.now()
  
  try {
    const result = fn()
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const end = performance.now()
        const duration = end - start
        
        // Log pour le développement
        if (import.meta.env.NODE_ENV === 'development') {
          console.log(`⏱️ Performance: ${name}`, `${duration.toFixed(2)}ms`)
        }
        
        // Envoyer à Sentry si lent
        if (duration > 1000) {
          const { captureMessage } = typeof window !== 'undefined' ? 
            require('./sentry').useSentry().captureMessage : () => {}
          captureMessage(`Slow operation: ${name} (${duration.toFixed(2)}ms)`, 'warning')
        }
      })
    } else {
      const end = performance.now()
      const duration = end - start
      
      if (import.meta.env.NODE_ENV === 'development') {
        console.log(`⏱️ Performance: ${name}`, `${duration.toFixed(2)}ms`)
      }
      
      return result
    }
  } catch (error) {
    const end = performance.now()
    const duration = end - start
    
    const { captureException } = typeof window !== 'undefined' ? 
      require('./sentry').useSentry() : { captureException: () => {} }
    captureException(error as Error, {
      operation: name,
      duration,
    })
    
    throw error
  }
}

// Fonction pour mesurer le temps de chargement des images
export function measureImageLoad(src: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const start = performance.now()
    
    img.onload = () => {
      const end = performance.now()
      const duration = end - start
      resolve(duration)
    }
    
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${src}`))
    }
    
    img.src = src
  })
}

// Fonction pour mesurer le temps de chargement des API
export function measureApiCall<T>(
  apiCall: () => Promise<T>,
  endpoint: string
): Promise<T> {
  return measurePerformance(`API: ${endpoint}`, apiCall) as Promise<T>
}
