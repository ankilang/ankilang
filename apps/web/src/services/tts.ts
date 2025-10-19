import { BrowserIDBCache, AppwriteStorageCache, buildCacheKey } from '@ankilang/shared-cache'
import { Storage, Permission, Role } from 'appwrite'
import { createVercelApiClient } from '../lib/vercel-api-client'
import { getSessionJWT } from './appwrite'
import client from './appwrite'
import { ttsToBlob as votzTtsToBlob } from './votz'
import { generateTTS as elevenlabsGenerateTTS } from './elevenlabs'
import { metric, time } from './cache/metrics'
import { FLAGS } from '../config/flags'
import { CacheManager } from './cache-manager'

// Types pour la nouvelle interface unifiée
export type TTSRequest = {
  text: string
  language_code: string
  voice_id?: string
  save?: boolean
}

export type TTSResponse = {
  url: string
  mimeType: string
  provider: 'votz' | 'elevenlabs'
}

// Cache multi-niveau pour TTS
const idb = new BrowserIDBCache('ankilang', 'tts-cache')
const ONE_WEEK = FLAGS.TTS_TTL_DAYS * 24 * 60 * 60 * 1000

// Cache Appwrite Storage pour partage inter-utilisateurs
// Utilise des dossiers virtuels pour organiser par provider
// Appwrite deps wrapper to ensure Blob returns and proper File upload
const storageSdk = new Storage(client)
const appwriteDeps = {
  storage: {
    getFileView: async (bucketId: string, fileId: string) => {
      const url = storageSdk.getFileView(bucketId, fileId).toString()
      const res = await fetch(url)
      if (!res.ok) throw new Error(`getFileView fetch failed: ${res.status}`)
      return await res.blob()
    },
    createFile: async (bucketId: string, fileId: string, blob: Blob, permissions?: string[]) => {
      const file = new File([blob], fileId, { type: blob.type || 'application/octet-stream' })
      // Convert legacy 'role:all' permissions to new format
      const appwritePermissions = permissions?.includes('role:all')
        ? [Permission.read(Role.any())]
        : permissions
      await storageSdk.createFile(bucketId, fileId, file, appwritePermissions)
    },
    getFile: (bucketId: string, fileId: string) => storageSdk.getFile(bucketId, fileId),
    deleteFile: (bucketId: string, fileId: string) => storageSdk.deleteFile(bucketId, fileId),
  }
}

const votzCache = new AppwriteStorageCache(
  appwriteDeps,
  import.meta.env.VITE_APPWRITE_BUCKET_ID || 'flashcard-images',
  'cache/tts/votz'
)

const elevenlabsCache = new AppwriteStorageCache(
  appwriteDeps,
  import.meta.env.VITE_APPWRITE_BUCKET_ID || 'flashcard-images',
  'cache/tts/elevenlabs'
)

// Détection de l'occitan
const isOccitan = (lang: string) => lang === 'oc' || lang === 'oc-gascon'

