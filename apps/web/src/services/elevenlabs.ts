const PROD = 'https://ankilangelevenlabs.netlify.app/.netlify/functions/elevenlabs'

// Utiliser l'URL de production par défaut (LOCAL disponible via variable d'env si besoin)
const BASE = import.meta.env.VITE_ELEVENLABS_URL || PROD

export type ElevenLabsLanguage = 
  | 'en' | 'en-US' | 'en-GB' | 'en-AU' | 'en-CA'
  | 'es' | 'es-ES' | 'es-MX' | 'es-AR'
  | 'fr' | 'fr-FR' | 'fr-CA'
  | 'de' | 'de-DE' | 'de-AT'
  | 'it' | 'it-IT'
  | 'pt' | 'pt-PT' | 'pt-BR'
  | 'nl' | 'nl-NL'
  | 'pl' | 'pl-PL'
  | 'sv' | 'sv-SE'
  | 'da' | 'da-DK'
  | 'nb' | 'nb-NO'
  | 'fi' | 'fi-FI'
  | 'ru' | 'ru-RU'
  | 'ja' | 'ja-JP'
  | 'ko' | 'ko-KR'
  | 'zh' | 'zh-CN' | 'zh-TW'
  | 'ar' | 'ar-SA'
  | 'tr' | 'tr-TR'
  | 'bg' | 'bg-BG'
  | 'cs' | 'cs-CZ'
  | 'el' | 'el-GR'
  | 'et' | 'et-EE'
  | 'he' | 'he-IL'
  | 'hu' | 'hu-HU'
  | 'id' | 'id-ID'
  | 'lt' | 'lt-LT'
  | 'lv' | 'lv-LV'
  | 'ro' | 'ro-RO'
  | 'sk' | 'sk-SK'
  | 'sl' | 'sl-SI'
  | 'th' | 'th-TH'
  | 'uk' | 'uk-UA'
  | 'vi' | 'vi-VN'

export type ElevenLabsRequest = {
  text: string
  voice_id: string
  model_id?: string
  language_code?: string
  voice_settings?: {
    stability?: number
    similarity_boost?: number
  }
  output_format?: string
  save_to_storage?: boolean
}

export type ElevenLabsResponse = {
  audio: string
  contentType: string
  size: number
  duration: number
  fileUrl?: string
  fileId?: string
}

// Mapping des voix génériques vers les IDs ElevenLabs
const VOICE_MAPPING: Record<string, string> = {
  'voice1': 'pNInz6obpgDQGcFmaJgB', // Voix masculine
  'voice2': 'EXAVITQu4vr4xnSDxMaL', // Voix féminine
  'voice3': 'VR6AewLTigWG4xSOukaG'  // Voix neutre
}

// Mapping des langues vers les codes ElevenLabs
const LANGUAGE_MAPPING: Record<string, string> = {
  'en': 'en-US',
  'en-US': 'en-US',
  'en-GB': 'en-GB',
  'en-AU': 'en-AU',
  'en-CA': 'en-CA',
  'es': 'es-ES',
  'es-ES': 'es-ES',
  'es-MX': 'es-MX',
  'es-AR': 'es-AR',
  'fr': 'fr-FR',
  'fr-FR': 'fr-FR',
  'fr-CA': 'fr-CA',
  'de': 'de-DE',
  'de-DE': 'de-DE',
  'de-AT': 'de-AT',
  'it': 'it-IT',
  'it-IT': 'it-IT',
  'pt': 'pt-PT',
  'pt-PT': 'pt-PT',
  'pt-BR': 'pt-BR',
  'nl': 'nl-NL',
  'nl-NL': 'nl-NL',
  'pl': 'pl-PL',
  'pl-PL': 'pl-PL',
  'sv': 'sv-SE',
  'sv-SE': 'sv-SE',
  'da': 'da-DK',
  'da-DK': 'da-DK',
  'nb': 'nb-NO',
  'nb-NO': 'nb-NO',
  'fi': 'fi-FI',
  'fi-FI': 'fi-FI',
  'ru': 'ru-RU',
  'ru-RU': 'ru-RU',
  'ja': 'ja-JP',
  'ja-JP': 'ja-JP',
  'ko': 'ko-KR',
  'ko-KR': 'ko-KR',
  'zh': 'zh-CN',
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-TW',
  'ar': 'ar-SA',
  'ar-SA': 'ar-SA',
  'tr': 'tr-TR',
  'tr-TR': 'tr-TR',
  'bg': 'bg-BG',
  'bg-BG': 'bg-BG',
  'cs': 'cs-CZ',
  'cs-CZ': 'cs-CZ',
  'el': 'el-GR',
  'el-GR': 'el-GR',
  'et': 'et-EE',
  'et-EE': 'et-EE',
  'he': 'he-IL',
  'he-IL': 'he-IL',
  'hu': 'hu-HU',
  'hu-HU': 'hu-HU',
  'id': 'id-ID',
  'id-ID': 'id-ID',
  'lt': 'lt-LT',
  'lt-LT': 'lt-LT',
  'lv': 'lv-LV',
  'lv-LV': 'lv-LV',
  'ro': 'ro-RO',
  'ro-RO': 'ro-RO',
  'sk': 'sk-SK',
  'sk-SK': 'sk-SK',
  'sl': 'sl-SI',
  'sl-SI': 'sl-SI',
  'th': 'th-TH',
  'th-TH': 'th-TH',
  'uk': 'uk-UA',
  'uk-UA': 'uk-UA',
  'vi': 'vi-VN',
  'vi-VN': 'vi-VN'
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

/**
 * Génère une synthèse vocale ElevenLabs et retourne le blob audio
 * @param text - Texte à synthétiser
 * @param language - Code langue (ex: 'en-US', 'fr-FR')
 * @param voice - ID de la voix (optionnel)
 * @returns Promise<Blob> - Fichier audio
 */
export async function ttsToBlob(text: string, language: ElevenLabsLanguage, voice?: string): Promise<Blob> {
  if (!text.trim()) {
    throw new Error('Le texte ne peut pas être vide')
  }

  // Récupérer le JWT Appwrite pour authentifier la requête
  const { getSessionJWT } = await import('./appwrite')
  const jwt = await getSessionJWT()
  
  if (!jwt) {
    throw new Error('User not authenticated. Please log in to use TTS.')
  }

  const url = `${BASE}`
  
  try {
    console.log(`🎵 Génération TTS ElevenLabs: "${text}" (${language})`)
    
    // Mapping des paramètres vers le format ElevenLabs
    const voiceId = voice ? VOICE_MAPPING[voice] || VOICE_MAPPING['voice1'] : VOICE_MAPPING['voice1']
    const languageCode = LANGUAGE_MAPPING[language] || 'en-US'
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      },
      body: JSON.stringify({
        text: text.trim(),
        voice_id: voiceId,
        model_id: 'eleven_turbo_v2_5',
        language_code: languageCode,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        },
        output_format: 'mp3_44100_128',
        save_to_storage: false
      } as ElevenLabsRequest)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Erreur TTS ElevenLabs (${response.status}): ${errorText}`)
    }

    // ElevenLabs retourne un JSON avec l'audio en base64
    const result = await response.json() as ElevenLabsResponse
    
    if (!result.audio) {
      throw new Error('Audio manquant dans la réponse ElevenLabs')
    }
    
    // Convertir base64 en blob
    const binaryString = atob(result.audio)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    
    const blob = new Blob([bytes], { type: result.contentType || 'audio/mpeg' })
    
    console.log(`✅ Audio ElevenLabs généré avec succès:`, { 
      size: blob.size, 
      type: blob.type,
      duration: result.duration,
      fileUrl: result.fileUrl 
    })
    return blob
    
  } catch (error) {
    console.error('Erreur lors de la génération TTS ElevenLabs:', error)
    throw new Error(`Impossible de générer l'audio: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
  }
}

