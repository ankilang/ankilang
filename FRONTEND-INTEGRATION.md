# Guide d'Intégration Frontend - AnkiLang API

Ce guide explique comment intégrer l'AnkiLang API dans votre application frontend (React, Vue, Angular, etc.) avec TypeScript.

---

## Table des matières

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Types TypeScript](#types-typescript)
4. [Client API](#client-api)
5. [Exemples d'utilisation](#exemples-dutilisation)
6. [Gestion des erreurs](#gestion-des-erreurs)
7. [Helpers Audio](#helpers-audio)
8. [Helpers Images](#helpers-images)
9. [React Hooks (Bonus)](#react-hooks-bonus)

---

## Installation

Aucune dépendance externe n'est requise ! L'API client utilise uniquement `fetch` natif.

```bash
# Optionnel : si vous utilisez axios
npm install axios
```

---

## Configuration

Créez un fichier `.env` ou `.env.local` dans votre projet frontend :

```env
VITE_ANKILANG_API_URL=https://ankilang-api-monorepo.vercel.app
VITE_ANKILANG_ALLOWED_ORIGIN=https://ankilang.com

# JWT Appwrite - À générer côté client ou récupérer depuis votre backend
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=ankilang
```

---

## Types TypeScript

Créez un fichier `types/ankilang-api.ts` :

```typescript
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

export type DeepLSourceLang =
  | 'AR' | 'BG' | 'CS' | 'DA' | 'DE' | 'EL' | 'EN' | 'ES'
  | 'ET' | 'FI' | 'FR' | 'HU' | 'ID' | 'IT' | 'JA' | 'KO'
  | 'LT' | 'LV' | 'NB' | 'NL' | 'PL' | 'PT' | 'RO' | 'RU'
  | 'SK' | 'SL' | 'SV' | 'TR' | 'UK' | 'ZH';

export type DeepLTargetLang =
  | 'AR' | 'BG' | 'CS' | 'DA' | 'DE' | 'EL' | 'EN' | 'EN-GB' | 'EN-US'
  | 'ES' | 'ES-419' | 'ET' | 'FI' | 'FR' | 'HE' | 'HU' | 'ID' | 'IT'
  | 'JA' | 'KO' | 'LT' | 'LV' | 'NB' | 'NL' | 'PL' | 'PT' | 'PT-BR'
  | 'PT-PT' | 'RO' | 'RU' | 'SK' | 'SL' | 'SV' | 'TH' | 'TR' | 'UK'
  | 'VI' | 'ZH' | 'ZH-HANS' | 'ZH-HANT';

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
// Revirada Types
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
// Votz Types
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
// ElevenLabs Types
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
```

---

## Client API

Créez un fichier `lib/ankilang-api-client.ts` :

```typescript
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
} from '../types/ankilang-api';

// ============================================
// API Client Configuration
// ============================================

export interface AnkilangApiConfig {
  baseUrl: string;
  jwtToken: string;
  origin?: string;
}

export class AnkilangApiError extends Error {
  constructor(
    public status: number,
    public title: string,
    public detail: string,
    public instance?: string
  ) {
    super(detail);
    this.name = 'AnkilangApiError';
  }
}

// ============================================
// Main API Client Class
// ============================================

export class AnkilangApiClient {
  private baseUrl: string;
  private jwtToken: string;
  private origin: string;

  constructor(config: AnkilangApiConfig) {
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
      console.debug('Rate limit:', rateLimitInfo);
    }

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new AnkilangApiError(
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

export function createAnkilangApiClient(
  jwtToken: string,
  baseUrl: string = import.meta.env.VITE_ANKILANG_API_URL || 'https://ankilang-api-monorepo.vercel.app',
  origin: string = import.meta.env.VITE_ANKILANG_ALLOWED_ORIGIN || 'https://ankilang.com'
): AnkilangApiClient {
  return new AnkilangApiClient({ baseUrl, jwtToken, origin });
}
```

---

## Exemples d'utilisation

### 1. Initialisation du client

```typescript
import { createAnkilangApiClient } from './lib/ankilang-api-client';

// Récupérer le JWT depuis votre système d'authentification
const jwtToken = 'eyJ0eXAiOiJKV1QiLCJhbGc...';

const api = createAnkilangApiClient(jwtToken);
```

### 2. DeepL - Traduction

```typescript
async function translateText() {
  try {
    const result = await api.translateWithDeepL({
      text: 'Hello world',
      sourceLang: 'EN',
      targetLang: 'FR',
    });

    console.log(result.translatedText); // "Bonjour le monde"
  } catch (error) {
    if (error instanceof AnkilangApiError) {
      console.error(`Error ${error.status}: ${error.detail}`);
    }
  }
}
```

### 3. Pexels - Recherche d'images

```typescript
async function searchImages() {
  try {
    const result = await api.searchPexels({
      query: 'cat',
      perPage: 10,
      locale: 'fr-FR',
    });

    console.log(`Found ${result.total_results} images`);
    result.photos.forEach(photo => {
      console.log(`- ${photo.alt} by ${photo.photographer}`);
    });
  } catch (error) {
    console.error('Search failed:', error);
  }
}
```

### 4. Pexels - Optimisation d'image

```typescript
async function optimizeImage(imageUrl: string) {
  try {
    const result = await api.optimizeImage({
      imageUrl,
      width: 800,
      quality: 85,
      format: 'webp',
    });

    console.log(`Compression: ${result.compression}`);
    console.log(`Size: ${result.originalSize} → ${result.optimizedSize} bytes`);

    // Utiliser l'image optimisée
    const img = document.createElement('img');
    img.src = result.optimizedImage; // Data URL
    document.body.appendChild(img);
  } catch (error) {
    console.error('Optimization failed:', error);
  }
}
```

### 5. Revirada - Traduction Occitan

```typescript
async function translateOccitan() {
  try {
    // Français → Occitan Languedocien
    const frToOc = await api.translateWithRevirada({
      text: 'Bonjour le monde',
      direction: 'fr-oc',
      dialect: 'lengadocian',
    });
    console.log(frToOc.translatedText);

    // Occitan Gascon → Français
    const ocToFr = await api.translateWithRevirada({
      text: 'Bonjorn',
      direction: 'oc-fr',
      dialect: 'gascon',
    });
    console.log(ocToFr.translatedText);
  } catch (error) {
    console.error('Translation failed:', error);
  }
}
```

### 6. Votz - Synthèse vocale Occitan

```typescript
async function generateOccitanSpeech() {
  try {
    // Mode file (retourne base64)
    const fileResult = await api.generateVotzTTS({
      text: 'Bonjorn',
      language: 'languedoc',
      mode: 'file',
    });

    if (fileResult.mode === 'file') {
      // Jouer l'audio (voir section Helpers Audio)
      playBase64Audio(fileResult.audio, 'audio/wav');
    }

    // Mode URL (retourne URL temporaire)
    const urlResult = await api.generateVotzTTS({
      text: 'Bonjorn',
      language: 'gascon',
      mode: 'url',
    });

    if (urlResult.mode === 'url') {
      const audio = new Audio(urlResult.url);
      audio.play();
    }
  } catch (error) {
    console.error('TTS generation failed:', error);
  }
}
```

### 7. ElevenLabs - Synthèse vocale multilingue

```typescript
import { ELEVENLABS_VOICES } from './types/ankilang-api';

async function generateMultilingualSpeech() {
  try {
    const result = await api.generateElevenlabsTTS({
      text: 'Bonjour, ceci est un test de synthèse vocale.',
      voiceId: ELEVENLABS_VOICES.RACHEL,
      modelId: 'eleven_multilingual_v2',
      stability: 0.65,
      similarityBoost: 0.85,
      style: 0.3,
      useSpeakerBoost: true,
    });

    // Jouer l'audio MP3 (voir section Helpers Audio)
    playBase64Audio(result.audio, 'audio/mpeg');
  } catch (error) {
    console.error('TTS generation failed:', error);
  }
}
```

---

## Gestion des erreurs

### Type-safe error handling

```typescript
import { AnkilangApiError } from './lib/ankilang-api-client';

async function handleApiCall() {
  try {
    const result = await api.translateWithDeepL({
      text: 'Hello',
      sourceLang: 'EN',
      targetLang: 'FR',
    });
    return result;
  } catch (error) {
    if (error instanceof AnkilangApiError) {
      // Erreurs API spécifiques
      switch (error.status) {
        case 401:
          console.error('Authentication failed - JWT invalid');
          // Rediriger vers login
          break;
        case 429:
          console.error('Rate limit exceeded');
          // Afficher message à l'utilisateur
          break;
        case 502:
          console.error('External API error:', error.detail);
          break;
        default:
          console.error(`API Error: ${error.detail}`);
      }
    } else {
      // Erreurs réseau ou autres
      console.error('Network error:', error);
    }
  }
}
```

### React Error Boundary

```typescript
import { Component, ErrorInfo, ReactNode } from 'react';
import { AnkilangApiError } from './lib/ankilang-api-client';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: AnkilangApiError;
}

export class ApiErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    if (error instanceof AnkilangApiError) {
      return { hasError: true, error };
    }
    return { hasError: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('API Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="error-container">
          <h2>Une erreur est survenue</h2>
          <p>{this.state.error.detail}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Réessayer
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## Helpers Audio

Créez un fichier `utils/audio-helpers.ts` :

```typescript
/**
 * Convert base64 audio to Blob
 */
export function base64ToBlob(base64: string, mimeType: string): Blob {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new Blob([bytes], { type: mimeType });
}

/**
 * Play base64 audio
 */
export function playBase64Audio(base64: string, mimeType: string): HTMLAudioElement {
  const blob = base64ToBlob(base64, mimeType);
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);

  // Cleanup URL after audio ends
  audio.addEventListener('ended', () => {
    URL.revokeObjectURL(url);
  });

  audio.play();
  return audio;
}

/**
 * Download base64 audio as file
 */
export function downloadBase64Audio(
  base64: string,
  mimeType: string,
  filename: string
): void {
  const blob = base64ToBlob(base64, mimeType);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

/**
 * Create audio element from base64 with controls
 */
export function createAudioElement(
  base64: string,
  mimeType: string,
  options: { controls?: boolean; autoplay?: boolean } = {}
): HTMLAudioElement {
  const blob = base64ToBlob(base64, mimeType);
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);

  if (options.controls) {
    audio.controls = true;
  }

  if (options.autoplay) {
    audio.autoplay = true;
  }

  return audio;
}
```

### Utilisation des helpers audio

```typescript
import { playBase64Audio, downloadBase64Audio } from './utils/audio-helpers';

// Votz (WAV)
const votzResult = await api.generateVotzTTS({
  text: 'Bonjorn',
  language: 'languedoc',
  mode: 'file',
});

if (votzResult.mode === 'file') {
  playBase64Audio(votzResult.audio, 'audio/wav');

  // Ou télécharger
  downloadBase64Audio(votzResult.audio, 'audio/wav', 'votz-audio.wav');
}

// ElevenLabs (MP3)
const elevenResult = await api.generateElevenlabsTTS({
  text: 'Hello world',
  voiceId: ELEVENLABS_VOICES.RACHEL,
});

playBase64Audio(elevenResult.audio, 'audio/mpeg');
```

---

## Helpers Images

Créez un fichier `utils/image-helpers.ts` :

```typescript
/**
 * Load image from data URL
 */
export function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Download image from data URL
 */
export function downloadImageFromDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

/**
 * Display optimized image in container
 */
export async function displayOptimizedImage(
  dataUrl: string,
  container: HTMLElement
): Promise<void> {
  const img = await loadImageFromDataUrl(dataUrl);
  img.style.maxWidth = '100%';
  img.style.height = 'auto';
  container.appendChild(img);
}
```

### Utilisation des helpers images

```typescript
import { displayOptimizedImage, downloadImageFromDataUrl } from './utils/image-helpers';

const result = await api.optimizeImage({
  imageUrl: 'https://example.com/image.jpg',
  width: 800,
  format: 'webp',
  quality: 85,
});

// Afficher dans le DOM
const container = document.getElementById('image-container');
if (container) {
  await displayOptimizedImage(result.optimizedImage, container);
}

// Télécharger
downloadImageFromDataUrl(result.optimizedImage, 'optimized-image.webp');
```

---

## React Hooks (Bonus)

Créez un fichier `hooks/useAnkilangApi.ts` :

```typescript
import { useState, useCallback } from 'react';
import { AnkilangApiClient, AnkilangApiError } from '../lib/ankilang-api-client';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: AnkilangApiError | null;
}

export function useApiCall<T, P>(
  apiMethod: (params: P) => Promise<T>
) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (params: P) => {
      setState({ data: null, loading: true, error: null });

      try {
        const data = await apiMethod(params);
        setState({ data, loading: false, error: null });
        return data;
      } catch (error) {
        const apiError = error instanceof AnkilangApiError
          ? error
          : new AnkilangApiError(500, 'Unknown Error', 'An unknown error occurred');

        setState({ data: null, loading: false, error: apiError });
        throw apiError;
      }
    },
    [apiMethod]
  );

  return { ...state, execute };
}

// ============================================
// Hooks spécifiques pour chaque API
// ============================================

export function useDeepLTranslation(api: AnkilangApiClient) {
  return useApiCall((params: Parameters<typeof api.translateWithDeepL>[0]) =>
    api.translateWithDeepL(params)
  );
}

export function usePexelsSearch(api: AnkilangApiClient) {
  return useApiCall((params: Parameters<typeof api.searchPexels>[0]) =>
    api.searchPexels(params)
  );
}

export function useReviradaTranslation(api: AnkilangApiClient) {
  return useApiCall((params: Parameters<typeof api.translateWithRevirada>[0]) =>
    api.translateWithRevirada(params)
  );
}

export function useVotzTTS(api: AnkilangApiClient) {
  return useApiCall((params: Parameters<typeof api.generateVotzTTS>[0]) =>
    api.generateVotzTTS(params)
  );
}

export function useElevenLabsTTS(api: AnkilangApiClient) {
  return useApiCall((params: Parameters<typeof api.generateElevenlabsTTS>[0]) =>
    api.generateElevenlabsTTS(params)
  );
}
```

### Utilisation des React Hooks

```typescript
import { createAnkilangApiClient } from './lib/ankilang-api-client';
import { useDeepLTranslation } from './hooks/useAnkilangApi';

function TranslationComponent() {
  const api = createAnkilangApiClient('YOUR_JWT_TOKEN');
  const { data, loading, error, execute } = useDeepLTranslation(api);

  const handleTranslate = async () => {
    try {
      await execute({
        text: 'Hello world',
        sourceLang: 'EN',
        targetLang: 'FR',
      });
    } catch (err) {
      console.error('Translation failed');
    }
  };

  return (
    <div>
      <button onClick={handleTranslate} disabled={loading}>
        {loading ? 'Translating...' : 'Translate'}
      </button>

      {error && <p className="error">{error.detail}</p>}
      {data && <p className="result">{data.translatedText}</p>}
    </div>
  );
}
```

### React Hook avec Audio Player

```typescript
import { useState } from 'react';
import { useVotzTTS } from './hooks/useAnkilangApi';
import { playBase64Audio } from './utils/audio-helpers';

function OccitanTTSPlayer({ api }: { api: AnkilangApiClient }) {
  const [text, setText] = useState('Bonjorn');
  const { loading, error, execute } = useVotzTTS(api);

  const handleSpeak = async () => {
    try {
      const result = await execute({
        text,
        language: 'languedoc',
        mode: 'file',
      });

      if (result.mode === 'file') {
        playBase64Audio(result.audio, 'audio/wav');
      }
    } catch (err) {
      console.error('TTS failed');
    }
  };

  return (
    <div>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Texte en occitan..."
      />
      <button onClick={handleSpeak} disabled={loading}>
        {loading ? '🔊 Génération...' : '🔊 Écouter'}
      </button>
      {error && <p className="error">{error.detail}</p>}
    </div>
  );
}
```

---

## Résumé

Vous avez maintenant tout ce qu'il faut pour intégrer l'AnkiLang API dans votre frontend :

✅ **Types TypeScript** complets pour toutes les APIs
✅ **Client API** type-safe avec gestion d'erreurs
✅ **Helpers** pour audio (WAV, MP3) et images
✅ **React Hooks** pour une intégration facile
✅ **Exemples concrets** pour chaque fonctionnalité

### Fichiers à créer dans votre frontend :

```
src/
├── types/
│   └── ankilang-api.ts          # Types TypeScript
├── lib/
│   └── ankilang-api-client.ts   # Client API
├── utils/
│   ├── audio-helpers.ts         # Helpers audio
│   └── image-helpers.ts         # Helpers images
└── hooks/
    └── useAnkilangApi.ts        # React Hooks (optionnel)
```

### Configuration requise :

```env
VITE_ANKILANG_API_URL=https://ankilang-api-monorepo.vercel.app
VITE_ANKILANG_ALLOWED_ORIGIN=https://ankilang.com
```

### Démarrage rapide :

```typescript
import { createAnkilangApiClient } from './lib/ankilang-api-client';

const api = createAnkilangApiClient('YOUR_JWT_TOKEN');

// Traduire avec DeepL
const translation = await api.translateWithDeepL({
  text: 'Hello',
  sourceLang: 'EN',
  targetLang: 'FR',
});

console.log(translation.translatedText); // "Bonjour"
```

---

**Documentation API complète** : Voir `API-DOCUMENTATION.txt`

**Support** : Consultez les fichiers `README.md`, `CHANGELOG.md`, `TEST-RESULTS.md`
