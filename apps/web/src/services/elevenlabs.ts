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
  language: ElevenLabsLanguage
  voice?: string // ID de la voix (optionnel)
  mode: 'file' | 'url'
}

export type ElevenLabsResponse = {
  success: boolean
  audioUrl?: string
  error?: string
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
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      },
      body: JSON.stringify({
        text: text.trim(),
        language,
        voice,
        mode: 'file'
      } as ElevenLabsRequest)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Erreur TTS ElevenLabs (${response.status}): ${errorText}`)
    }

    // ElevenLabs retourne directement le fichier audio
    const contentType = response.headers.get('content-type') || 'audio/mpeg'
    const arrayBuffer = await response.arrayBuffer()
    
    if (arrayBuffer.byteLength === 0) {
      throw new Error('Fichier audio vide reçu d\'ElevenLabs')
    }
    
    const blob = new Blob([arrayBuffer], { type: contentType })
    
    // Vérifier que c'est bien un fichier audio
    if (!contentType.startsWith('audio/')) {
      console.warn(`⚠️ Type MIME inattendu: ${contentType}, mais on continue...`)
    }

    console.log(`✅ Audio ElevenLabs généré avec succès:`, { size: blob.size, type: blob.type })
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
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      },
      body: JSON.stringify({
        text: text.trim(),
        language,
        voice,
        mode: 'url'
      } as ElevenLabsRequest)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Erreur TTS ElevenLabs (${response.status}): ${errorText}`)
    }

    const result = await response.json() as ElevenLabsResponse
    
    if (!result.success || !result.audioUrl) {
      throw new Error(result.error || 'Erreur inconnue lors de la génération TTS')
    }

    console.log(`✅ Audio ElevenLabs généré avec succès: ${result.audioUrl}`)
    return result.audioUrl
    
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
