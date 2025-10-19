// ============================================
// ANKILANG VERCEL API CLIENT
// ============================================
// URL API: https://ankilang-api-monorepo.vercel.app
// Documentation: API-DOCUMENTATION.txt

import type {
  ApiError,
  DeepLRequest,
  DeepLResponse,
  PexelsSearchRequest,
  PexelsSearchResponse,
  PexelsOptimizeRequest,
  PexelsOptimizeResponse,
  ReviradaRequest,
  ReviradaResponse,
  VotzRequest,
  VotzResponse,
  ElevenLabsRequest,
  ElevenLabsResponse,
  RateLimitHeaders,
} from '../types/ankilang-vercel-api';

// ============================================
// API Client Configuration
// ============================================

export interface VercelApiConfig {
  baseUrl: string;
  jwtToken: string;
  origin?: string;
}

export class VercelApiError extends Error {
  constructor(
    public status: number,
    public title: string,
    public detail: string,
    public instance?: string
  ) {
    super(detail);
    this.name = 'VercelApiError';
  }
}

// ============================================
// Main Vercel API Client Class
// ============================================

export class VercelApiClient {
  private baseUrl: string;
  private jwtToken: string;
  private origin: string;

  constructor(config: VercelApiConfig) {
    this.baseUrl = config.baseUrl;
    this.jwtToken = config.jwtToken;
    this.origin = config.origin || 'https://ankilang.com';
  }

  /**
   * Update JWT token (useful after token refresh)
   */
  setJwtToken(token: string): void {
    this.jwtToken = token;
  }

  /**
   * Extract rate limit headers from response
   */
  private extractRateLimitHeaders(headers: Headers): RateLimitHeaders | null {
    const limit = headers.get('X-RateLimit-Limit');
    const remaining = headers.get('X-RateLimit-Remaining');
    const reset = headers.get('X-RateLimit-Reset');

    if (!limit || !remaining || !reset) return null;

    return {
      limit: parseInt(limit, 10),
      remaining: parseInt(remaining, 10),
      reset: parseInt(reset, 10),
    };
  }

  /**
   * Generic request method
   */
  private async request<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.jwtToken}`,
        'Origin': this.origin,
      },
      body: JSON.stringify(data),
    });

    // Extract rate limit info
    const rateLimitInfo = this.extractRateLimitHeaders(response.headers);
    if (rateLimitInfo) {
      console.debug('[Vercel API] Rate limit:', rateLimitInfo);
    }

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new VercelApiError(
        error.status,
        error.title,
        error.detail,
        error.instance
      );
    }

    return await response.json();
  }

  // ============================================
  // DeepL Translation
  // ============================================

  /**
   * Translate text using DeepL
   */
  async translateWithDeepL(request: DeepLRequest): Promise<DeepLResponse> {
    return this.request<DeepLResponse>('/api/deepl', request);
  }

  // ============================================
  // Pexels Image Search
  // ============================================

  /**
   * Search images on Pexels
   */
  async searchPexels(request: PexelsSearchRequest): Promise<PexelsSearchResponse> {
    return this.request<PexelsSearchResponse>('/api/pexels', request);
  }

  /**
   * Optimize image using Sharp
   */
  async optimizeImage(request: PexelsOptimizeRequest): Promise<PexelsOptimizeResponse> {
    return this.request<PexelsOptimizeResponse>('/api/pexels-optimize', request);
  }

  // ============================================
  // Revirada Occitan Translation
  // ============================================

  /**
   * Translate Occitan using Revirada (Apertium)
   */
  async translateWithRevirada(request: ReviradaRequest): Promise<ReviradaResponse> {
    return this.request<ReviradaResponse>('/api/revirada', request);
  }

  // ============================================
  // Votz TTS (Occitan)
  // ============================================

  /**
   * Generate Occitan TTS using Votz
   */
  async generateVotzTTS(request: VotzRequest): Promise<VotzResponse> {
    return this.request<VotzResponse>('/api/votz', request);
  }

  // ============================================
  // ElevenLabs TTS (Multilingual)
  // ============================================

  /**
   * Generate multilingual TTS using ElevenLabs
   */
  async generateElevenlabsTTS(request: ElevenLabsRequest): Promise<ElevenLabsResponse> {
    return this.request<ElevenLabsResponse>('/api/elevenlabs', request);
  }
}

// ============================================
// Factory function for easy initialization
// ============================================

export function createVercelApiClient(
  jwtToken: string,
  baseUrl: string = import.meta.env.VITE_VERCEL_API_URL || 'https://ankilang-api-monorepo.vercel.app',
  origin: string = import.meta.env.VITE_VERCEL_API_ORIGIN || 'https://ankilang.com'
): VercelApiClient {
  return new VercelApiClient({ baseUrl, jwtToken, origin });
}
