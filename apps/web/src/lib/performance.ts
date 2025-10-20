// Optimisations de performance pour l'application

// Fonction pour précharger les ressources critiques
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return

  // Précharger les polices critiques
  const fontPreloads = [
    '/fonts/inter-400.woff2',
    '/fonts/inter-600.woff2',
    '/fonts/playfair-display-400.woff2',
  ]

  fontPreloads.forEach(font => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = font
    link.as = 'font'
    link.type = 'font/woff2'
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })

  // Précharger les images critiques
  const imagePreloads = [
    '/ankilang-demo.gif',
    '/images/ankilang-og-image.jpg',
  ]

  imagePreloads.forEach(image => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = image
    link.as = 'image'
    document.head.appendChild(link)
  })
}

// Fonction pour optimiser les images
export function optimizeImages() {
  if (typeof window === 'undefined') return

  // Observer pour les images lazy loading
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        if (img.dataset.src) {
          img.src = img.dataset.src
          img.removeAttribute('data-src')
          imageObserver.unobserve(img)
        }
      }
    })
  })

  // Observer toutes les images avec data-src
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img)
  })
}

// Fonction pour optimiser les animations
export function optimizeAnimations() {
  if (typeof window === 'undefined') return

  // Respecter les préférences de l'utilisateur
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  
  if (prefersReducedMotion) {
    // Désactiver les animations pour les utilisateurs qui préfèrent
    document.documentElement.style.setProperty('--animation-duration', '0ms')
    document.documentElement.style.setProperty('--animation-delay', '0ms')
  }
}

// Fonction pour optimiser le scroll
export function optimizeScroll() {
  if (typeof window === 'undefined') return

  let ticking = false

  const updateScroll = () => {
    // Optimisations de scroll ici
    ticking = false
  }

  const requestTick = () => {
    if (!ticking) {
      requestAnimationFrame(updateScroll)
      ticking = true
    }
  }

  window.addEventListener('scroll', requestTick, { passive: true })
}

// Fonction pour optimiser les événements
export function optimizeEvents() {
  if (typeof window === 'undefined') return

  // Debounce pour les événements fréquents
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout
    return (...args: any[]) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  }

  // Optimiser les événements de resize
  const handleResize = debounce(() => {
    // Logique de resize optimisée
  }, 100)

  window.addEventListener('resize', handleResize, { passive: true })
}

// Fonction pour initialiser toutes les optimisations
export function initPerformanceOptimizations() {
  preloadCriticalResources()
  optimizeImages()
  optimizeAnimations()
  optimizeScroll()
  optimizeEvents()
}

// Fonction pour mesurer les performances
export function measurePerformance() {
  if (typeof window === 'undefined') return

  // Mesurer le temps de chargement
  window.addEventListener('load', () => {
    const loadTime = performance.now()
    console.log(`🚀 Page chargée en ${loadTime.toFixed(2)}ms`)

    // Envoyer les métriques à Sentry si disponible
    if (window.Sentry) {
      window.Sentry.addBreadcrumb({
        message: 'Page loaded',
        category: 'performance',
        data: { loadTime }
      })
    }
  })

  // Mesurer les Core Web Vitals
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log(`📊 LCP: ${entry.startTime.toFixed(2)}ms`)
        }
        if (entry.entryType === 'first-input') {
          const fidEntry = entry as PerformanceEventTiming
          console.log(`📊 FID: ${fidEntry.processingStart - fidEntry.startTime}ms`)
        }
      }
    })

    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] })
  }
}

// Déclaration TypeScript pour Sentry global
declare global {
  interface Window {
    Sentry?: {
      addBreadcrumb: (breadcrumb: any) => void
    }
  }
}
