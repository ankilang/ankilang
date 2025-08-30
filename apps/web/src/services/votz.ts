const LOCAL = 'http://localhost:8888/.netlify/functions/votz'
const PROD = 'https://ankilangvotz.netlify.app/.netlify/functions/votz'

const BASE = import.meta.env.VITE_VOTZ_URL || (import.meta.env.DEV ? LOCAL : PROD)

export type VotzLanguage = 'languedoc' | 'gascon'

export type VotzRequest = {
  text: string
  language: VotzLanguage
  mode: 'file' | 'url'
}

export type VotzResponse = {
  success: boolean
  audioUrl?: string
  error?: string
}

/**
 * Génère une synthèse vocale via Votz pour l'occitan
 * @param text - Texte à synthétiser
 * @param language - Dialecte occitan (languedoc ou gascon)
 * @returns Promise<Blob> - Fichier audio MP3
 */
export async function ttsToBlob(text: string, language: VotzLanguage = 'languedoc'): Promise<Blob> {
  if (!text.trim()) {
    throw new Error('Le texte ne peut pas être vide')
  }

  try {
    const response = await fetch(BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.trim(),
        language,
        mode: 'file'
      } as VotzRequest)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Erreur TTS (${response.status}): ${errorText}`)
    }

    const blob = await response.blob()
    
    // Vérifier que c'est bien un fichier audio
    if (!blob.type.startsWith('audio/')) {
      throw new Error(`Type de fichier invalide: ${blob.type}`)
    }

    return blob
  } catch (error) {
    console.error('Erreur lors de la génération TTS:', error)
    throw new Error(`Impossible de générer l'audio: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
  }
}

/**
 * Génère une synthèse vocale et retourne une URL d'objet
 * @param text - Texte à synthétiser
 * @param language - Dialecte occitan
 * @returns Promise<string> - URL d'objet pour l'audio
 */
export async function ttsToObjectURL(text: string, language: VotzLanguage = 'languedoc'): Promise<string> {
  const blob = await ttsToBlob(text, language)
  return URL.createObjectURL(blob)
}

/**
 * Génère une synthèse vocale et la joue immédiatement
 * @param text - Texte à synthétiser
 * @param language - Dialecte occitan
 * @returns Promise<HTMLAudioElement> - Élément audio
 */
export async function playTTS(text: string, language: VotzLanguage = 'languedoc'): Promise<HTMLAudioElement> {
  const audioUrl = await ttsToObjectURL(text, language)
  const audio = new Audio(audioUrl)
  
  // Nettoyer l'URL après lecture
  audio.addEventListener('ended', () => {
    URL.revokeObjectURL(audioUrl)
  })
  
  await audio.play()
  return audio
}

/**
 * Vérifie si le texte est en occitan (heuristique simple)
 * @param text - Texte à vérifier
 * @returns boolean
 */
export function isOccitanText(text: string): boolean {
  const occitanWords = [
    'bonjorn', 'adieu', 'mercé', 'plan', 'aquí', 'aquò', 'que', 'se', 'de', 'lo', 'la', 'los', 'las',
    'un', 'una', 'amb', 'per', 'dins', 'sus', 'jos', 'abans', 'après', 'ara', 'ièr', 'deman'
  ]
  
  const words = text.toLowerCase().split(/\s+/)
  const occitanWordCount = words.filter(word => 
    occitanWords.some(occWord => word.includes(occWord))
  ).length
  
  return occitanWordCount > 0 && (occitanWordCount / words.length) > 0.1
}

/**
 * Détecte le dialecte probable à partir du texte
 * @param text - Texte occitan
 * @returns VotzLanguage
 */
export function detectDialect(text: string): VotzLanguage {
  const gasconMarkers = ['que', 'hèr', 'òm', 'ua', 'eth', 'ath']
  const languedocMarkers = ['que', 'ièr', 'òme', 'una', 'lo', 'la']
  
  const lowerText = text.toLowerCase()
  
  const gasconScore = gasconMarkers.reduce((score, marker) => 
    score + (lowerText.includes(marker) ? 1 : 0), 0
  )
  
  const languedocScore = languedocMarkers.reduce((score, marker) => 
    score + (lowerText.includes(marker) ? 1 : 0), 0
  )
  
  return gasconScore > languedocScore ? 'gascon' : 'languedoc'
}
