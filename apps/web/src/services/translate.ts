export type TranslateRequest = {
  sourceLang: string
  targetLang: string
  text: string
}

export type TranslateResponse = {
  translatedText: string
  provider?: 'revirada' | 'deepl'
}

export async function translate(req: TranslateRequest, opts?: { signal?: AbortSignal }): Promise<TranslateResponse> {
  const res = await fetch('/.netlify/functions/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
    signal: opts?.signal,
  })

  if (!res.ok) {
    const msg = await safeText(res)
    throw new Error(`Translate failed: ${res.status} ${msg}`)
  }
  return res.json()
}

async function safeText(res: Response) {
  try { return await res.text() } catch { return '' }
}

