// ============================================
// PEXELS SERVICE - VERCEL API
// ============================================
// Unified Pexels image service using Vercel API
// - Image search via Pexels API
// - Image optimization via Sharp
// - Upload to Appwrite Storage

import { createVercelApiClient, VercelApiError } from '../lib/vercel-api-client'
import { getSessionJWT } from './appwrite'
import type {
  PexelsSearchResponse,
} from '../types/ankilang-vercel-api'

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

// Note: The Vercel API now handles upload to Appwrite directly
// The functions below are kept for reference but no longer used

/**
 * Optimize image using Sharp and upload to Appwrite Storage
 * @param pexelsUrl - URL of the Pexels image (medium or large)
 * @returns Information about the optimized and uploaded image
 */
export async function optimizeAndUploadImage(pexelsUrl: string) {
  const api = await getApiClient()

  try {
    console.log(`[Pexels] Optimizing image: ${pexelsUrl}`)

    // The Vercel API now handles both optimization AND upload to Appwrite
    const result = await api.optimizeImage({
      imageUrl: pexelsUrl,
      width: 600,
      height: 400,
      quality: 80,
      format: 'webp',
    })

    console.log('[Pexels] Optimization + Upload complete:', result)
    console.log(
      `[Pexels] ${result.originalSize} → ${result.optimizedSize} bytes (${result.compressionRatio}% saved)`
    )

    // Get current user for compatibility
    const { account } = await import('./appwrite')
    const user = await account.get()

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Return in the expected format
    return {
      success: true,
      fileId: result.fileId,
      fileUrl: result.url,
      userId: user.$id,
      originalSize: result.originalSize,
      optimizedSize: result.optimizedSize,
      savings: result.compressionRatio,
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
