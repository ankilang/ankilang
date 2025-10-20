export interface ImageResult {
  id: string
  src: string
  alt?: string
  width?: number
  height?: number
}

export interface ImageSearchResponse {
  results: ImageResult[]
  total?: number
  nextPage?: number | null
}

export async function searchImages(q: string, page = 1, opts?: { signal?: AbortSignal }): Promise<ImageSearchResponse> {
  const url = new URL('/.netlify/functions/images', window.location.origin)
  url.searchParams.set('q', q)
  url.searchParams.set('page', String(page))

  const res = await fetch(url.toString(), { signal: opts?.signal })
  if (!res.ok) {
    const msg = await safeText(res)
    throw new Error(`Images search failed: ${res.status} ${msg}`)
  }
  return res.json()
}

async function safeText(res: Response) {
  try { return await res.text() } catch { return '' }
}