/**
 * Génère une synthèse vocale ElevenLabs et retourne l'URL temporaire
 * @param text - Texte à synthétiser
 * @param language - Code langue (ex: 'en-US', 'fr-FR')
 * @param voice - ID de la voix (optionnel)
 * @returns Promise<string> - URL temporaire ElevenLabs pour l'audio
 */
export async function ttsToTempURL(text: string, language: ElevenLabsLanguage, voice?: string): Promise<string> {
  if (!text.trim()) {
    throw new Error('Le texte ne peut pas être vide')
  }

  // Récupérer le JWT Appwrite pour authentifier la requête
  const { getSessionJWT } = await import('./appwrite')
  const jwt = await getSessionJWT()
  
  if (!jwt) {
    throw new Error('User not authenticated. Please log in to use TTS.')
  }

  const url = `${BASE}`
  
  try {
    console.log(`🎵 Génération TTS ElevenLabs: "${text}" (${language})`)
    
    // Mapping des paramètres vers le format ElevenLabs
    const voiceId = voice ? VOICE_MAPPING[voice] || VOICE_MAPPING['voice1'] : VOICE_MAPPING['voice1']
    const languageCode = LANGUAGE_MAPPING[language] || 'en-US'
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      },
      body: JSON.stringify({
        text: text.trim(),
        voice_id: voiceId,
        model_id: 'eleven_turbo_v2_5',
        language_code: languageCode,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        },
        output_format: 'mp3_44100_128',
        save_to_storage: true // Sauvegarder pour obtenir une URL permanente
      } as ElevenLabsRequest)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Erreur TTS ElevenLabs (${response.status}): ${errorText}`)
    }

    const result = await response.json() as ElevenLabsResponse
    
    if (!result.audio) {
      throw new Error('Audio manquant dans la réponse ElevenLabs')
    }

    // Retourner l'URL du fichier si disponible, sinon convertir en base64
    if (result.fileUrl) {
      console.log(`✅ Audio ElevenLabs généré avec succès: ${result.fileUrl}`)
      return result.fileUrl
    } else {
      // Fallback: convertir l'audio base64 en data URL
      const dataUrl = `data:${result.contentType || 'audio/mpeg'};base64,${result.audio}`
      console.log(`✅ Audio ElevenLabs généré avec succès (base64)`)
      return dataUrl
    }
    
  } catch (error) {
    console.error('Erreur lors de la génération TTS ElevenLabs:', error)
    throw new Error(`Impossible de générer l'audio: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
  }
}

/**
 * Génère une synthèse vocale ElevenLabs et retourne une URL d'objet
 * @param text - Texte à synthétiser
 * @param language - Code langue (ex: 'en-US', 'fr-FR')
 * @param voice - ID de la voix (optionnel)
 * @returns Promise<string> - URL d'objet pour l'audio
 */
export async function ttsToDataURL(text: string, language: ElevenLabsLanguage, voice?: string): Promise<string> {
  const blob = await ttsToBlob(text, language, voice)
  return await blobToBase64(blob)
}
