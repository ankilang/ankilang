/**
 * Service de cache multi-niveau pour les images Pexels
 *
 * Architecture:
 * 1. IndexedDB (local, rapide) - TTL 180 jours
 * 2. Appwrite Storage (serveur, partagé) - Lecture publique
 * 3. Vercel API (optimisation Sharp) - Fallback si cache miss
 *
 * Fonctionnalités:
 * - Clés déterministes basées sur photo.id + paramètres transformation
 * - Déduplication des requêtes concurrentes (in-flight map)
 * - Dossiers virtuels dans Appwrite ('cache/pexels/{hash}.webp')
 * - Métriques et logs
 * - Fallback sur URL originale en cas d'erreur
 *
 * @module image-cache
 */

import { BrowserIDBCache, AppwriteStorageCache, buildCacheKey, sha256Hex } from '@ankilang/shared-cache'
import { Storage, Permission, Role } from 'appwrite'
import client, { getSessionJWT } from './appwrite'
import type { PexelsPhoto } from '../types/ankilang-vercel-api'
import { createVercelApiClient } from '../lib/vercel-api-client'
import { FLAGS } from '../config/flags'
import { metric, time } from './cache/metrics'
// Note: storage-path generation is handled inside the AppwriteStorageCache

/**
 * Options pour l'optimisation d'image
 */
export interface ImageCacheOptions {
  /** Largeur de l'image optimisée (default: 600) */
  width?: number
  /** Hauteur de l'image optimisée (default: 400) */
  height?: number
  /** Format de sortie (default: 'webp') */
  format?: 'webp' | 'avif' | 'jpeg' | 'png'
  /** Qualité de compression 0-100 (default: 80) */
  quality?: number
  /** Device pixel ratio (default: 1) */
  dpr?: number
}

/**
 * Résultat du cache d'image
 */
export interface CachedImageResult {
  /** Blob de l'image optimisée */
  blob: Blob
  /** URL de l'image (Object URL à révoquer après usage) */
  url: string
  /** Taille de l'image en octets */
  size: number
  /** Format de l'image */
  format: string
  /** Source du cache ('idb', 'appwrite', 'api') */
  source: 'idb' | 'appwrite' | 'api'
  /** URL Appwrite publique (si disponible) */
  appwriteUrl?: string
  /** FileId Appwrite (si disponible) */
  appwriteFileId?: string
}

// Cache IDB local (rapide, navigateur uniquement)
const idb = new BrowserIDBCache('ankilang', 'image-cache')

// Cache Appwrite Storage (serveur, partagé entre utilisateurs)
// Wrapper pour retourner un Blob depuis getFileView et gérer File pour createFile
const storageSdk = new Storage(client)
const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID || 'flashcard-images'

const appwriteDeps = {
  storage: {
    getFileView: async (bucketId: string, fileId: string) => {
      const url = storageSdk.getFileView(bucketId, fileId).toString()
      const res = await fetch(url)
      if (!res.ok) throw new Error(`getFileView fetch failed: ${res.status}`)
      return await res.blob()
    },
    createFile: async (bucketId: string, fileId: string, blob: Blob, permissions?: string[]) => {
      const file = new File([blob], fileId, { type: blob.type || 'application/octet-stream' })
      // Convert legacy 'role:all' permissions to new format
      const appwritePermissions = permissions?.includes('role:all')
        ? [Permission.read(Role.any())]
        : permissions
      await storageSdk.createFile(bucketId, fileId, file, appwritePermissions)
    },
    getFile: (bucketId: string, fileId: string) => storageSdk.getFile(bucketId, fileId),
    deleteFile: (bucketId: string, fileId: string) => storageSdk.deleteFile(bucketId, fileId),
  }
}

const storage = new AppwriteStorageCache(
  appwriteDeps,
  BUCKET_ID,
  'cache/pexels'
)

/**
 * Build Appwrite public URL for a fileId
 */
function buildAppwriteUrl(fileId: string): string {
  const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1'
  const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || 'ankilang'
  return `${endpoint}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${projectId}`
}

/**
 * Build Appwrite fileId from cache key (matches AppwriteStorageCache logic)
 * Format: {prefix}-{hash16}.{ext}
 */
async function buildAppwriteFileId(cacheKey: string, format: string): Promise<string> {
  const fullHash = await sha256Hex(cacheKey)
  const shortHash = fullHash.slice(0, 16)
  return `p-${shortHash}.${format}` // 'p' = pexels prefix
}

async function buildAppwriteInfo(cacheKey: string, format: string): Promise<{ url: string, fileId: string }> {
  const fileId = await buildAppwriteFileId(cacheKey, format)
  const url = buildAppwriteUrl(fileId)
  return { url, fileId }
}

// TTL pour les images Pexels (6 mois)
const PEXELS_TTL_MS = FLAGS.PEXELS_TTL_DAYS * 24 * 60 * 60 * 1000

// Map de déduplication pour requêtes en vol
const inFlightRequests = new Map<string, Promise<CachedImageResult>>()

// ============================================
// API Client Management
// ============================================

let apiClient: ReturnType<typeof createVercelApiClient> | null = null

