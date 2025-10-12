import { buildCacheKey } from '@ankilang/shared-cache'
import { StorageService } from './storage.service'
import { metric, time } from './cache/metrics'

const BUCKET = import.meta.env.VITE_APPWRITE_BUCKET_ID || 'flashcard-images'
const storageService = new StorageService()

export interface PexelsCacheParams {
  pexelsId: string
  srcUrl: string
  variant?: string // ex: 'original' | 'landscape' | '800w'
  contentTypeHint?: string // ex: 'image/jpeg' | 'image/webp'
}

export interface PexelsCacheResult {
  fileId: string
  fileUrl: string
  fromCache: boolean
}

/**
 * Récupère ou met en cache une image Pexels dans Appwrite Storage
 * Évite les téléchargements redondants en utilisant des clés déterministes
 * Avec fallbacks robustes en cas d'erreur
 */
export async function getOrPutPexelsImage(params: PexelsCacheParams): Promise<PexelsCacheResult> {
  return time('Pexels.cache.getOrPut', async () => {
    const key = await buildCacheKey({
      namespace: 'pexels',
      externalId: params.pexelsId,
      variant: params.variant ?? 'original',
    })

    // 1) Check si déjà en Storage (en utilisant fileId = key safe)
    const safeId = key.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120)
    
    try {
      const url = await storageService.getFileView(BUCKET, safeId)
      metric('Pexels.cache', { 
        hit: true, 
        pexelsId: params.pexelsId, 
        variant: params.variant ?? 'original' 
      })
      console.log(`[Pexels Cache] HIT: ${params.pexelsId} (${params.variant ?? 'original'})`)
      return { fileId: safeId, fileUrl: url, fromCache: true }
    } catch (error) {
      // miss → continue avec métrique
      metric('Pexels.cache', { 
        hit: false, 
        pexelsId: params.pexelsId, 
        variant: params.variant ?? 'original',
        error: (error as Error).message
      })
      console.log(`[Pexels Cache] MISS: ${params.pexelsId} (${params.variant ?? 'original'})`)
    }

    // 2) Télécharger l'image Pexels avec retry
    let blob: Blob | null = null
    let downloadAttempts = 0
    const maxRetries = 3

    while (downloadAttempts < maxRetries) {
      try {
        const resp = await fetch(params.srcUrl)
        if (!resp.ok) {
          throw new Error(`Pexels download failed: ${resp.status} ${resp.statusText}`)
        }
        blob = await resp.blob()
        break
      } catch (error) {
        downloadAttempts++
        if (downloadAttempts >= maxRetries) {
          metric('Pexels.download.error', { 
            pexelsId: params.pexelsId, 
            attempts: downloadAttempts,
            error: (error as Error).message 
          })
          throw new Error(`Pexels download failed after ${maxRetries} attempts: ${(error as Error).message}`)
        }
        console.warn(`[Pexels Cache] Download attempt ${downloadAttempts} failed, retrying...`)
        await new Promise(resolve => setTimeout(resolve, 1000 * downloadAttempts)) // Backoff
      }
    }

    if (!blob) {
      throw new Error('Failed to download Pexels image after all retries')
    }

    // 3) Upload déterministe avec fallback
    try {
      const file = await storageService.uploadFile(BUCKET, safeId, blob, undefined)
      const url = await storageService.getFileView(BUCKET, file.$id)
      
      metric('Pexels.cache.set', { 
        pexelsId: params.pexelsId, 
        variant: params.variant ?? 'original',
        size: blob.size,
        fileId: file.$id
      })
      
      console.log(`[Pexels Cache] SET: ${params.pexelsId} (${params.variant ?? 'original'}) → ${file.$id}`)
      return { fileId: file.$id, fileUrl: url, fromCache: false }
    } catch (error) {
      // Si collision du safeId, c'est que le cache existe déjà
      if (error instanceof Error && error.message.includes('already exists')) {
        console.log(`[Pexels Cache] COLLISION: ${params.pexelsId} already cached`)
        try {
          const url = await storageService.getFileView(BUCKET, safeId)
          return { fileId: safeId, fileUrl: url, fromCache: true }
        } catch (viewError) {
          // Fallback final : retourner l'URL Pexels directement
          console.warn(`[Pexels Cache] Fallback to direct URL for ${params.pexelsId}`)
          metric('Pexels.cache.fallback', { 
            pexelsId: params.pexelsId, 
            reason: 'storage_error',
            error: (viewError as Error).message
          })
          return { fileId: safeId, fileUrl: params.srcUrl, fromCache: false }
        }
      }
      
      // Autre erreur d'upload → fallback à l'URL directe
      console.warn(`[Pexels Cache] Upload failed, fallback to direct URL: ${(error as Error).message}`)
      metric('Pexels.cache.fallback', { 
        pexelsId: params.pexelsId, 
        reason: 'upload_error',
        error: (error as Error).message
      })
      return { fileId: safeId, fileUrl: params.srcUrl, fromCache: false }
    }
  })
}

/**
 * Version optimisée qui utilise la fonction existante optimizeAndUploadImage
 * mais avec déduplication par cache
 */
export async function getOrPutPexelsImageOptimized(params: PexelsCacheParams): Promise<PexelsCacheResult> {
  const key = await buildCacheKey({
    namespace: 'pexels',
    externalId: params.pexelsId,
    variant: params.variant ?? 'original',
  })

  // 1) Check si déjà en Storage
  const safeId = key.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120)
  
  try {
    const url = await storageService.getFileView(BUCKET, safeId)
    console.log(`[Pexels Cache] HIT: ${params.pexelsId} (${params.variant ?? 'original'})`)
    return { fileId: safeId, fileUrl: url, fromCache: true }
  } catch {
    // miss → utiliser la fonction d'optimisation existante
    console.log(`[Pexels Cache] MISS: ${params.pexelsId} (${params.variant ?? 'original'}) - using optimization`)
  }

  // 2) Utiliser la fonction d'optimisation existante
  const { optimizeAndUploadImage } = await import('./pexels')
  const result = await optimizeAndUploadImage(params.srcUrl)
  
  console.log(`[Pexels Cache] SET: ${params.pexelsId} (${params.variant ?? 'original'}) → ${result.fileId}`)
  return { 
    fileId: result.fileId, 
    fileUrl: result.fileUrl, 
    fromCache: false 
  }
}
