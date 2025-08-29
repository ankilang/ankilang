export type TranslateItem = { translated: string; detectedSourceLang?: string; billedCharacters?: number }
export type TranslateResponse =
  | { success: true; original: string | string[]; targetLang: string; result: TranslateItem | TranslateItem[] }
  | { success: false; error: string }

const LOCAL = 'http://localhost:8888/.netlify/functions/translate'
const PROD = '/.netlify/functions/translate'

const BASE_URL = import.meta.env.VITE_TRANSLATE_URL || (import.meta.env.DEV ? LOCAL : PROD)

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
  const normalizedTarget = normalizeDeepLLang(targetLang)!
  const normalizedSource = normalizeDeepLLang(sourceLang ?? undefined)
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, targetLang: normalizedTarget, sourceLang: normalizedSource ?? null }),
  })
  return (await res.json()) as TranslateResponse
}
