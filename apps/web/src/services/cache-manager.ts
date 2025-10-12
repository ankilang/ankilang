import localforage from 'localforage'

/**
 * Gestionnaire de cache local pour l'application
 * Permet de vider tous les caches IndexedDB utilisés par l'application
 */
export class CacheManager {
  private static readonly CACHE_STORES = [
    { name: 'ankilang', storeName: 'tts-cache' },
    { name: 'ankilang', storeName: 'cache' },
    { name: 'ankilang-test', storeName: 'test-cache' },
  ]
  
  private static objectUrls = new Set<string>()

  /**
   * Enregistre une Object URL pour suivi et nettoyage
   */
  static trackObjectUrl(url: string): void {
    if (url?.startsWith('blob:')) {
      this.objectUrls.add(url)
    }
  }

  /**
   * Révoque toutes les Object URLs trackées
   */
  static revokeTrackedUrls(): void {
    for (const url of this.objectUrls) {
      try {
        URL.revokeObjectURL(url)
      } catch (error) {
        console.warn('[CacheManager] Erreur lors de la révocation d\'URL:', error)
      }
    }
    this.objectUrls.clear()
  }

  /**
   * Vide tous les caches locaux de l'application
   */
  static async clearAllCaches(): Promise<{ success: boolean; cleared: string[]; errors: string[] }> {
    const cleared: string[] = []
    const errors: string[] = []

    console.log('🧹 [CacheManager] Début du nettoyage des caches...')

    // 1) Révoquer toutes les Object URLs trackées
    this.revokeTrackedUrls()
    console.log('✅ [CacheManager] Object URLs révoquées')

    for (const store of this.CACHE_STORES) {
      try {
        const instance = localforage.createInstance(store)
        await instance.clear()
        cleared.push(`${store.name}/${store.storeName}`)
        console.log(`✅ [CacheManager] Cache vidé: ${store.name}/${store.storeName}`)
      } catch (error) {
        const errorMsg = `Erreur lors du vidage de ${store.name}/${store.storeName}: ${error}`
        errors.push(errorMsg)
        console.error(`❌ [CacheManager] ${errorMsg}`)
      }
    }

    // Nettoyer aussi les caches Workbox si disponibles
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys()
        const appwriteMediaCache = cacheNames.find(name => name.includes('appwrite-media'))
        
        if (appwriteMediaCache) {
          await caches.delete(appwriteMediaCache)
          cleared.push(`workbox/${appwriteMediaCache}`)
          console.log(`✅ [CacheManager] Cache Workbox vidé: ${appwriteMediaCache}`)
        }
      } catch (error) {
        const errorMsg = `Erreur lors du vidage du cache Workbox: ${error}`
        errors.push(errorMsg)
        console.error(`❌ [CacheManager] ${errorMsg}`)
      }
    }

    const success = errors.length === 0
    console.log(`🎉 [CacheManager] Nettoyage terminé: ${cleared.length} caches vidés, ${errors.length} erreurs`)

    return { success, cleared, errors }
  }

  /**
   * Obtient des informations sur l'utilisation du cache
   */
  static async getCacheInfo(): Promise<{ stores: Array<{ name: string; storeName: string; size: number }> }> {
    const stores: Array<{ name: string; storeName: string; size: number }> = []

    for (const store of this.CACHE_STORES) {
      try {
        const instance = localforage.createInstance(store)
        const keys = await instance.keys()
        stores.push({
          name: store.name,
          storeName: store.storeName,
          size: keys.length
        })
      } catch (error) {
        console.warn(`[CacheManager] Impossible de lire ${store.name}/${store.storeName}:`, error)
        stores.push({
          name: store.name,
          storeName: store.storeName,
          size: 0
        })
      }
    }

    return { stores }
  }

  /**
   * Vide un cache spécifique
   */
  static async clearSpecificCache(storeName: string, dbName: string = 'ankilang'): Promise<boolean> {
    try {
      const instance = localforage.createInstance({ name: dbName, storeName })
      await instance.clear()
      console.log(`✅ [CacheManager] Cache vidé: ${dbName}/${storeName}`)
      return true
    } catch (error) {
      console.error(`❌ [CacheManager] Erreur lors du vidage de ${dbName}/${storeName}:`, error)
      return false
    }
  }
}
