const LOCAL = 'http://localhost:8888/.netlify/functions/pexels'
const PROD = 'https://ankilangpexels.netlify.app/.netlify/functions/pexels'

const BASE = import.meta.env.VITE_PEXELS_URL || (import.meta.env.DEV ? LOCAL : PROD)

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

export async function pexelsSearchPhotos(query: string, opts: Opts = {}) {
  const url = toURL('/photos/search', { query, ...opts })
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Pexels search failed: ${res.status}`)
  return res.json() as Promise<{ page: number; per_page: number; total_results: number; next_page?: string; prev_page?: string; photos: any[] }>
}

export async function pexelsCurated(opts: Opts = {}) {
  const url = toURL('/photos/curated', opts)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Pexels curated failed: ${res.status}`)
  return res.json() as Promise<{ page: number; per_page: number; total_results: number; next_page?: string; prev_page?: string; photos: any[] }>
}

export async function pexelsPhoto(id: number | string) {
  const url = toURL(`/photos/${id}`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Pexels photo failed: ${res.status}`)
  return res.json()
}

