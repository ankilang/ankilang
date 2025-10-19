// ============================================
// ANKILANG VERCEL API - Types TypeScript
// ============================================
// URL API: https://ankilang-api-monorepo.vercel.app
// Documentation: API-DOCUMENTATION.txt

// ============================================
// API Response Types
// ============================================

export interface ApiError {
  status: number;
  title: string;
  detail: string;
  instance?: string;
}

export interface RateLimitHeaders {
  limit: number;
  remaining: number;
  reset: number;
}

// ============================================
// DeepL Types
// ============================================

/**
 * DeepL source languages (lowercase as required by Vercel API)
 * Note: API validation schema expects lowercase codes
 */
export type DeepLSourceLang =
  | 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt' | 'oc' | 'ca';

/**
 * DeepL target languages (lowercase as required by Vercel API)
 * Note: API validation schema expects lowercase codes
 */
export type DeepLTargetLang =
  | 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt' | 'oc' | 'ca';

export interface DeepLRequest {
  text: string;
  sourceLang: DeepLSourceLang;
  targetLang: DeepLTargetLang;
}

export interface DeepLResponse {
  translatedText: string;
  sourceLang: string;
  targetLang: string;
}

// ============================================
// Pexels Types
// ============================================

export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
  };
  alt: string;
}

export interface PexelsSearchRequest {
  query: string;
  perPage?: number;
  locale?: string;
}

export interface PexelsSearchResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
}

export type ImageFormat = 'jpeg' | 'webp' | 'png' | 'avif';

export interface PexelsOptimizeRequest {
  imageUrl: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: ImageFormat;
}

export interface PexelsOptimizeResponse {
  optimizedImage: string; // Data URL base64
  originalSize: number;
  optimizedSize: number;
  compression: string;
  format: string;
  dimensions: {
    width: number;
    height: number;
  };
}

// ============================================
// Revirada Types (Occitan Translation)
// ============================================

export type ReviradaDirection = 'fr-oc' | 'oc-fr';
export type ReviradaDialect = 'lengadocian' | 'gascon';

export interface ReviradaRequest {
  text: string;
  direction: ReviradaDirection;
  dialect?: ReviradaDialect;
}

export interface ReviradaResponse {
  originalText: string;
  translatedText: string;
  direction: ReviradaDirection;
  dialect: ReviradaDialect;
  words: number;
}

// ============================================
// Votz Types (Occitan TTS)
// ============================================

export type VotzLanguage = 'languedoc' | 'gascon';
export type VotzMode = 'file' | 'url';

export interface VotzRequest {
  text: string;
  language?: VotzLanguage;
  mode?: VotzMode;
}

export interface VotzFileResponse {
  audio: string; // Base64
  language: VotzLanguage;
  mode: 'file';
  size: number;
}

export interface VotzUrlResponse {
  url: string;
  language: VotzLanguage;
  mode: 'url';
}

export type VotzResponse = VotzFileResponse | VotzUrlResponse;

// ============================================
// ElevenLabs Types (Multilingual TTS)
// ============================================

export type ElevenLabsModel =
  | 'eleven_multilingual_v2'
  | 'eleven_turbo_v2'
  | 'eleven_monolingual_v1';

export interface ElevenLabsRequest {
  text: string;
  voiceId: string;
  modelId?: ElevenLabsModel;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

export interface ElevenLabsResponse {
  audio: string; // Base64 MP3
  voiceId: string;
  modelId: string;
  size: number;
}

// ============================================
// Popular ElevenLabs Voices
// ============================================

export const ELEVENLABS_VOICES = {
  RACHEL: '21m00Tcm4TlvDq8ikWAM',
  DOMI: 'AZnzlk1XvdvUeBnXmlld',
  BELLA: 'EXAVITQu4vr4xnSDxMaL',
  ANTONI: 'ErXwobaYiN019PkySvjV',
  ELLI: 'MF3mGyEYCl7XYWbV9V6O',
  JOSH: 'TxGEqnHWrfWFTfGW9XjX',
  ARNOLD: 'VR6AewLTigWG4xSOukaG',
  ADAM: 'pNInz6obpgDQGcFmaJgB',
  SAM: 'yoZ06aMxZJJ28mfd3POQ',
} as const;
