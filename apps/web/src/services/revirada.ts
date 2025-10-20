import { createVercelApiClient } from '../lib/vercel-api-client'
import type { ReviradaRequest as VReviRequest, ReviradaResponse as VReviResponse } from '../types/ankilang-vercel-api'

export interface ReviradaRequest {
  text: string | string[]
  sourceLang: 'fra' | 'oci' | 'oci_gascon'
  targetLang: 'fra' | 'oci' | 'oci_gascon'
  contentType?: 'txt' | 'html' | 'xml'
}

export type ReviradaResponse =
  | { success: true; translated: string | string[]; languagePair?: string; words?: number; translationTime?: number }
  | { success: false; error: string }

export async function reviradaTranslate(req: ReviradaRequest) {
  const { getSessionJWT } = await import('./appwrite')
  const jwt = await getSessionJWT()
  if (!jwt) throw new Error('User not authenticated. Please log in to use translation.')

  const api = createVercelApiClient(jwt)

  // Mapper notre contrat (source/target) vers le format Vercel (direction + dialect)
  const isFrToOc = req.sourceLang === 'fra' && (req.targetLang === 'oci' || req.targetLang === 'oci_gascon')
  const isOcToFr = (req.sourceLang === 'oci' || req.sourceLang === 'oci_gascon') && req.targetLang === 'fra'
  const direction: VReviRequest['direction'] = isFrToOc ? 'fr-oc' : isOcToFr ? 'oc-fr' : 'fr-oc'
  const dialect: VReviRequest['dialect'] | undefined = req.targetLang === 'oci_gascon' || req.sourceLang === 'oci_gascon' ? 'gascon' : 'lengadocian'

  const textStr = Array.isArray(req.text) ? req.text.join('\n') : req.text

  try {
    const vr: VReviRequest = { text: textStr, direction, dialect }
    const res: VReviResponse = await api.translateWithRevirada(vr)
    return { success: true, translated: res.translatedText, languagePair: res.direction, words: res.words } as ReviradaResponse
  } catch (e: any) {
    return { success: false, error: e?.message || 'Revirada translation error' }
  }
}

export function toReviCode(lang: string): 'fra' | 'oci' | 'oci_gascon' {
  const l = lang.toLowerCase()
  if (l === 'fr' || l === 'fra') return 'fra'
  if (l === 'oc' || l === 'oci') return 'oci'
  if (l === 'oc-gascon' || l === 'oci_gascon') return 'oci_gascon'
  // Default safe fallback
  return 'oci'
}
