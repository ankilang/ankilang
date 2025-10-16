import { useEffect } from 'react'

/**
 * Hook personnalisé pour le prefetch intelligent des routes
 *
 * Fonctionnalités :
 * - Détection de la connexion réseau (évite le prefetch sur 2G/3G)
 * - Utilisation de requestIdleCallback pour ne pas bloquer le thread principal
 * - Timeout de sécurité (3 secondes maximum)
 *
 * @example
 * ```typescript
 * function App() {
 *   useRoutePrefetch() // Active le prefetch automatique
 *   return <Routes>...</Routes>
 * }
 * ```
 */
export const useRoutePrefetch = () => {
  useEffect(() => {
    // Détection intelligente de la connexion réseau
    const conn = (navigator as any).connection as {
      saveData?: boolean;
      effectiveType?: string;
    } | undefined

    // Éviter le prefetch sur les connexions lentes ou en mode économie de données
    const isSlow = conn?.effectiveType && /(^2g$|^3g$)/.test(conn.effectiveType)
    const shouldSkip = conn?.saveData || isSlow

    if (shouldSkip) {
      console.log('🔄 Prefetch ignoré : connexion lente détectée')
      return
    }

    // Fonction d'exécution en arrière-plan
    const idle = (callback: () => void) => {
      if ('requestIdleCallback' in window) {
        // Utilise requestIdleCallback avec timeout de sécurité
        ;(window as any).requestIdleCallback(callback, { timeout: 3000 })
      } else {
        // Fallback pour les navigateurs plus anciens
        setTimeout(callback, 1500)
      }
    }

    // Prefetch des routes les plus utilisées
    idle(() => {
      console.log('🚀 Prefetch des routes principales...')

      // Importer les composants fréquemment utilisés
      const prefetchPromises = [
        import('../pages/app/themes/Index'),
        import('../pages/app/themes/Detail'),
        import('../pages/app/account/Index'),
        import('../pages/app/Dashboard')
      ]

      // Attendre que tous les imports soient terminés
      Promise.all(prefetchPromises)
        .then(() => {
          console.log('✅ Prefetch terminé avec succès')
        })
        .catch((error) => {
          console.warn('⚠️ Erreur lors du prefetch:', error)
          // Le prefetch peut échouer, ce n'est pas critique
        })
    })
  }, [])
}

// Hook pour prefetch manuel d'une route spécifique
export const usePrefetchRoute = (routePath: string) => {
  useEffect(() => {
    const prefetchRoute = async () => {
      try {
        // Mapper les chemins vers les composants
        const routeMap: Record<string, () => Promise<any>> = {
          '/app/themes': () => import('../pages/app/themes/Index'),
          '/app/themes/new': () => import('../pages/app/themes/New'),
          '/app/account': () => import('../pages/app/account/Index'),
          '/app/dashboard': () => import('../pages/app/Dashboard')
        }

        const importFn = routeMap[routePath]
        if (importFn) {
          await importFn()
          console.log(`✅ Route ${routePath} préfétchée`)
        }
      } catch (error) {
        console.warn(`⚠️ Échec prefetch route ${routePath}:`, error)
      }
    }

    prefetchRoute()
  }, [routePath])
}
