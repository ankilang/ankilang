// ============================================
// PEXELS SERVICE - VERCEL API
// ============================================
// Unified Pexels image service using Vercel API
// - Image search via Pexels API
// - Image optimization via Sharp
// - Upload to Appwrite Storage

import { createVercelApiClient, VercelApiError } from '../lib/vercel-api-client'
import { getSessionJWT } from './appwrite'
import { Client, Storage, ID } from 'appwrite'
import type {
  PexelsSearchResponse,
} from '../types/ankilang-vercel-api'

// Initialize Appwrite Storage
const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID)

const storage = new Storage(client)

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

// ============================================
// Image Search
// ============================================

/**
 * Search photos on Pexels
 */
export async function pexelsSearchPhotos(
  query: string,
  opts: {
    per_page?: number
    page?: number
    orientation?: string
    size?: string
    locale?: string
  } = {}
): Promise<PexelsSearchResponse> {
  const api = await getApiClient()

  try {
    console.log(`[Pexels] Searching: "${query}"`, opts)

    const result = await api.searchPexels({
      query,
      perPage: opts.per_page || 15,
      locale: opts.locale || 'fr-FR',
    })

    console.log(`[Pexels] Found ${result.total_results} results`)
    return result
  } catch (error) {
    if (error instanceof VercelApiError) {
      console.error('[Pexels] Search error:', error.detail)
      throw new Error(`Image search failed: ${error.detail}`)
    }
    console.error('[Pexels] Error:', error)
    throw new Error(`Image search failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get curated photos (fallback to search with popular keyword)
 * Note: Vercel API doesn't have a dedicated curated endpoint,
 * so we use a generic search as fallback
 */
export async function pexelsCurated(
  opts: {
    per_page?: number
    page?: number
    locale?: string
  } = {}
): Promise<PexelsSearchResponse> {
  console.log('[Pexels] Getting curated photos (using fallback search)')

  // Fallback: use a popular generic search term
  return pexelsSearchPhotos('nature landscape', opts)
}

/**
 * Get photo by ID (not implemented in Vercel API)
 * This function is kept for compatibility but not used in current implementation
 */
export async function pexelsPhoto(_id: number | string): Promise<any> {
  console.warn('[Pexels] Photo detail endpoint not available in Vercel API')
  throw new Error('Photo detail not implemented. Use search instead.')
}

// ============================================
// Image Optimization & Upload
// ============================================

/**
 * Convert base64 data URL to Blob
 */
function dataURLToBlob(dataURL: string): Blob {
  const arr = dataURL.split(',')
  const mimeMatch = arr[0]?.match(/:(.*?);/)
  const mime = mimeMatch ? mimeMatch[1] : 'image/webp'
  const bstr = atob(arr[1] || '')
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}

/**
 * Upload base64 image to Appwrite Storage
 */
async function uploadBase64ToAppwrite(
  base64Data: string
): Promise<{ fileId: string; fileUrl: string }> {
  try {
    // Convert base64 to Blob
    const blob = dataURLToBlob(base64Data)

    // Create File object
    const file = new File([blob], 'optimized-image.webp', { type: 'image/webp' })

    console.log(`[Pexels] Uploading to Appwrite Storage (${(blob.size / 1024).toFixed(2)} KB)`)

    // Upload to Appwrite Storage
    const bucketId = import.meta.env.VITE_APPWRITE_BUCKET_IMAGES || 'images'
    const uploaded = await storage.createFile(bucketId, ID.unique(), file)

    // Get file URL
    const fileUrl = storage.getFileView(bucketId, uploaded.$id).toString()

    console.log(`[Pexels] Upload successful: ${uploaded.$id}`)

    return {
      fileId: uploaded.$id,
      fileUrl,
    }
  } catch (error) {
    console.error('[Pexels] Upload to Appwrite failed:', error)
    throw new Error(`Failed to upload image to storage: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Optimize image using Sharp and upload to Appwrite Storage
 * @param pexelsUrl - URL of the Pexels image (medium or large)
 * @returns Information about the optimized and uploaded image
 */
export async function optimizeAndUploadImage(pexelsUrl: string) {
  const api = await getApiClient()

  try {
    console.log(`[Pexels] Optimizing image: ${pexelsUrl}`)

    // Step 1: Optimize image via Vercel API
    const optimized = await api.optimizeImage({
      imageUrl: pexelsUrl,
      width: 600,
      height: 400,
      quality: 80,
      format: 'webp',
    })

    console.log(
      `[Pexels] Optimization complete: ${optimized.originalSize} → ${optimized.optimizedSize} bytes (${optimized.compression})`
    )

    // Step 2: Get current user
    const { account } = await import('./appwrite')
    const user = await account.get()

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Step 3: Upload to Appwrite Storage
    const uploaded = await uploadBase64ToAppwrite(optimized.optimizedImage)

    return {
      success: true,
      fileId: uploaded.fileId,
      fileUrl: uploaded.fileUrl,
      userId: user.$id,
      originalSize: optimized.originalSize,
      optimizedSize: optimized.optimizedSize,
      savings: parseFloat(optimized.compression),
    }
  } catch (error) {
    if (error instanceof VercelApiError) {
      console.error('[Pexels] Optimization error:', error.detail)
      throw new Error(`Image optimization failed: ${error.detail}`)
    }
    console.error('[Pexels] Error:', error)
    throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