// Validation des URLs audio
const isPlayableUrl = (u?: string) =>
  !!u && (u.startsWith('data:') || u.startsWith('blob:') || /^https?:\/\//.test(u))

// Fonction supprimée car plus utilisée dans la nouvelle architecture

/**
 * NOUVELLE INTERFACE UNIFIÉE - Routeur TTS principal avec cache IDB et métriques
 * Force Appwrite pour ElevenLabs, garde Votz pour l'occitan
 */
export async function generateTTS({
  text,
  language_code,
  voice_id,
  save: _save = false, // Prefix with _ to indicate intentionally unused (for future use)
}: TTSRequest): Promise<TTSResponse> {
  if (!text?.trim()) {
    throw new Error('Le texte ne peut pas être vide')
  }

  return time('TTS.generate', async () => {
    // 1) Clé de cache déterministe
    const key = await buildCacheKey({
      namespace: 'tts',
      lang: language_code,
      voice: voice_id ?? '21m00Tcm4TlvDq8ikWAM',
      speed: '0.80', // vitesse par défaut souhaitée
      text,
    })

    // 2) Tentative cache IDB (local, rapide)
    let cached: Blob | null = null
    try {
      cached = await idb.get<Blob>(key)
      if (cached) {
        console.log('[TTS] ✅ Hit cache IDB')
        metric('TTS.cache', {
          hit: true,
          source: 'idb',
          lang: language_code,
          textLength: text.length,
          provider: isOccitan(language_code) ? 'votz' : 'elevenlabs'
        })

        const url = URL.createObjectURL(cached)
        CacheManager.trackObjectUrl(url)
        return {
          url,
          mimeType: 'audio/mpeg',
          provider: isOccitan(language_code) ? 'votz' : 'elevenlabs'
        }
      }
    } catch (error) {
      console.warn('[TTS] Cache IDB indisponible:', error)
      metric('TTS.cache.error', { adapter: 'idb', error: (error as Error).message })

      // Vérifier si le cache est désactivé à cause du quota
      if (idb.isDisabled?.()) {
        metric('Cache.disabled', { reason: 'quota_exceeded', adapter: 'browser-idb' })
      }
    }

    // 3) Lecture Appwrite en preview désactivée pour réduire le bruit et la complexité

    // 4) Miss complet → Génération via API
    console.log('[TTS] ❌ Miss cache complet, génération...')
    metric('TTS.cache', {
      hit: false,
      lang: language_code,
      textLength: text.length,
      provider: isOccitan(language_code) ? 'votz' : 'elevenlabs'
    })

    // 5) Génération via API
    let result: TTSResponse
    let blob: Blob | null = null

    try {
      if (isOccitan(language_code)) {
        // Votz uniquement pour l'occitan
        console.log('🔊 [TTS] Génération Votz pour l\'occitan')
        blob = await votzTtsToBlob(text, 'languedoc')
        const url = URL.createObjectURL(blob)
        CacheManager.trackObjectUrl(url)

        if (!isPlayableUrl(url)) {
          throw new Error('URL audio invalide générée par Votz')
        }

        result = {
          url,
          mimeType: 'audio/mpeg',
          provider: 'votz' as const
        }
      } else {
        // ElevenLabs → Vercel API
        console.log('🔊 [TTS] Génération ElevenLabs via Vercel API')
        blob = await elevenlabsGenerateTTS({
          text,
          voiceId: voice_id ?? '21m00Tcm4TlvDq8ikWAM',
          modelId: 'eleven_multilingual_v2',
        })

        const url = URL.createObjectURL(blob)
        CacheManager.trackObjectUrl(url)

        if (!isPlayableUrl(url)) {
          throw new Error('URL audio invalide générée par ElevenLabs')
        }

        result = {
          url,
          mimeType: 'audio/mpeg',
          provider: 'elevenlabs' as const
        }
      }

      // 6) Sauvegarde dans les caches (IDB + Appwrite)
      if (blob) {
        // 6a) Cache IDB (local)
        try {
          await idb.set(key, blob, { ttlMs: ONE_WEEK, contentType: 'audio/mpeg' })
          console.log('[TTS] ✅ Sauvegardé dans cache IDB')
          metric('TTS.cache.set', {
            adapter: 'idb',
            size: blob.size,
            lang: language_code,
            provider: isOccitan(language_code) ? 'votz' : 'elevenlabs'
          })
        } catch (error) {
          console.warn('[TTS] Échec sauvegarde cache IDB:', error)
          metric('TTS.cache.set.error', { adapter: 'idb', error: (error as Error).message })
        }

        // 6b) (désactivé en preview) Pas d'upload Appwrite ici pour éviter les orphelins
      }

      return result
    
  } catch (error) {
    console.error('TTS Error:', error)
    throw new Error(`TTS failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
  })
}

/**
 * NOUVELLE INTERFACE UNIFIÉE - Lecture audio directe
 */
export async function playTTS({
  text,
  language_code,
  voice_id,
}: {
  text: string
  language_code: string
  voice_id?: string
}): Promise<HTMLAudioElement> {
  try {
    const result = await generateTTS({
      text,
      language_code,
      voice_id,
      save: false
    })
    
    const audio = new Audio(result.url)
    
    // Nettoyer l'URL après lecture
    audio.addEventListener('ended', () => {
      if (result.url.startsWith('blob:')) {
        URL.revokeObjectURL(result.url)
      }
    })
    
    audio.addEventListener('error', () => {
      if (result.url.startsWith('blob:')) {
        URL.revokeObjectURL(result.url)
      }
    })
    
    return audio
    
  } catch (error) {
    console.error('TTS Play Error:', error)
    throw new Error(`TTS play failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Persist TTS (upload=true) et renvoie l'URL Appwrite
 */
export async function persistTTS({
  text,
  language_code,
  voice_id,
}: {
  text: string
  language_code: string
  voice_id?: string
}): Promise<{ url: string }> {
  const oc = isOccitan(language_code)
  if (oc) {
    const jwt = await getSessionJWT()
    if (!jwt) throw new Error('User not authenticated')
    const client = createVercelApiClient(jwt)
    const res: any = await client.generateVotzTTS({ text, language: 'languedoc', mode: 'file', upload: true } as any)
    if (res?.url) return { url: res.url }
    throw new Error('Persist Votz TTS failed')
  }
  const { persistElevenlabsTTS } = await import('./elevenlabs')
  const persisted = await persistElevenlabsTTS({ text, voiceId: voice_id ?? '21m00Tcm4TlvDq8ikWAM' })
  return { url: persisted.url }
}
