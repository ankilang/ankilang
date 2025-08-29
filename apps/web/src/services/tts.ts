export type TTSRequest = {
  lang: string
  text: string
}

export type TTSResponse = {
  audioUrl: string
}

export async function generateTTS(req: TTSRequest, opts?: { signal?: AbortSignal }): Promise<TTSResponse> {
  const res = await fetch('/.netlify/functions/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
    signal: opts?.signal,
  })
  if (!res.ok) {
    const msg = await safeText(res)
    throw new Error(`TTS failed: ${res.status} ${msg}`)
  }
  return res.json()
}

async function safeText(res: Response) {
  try { return await res.text() } catch { return '' }
}

