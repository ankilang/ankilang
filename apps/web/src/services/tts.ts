export type TTSRequest = {
  lang: string
  text: string
}

export type TTSResponse = {
  audioUrl: string
}

export async function generateTTS(req: TTSRequest, opts?: { signal?: AbortSignal }): Promise<TTSResponse> {
  // Récupérer le JWT Appwrite pour authentifier la requête
  const { getSessionJWT } = await import('./appwrite')
  const jwt = await getSessionJWT()
  
  if (!jwt) {
    throw new Error('User not authenticated. Please log in to use TTS.')
  }
  
  const res = await fetch('https://ankilangtts.netlify.app/.netlify/functions/tts', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    },
    body: JSON.stringify(req),
    signal: opts?.signal,
  })
  
  if (!res.ok) {
    const msg = await safeText(res)
    if (res.status === 401) {
      throw new Error('Authentication failed. Please log in again.')
    }
    throw new Error(`TTS failed: ${res.status} ${msg}`)
  }
  return res.json()
}

async function safeText(res: Response) {
  try { return await res.text() } catch { return '' }
}

