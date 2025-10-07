import { ttsToBlob as votzTtsToBlob } from './votz'
import { ttsViaAppwrite } from './elevenlabs-appwrite'

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

// Détection de l'occitan
const isOccitan = (lang: string) => lang === 'oc' || lang === 'oc-gascon'

// Validation des URLs audio
const isPlayableUrl = (u?: string) =>
  !!u && (u.startsWith('data:') || u.startsWith('blob:') || /^https?:\/\//.test(u))

// Fonction supprimée car plus utilisée dans la nouvelle architecture

/**
 * NOUVELLE INTERFACE UNIFIÉE - Routeur TTS principal
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

  try {
    if (isOccitan(language_code)) {
      // Votz uniquement pour l'occitan
      console.log('🔊 [TTS] Utilisation de Votz pour l\'occitan')
      const blob = await votzTtsToBlob(text, 'languedoc')
      const url = URL.createObjectURL(blob)
      
      if (!isPlayableUrl(url)) {
        throw new Error('URL audio invalide générée par Votz')
      }
      
      return { 
        url, 
        mimeType: 'audio/mpeg', 
        provider: 'votz' as const 
      }
    }

    // ElevenLabs → Appwrite uniquement (verrouillé)
    console.log('🔊 [TTS] Utilisation d\'ElevenLabs via Appwrite Functions')
    const result = await ttsViaAppwrite({
      text,
      language_code,
      voice_id: voice_id ?? '21m00Tcm4TlvDq8ikWAM',
      save_to_storage: save,
    })
    
    if (!isPlayableUrl(result.url)) {
      throw new Error('URL audio invalide générée par ElevenLabs')
    }
    
    return result
    
  } catch (error) {
    console.error('TTS Error:', error)
    throw new Error(`TTS failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
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
