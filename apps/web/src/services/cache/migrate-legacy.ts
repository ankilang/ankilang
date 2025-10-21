import { BrowserIDBCache } from '@ankilang/shared-cache'
import { FLAGS } from '../../config/flags'

const idb = new BrowserIDBCache('ankilang', 'binary-cache')

const LEGACY_KEYS = {
  TTS_PREFIX: 'ankilang_tts_', // ancien cache localStorage
  MIGRATION_MARKER: 'cache_migration_v4_completed',
}

/**
 * Migre les anciens caches localStorage vers le nouveau système IDB
 * Cette fonction est appelée une seule fois au démarrage de l'application
 */
export async function migrateLegacyCache(): Promise<{ moved: number; errors: number }> {
  if (!FLAGS.CACHE_ENABLE) {
    console.info('[Cache][migrate] Cache désactivé, migration ignorée')
    return { moved: 0, errors: 0 }
  }

  // Vérifier si la migration a déjà été effectuée
  const migrationCompleted = localStorage.getItem(LEGACY_KEYS.MIGRATION_MARKER)
  if (migrationCompleted) {
    console.info('[Cache][migrate] Migration v4 déjà effectuée')
    return { moved: 0, errors: 0 }
  }

  let moved = 0
  let errors = 0

  console.info('[Cache][migrate] Début de la migration legacy cache...')

  // 1) Migrer TTS localStorage → IDB (dataURL → Blob)
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (!k?.startsWith(LEGACY_KEYS.TTS_PREFIX)) continue

    try {
      const raw = localStorage.getItem(k)
      if (!raw) continue

      const entry = JSON.parse(raw) as { url?: string; mimeType?: string }
      if (!entry?.url?.startsWith('data:')) continue

      // Télécharger le blob depuis la data URL
      const res = await fetch(entry.url)
      if (!res.ok) {
        console.warn(`[Cache][migrate] URL invalide pour ${k}: ${res.status}`)
        continue
      }

      const blob = await res.blob()
      if (blob.size === 0) {
        console.warn(`[Cache][migrate] Blob vide pour ${k}`)
        continue
      }

      // Créer une nouvelle clé déterministe
      const newKey = k.replace(LEGACY_KEYS.TTS_PREFIX, 'tts:migrated:')
      
      // Stocker dans le nouveau cache IDB
      await idb.set(newKey, blob, { 
        ttlMs: FLAGS.TTS_TTL_DAYS * 864e5,
        contentType: entry.mimeType || 'audio/mpeg'
      })

      // Supprimer l'ancien cache
      localStorage.removeItem(k)
      moved++

      console.debug(`[Cache][migrate] Migré: ${k} → ${newKey} (${blob.size} bytes)`)
    } catch (error) {
      console.warn(`[Cache][migrate] Échec pour ${k}:`, error)
      errors++
    }
  }

  // 2) Marquer la migration comme terminée
  localStorage.setItem(LEGACY_KEYS.MIGRATION_MARKER, Date.now().toString())
  localStorage.setItem('cache_migration_last_count', String(moved))

  console.info(`[Cache][migrate] Migration terminée: ${moved} fichiers migrés, ${errors} erreurs`)
  
  return { moved, errors }
}

/**
 * Vérifie si des anciens caches existent encore
 */
export function hasLegacyCache(): boolean {
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k?.startsWith(LEGACY_KEYS.TTS_PREFIX)) {
      return true
    }
  }
  return false
}

/**
 * Force une nouvelle migration (pour les tests)
 */
export function resetMigrationMarker(): void {
  localStorage.removeItem(LEGACY_KEYS.MIGRATION_MARKER)
  localStorage.removeItem('cache_migration_last_count')
  console.info('[Cache][migrate] Marqueur de migration réinitialisé')
}
