import { BrowserIDBCache, buildCacheKey } from '@ankilang/shared-cache'
import { ttsToBlob as votzTtsToBlob } from './votz'
import { ttsViaAppwrite } from './elevenlabs-appwrite'
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

// Cache IDB dédié TTS
const idb = new BrowserIDBCache('ankilang', 'tts-cache')
const ONE_WEEK = FLAGS.TTS_TTL_DAYS * 24 * 60 * 60 * 1000

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
  save = false,
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

    // 2) Tentative IDB avec métriques
    let cached: Blob | null = null
    try {
      cached = await idb.get<Blob>(key)
      metric('TTS.cache', { 
        hit: Boolean(cached), 
        lang: language_code, 
        textLength: text.length,
        provider: isOccitan(language_code) ? 'votz' : 'elevenlabs'
      })
    } catch (error) {
      console.warn('[TTS] Cache IDB indisponible:', error)
      metric('TTS.cache.error', { error: (error as Error).message })
      
      // Vérifier si le cache est désactivé à cause du quota
      if (idb.isDisabled?.()) {
        metric('Cache.disabled', { reason: 'quota_exceeded', adapter: 'browser-idb' })
      }
    }

    if (cached) {
      const url = URL.createObjectURL(cached)
      CacheManager.trackObjectUrl(url)
      return { 
        url, 
        mimeType: 'audio/mpeg', 
        provider: isOccitan(language_code) ? 'votz' : 'elevenlabs' 
      }
    }

  // 3) Génération
  let result: TTSResponse
  let blob: Blob | null = null

  try {
    if (isOccitan(language_code)) {
      // Votz uniquement pour l'occitan
      console.log('🔊 [TTS] Utilisation de Votz pour l\'occitan')
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
      // ElevenLabs → Appwrite uniquement (verrouillé)
      console.log('🔊 [TTS] Utilisation d\'ElevenLabs via Appwrite Functions')
      result = await ttsViaAppwrite({
        text,
        language_code,
        voice_id: voice_id ?? '21m00Tcm4TlvDq8ikWAM',
        save_to_storage: save,
        output_format: save ? 'mp3_44100_128' : 'mp3_22050_64',
      })
      
      if (!isPlayableUrl(result.url)) {
        throw new Error('URL audio invalide générée par ElevenLabs')
      }

      // Convertir data: → Blob pour cache local
      if (result.url.startsWith('data:')) {
        const resp = await fetch(result.url)
        blob = await resp.blob()
      } else {
        // Si on reçoit une URL http(s), on peut tenter de la récupérer pour mettre en cache local (best-effort)
        try {
          const resp = await fetch(result.url)
          blob = await resp.blob()
        } catch {
          blob = null
        }
      }
    }

    // 4) Set IDB (best-effort) avec métriques
    if (blob) {
      try {
        await idb.set(key, blob, { ttlMs: ONE_WEEK, contentType: 'audio/mpeg' })
        metric('TTS.cache.set', { 
          size: blob.size, 
          lang: language_code,
          provider: isOccitan(language_code) ? 'votz' : 'elevenlabs'
        })
      } catch (error) {
        console.warn('[TTS] Échec mise en cache:', error)
        metric('TTS.cache.set.error', { error: (error as Error).message })
      }
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
