export type ReviradaRequest = {
  text: string | string[]
  sourceLang: 'fra' | 'oci' | 'oci_gascon'
  targetLang: 'fra' | 'oci' | 'oci_gascon'
  contentType?: 'txt' | 'html' | 'xml'
}

export type ReviradaResponse =
  | { success: true; translated: string | string[]; languagePair?: string; words?: number; translationTime?: number }
  | { success: false; error: string }

const LOCAL = 'http://localhost:8888/.netlify/functions/revirada'
const PROD = '/.netlify/functions/revirada'

const BASE_URL = import.meta.env.VITE_REVI_URL || (import.meta.env.DEV ? LOCAL : PROD)

export async function reviradaTranslate(req: ReviradaRequest) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...req, contentType: req.contentType ?? 'txt' })
  })
  return (await res.json()) as ReviradaResponse
}

export function toReviCode(lang: string): 'fra' | 'oci' | 'oci_gascon' {
  const l = lang.toLowerCase()
  if (l === 'fr' || l === 'fra') return 'fra'
  if (l === 'oc' || l === 'oci') return 'oci'
  if (l === 'oc-gascon' || l === 'oci_gascon') return 'oci_gascon'
  // Default safe fallback
  return 'oci'
}

