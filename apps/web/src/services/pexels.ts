const PROD = 'https://ankilangpexels.netlify.app/.netlify/functions/pexels'

const BASE = import.meta.env.VITE_PEXELS_URL || PROD

type Opts = Record<string, string | number | boolean | undefined>

function toURL(path: string, opts?: Opts) {
  const u = new URL((BASE.endsWith('/') ? BASE.slice(0, -1) : BASE) + path, window.location.origin)
  if (opts) {
    Object.entries(opts).forEach(([k, v]) => {
      if (v !== undefined && v !== null) u.searchParams.set(k, String(v))
    })
  }
  return u.toString()
}

async function fetchPexels(path: string, opts?: Opts) {
  const url = toURL(path, opts)

  const { getSessionJWT } = await import('./appwrite')
  const jwt = await getSessionJWT()

  if (!jwt) {
    throw new Error('User not authenticated. Please log in to use Pexels.')
  }

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${jwt}`
    }
  })

  if (!res.ok) {
    const errorText = await safeText(res)
    if (res.status === 401) {
      throw new Error('Pexels authentication failed. Please log in again.')
    }
    throw new Error(`Pexels request failed: ${res.status} - ${errorText}`)
  }

  return res
}

export async function pexelsSearchPhotos(query: string, opts: Opts = {}) {
  const res = await fetchPexels('/photos/search', { query, ...opts })
  return res.json() as Promise<{ page: number; per_page: number; total_results: number; next_page?: string; prev_page?: string; photos: any[] }>
}

export async function pexelsCurated(opts: Opts = {}) {
  const res = await fetchPexels('/photos/curated', opts)
  return res.json() as Promise<{ page: number; per_page: number; total_results: number; next_page?: string; prev_page?: string; photos: any[] }>
}

export async function pexelsPhoto(id: number | string) {
  const res = await fetchPexels(`/photos/${id}`)
  return res.json()
}

/**
 * Optimise et uploade une image Pexels vers Appwrite Storage
 * @param pexelsUrl - URL de l'image Pexels (medium ou large)
 * @returns Informations sur l'image optimisée et uploadée
 */
export async function optimizeAndUploadImage(pexelsUrl: string) {
  const url = toURL('/optimize', { url: pexelsUrl })
  
  // Récupérer le JWT Appwrite pour authentifier la requête
  const { getSessionJWT } = await import('./appwrite')
  const jwt = await getSessionJWT()
  
  if (!jwt) {
    throw new Error('User not authenticated. Please log in to upload images.')
  }
  
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json'
    }
  })
  
  if (!res.ok) {
    const errorText = await res.text()
    if (res.status === 401) {
      throw new Error('Authentication failed. Please log in again.')
    }
    throw new Error(`Image optimization failed: ${res.status} - ${errorText}`)
  }
  
  return res.json() as Promise<{
    success: boolean
    fileId: string
    fileUrl: string
    userId: string
    originalSize: number
    optimizedSize: number
    savings: number
  }>
}
async function safeText(res: Response) {
  try { return await res.text() } catch { return '' }
}
