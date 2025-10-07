import { ttsToBlob as votzTtsToBlob } from './votz'
import { ttsToBlob as elevenLabsTtsToBlob, type ElevenLabsLanguage } from './elevenlabs-appwrite'

export type TTSRequest = {
  lang: string
  text: string
  provider?: 'votz' | 'elevenlabs' // Nouveau paramètre
  voice?: string // Pour ElevenLabs
}

export type TTSResponse = {
  audioUrl: string
}

/**
 * Convertit un blob en base64
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export async function generateTTS(req: TTSRequest, opts?: { signal?: AbortSignal }): Promise<TTSResponse> {
  // Détecter automatiquement le provider si non spécifié
  const isOccitan = req.lang === 'oc' || req.lang === 'oc-gascon'
  const provider = req.provider || (isOccitan ? 'votz' : 'elevenlabs')
  
  try {
    let audioUrl: string
    
    if (provider === 'votz') {
      // Utiliser Votz pour l'occitan
      console.log('🔊 [TTS] Utilisation de Votz pour l\'occitan')
      const blob = await votzTtsToBlob(req.text, 'languedoc')
      audioUrl = await blobToBase64(blob)
    } else {
      // Utiliser ElevenLabs via Appwrite Functions
      console.log('🔊 [TTS] Utilisation d\'ElevenLabs via Appwrite Functions')
      const blob = await elevenLabsTtsToBlob(req.text, req.lang as ElevenLabsLanguage, req.voice)
      audioUrl = await blobToBase64(blob)
    }
    
    // Vérifier si la requête a été annulée
    if (opts?.signal?.aborted) {
      throw new Error('TTS request was aborted')
    }
    
    return { audioUrl }
    
  } catch (error) {
    console.error('TTS Error:', error)
    throw new Error(`TTS failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function playTTS(req: TTSRequest): Promise<HTMLAudioElement> {
  const isOccitan = req.lang === 'oc' || req.lang === 'oc-gascon'
  const provider = req.provider || (isOccitan ? 'votz' : 'elevenlabs')
  
  try {
    if (provider === 'votz') {
      // Utiliser Votz pour l'occitan
      console.log('🔊 [TTS] Utilisation de Votz pour l\'occitan')
      const { playTTS: playVotzTTS } = await import('./votz')
      return await playVotzTTS(req.text, 'languedoc')
    } else {
      // Utiliser ElevenLabs via Appwrite Functions
      console.log('🔊 [TTS] Utilisation d\'ElevenLabs via Appwrite Functions')
      const { playTTS: playElevenLabsTTS } = await import('./elevenlabs-appwrite')
      return await playElevenLabsTTS(req.text, req.lang as ElevenLabsLanguage, req.voice)
    }
  } catch (error) {
    console.error('TTS Play Error:', error)
    throw new Error(`TTS play failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