async function getApiClient() {
  if (!apiClient) {
    const jwt = await getSessionJWT()
    if (!jwt) throw new Error('User not authenticated')
    apiClient = createVercelApiClient(jwt)
  }
  return apiClient
}

/**
 * Détecte le meilleur format d'image supporté par le navigateur
 * Ordre de préférence: avif > webp > jpeg
 */
function detectBestFormat(): 'avif' | 'webp' | 'jpeg' {
  if (typeof document === 'undefined') return 'webp'

  const canvas = document.createElement('canvas')

  // Test AVIF
  const avifSupport = canvas.toDataURL('image/avif').startsWith('data:image/avif')
  if (avifSupport) return 'avif'

  // Test WebP
  const webpSupport = canvas.toDataURL('image/webp').startsWith('data:image/webp')
  if (webpSupport) return 'webp'

  // Fallback JPEG (universellement supporté)
  return 'jpeg'
}

/**
 * Récupère une image Pexels optimisée avec cache multi-niveau
 *
 * Flow:
 * 1. Vérifie IndexedDB (local)
 * 2. Vérifie Appwrite Storage (serveur)
 * 3. Optimise via Vercel API + stocke dans les caches
 * 4. Fallback sur URL originale en cas d'erreur
 *
 * @param photo - Photo Pexels
 * @param options - Options d'optimisation
 * @returns Résultat avec blob, url, métadonnées
 *
 * @example
 * ```ts
 * const result = await getCachedImage(photo, {
 *   width: 600,
 *   height: 400,
 *   format: 'webp',
 *   quality: 80
 * })
 *
 * // Utiliser l'URL pour affichage
 * imgElement.src = result.url
 *
 * // Ne pas oublier de révoquer après usage
 * URL.revokeObjectURL(result.url)
 * ```
 */
export async function getCachedImage(
  photo: PexelsPhoto,
  options?: ImageCacheOptions
): Promise<CachedImageResult> {
  return time('Image.getCached', async () => {
    // Paramètres par défaut avec détection du meilleur format
    const bestFormat = detectBestFormat()
    const opts = {
      width: options?.width ?? 600,
      height: options?.height ?? 400,
      format: options?.format ?? bestFormat,
      quality: options?.quality ?? 80,
      dpr: options?.dpr ?? 1,
    }

    // Clé de cache déterministe
    const cacheKey = await buildCacheKey({
      namespace: 'pexels',
      externalId: String(photo.id),
      extra: {
        v: '1', // Version pour invalidation propre
        w: opts.width,
        h: opts.height,
        fit: 'cover',
        fmt: opts.format,
        q: opts.quality,
        dpr: opts.dpr,
      },
    })

    // Déduplication: si une requête est déjà en vol pour cette clé, la réutiliser
    const existing = inFlightRequests.get(cacheKey)
    if (existing) {
      console.log(`[Image Cache] Requête déjà en cours pour ${photo.id}, réutilisation`)
      metric('Image.dedup', { photoId: photo.id })
      return existing
    }

    // Lancer la requête et la stocker dans inFlightRequests
    const promise = (async (): Promise<CachedImageResult> => {
      try {
        // 1) Tentative IndexedDB
        let cachedBlob: Blob | null = null
        try {
          cachedBlob = await idb.get<Blob>(cacheKey)
          if (cachedBlob) {
            console.log(`[Image Cache] ✅ Hit IDB pour photo ${photo.id}`)
            metric('Image.cache', { hit: true, source: 'idb', photoId: photo.id })

            const url = URL.createObjectURL(cachedBlob)
            const appwriteInfo = await buildAppwriteInfo(cacheKey, opts.format)
            return {
              blob: cachedBlob,
              url,
              size: cachedBlob.size,
              format: opts.format,
              source: 'idb',
              appwriteUrl: appwriteInfo.url,
              appwriteFileId: appwriteInfo.fileId,
            }
          }
        } catch (error) {
          console.warn('[Image Cache] Erreur lecture IDB:', error)
          metric('Image.cache.error', { adapter: 'idb', error: (error as Error).message })
        }

        // 2) Tentative Appwrite Storage
        try {
          const remoteBlob = await storage.get<Blob>(cacheKey)
          if (remoteBlob) {
            console.log(`[Image Cache] ✅ Hit Appwrite pour photo ${photo.id}`)
            metric('Image.cache', { hit: true, source: 'appwrite', photoId: photo.id })

            // Hydrater le cache IDB
            try {
              await idb.set(cacheKey, remoteBlob, {
                ttlMs: PEXELS_TTL_MS,
                contentType: `image/${opts.format}`,
              })
            } catch (error) {
              console.warn('[Image Cache] Échec hydratation IDB:', error)
            }

            const url = URL.createObjectURL(remoteBlob)
            const appwriteInfo = await buildAppwriteInfo(cacheKey, opts.format)
            return {
              blob: remoteBlob,
              url,
              size: remoteBlob.size,
              format: opts.format,
              source: 'appwrite',
              appwriteUrl: appwriteInfo.url,
              appwriteFileId: appwriteInfo.fileId,
            }
          }
        } catch (error) {
          console.warn('[Image Cache] Erreur lecture Appwrite:', error)
          metric('Image.cache.error', { adapter: 'appwrite', error: (error as Error).message })
        }

        // 3) Miss total → Optimisation via Vercel API
        console.log(`[Image Cache] ❌ Miss complet pour photo ${photo.id}, optimisation...`)
        metric('Image.cache', { hit: false, photoId: photo.id })

        const api = await getApiClient()
        const optimized = await api.optimizeImage({
          imageUrl: photo.src.medium,
          width: opts.width,
          height: opts.height,
          quality: opts.quality,
          format: opts.format,
        })

        // L'API Vercel retourne fileId + url (déjà uploadé dans Appwrite)
        // Mais pour avoir le Blob pour cache IDB, on doit fetch l'URL
        const response = await fetch(optimized.url)
        if (!response.ok) {
          throw new Error(`Failed to fetch optimized image: ${response.statusText}`)
        }

        const blob = await response.blob()
        console.log(`[Image Cache] ✅ Image optimisée: ${blob.size} bytes`)

        // 4) Stocker dans IndexedDB
        try {
          await idb.set(cacheKey, blob, {
            ttlMs: PEXELS_TTL_MS,
            contentType: `image/${opts.format}`,
          })
          console.log(`[Image Cache] ✅ Sauvegardé dans IDB`)
        } catch (error) {
          console.warn('[Image Cache] Échec sauvegarde IDB:', error)
        }

        // 5) Stocker dans Appwrite Storage (idempotent, lecture publique)
        try {
          await storage.set(cacheKey, blob, {
            contentType: `image/${opts.format}`,
            publicRead: true,
          })

          console.log(`[Image Cache] ✅ Sauvegardé dans Appwrite Storage`)
        } catch (error) {
          // Échec non bloquant (fichier peut déjà exister = idempotent)
          console.warn('[Image Cache] Échec sauvegarde Appwrite (non bloquant):', error)
        }

        const url = URL.createObjectURL(blob)
        const appwriteInfo = await buildAppwriteInfo(cacheKey, opts.format)
        return {
          blob,
          url,
          size: blob.size,
          format: opts.format,
          source: 'api',
          appwriteUrl: appwriteInfo.url,
          appwriteFileId: appwriteInfo.fileId,
        }
      } catch (error) {
        console.error('[Image Cache] Erreur critique:', error)
        metric('Image.error', { error: (error as Error).message, photoId: photo.id })

        // Fallback: retourner l'URL originale Pexels (non optimisée)
        // Créer un blob factice pour respecter l'interface
        const fallbackUrl = photo.src.medium
        const fallbackResponse = await fetch(fallbackUrl)
        const fallbackBlob = await fallbackResponse.blob()

        return {
          blob: fallbackBlob,
          url: fallbackUrl,
          size: fallbackBlob.size,
          format: 'jpeg', // Pexels retourne généralement du JPEG
          source: 'api', // Techniquement c'est Pexels direct, mais on marque 'api'
        }
      }
    })()

    // Stocker la promesse dans inFlightRequests
    inFlightRequests.set(cacheKey, promise)

    try {
      return await promise
    } finally {
      // Nettoyer après résolution (succès ou échec)
      inFlightRequests.delete(cacheKey)
    }
  })
}

