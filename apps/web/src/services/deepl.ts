export type TranslateItem = { translated: string; detectedSourceLang?: string; billedCharacters?: number }
export type TranslateResponse =
  | { success: true; original: string | string[]; targetLang: string; result: TranslateItem | TranslateItem[] }
  | { success: false; error: string }

const PROD = 'https://ankilangdeepl.netlify.app/.netlify/functions/translate'

const BASE_URL = import.meta.env.VITE_TRANSLATE_URL || PROD

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

export async function translate(text: string | string[], targetLang: string, sourceLang?: string) {
  // Récupérer le JWT Appwrite pour authentifier la requête
  const { getSessionJWT } = await import('./appwrite')
  const jwt = await getSessionJWT()
  
  if (!jwt) {
    throw new Error('User not authenticated. Please log in to use translation.')
  }
  
  const normalizedTarget = normalizeDeepLLang(targetLang)!
  const normalizedSource = normalizeDeepLLang(sourceLang ?? undefined)
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    },
    body: JSON.stringify({ text, targetLang: normalizedTarget, sourceLang: normalizedSource ?? null }),
  })
  
  if (!res.ok) {
    const errorText = await res.text()
    if (res.status === 401) {
      throw new Error('Authentication failed. Please log in again.')
    }
    throw new Error(`Translation failed: ${res.status} - ${errorText}`)
  }
  
  return (await res.json()) as TranslateResponse
}
