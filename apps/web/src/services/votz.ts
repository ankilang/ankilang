const PROD = 'https://ankilangvotz.netlify.app/.netlify/functions/votz'

// Utiliser l'URL de production par défaut (LOCAL disponible via variable d'env si besoin)
const BASE = import.meta.env.VITE_VOTZ_URL || PROD

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


function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
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

  // Essayer d'abord l'URL configurée, puis fallback sur PROD
  const urlsToTry = [
    BASE,
    ...(BASE !== PROD ? [PROD] : [])
  ]

  for (let i = 0; i < urlsToTry.length; i++) {
    const url = urlsToTry[i]
    try {
      console.log(`🔄 Tentative ${i + 1}/${urlsToTry.length}: ${url}`)
      
      const response = await fetch(url, {
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

      // En mode 'file', Votz retourne directement le fichier audio en base64
      const contentType = response.headers.get('content-type') || 'audio/mpeg'
      const arrayBuffer = await response.arrayBuffer()
      
      if (arrayBuffer.byteLength === 0) {
        throw new Error('Fichier audio vide reçu de Votz')
      }
      
      const blob = new Blob([arrayBuffer], { type: contentType })
      
      // Vérifier que c'est bien un fichier audio
      if (!contentType.startsWith('audio/')) {
        console.warn(`⚠️ Type MIME inattendu: ${contentType}, mais on continue...`)
      }

      console.log(`✅ Audio généré avec succès via ${url}:`, { size: blob.size, type: blob.type })
      return blob
      
    } catch (error) {
      console.warn(`❌ Échec avec ${url}:`, error)
      
      // Si c'est la dernière tentative, lancer l'erreur
      if (i === urlsToTry.length - 1) {
        console.error('Erreur lors de la génération TTS:', error)
        throw new Error(`Impossible de générer l'audio: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
      }
    }
  }

  // Cette ligne ne devrait jamais être atteinte
  throw new Error('Toutes les tentatives ont échoué')
}

/**
 * Génère une synthèse vocale et retourne l'URL temporaire Votz
 * @param text - Texte à synthétiser
 * @param language - Dialecte occitan
 * @returns Promise<string> - URL temporaire Votz pour l'audio
 */
export async function ttsToTempURL(text: string, language: VotzLanguage = 'languedoc'): Promise<string> {
  if (!text.trim()) {
    throw new Error('Le texte ne peut pas être vide')
  }

  // Essayer d'abord l'URL configurée, puis fallback sur PROD
  const urlsToTry = [
    BASE,
    ...(BASE !== PROD ? [PROD] : [])
  ]

  for (let i = 0; i < urlsToTry.length; i++) {
    const url = urlsToTry[i]
    try {
      console.log(`🔄 Tentative ${i + 1}/${urlsToTry.length}: ${url}`)
      
      const response = await fetch(url, {
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

      // En mode 'file', Votz retourne directement le fichier audio
      const contentType = response.headers.get('content-type') || 'audio/mpeg'
      const arrayBuffer = await response.arrayBuffer()
      
      if (arrayBuffer.byteLength === 0) {
        throw new Error('Fichier audio vide reçu de Votz')
      }
      
      // Convertir en blob base64 pour l'export
      const blob = new Blob([arrayBuffer], { type: contentType })
      const base64 = await blobToBase64(blob)
      
      console.log(`✅ Audio généré avec succès via ${url}:`, { size: blob.size, type: blob.type })
      return base64
      
    } catch (error) {
      console.warn(`❌ Échec avec ${url}:`, error)
      
      // Si c'est la dernière tentative, lancer l'erreur
      if (i === urlsToTry.length - 1) {
        console.error('Erreur lors de la génération TTS:', error)
        throw new Error(`Impossible de générer l'audio: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
      }
    }
  }

  // Cette ligne ne devrait jamais être atteinte
  throw new Error('Toutes les tentatives ont échoué')
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
