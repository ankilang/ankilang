import { useEffect } from 'react'

interface AnalyticsProps {
  domain?: string
  enabled?: boolean
}

export default function Analytics({ 
  domain = 'ankilang.com',
  enabled = true 
}: AnalyticsProps) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    // Plausible Analytics (respectueux de la vie privée)
    const script = document.createElement('script')
    script.defer = true
    script.dataset.domain = domain
    script.src = 'https://plausible.io/js/script.js'
    document.head.appendChild(script)

    // Fallback console.log pour le développement
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics initialized for domain:', domain)
    }

    return () => {
      // Cleanup si nécessaire
      const existingScript = document.querySelector(`script[data-domain="${domain}"]`)
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [domain, enabled])

  return null
}

// Hook pour tracker les événements personnalisés
export function useAnalytics() {
  const track = (event: string, props?: Record<string, any>) => {
    if (typeof window === 'undefined') return

    // Plausible custom events
    if (window.plausible) {
      window.plausible(event, { props })
    }

    // Fallback console.log pour le développement
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Event tracked:', event, props)
    }
  }

  return { track }
}

// Déclaration TypeScript pour Plausible
declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, any> }) => void
  }
}
