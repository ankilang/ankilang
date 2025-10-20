import { createVercelApiClient } from '../lib/vercel-api-client'
import type { DeepLRequest, DeepLResponse } from '../types/ankilang-vercel-api'

export interface TranslateItem { translated: string; detectedSourceLang?: string; billedCharacters?: number }
export type TranslateResponse =
  | { success: true; original: string | string[]; targetLang: string; result: TranslateItem | TranslateItem[] }
  | { success: false; error: string }

function normalizeDeepLLang(code?: string | null): string | undefined {
  if (!code) return undefined
  const c = code.toLowerCase()
  // Allow overriding variants via env
  const EN_VARIANT = (import.meta.env.VITE_DEEPL_EN_VARIANT as string | undefined)?.toUpperCase()
  const PT_VARIANT = (import.meta.env.VITE_DEEPL_PT_VARIANT as string | undefined)?.toUpperCase()
  const ZH_VARIANT = (import.meta.env.VITE_DEEPL_ZH_VARIANT as string | undefined)?.toUpperCase()

  const map: Record<string, string> = {
    // Variantes/alias DeepL
    no: 'NB', // Norwegian Bokmål
    nb: 'NB',
    pt: PT_VARIANT === 'PT-BR' ? 'PT-BR' : 'PT-PT', // défaut PT-PT
    'pt-pt': 'PT-PT',
    'pt-br': 'PT-BR',
    // DeepL impose EN-GB ou EN-US
    en: EN_VARIANT === 'EN-US' ? 'EN-US' : 'EN-GB',
    es: 'ES',
    de: 'DE',
    fr: 'FR',
    it: 'IT',
    nl: 'NL',
    pl: 'PL',
    sv: 'SV',
    da: 'DA',
    fi: 'FI',
    ru: 'RU',
    ja: 'JA',
    ko: 'KO',
    // Chinois: DeepL recommande ZH-HANS (simplifié) ou ZH-HANT (traditionnel)
    zh: ZH_VARIANT === 'ZH-HANT' ? 'ZH-HANT' : 'ZH-HANS',
    'zh-hans': 'ZH-HANS',
    'zh-hant': 'ZH-HANT',
    ar: 'AR',
    tr: 'TR'
  }
  return map[c] || c.toUpperCase()
}

export async function translate(text: string | string[], targetLang: string, sourceLang?: string): Promise<TranslateResponse> {
  // JWT pour Vercel API
  const { getSessionJWT } = await import('./appwrite')
  const jwt = await getSessionJWT()
  if (!jwt) throw new Error('User not authenticated. Please log in to use translation.')

  const api = createVercelApiClient(jwt)

  // Normalisation des codes langues (DeepL attend UPPERCASE/variants spécifiques)
  const normalizedTarget = normalizeDeepLLang(targetLang)!
  const normalizedSource = normalizeDeepLLang(sourceLang ?? undefined)

  // La Vercel API prend un champ text: string — on concatène prudemment si un tableau est fourni
  const textStr = Array.isArray(text) ? text.join('\n') : text

  try {
    const req: DeepLRequest = {
      text: textStr,
      targetLang: normalizedTarget as any,
      sourceLang: (normalizedSource as any) || (normalizedTarget === 'EN-US' || normalizedTarget === 'EN-GB' ? 'FR' : 'EN-GB'),
    }
    const res: DeepLResponse = await api.translateWithDeepL(req)
    // Mapper vers l'ancienne forme attendue par le front
    const item: TranslateItem = {
      translated: res.translatedText,
      detectedSourceLang: res.sourceLang,
    }
    return { success: true, original: text, targetLang: normalizedTarget, result: item }
  } catch (e: any) {
    return { success: false, error: e?.message || 'DeepL translation error' }
  }
}
