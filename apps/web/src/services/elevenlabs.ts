// ============================================
// ELEVENLABS SERVICE - VERCEL API
// ============================================
// Multilingual TTS service using Vercel API
// - ElevenLabs API for 29+ languages
// - Supports Multilingual v2 and Flash v2.5 models

import { createVercelApiClient, VercelApiError } from '../lib/vercel-api-client'
import { getSessionJWT } from './appwrite'
import type {
  ElevenLabsRequest,
  ElevenLabsModel,
} from '../types/ankilang-vercel-api'

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

// ============================================
// TTS Functions
// ============================================

/**
 * Generate multilingual TTS using ElevenLabs
 * @param request - ElevenLabs TTS request
 * @returns Promise<Blob> - MP3 audio file
 */
export async function generateTTS(request: ElevenLabsRequest): Promise<Blob> {
  if (!request.text?.trim()) {
    throw new Error('Le texte ne peut pas être vide')
  }

  const api = await getApiClient()

  try {
    console.log(`[ElevenLabs] Generating TTS: "${request.text.slice(0, 50)}..." (voice: ${request.voiceId})`)

    const result = await api.generateElevenlabsTTS({
      text: request.text.trim(),
      voiceId: request.voiceId,
      modelId: request.modelId || 'eleven_multilingual_v2',
      stability: request.stability,
      similarityBoost: request.similarityBoost,
      style: request.style,
      useSpeakerBoost: request.useSpeakerBoost,
      upload: false,
    })

    // Support both preview (audio base64) and potential persist (url)
    if ((result as any).audio) {
      const blob = base64ToBlob((result as any).audio)
      console.log(`[ElevenLabs] TTS generated successfully: ${blob.size} bytes (model: ${(result as any).modelId})`)
      return blob
    }
    if ((result as any).url) {
      const res = await fetch((result as any).url)
      if (!res.ok) throw new Error(`Failed to fetch persisted audio: ${res.status}`)
      const blob = await res.blob()
      console.log(`[ElevenLabs] TTS fetched from URL: ${blob.size} bytes`)
      return blob
    }
    throw new Error('Unexpected ElevenLabs response: neither audio nor url provided')
  } catch (error) {
    if (error instanceof VercelApiError) {
      console.error('[ElevenLabs] TTS error:', error.detail)
      throw new Error(`ElevenLabs TTS failed: ${error.detail}`)
    }
    console.error('[ElevenLabs] Error:', error)
    throw new Error(`ElevenLabs TTS failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate TTS with default Rachel voice
 */
export async function generateTTSWithRachel(text: string, modelId?: ElevenLabsModel): Promise<Blob> {
  return generateTTS({
    text,
    voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel
    modelId,
  })
}

/**
 * Persist ElevenLabs TTS (upload=true) et renvoie l'URL Appwrite
 */
export async function persistElevenlabsTTS(request: { text: string; voiceId: string; modelId?: ElevenLabsModel; fileId?: string }): Promise<{ fileId: string; url: string }> {
  const api = await getApiClient()
  const res = await api.generateElevenlabsTTS({
    text: request.text.trim(),
    voiceId: request.voiceId,
    modelId: request.modelId || 'eleven_multilingual_v2',
    upload: true,
    fileId: request.fileId,
  } as any)
  if ((res as any).url && (res as any).fileId) return res as any
  throw new Error('Persist ElevenLabs TTS failed: missing url/fileId')
}

// ============================================
// Popular Voices (re-export for convenience)
// ============================================

export { ELEVENLABS_VOICES } from '../types/ankilang-vercel-api'
