// ============================================
// TRANSLATION SERVICE - VERCEL API
// ============================================
// Unified translation service using Vercel API
// - DeepL for multilingual translation (30+ languages)
// - Revirada for Occitan translation (languedocien/gascon)

import { createVercelApiClient, VercelApiError } from '../lib/vercel-api-client'
import { getSessionJWT } from './appwrite'
import type { DeepLSourceLang, DeepLTargetLang } from '../types/ankilang-vercel-api'

export type TranslateRequest = {
  sourceLang: string
  targetLang: string
  text: string
}

export type TranslateResponse = {
  translatedText: string
  provider?: 'revirada' | 'deepl'
}

let apiClient: ReturnType<typeof createVercelApiClient> | null = null

async function getApiClient() {
  if (!apiClient) {
    const jwt = await getSessionJWT()
    if (!jwt) throw new Error('User not authenticated')
    apiClient = createVercelApiClient(jwt)
  }
  return apiClient
}

/**
 * Détecte si la traduction doit utiliser Revirada (occitan) ou DeepL
 */
function shouldUseRevirada(sourceLang: string, targetLang: string): boolean {
  const isOccitan = (lang: string) => lang === 'oc' || lang.startsWith('oc-')
  return isOccitan(sourceLang) || isOccitan(targetLang)
}

/**
 * Normalise les codes langue pour DeepL (lowercase → UPPERCASE)
 */
function normalizeDeepLLang(lang: string): string {
  return lang.toUpperCase()
}

/**
 * Traduit un texte en détectant automatiquement le service approprié
 * @param req - TranslateRequest { text, sourceLang, targetLang }
 * @param opts - Options (signal pour AbortController)
 * @returns Promise<TranslateResponse>
 */
export async function translate(
  req: TranslateRequest,
  _opts?: { signal?: AbortSignal }
): Promise<TranslateResponse> {
  const api = await getApiClient()

  try {
    // Routage Revirada vs DeepL
    if (shouldUseRevirada(req.sourceLang, req.targetLang)) {
      // Traduction occitan via Revirada
      const direction = req.targetLang === 'oc' || req.targetLang.startsWith('oc-') ? 'fr-oc' : 'oc-fr'
      const dialect = req.targetLang === 'oc-gascon' || req.sourceLang === 'oc-gascon' ? 'gascon' : 'lengadocian'

      console.log(`[Translate] Using Revirada: ${direction} (${dialect})`)

      const result = await api.translateWithRevirada({
        text: req.text,
        direction,
        dialect
      })

      return {
        translatedText: result.translatedText,
        provider: 'revirada'
      }
    } else {
      // Traduction multilingue via DeepL
      console.log(`[Translate] Using DeepL: ${req.sourceLang} → ${req.targetLang}`)

      const result = await api.translateWithDeepL({
        text: req.text,
        sourceLang: normalizeDeepLLang(req.sourceLang) as DeepLSourceLang,
        targetLang: normalizeDeepLLang(req.targetLang) as DeepLTargetLang
      })

      return {
        translatedText: result.translatedText,
        provider: 'deepl'
      }
    }
  } catch (error) {
    if (error instanceof VercelApiError) {
      // Erreur API Vercel (RFC 7807)
      console.error('[Translate] Vercel API error:', {
        status: error.status,
        title: error.title,
        detail: error.detail
      })
      throw new Error(`Translation failed: ${error.detail}`)
    }
    // Erreur réseau ou autre
    console.error('[Translate] Error:', error)
    throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Traduction occitan uniquement (wrapper pour clarté)
 */
export async function translateOccitan(
  text: string,
  direction: 'fr-oc' | 'oc-fr',
  dialect: 'lengadocian' | 'gascon' = 'lengadocian'
): Promise<TranslateResponse> {
  const api = await getApiClient()

  console.log(`[Translate Occitan] ${direction} (${dialect})`)

  const result = await api.translateWithRevirada({
    text,
    direction,
    dialect
  })

  return {
    translatedText: result.translatedText,
    provider: 'revirada'
  }
}

/**
 * Traduction DeepL uniquement (wrapper pour clarté)
 */
export async function translateMultilingual(
  text: string,
  sourceLang: DeepLSourceLang,
  targetLang: DeepLTargetLang
): Promise<TranslateResponse> {
  const api = await getApiClient()

  console.log(`[Translate Multilingual] ${sourceLang} → ${targetLang}`)

  const result = await api.translateWithDeepL({
    text,
    sourceLang,
    targetLang
  })

  return {
    translatedText: result.translatedText,
    provider: 'deepl'
  }
}