/**
 * Précharge une image dans le cache sans la retourner
 * Utile pour précacher des images avant qu'elles soient demandées
 *
 * @param photo - Photo Pexels à précacher
 * @param options - Options d'optimisation
 */
export async function prefetchImage(
  photo: PexelsPhoto,
  options?: ImageCacheOptions
): Promise<void> {
  try {
    const result = await getCachedImage(photo, options)
    // Révoquer immédiatement l'URL car on ne l'utilise pas
    URL.revokeObjectURL(result.url)
    console.log(`[Image Cache] ✅ Préchargement réussi pour photo ${photo.id}`)
  } catch (error) {
    console.warn(`[Image Cache] Échec préchargement photo ${photo.id}:`, error)
  }
}

/**
 * Efface l'image du cache (IDB + Appwrite)
 *
 * @param photo - Photo Pexels à effacer
 * @param options - Options utilisées lors du cache (pour retrouver la clé)
 */
export async function clearCachedImage(
  photo: PexelsPhoto,
  options?: ImageCacheOptions
): Promise<void> {
  const opts = {
    width: options?.width ?? 600,
    height: options?.height ?? 400,
    format: options?.format ?? detectBestFormat(),
    quality: options?.quality ?? 80,
    dpr: options?.dpr ?? 1,
  }

  const cacheKey = await buildCacheKey({
    namespace: 'pexels',
    externalId: String(photo.id),
    extra: {
      v: '1',
      w: opts.width,
      h: opts.height,
      fit: 'cover',
      fmt: opts.format,
      q: opts.quality,
      dpr: opts.dpr,
    },
  })

  try {
    await idb.delete(cacheKey)
    await storage.delete(cacheKey)
    console.log(`[Image Cache] ✅ Image ${photo.id} effacée du cache`)
  } catch (error) {
    console.warn(`[Image Cache] Échec effacement photo ${photo.id}:`, error)
  }
}
