export interface ReviradaRequest {
  text: string | string[]
  sourceLang: 'fra' | 'oci' | 'oci_gascon'
  targetLang: 'fra' | 'oci' | 'oci_gascon'
  contentType?: 'txt' | 'html' | 'xml'
}

export type ReviradaResponse =
  | { success: true; translated: string | string[]; languagePair?: string; words?: number; translationTime?: number }
  | { success: false; error: string }

const PROD = 'https://ankilangrevirada.netlify.app/.netlify/functions/revirada'

const BASE_URL = import.meta.env.VITE_REVI_URL || PROD

export async function reviradaTranslate(req: ReviradaRequest) {
  // Récupérer le JWT Appwrite pour authentifier la requête
  const { getSessionJWT } = await import('./appwrite')
  const jwt = await getSessionJWT()
  
  if (!jwt) {
    throw new Error('User not authenticated. Please log in to use translation.')
  }
  
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    },
    body: JSON.stringify({ ...req, contentType: req.contentType ?? 'txt' })
  })
  
  if (!res.ok) {
    const errorText = await res.text()
    if (res.status === 401) {
      throw new Error('Authentication failed. Please log in again.')
    }
    throw new Error(`Translation failed: ${res.status} - ${errorText}`)
  }
  
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

