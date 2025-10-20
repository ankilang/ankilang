// ============================================
// VOTZ SERVICE - VERCEL API
// ============================================
// Occitan TTS service using Vercel API
// - Votz API for Languedocian and Gascon

import { createVercelApiClient, VercelApiError } from '../lib/vercel-api-client'
import { getSessionJWT } from './appwrite'
import { CacheManager } from './cache-manager'
import type { VotzLanguage } from '../types/ankilang-vercel-api'

// Re-export VotzLanguage for convenience
export type { VotzLanguage }

// ============================================
// API Client Management
// ============================================

let apiClient: ReturnType<typeof createVercelApiClient> | null = null

async function getApiClient() {
  if (!apiClient) {
    const jwt = await getSessionJWT()
    if (!jwt) throw new Error('User not authenticated')
    apiClient = createVercelApiClient(jwt)
  }
  return apiClient
}

// ============================================
// Helper Functions
// ============================================

/**
 * Convert base64 string to Blob
 */
function base64ToBlob(base64: string, mimeType = 'audio/mpeg'): Blob {
  const byteCharacters = atob(base64)
  const byteArray = new Uint8Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteArray[i] = byteCharacters.charCodeAt(i)
  }
  return new Blob([byteArray], { type: mimeType })
}

/**
 * Convert Blob to base64 data URL
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => { resolve(reader.result as string); }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// ============================================
// TTS Functions
// ============================================

/**
 * Generate Occitan TTS and return as Blob (preview mode)
 * @param text - Text to synthesize
 * @param language - Occitan dialect (languedoc or gascon)
 * @returns Promise<Blob> - MP3 audio file
 */
export async function ttsToBlob(text: string, language: VotzLanguage = 'languedoc'): Promise<Blob> {
  if (!text.trim()) {
    throw new Error('Le texte ne peut pas être vide')
  }

  const api = await getApiClient()

  try {
    console.log(`[Votz] Generating TTS (preview): "${text.slice(0, 50)}..." (${language})`)

    const result = await api.generateVotzTTS({
      text: text.trim(),
      language,
      mode: 'file',
      upload: false, // Preview mode: return base64
    })

    // VotzFileResponse returns base64 audio
    if ('audio' in result && result.mode === 'file') {
      const blob = base64ToBlob(result.audio)
      console.log(`[Votz] TTS generated successfully: ${blob.size} bytes`)
      return blob
    }

    // Unexpected response format
    throw new Error(`Expected VotzFileResponse, got: ${JSON.stringify(result).slice(0, 200)}`)
  } catch (error) {
    if (error instanceof VercelApiError) {
      console.error('[Votz] TTS error:', error.detail)
      throw new Error(`Votz TTS failed: ${error.detail}`)
    }
    console.error('[Votz] Error:', error)
    throw new Error(`Votz TTS failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate Occitan TTS and return as base64 data URL
 * @param text - Text to synthesize
 * @param language - Occitan dialect
 * @returns Promise<string> - Base64 data URL
 */
export async function ttsToTempURL(text: string, language: VotzLanguage = 'languedoc'): Promise<string> {
  const blob = await ttsToBlob(text, language)
  return blobToBase64(blob)
}

/**
 * Generate Occitan TTS and return as object URL
 * @param text - Text to synthesize
 * @param language - Occitan dialect
 * @returns Promise<string> - Object URL
 */
export async function ttsToObjectURL(text: string, language: VotzLanguage = 'languedoc'): Promise<string> {
  const blob = await ttsToBlob(text, language)
  const url = URL.createObjectURL(blob)
  CacheManager.trackObjectUrl(url)
  return url
}

/**
 * Generate Occitan TTS and play it immediately
 * @param text - Text to synthesize
 * @param language - Occitan dialect
 * @returns Promise<HTMLAudioElement> - Audio element
 */
export async function playTTS(text: string, language: VotzLanguage = 'languedoc'): Promise<HTMLAudioElement> {
  const audioUrl = await ttsToObjectURL(text, language)
  const audio = new Audio(audioUrl)

  // Clean up URL after playback
  audio.addEventListener('ended', () => {
    URL.revokeObjectURL(audioUrl)
  })

  audio.addEventListener('error', () => {
    URL.revokeObjectURL(audioUrl)
  })

  await audio.play()
  return audio
}

/**
 * Persist Votz TTS (upload=true) and return Appwrite URL
 * @param request - Votz TTS request
 * @returns Promise<{ fileId: string; url: string }> - Appwrite Storage reference
 */
export async function persistVotzTTS(request: {
  text: string;
  language?: VotzLanguage;
  fileId?: string
}): Promise<{ fileId: string; url: string }> {
  const api = await getApiClient()

  console.log(`[Votz] Persisting TTS: "${request.text.slice(0, 50)}..." (${request.language || 'languedoc'})`)

  const result = await api.generateVotzTTS({
    text: request.text.trim(),
    language: request.language || 'languedoc',
    mode: 'file',
    upload: true, // Upload to Appwrite Storage
    filename: request.fileId,
  })

  // VotzUrlResponse returns fileId and url
  if ('url' in result && 'fileId' in result) {
    console.log(`[Votz] TTS persisted successfully: ${result.fileId}`)
    return { fileId: result.fileId, url: result.url }
  }

  throw new Error('Persist Votz TTS failed: missing url/fileId in response')
}

// ============================================
// Helper Functions for Occitan Detection
// ============================================

/**
 * Check if text is in Occitan (simple heuristic)
 * @param text - Text to check
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
 * Detect probable dialect from text
 * @param text - Occitan text
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
