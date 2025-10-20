import * as Sentry from '@sentry/react'

// Configuration Sentry simplifiée
export function initSentry() {
  if (typeof window === 'undefined') return

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.NODE_ENV,
    // Performance monitoring
    tracesSampleRate: import.meta.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Error sampling
    sampleRate: import.meta.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // User context
    beforeSend(event: any) {
      // Filtrer les erreurs non critiques
      if (event.exception) {
        const error = event.exception.values?.[0]
        if (error?.type === 'ChunkLoadError') {
          return null // Ignorer les erreurs de chunk loading
        }
      }
      return event
    },
    // Tags personnalisés
    initialScope: {
      tags: {
        component: 'ankilang-web',
        version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      },
    },
  })
}

// Hook pour capturer les erreurs manuellement
export function useSentry() {
  const captureException = (error: Error, context?: Record<string, any>) => {
    Sentry.withScope((scope: any) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, value)
        })
      }
      Sentry.captureException(error)
    })
  }

  const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
    Sentry.captureMessage(message, level)
  }

  const setUser = (user: { id: string; email?: string; username?: string }) => {
    Sentry.setUser(user)
  }

  const addBreadcrumb = (breadcrumb: { message: string; category?: string; level?: 'info' | 'warning' | 'error' }) => {
    Sentry.addBreadcrumb(breadcrumb)
  }

  return {
    captureException,
    captureMessage,
    setUser,
    addBreadcrumb,
  }
}

// Composant Sentry Error Boundary
export const SentryErrorBoundary = Sentry.withErrorBoundary

// Fonction pour tracker les performances
export function trackPerformance(name: string, fn: () => void | Promise<void>) {
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
          const { captureMessage } = useSentry()
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
    
    const { captureException } = useSentry()
    captureException(error as Error, {
      operation: name,
      duration,
    })
    
    throw error
  }
}

// Fonction pour tracker les événements métier
export function trackBusinessEvent(event: string, properties?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message: event,
    category: 'business',
    level: 'info',
    data: properties,
  })
}

// Fonction pour tracker les erreurs API
export function trackApiError(endpoint: string, status: number, error: string) {
  Sentry.withScope((scope: any) => {
    scope.setTag('error_type', 'api_error')
    scope.setContext('api', {
      endpoint,
      status,
      error,
    })
    Sentry.captureMessage(`API Error: ${endpoint} (${status})`, 'error')
  })
}
