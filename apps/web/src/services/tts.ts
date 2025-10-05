import { ttsToBlob as votzTtsToBlob } from './votz'
import { ttsToBlob as elevenLabsTtsToBlob, type ElevenLabsLanguage } from './elevenlabs'

export type TTSRequest = {
  lang: string
  text: string
  provider?: 'votz' | 'elevenlabs' // Nouveau paramètre
  voice?: string // Pour ElevenLabs
}

export type TTSResponse = {
  audioUrl: string
}

export async function generateTTS(req: TTSRequest, opts?: { signal?: AbortSignal }): Promise<TTSResponse> {
  const { getSessionJWT } = await import('./appwrite')
  const jwt = await getSessionJWT()
  
  if (!jwt) {
    throw new Error('User not authenticated. Please log in to use TTS.')
  }
  
  // TEMPORAIRE: Forcer Votz pour éviter les erreurs CORS ElevenLabs
  // const isOccitan = req.lang === 'oc' || req.lang === 'oc-gascon'
  const provider = req.provider || 'votz' // (isOccitan ? 'votz' : 'elevenlabs')
  
  try {
    let audioUrl: string
    
    if (provider === 'votz') {
      // Utiliser Votz pour l'occitan
      const blob = await votzTtsToBlob(req.text, 'languedoc')
      audioUrl = await blobToBase64(blob)
    } else {
      // Utiliser ElevenLabs pour les autres langues
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

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}


