# Plan de Migration vers l'API Vercel Unifiée

**Date de création** : 2025-10-18
**Dernière mise à jour** : 2025-10-18 (Ajout stratégie cache/storage)
**Objectif** : Remplacer les services dispersés (Netlify Functions) par l'API unifiée déployée sur Vercel
**URL API** : `https://ankilang-api-monorepo.vercel.app`

---

## ⚠️ IMPORTANT - Stratégie Cache & Storage

### Décisions architecturales validées

#### 1. **Cache IDB TTS** → ✅ **100% PRÉSERVÉ**
- Aucun changement dans la logique de cache (`tts.ts` ligne 49-161)
- Mêmes clés déterministes via `buildCacheKey()`
- Même TTL : 7 jours (`ONE_WEEK`)
- Même adapter : `BrowserIDBCache` de `@ankilang/shared-cache`

#### 2. **Appwrite Storage** → ✅ **100% PRÉSERVÉ**

**Audio TTS** :
- Upload **côté client** via `cards.service.ts` ligne 120
- Processus identique : base64 → Blob → `storageService.uploadFile()`
- Bucket : `flashcard-images`
- Permissions : owner-only (`Permission.user(userId)`)

**Images Pexels** :
- **Stratégie retenue** : Garder `pexels-cache.ts` (Option B)
- **Raison** : Migration plus sûre, Sharp peut être ajouté en v2
- Processus : Check Appwrite Storage → Si MISS : download Pexels → upload Storage
- Clé déterministe : `buildCacheKey({ namespace: 'pexels', externalId, variant })`

#### 3. **Architecture finale TTS** :
```
User action: "Générer TTS"
  ↓
1. Check Cache IDB (clé déterministe) → HIT ? Retour immédiat ✅
  ↓ MISS
2. API Vercel (/api/votz ou /api/elevenlabs) → Retourne base64
  ↓
3. Conversion base64 → Blob
  ↓
4. Stockage Cache IDB (pour réutilisation rapide sous 7 jours)
  ↓
5. Si save=true : Upload Appwrite Storage (pour persistance permanente)
  ↓
6. Stockage audioFileId + audioUrl dans la carte (database)
```

**Bénéfices du double stockage** :
- Cache IDB : Accès instantané, offline, réduit API calls
- Appwrite Storage : Persistance long-terme, export Anki, multi-device

---

## 📊 Vue d'ensemble

### État actuel

| Service | Endpoint actuel | Statut | Problèmes |
|---------|----------------|--------|-----------|
| **Translation** | `/.netlify/functions/translate` | ❌ Non déployé | Stub non fonctionnel |
| **Votz TTS** | `https://ankilangvotz.netlify.app/.netlify/functions/votz` | ✅ Fonctionne | Endpoint séparé, pas de rate limiting unifié |
| **ElevenLabs TTS** | Appwrite Function directe | ✅ Fonctionne | Polling manuel, pas d'abstraction |
| **Pexels** | `https://ankilangpexels.netlify.app/.netlify/functions/pexels` | ✅ Fonctionne | Endpoint séparé, pas d'optimisation |

### État cible

| Service | Endpoint Vercel | Bénéfices |
|---------|----------------|-----------|
| **DeepL** | `/api/deepl` | Traduction multilingue (30 langues) |
| **Revirada** | `/api/revirada` | Traduction occitan (languedocien/gascon) |
| **Votz TTS** | `/api/votz` | TTS occitan avec mode file/url |
| **ElevenLabs TTS** | `/api/elevenlabs` | TTS multilingue avec contrôles avancés |
| **Pexels Search** | `/api/pexels` | Recherche d'images |
| **Pexels Optimize** | `/api/pexels-optimize` | Optimisation d'images (Sharp) |

**Avantages de la migration** :
- ✅ Authentification JWT unifiée
- ✅ Rate limiting cohérent (10-50 req/min selon l'API)
- ✅ Format d'erreur RFC 7807 standardisé
- ✅ Headers rate limit (`X-RateLimit-*`)
- ✅ Endpoints CORS configurés
- ✅ Optimisation d'images intégrée (Sharp)
- ✅ Contrôles vocaux ElevenLabs exposés (stability, similarityBoost, style)

---

## 🎯 Plan de migration (4 phases)

### Phase 1 : Infrastructure (non-breaking) ✅ SÛRE

**Objectif** : Créer les fichiers d'infrastructure sans toucher au code existant.

#### Fichiers à créer

##### 1.1 Types TypeScript

**Fichier** : `apps/web/src/types/ankilang-api.ts`

**Contenu** :
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

##### 1.2 Client API unifié

**Fichier** : `apps/web/src/lib/ankilang-api-client.ts`

**Contenu** : Voir `FRONTEND-INTEGRATION.md` lignes 250-437

**Points clés** :
- Classe `AnkilangApiClient` avec méthodes pour chaque API
- Gestion d'erreurs avec `AnkilangApiError` (extends `Error`)
- Extraction des headers rate limit
- Factory `createAnkilangApiClient(jwtToken, baseUrl, origin)`

##### 1.3 Helpers Audio

**Fichier** : `apps/web/src/utils/audio-helpers.ts`

**Fonctions** :
- `base64ToBlob(base64: string, mimeType: string): Blob`
- `playBase64Audio(base64: string, mimeType: string): HTMLAudioElement`
- `downloadBase64Audio(base64: string, mimeType: string, filename: string): void`
- `createAudioElement(base64: string, mimeType: string, options?): HTMLAudioElement`

**Note** : Certaines fonctions existent déjà dans `votz.ts` et `elevenlabs-appwrite.ts`, il faudra les centraliser.

##### 1.4 Helpers Images

**Fichier** : `apps/web/src/utils/image-helpers.ts`

**Fonctions** :
- `loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement>`
- `downloadImageFromDataUrl(dataUrl: string, filename: string): void`
- `displayOptimizedImage(dataUrl: string, container: HTMLElement): Promise<void>`

##### 1.5 Configuration environnement

**Fichier** : `apps/web/.env` (ou `.env.local`)

**Ajouter** :
```env
# API Vercel unifiée
VITE_ANKILANG_API_URL=https://ankilang-api-monorepo.vercel.app
VITE_ANKILANG_ALLOWED_ORIGIN=https://ankilang.com
```

**Garder** :
```env
# Authentification Appwrite (requis pour JWT)
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=ankilang
```

##### 1.6 React Hooks (optionnel)

**Fichier** : `apps/web/src/hooks/useAnkilangApi.ts`

**Contenu** : Voir `FRONTEND-INTEGRATION.md` lignes 876-953

**Hooks fournis** :
- `useApiCall<T, P>(apiMethod)` - Generic hook avec loading/error/data
- `useDeepLTranslation(api)`
- `usePexelsSearch(api)`
- `useReviradaTranslation(api)`
- `useVotzTTS(api)`
- `useElevenLabsTTS(api)`

---

### Phase 2 : Migration services individuels (breaking) ⚠️

**Objectif** : Remplacer chaque service existant par le client API unifié.

#### 2.1 Migration `pexels.ts` (FACILE)

**Fichier** : `apps/web/src/services/pexels.ts`

**Changements** :

**Avant** :
```typescript
// apps/web/src/services/pexels.ts (ACTUEL)
const BASE = import.meta.env.VITE_PEXELS_URL || PROD

async function fetchPexels(path: string, opts?: Opts) {
  const url = toURL(path, opts)
  const jwt = await getSessionJWT()
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${jwt}` }
  })
  return res
}

export async function pexelsSearchPhotos(query: string, opts: Opts = {}) {
  const res = await fetchPexels('/photos/search', { query, ...opts })
  return res.json()
}

export async function optimizeAndUploadImage(pexelsUrl: string) {
  // Appelle Netlify Function qui n'optimise PAS réellement
  const url = toURL('/optimize', { url: pexelsUrl })
  const res = await fetch(url, { ... })
  return res.json()
}
```

**Après** :
```typescript
// apps/web/src/services/pexels.ts (NOUVEAU)
import { createAnkilangApiClient } from '@/lib/ankilang-api-client'
import { getSessionJWT } from './appwrite'
import type { PexelsSearchRequest, PexelsSearchResponse } from '@/types/ankilang-api'

let apiClient: ReturnType<typeof createAnkilangApiClient> | null = null

async function getApiClient() {
  if (!apiClient) {
    const jwt = await getSessionJWT()
    if (!jwt) throw new Error('User not authenticated')
    apiClient = createAnkilangApiClient(jwt)
  }
  return apiClient
}

export async function pexelsSearchPhotos(
  query: string,
  opts: { page?: number; per_page?: number; locale?: string } = {}
): Promise<PexelsSearchResponse> {
  const api = await getApiClient()
  return api.searchPexels({
    query,
    perPage: opts.per_page,
    locale: opts.locale
  })
}

/**
 * ⚠️ STRATÉGIE RETENUE : Utiliser pexels-cache.ts (Option B)
 * Raison : Migration plus sûre, Sharp peut être ajouté en v2
 */
export async function optimizeAndUploadImage(pexelsUrl: string): Promise<{
  success: boolean;
  fileId: string;
  fileUrl: string;
  userId: string;
  originalSize: number;
  optimizedSize: number;
  savings: number;
}> {
  // Utiliser le cache Pexels existant qui gère déjà Appwrite Storage
  const { getOrPutPexelsImage } = await import('./pexels-cache')

  // Extraire l'ID Pexels de l'URL (ex: https://images.pexels.com/photos/45201/...)
  const pexelsId = extractPexelsIdFromUrl(pexelsUrl)

  const result = await getOrPutPexelsImage({
    pexelsId,
    srcUrl: pexelsUrl,
    variant: 'medium'
  })

  return {
    success: true,
    fileId: result.fileId,
    fileUrl: result.fileUrl,
    userId: '', // Non utilisé dans pexels-cache
    originalSize: 0, // Non calculé (Sharp sera en v2)
    optimizedSize: 0,
    savings: 0
  }
}

/**
 * Helper pour extraire l'ID Pexels depuis l'URL
 */
function extractPexelsIdFromUrl(url: string): string {
  // URL format: https://images.pexels.com/photos/{id}/...
  const match = url.match(/\/photos\/(\d+)\//)
  if (match && match[1]) {
    return match[1]
  }
  // Fallback: utiliser un hash de l'URL complète
  return url.split('/').pop()?.split('?')[0] || 'unknown'
}

// Garder les autres exports pour compatibilité
export async function pexelsCurated(opts: { page?: number; per_page?: number } = {}) {
  const api = await getApiClient()
  return api.searchPexels({
    query: 'nature', // Query par défaut pour curated
    perPage: opts.per_page
  })
}

export async function pexelsPhoto(id: number | string) {
  // L'API Vercel n'expose pas /photos/:id, garder l'ancien code ou supprimer
  throw new Error('pexelsPhoto non supporté par l\'API Vercel')
}
```

**Code à supprimer** :
- `const PROD = ...`
- `const BASE = ...`
- `function toURL(...)`
- `async function fetchPexels(...)`

**Code à GARDER** :
- ✅ `pexels-cache.ts` (inchangé)
- ✅ `storage.service.ts` (inchangé)

**Tests manuels** :
```typescript
// Dans la console ou composant de test
import { pexelsSearchPhotos, optimizeAndUploadImage } from './services/pexels'

const results = await pexelsSearchPhotos('cat', { per_page: 5, locale: 'fr-FR' })
console.log(results.photos)

// Tester avec URL Pexels réelle
const optimized = await optimizeAndUploadImage(results.photos[0].src.medium)
console.log('Upload Appwrite Storage:', optimized.fileId, optimized.fileUrl)
```

**⚠️ Note Sharp (v2)** : Si tu veux activer l'optimisation Sharp plus tard :
```typescript
// Version future avec Sharp (Option A)
export async function optimizeAndUploadImageWithSharp(pexelsUrl: string) {
  const api = await getApiClient()

  // 1. Optimiser avec Sharp via API Vercel
  const optimized = await api.optimizeImage({
    imageUrl: pexelsUrl,
    width: 800,
    quality: 85,
    format: 'webp'
  })

  // 2. Convertir base64 → Blob
  const blob = base64ToBlob(optimized.optimizedImage, `image/${optimized.format}`)

  // 3. Upload vers Appwrite Storage
  const { getSessionJWT } = await import('./appwrite')
  const jwt = await getSessionJWT()
  const userId = jwt // Extraire userId du JWT

  const storageService = new StorageService()
  const file = await storageService.uploadFile(
    'flashcard-images',
    `pexels-${Date.now()}.${optimized.format}`,
    blob,
    userId
  )

  return {
    success: true,
    fileId: file.$id,
    fileUrl: storageService.getFileView('flashcard-images', file.$id),
    userId,
    originalSize: optimized.originalSize,
    optimizedSize: optimized.optimizedSize,
    savings: parseFloat(optimized.compression.replace('%', ''))
  }
}
```

---

#### 2.2 Migration `votz.ts` (FACILE)

**Fichier** : `apps/web/src/services/votz.ts`

**Changements** :

**Avant** :
```typescript
// apps/web/src/services/votz.ts (ACTUEL)
const PROD = 'https://ankilangvotz.netlify.app/.netlify/functions/votz'
const BASE = import.meta.env.VITE_VOTZ_URL || PROD

export async function ttsToBlob(text: string, language: VotzLanguage = 'languedoc'): Promise<Blob> {
  const jwt = await getSessionJWT()
  const response = await fetch(BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    },
    body: JSON.stringify({ text: text.trim(), language, mode: 'file' })
  })
  const arrayBuffer = await response.arrayBuffer()
  return new Blob([arrayBuffer], { type: 'audio/mpeg' })
}
```

**Après** :
```typescript
// apps/web/src/services/votz.ts (NOUVEAU)
import { createAnkilangApiClient } from '@/lib/ankilang-api-client'
import { getSessionJWT } from './appwrite'
import { base64ToBlob } from '@/utils/audio-helpers'
import { CacheManager } from './cache-manager'
import type { VotzLanguage, VotzRequest, VotzFileResponse, VotzUrlResponse } from '@/types/ankilang-api'

let apiClient: ReturnType<typeof createAnkilangApiClient> | null = null

async function getApiClient() {
  if (!apiClient) {
    const jwt = await getSessionJWT()
    if (!jwt) throw new Error('User not authenticated. Please log in to use TTS.')
    apiClient = createAnkilangApiClient(jwt)
  }
  return apiClient
}

/**
 * Génère une synthèse vocale via Votz pour l'occitan
 * @param text - Texte à synthétiser
 * @param language - Dialecte occitan (languedoc ou gascon)
 * @returns Promise<Blob> - Fichier audio MP3
 */
export async function ttsToBlob(text: string, language: VotzLanguage = 'languedoc'): Promise<Blob> {
  if (!text.trim()) {
    throw new Error('Le texte ne peut pas être vide')
  }

  const api = await getApiClient()

  const result = await api.generateVotzTTS({
    text: text.trim(),
    language,
    mode: 'file'
  })

  if (result.mode === 'file') {
    // Convertir base64 en Blob
    return base64ToBlob(result.audio, 'audio/wav')
  }

  throw new Error('Mode de réponse inattendu')
}

/**
 * Génère une synthèse vocale et retourne l'URL temporaire Votz
 */
export async function ttsToTempURL(text: string, language: VotzLanguage = 'languedoc'): Promise<string> {
  if (!text.trim()) {
    throw new Error('Le texte ne peut pas être vide')
  }

  const api = await getApiClient()

  const result = await api.generateVotzTTS({
    text: text.trim(),
    language,
    mode: 'url'
  })

  if (result.mode === 'url') {
    return result.url
  }

  // Si mode file, convertir en data URL
  if (result.mode === 'file') {
    const blob = base64ToBlob(result.audio, 'audio/wav')
    return await blobToBase64(blob)
  }

  throw new Error('Mode de réponse inattendu')
}

/**
 * Génère une synthèse vocale et retourne une URL d'objet
 */
export async function ttsToObjectURL(text: string, language: VotzLanguage = 'languedoc'): Promise<string> {
  const blob = await ttsToBlob(text, language)
  const url = URL.createObjectURL(blob)
  CacheManager.trackObjectUrl(url)
  return url
}

/**
 * Génère une synthèse vocale et la joue immédiatement
 */
export async function playTTS(text: string, language: VotzLanguage = 'languedoc'): Promise<HTMLAudioElement> {
  const audioUrl = await ttsToObjectURL(text, language)
  const audio = new Audio(audioUrl)

  // Nettoyer l'URL après lecture
  audio.addEventListener('ended', () => {
    URL.revokeObjectURL(audioUrl)
  })

  await audio.play()
  return audio
}

// Helper pour convertir Blob en base64 (garder de l'ancien code)
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// Garder les fonctions de détection (isOccitanText, detectDialect) sans changement
export function isOccitanText(text: string): boolean {
  const occitanWords = [
    'bonjorn', 'adieu', 'mercé', 'plan', 'aquí', 'aquò', 'que', 'se', 'de', 'lo', 'la', 'los', 'las',
    'un', 'una', 'amb', 'per', 'dins', 'sus', 'jos', 'abans', 'après', 'ara', 'ièr', 'deman'
  ]

  const words = text.toLowerCase().split(/\s+/)
  const occitanWordCount = words.filter(word =>
    occitanWords.some(occWord => word.includes(occWord))
  ).length

  return occitanWordCount > 0 && (occitanWordCount / words.length) > 0.1
}

export function detectDialect(text: string): VotzLanguage {
  const gasconMarkers = ['que', 'hèr', 'òm', 'ua', 'eth', 'ath']
  const languedocMarkers = ['que', 'ièr', 'òme', 'una', 'lo', 'la']

  const lowerText = text.toLowerCase()

  const gasconScore = gasconMarkers.reduce((score, marker) =>
    score + (lowerText.includes(marker) ? 1 : 0), 0
  )

  const languedocScore = languedocMarkers.reduce((score, marker) =>
    score + (lowerText.includes(marker) ? 1 : 0), 0
  )

  return gasconScore > languedocScore ? 'gascon' : 'languedoc'
}
```

**Code à supprimer** :
- `const PROD = ...`
- `const BASE = ...`
- Boucle de retry `for (let i = 0; i < urlsToTry.length; i++)`
- Gestion manuelle des erreurs réseau (géré par le client)

**Tests manuels** :
```typescript
const blob = await ttsToBlob('Bonjorn lo monde', 'languedoc')
console.log(blob.size, blob.type)

const url = await ttsToObjectURL('Adieu', 'gascon')
const audio = new Audio(url)
audio.play()
```

---

#### 2.3 Migration `translate.ts` (MOYEN)

**Fichier** : `apps/web/src/services/translate.ts`

**Changements** :

**Avant** :
```typescript
// apps/web/src/services/translate.ts (ACTUEL - STUB)
export async function translate(req: TranslateRequest, opts?: { signal?: AbortSignal }): Promise<TranslateResponse> {
  const res = await fetch('/.netlify/functions/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
    signal: opts?.signal,
  })
  // ...
}
```

**Après** :
```typescript
// apps/web/src/services/translate.ts (NOUVEAU)
import { createAnkilangApiClient } from '@/lib/ankilang-api-client'
import { getSessionJWT } from './appwrite'
import type { DeepLSourceLang, DeepLTargetLang } from '@/types/ankilang-api'

export type TranslateRequest = {
  sourceLang: string
  targetLang: string
  text: string
}

export type TranslateResponse = {
  translatedText: string
  provider?: 'revirada' | 'deepl'
}

let apiClient: ReturnType<typeof createAnkilangApiClient> | null = null

async function getApiClient() {
  if (!apiClient) {
    const jwt = await getSessionJWT()
    if (!jwt) throw new Error('User not authenticated')
    apiClient = createAnkilangApiClient(jwt)
  }
  return apiClient
}

/**
 * Détecte si la traduction doit utiliser Revirada (occitan) ou DeepL
 */
function shouldUseRevirada(sourceLang: string, targetLang: string): boolean {
  const isOccitan = (lang: string) => lang === 'oc' || lang.startsWith('oc-')
  return isOccitan(sourceLang) || isOccitan(targetLang)
}

/**
 * Traduit un texte en détectant automatiquement le service approprié
 */
export async function translate(
  req: TranslateRequest,
  opts?: { signal?: AbortSignal }
): Promise<TranslateResponse> {
  const api = await getApiClient()

  // Routage Revirada vs DeepL
  if (shouldUseRevirada(req.sourceLang, req.targetLang)) {
    // Traduction occitan via Revirada
    const direction = req.targetLang === 'oc' || req.targetLang.startsWith('oc-') ? 'fr-oc' : 'oc-fr'
    const dialect = req.targetLang === 'oc-gascon' ? 'gascon' : 'lengadocian'

    const result = await api.translateWithRevirada({
      text: req.text,
      direction,
      dialect
    })

    return {
      translatedText: result.translatedText,
      provider: 'revirada'
    }
  } else {
    // Traduction multilingue via DeepL
    const result = await api.translateWithDeepL({
      text: req.text,
      sourceLang: req.sourceLang.toUpperCase() as DeepLSourceLang,
      targetLang: req.targetLang.toUpperCase() as DeepLTargetLang
    })

    return {
      translatedText: result.translatedText,
      provider: 'deepl'
    }
  }
}

/**
 * Traduction occitan uniquement (wrapper pour clarté)
 */
export async function translateOccitan(
  text: string,
  direction: 'fr-oc' | 'oc-fr',
  dialect: 'lengadocian' | 'gascon' = 'lengadocian'
): Promise<TranslateResponse> {
  const api = await getApiClient()

  const result = await api.translateWithRevirada({
    text,
    direction,
    dialect
  })

  return {
    translatedText: result.translatedText,
    provider: 'revirada'
  }
}

/**
 * Traduction DeepL uniquement (wrapper pour clarté)
 */
export async function translateMultilingual(
  text: string,
  sourceLang: DeepLSourceLang,
  targetLang: DeepLTargetLang
): Promise<TranslateResponse> {
  const api = await getApiClient()

  const result = await api.translateWithDeepL({
    text,
    sourceLang,
    targetLang
  })

  return {
    translatedText: result.translatedText,
    provider: 'deepl'
  }
}
```

**Code à supprimer** :
- Appel à `/.netlify/functions/translate` (non déployé)
- `async function safeText(...)`

**Tests manuels** :
```typescript
// DeepL
const result1 = await translate({
  text: 'Hello world',
  sourceLang: 'en',
  targetLang: 'fr'
})
console.log(result1.translatedText, result1.provider) // "Bonjour le monde", "deepl"

// Revirada
const result2 = await translate({
  text: 'Bonjour',
  sourceLang: 'fr',
  targetLang: 'oc'
})
console.log(result2.translatedText, result2.provider) // "Bonjorn", "revirada"
```

---

#### 2.4 Migration `elevenlabs-appwrite.ts` (MOYEN)

**Fichier** : `apps/web/src/services/elevenlabs-appwrite.ts`

**⚠️ IMPORTANT** : L'upload Appwrite Storage se fait **côté client** dans `cards.service.ts`, pas via l'API Vercel.

**Changements** :

**Avant** :
```typescript
// apps/web/src/services/elevenlabs-appwrite.ts (ACTUEL)
export async function ttsViaAppwrite(params: {
  text: string;
  language_code: string;
  voice_id?: string;
  save_to_storage?: boolean;
  output_format?: string;
}): Promise<{ url: string; mimeType: string; provider: 'elevenlabs' }> {
  const payload = { ... }
  const exec = await functions.createExecution(FUNCTION_ID, JSON.stringify(payload))

  // Polling
  let final = exec
  if (exec.status !== 'completed' && exec.$id) {
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 400))
      final = await functions.getExecution(FUNCTION_ID, exec.$id)
      if (final.status === 'completed' || final.status === 'failed') break
    }
  }

  // Parse response
  const raw = (final as any).response || (final as any).responseBody
  const data = JSON.parse(String(raw))

  if (payload.save_to_storage) {
    return { url: data.fileUrl, mimeType: 'audio/mpeg', provider: 'elevenlabs' }
  }

  return { url: `data:audio/mpeg;base64,${data.audio}`, mimeType: 'audio/mpeg', provider: 'elevenlabs' }
}
```

**Après** :
```typescript
// apps/web/src/services/elevenlabs-appwrite.ts (NOUVEAU)
import { createAnkilangApiClient } from '@/lib/ankilang-api-client'
import { getSessionJWT } from './appwrite'
import { base64ToBlob } from '@/utils/audio-helpers'
import type { ElevenLabsRequest, ElevenLabsModel } from '@/types/ankilang-api'

let apiClient: ReturnType<typeof createAnkilangApiClient> | null = null

async function getApiClient() {
  if (!apiClient) {
    const jwt = await getSessionJWT()
    if (!jwt) throw new Error('User not authenticated')
    apiClient = createAnkilangApiClient(jwt)
  }
  return apiClient
}

/**
 * Convertit une langue en ISO 639-1 (fr-FR → fr, de-DE → de)
 */
function toISO639_1(lang?: string): string | undefined {
  if (!lang) return undefined
  const parts = lang.toLowerCase().split('-')
  const two = parts[0]
  return two && two.length === 2 ? two : undefined
}

/**
 * NOUVELLE INTERFACE UNIFIÉE - Fonction principale ElevenLabs via API Vercel
 */
export async function ttsViaAppwrite(params: {
  text: string;
  language_code: string;
  voice_id?: string;
  save_to_storage?: boolean;
  output_format?: string;
}): Promise<{ url: string; mimeType: string; provider: 'elevenlabs' }> {
  if (!params.text?.trim()) throw new Error('Le texte est vide')

  const api = await getApiClient()

  // Mapping output_format → modelId
  const modelId: ElevenLabsModel = params.output_format?.includes('turbo')
    ? 'eleven_turbo_v2'
    : 'eleven_multilingual_v2'

  const result = await api.generateElevenlabsTTS({
    text: params.text.trim(),
    voiceId: params.voice_id ?? '21m00Tcm4TlvDq8ikWAM',
    modelId,
    stability: 0.5,
    similarityBoost: 0.75,
    style: 0.0,
    useSpeakerBoost: true
  })

  // L'API Vercel retourne toujours l'audio en base64
  // Si save_to_storage=true, il faut uploader manuellement vers Appwrite Storage
  if (params.save_to_storage) {
    // Convertir base64 → Blob
    const blob = base64ToBlob(result.audio, 'audio/mpeg')

    // Upload vers Appwrite Storage
    const { Storage } = await import('appwrite')
    const storage = new Storage((await import('./appwrite')).default)
    const bucketId = import.meta.env.VITE_APPWRITE_BUCKET_ID || 'flashcard-images'

    const file = await storage.createFile(
      bucketId,
      'unique()', // ID auto
      new File([blob], 'tts-audio.mp3', { type: 'audio/mpeg' })
    )

    const fileUrl = `${import.meta.env.VITE_APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files/${file.$id}/view?project=${import.meta.env.VITE_APPWRITE_PROJECT_ID}`

    return {
      url: fileUrl,
      mimeType: 'audio/mpeg',
      provider: 'elevenlabs'
    }
  }

  // Mode preview : retourner data URL
  return {
    url: `data:audio/mpeg;base64,${result.audio}`,
    mimeType: 'audio/mpeg',
    provider: 'elevenlabs'
  }
}

// Fonctions de compatibilité (garder pour ne pas casser l'ancien code)
export async function ttsToBlob(text: string, language: string, voice?: string): Promise<Blob> {
  const result = await ttsViaAppwrite({
    text,
    language_code: language,
    voice_id: voice,
    save_to_storage: false,
    output_format: 'mp3_22050_64'
  })

  if (result.url.startsWith('data:')) {
    const response = await fetch(result.url)
    return await response.blob()
  }

  throw new Error('Format de retour inattendu')
}

export async function ttsToStorage(text: string, language: string, voice?: string): Promise<{ fileUrl: string; fileId: string }> {
  const result = await ttsViaAppwrite({
    text,
    language_code: language,
    voice_id: voice,
    save_to_storage: true,
    output_format: 'mp3_44100_128'
  })

  const fileId = result.url.split('/').pop()?.split('?')[0] || 'unknown'

  return { fileUrl: result.url, fileId }
}

// Marquer comme @deprecated
export async function ttsPreview(opts: any) {
  console.warn('@deprecated ttsPreview: use ttsViaAppwrite instead')
  return ttsViaAppwrite({
    text: opts.text,
    language_code: opts.language,
    voice_id: opts.voiceId,
    save_to_storage: false,
    output_format: opts.outputFormat
  })
}

export async function ttsSaveAndLink(opts: any) {
  console.warn('@deprecated ttsSaveAndLink: use ttsViaAppwrite with save_to_storage=true')
  return ttsViaAppwrite({
    text: opts.text,
    language_code: opts.language,
    voice_id: opts.voiceId,
    save_to_storage: true,
    output_format: opts.outputFormat
  })
}

export async function playTTS(text: string, language: string, voice?: string): Promise<HTMLAudioElement> {
  const { url } = await ttsViaAppwrite({
    text,
    language_code: language,
    voice_id: voice,
    save_to_storage: false
  })

  const audio = new Audio(url)

  audio.addEventListener('ended', () => {
    if (url.startsWith('blob:')) URL.revokeObjectURL(url)
  })
  audio.addEventListener('error', () => {
    if (url.startsWith('blob:')) URL.revokeObjectURL(url)
  })

  return audio
}
```

**Code à supprimer** :
- `const functions = new Functions(client)` (pas besoin d'Appwrite Functions)
- Boucle de polling (l'API Vercel retourne directement)
- Parsing manuel de `response` vs `responseBody`
- `const FUNCTION_ID = ...` (plus utilisé)

**Points d'attention** :
- ⚠️ L'API Vercel retourne toujours `audio` en base64, jamais `fileUrl`
- ✅ Upload Appwrite Storage géré par `cards.service.ts` ligne 120 (déjà existant)
- ✅ Paramètre `save_to_storage` **ignoré** dans la nouvelle version (upload toujours côté client)
- ✅ La fonction `deleteCardAndAudio` reste inchangée (pas liée à l'API)

**Flux upload audio (inchangé)** :
```
1. API Vercel → Retourne base64
2. cards.service.ts reçoit data URL (ligne 146)
3. uploadAudioToStorage() : base64 → Blob (ligne 102-111)
4. storageService.uploadFile() → Appwrite Storage (ligne 120)
5. Stockage audioFileId + audioUrl dans la carte
```

**Tests manuels** :
```typescript
// Preview (data URL)
const preview = await ttsViaAppwrite({
  text: 'Bonjour',
  language_code: 'fr',
  voice_id: '21m00Tcm4TlvDq8ikWAM',
  save_to_storage: false
})
console.log(preview.url.startsWith('data:')) // true

// Save to storage
const saved = await ttsViaAppwrite({
  text: 'Hello',
  language_code: 'en',
  voice_id: 'pNInz6obpgDQGcFmaJgB',
  save_to_storage: true
})
console.log(saved.url.includes('appwrite')) // true
```

---

### Phase 3 : Adaptation de l'orchestrateur `tts.ts` ⚠️

**Fichier** : `apps/web/src/services/tts.ts`

**Objectif** : Adapter le routeur intelligent pour utiliser les services migrés.

**Changements** :

Le fichier `tts.ts` est déjà bien structuré avec :
- Détection automatique Votz (occitan) vs ElevenLabs (autres langues)
- Cache IDB avec métriques
- Gestion des erreurs

**Points à vérifier** :

1. **Imports** : S'assurer que `votz.ts` et `elevenlabs-appwrite.ts` exportent les bonnes fonctions
2. **Logique de cache** : ✅ GARDER INTACT (déjà optimale)
3. **Gestion des Blob** : S'assurer que les conversions base64 → Blob fonctionnent

**⚠️ IMPORTANT - Aucun changement nécessaire dans `tts.ts`** :

```typescript
// apps/web/src/services/tts.ts (AUCUNE MODIFICATION)

// Les imports restent identiques
import { ttsToBlob as votzTtsToBlob } from './votz'
import { ttsViaAppwrite } from './elevenlabs-appwrite'

// Le cache IDB reste intact (ligne 49-161)
const key = await buildCacheKey({ namespace: 'tts', lang, voice, speed, text })
let cached = await idb.get<Blob>(key)
if (cached) { /* HIT */ }

// La logique de routage reste identique (ligne 94-138)
if (isOccitan(language_code)) {
  blob = await votzTtsToBlob(text, 'languedoc')
} else {
  result = await ttsViaAppwrite({ text, language_code, voice_id, save_to_storage, output_format })
}

// La mise en cache reste identique (ligne 140-153)
await idb.set(key, blob, { ttlMs: ONE_WEEK })
```

**Validation** :
- ✅ `votz.ts` exporte `ttsToBlob()` qui appelle l'API Vercel en interne
- ✅ `elevenlabs-appwrite.ts` exporte `ttsViaAppwrite()` qui appelle l'API Vercel en interne
- ✅ `tts.ts` ne voit aucune différence, continue de recevoir des `Blob`
- ✅ Cache IDB fonctionne avec les mêmes clés déterministes

**Tests manuels** :
```typescript
// Test occitan
const oc = await generateTTS({
  text: 'Bonjorn',
  language_code: 'oc',
  save: false
})
console.log(oc.provider) // 'votz'

// Test autre langue
const fr = await generateTTS({
  text: 'Bonjour',
  language_code: 'fr',
  save: false
})
console.log(fr.provider) // 'elevenlabs'

// Test cache
const cached = await generateTTS({
  text: 'Bonjorn',
  language_code: 'oc',
  save: false
})
console.log('Should hit cache:', cached)
```

---

### Phase 4 : Adaptation des composants React ⚠️

**Objectif** : Mettre à jour les composants qui utilisent les services migrés.

#### Composants à adapter

##### 4.1 `StepEnhance.tsx` (Création de carte V2)

**Fichier** : `apps/web/src/components/cards/new-modal-v2/StepEnhance.tsx`

**Localiser** :
```bash
grep -r "generateTTS\|translate\|pexelsSearch" apps/web/src/components/cards/
```

**Vérifier les imports** :
```typescript
import { generateTTS, playTTS } from '@/services/tts'
import { translate } from '@/services/translate'
import { pexelsSearchPhotos, optimizeAndUploadImage } from '@/services/pexels'
```

**Actions** :
- ✅ Si les imports pointent vers les services migrés → OK, rien à faire
- ⚠️ Si les imports sont directs (`votz.ts`, `elevenlabs-appwrite.ts`) → Changer pour `tts.ts`

##### 4.2 Autres composants utilisant TTS/Translate/Pexels

**Recherche globale** :
```bash
# TTS
grep -r "ttsToBlob\|playTTS\|generateTTS" apps/web/src/components/

# Translate
grep -r "translate(" apps/web/src/components/

# Pexels
grep -r "pexelsSearch\|optimizeAndUpload" apps/web/src/components/
```

**Actions** :
- Vérifier que tous les imports pointent vers les services migrés
- Tester manuellement chaque composant

---

### Phase 5 : Nettoyage et documentation 🧹

#### 5.1 Supprimer le code obsolète

**Fichiers à supprimer** :
- ❌ Aucun (garder les anciens services avec `@deprecated` pour compatibilité)

**Code à marquer `@deprecated`** :
```typescript
// apps/web/src/services/elevenlabs-appwrite.ts
/**
 * @deprecated Utiliser ttsViaAppwrite() à la place
 */
export async function ttsPreview(...) { ... }

/**
 * @deprecated Utiliser ttsViaAppwrite() à la place
 */
export async function ttsSaveAndLink(...) { ... }
```

#### 5.2 Variables d'environnement à nettoyer

**Fichier** : `apps/web/.env`

**À SUPPRIMER** (si plus utilisées) :
```env
# VITE_VOTZ_URL=... (si vous n'utilisez plus Netlify Functions)
# VITE_PEXELS_URL=... (si vous n'utilisez plus Netlify Functions)
# VITE_APPWRITE_ELEVENLABS_FUNCTION_ID=... (si vous passez par l'API Vercel)
```

**À GARDER** :
```env
# Authentification Appwrite (requis pour JWT)
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=ankilang

# API Vercel unifiée (nouveau)
VITE_ANKILANG_API_URL=https://ankilang-api-monorepo.vercel.app
VITE_ANKILANG_ALLOWED_ORIGIN=https://ankilang.com

# Appwrite Storage (si vous sauvegardez les fichiers audio)
VITE_APPWRITE_BUCKET_ID=flashcard-images
VITE_APPWRITE_DB_ID=ankilang-main
VITE_APPWRITE_CARDS_COLLECTION_ID=cards
```

#### 5.3 Mettre à jour `CLAUDE.md`

**Fichier** : `CLAUDE.md`

**Section à modifier** : `### External Service Integration`

**Avant** :
```markdown
**Translation** (`apps/web/src/services/translate.ts`):
- Planned: Netlify Function endpoint `/.netlify/functions/translate`
- Providers: Revirada (Occitan), DeepL (other languages)
- Current: Stub implementation exists but functions not yet deployed
```

**Après** :
```markdown
**Translation** (`apps/web/src/services/translate.ts`):
- Endpoint: `https://ankilang-api-monorepo.vercel.app/api/deepl` (DeepL)
- Endpoint: `https://ankilang-api-monorepo.vercel.app/api/revirada` (Occitan)
- Auto-routing: Detects Occitan (`oc`) vs other languages
- Rate limit: 30 req/min (DeepL), 20 req/min (Revirada)
```

**Avant** :
```markdown
**Text-to-Speech** (`apps/web/src/services/tts.ts`):
- Votz API for Occitan (`apps/web/src/services/votz.ts`)
- ElevenLabs via Appwrite Function for other languages (`apps/web/src/services/elevenlabs-appwrite.ts`)
```

**Après** :
```markdown
**Text-to-Speech** (`apps/web/src/services/tts.ts`):
- Endpoint: `https://ankilang-api-monorepo.vercel.app/api/votz` (Occitan)
- Endpoint: `https://ankilang-api-monorepo.vercel.app/api/elevenlabs` (Other languages)
- Auto-routing: Detects language and chooses appropriate TTS engine
- Cache: Multi-tier (Memory LRU → IndexedDB)
- Rate limit: 10 req/min (Votz), 15 req/min (ElevenLabs)
```

**Avant** :
```markdown
**Images** (`apps/web/src/services/pexels.ts`):
- Pexels API for image search
- Results cached via `shared-cache` package
```

**Après** :
```markdown
**Images** (`apps/web/src/services/pexels.ts`):
- Endpoint: `https://ankilang-api-monorepo.vercel.app/api/pexels` (Search)
- Endpoint: `https://ankilang-api-monorepo.vercel.app/api/pexels-optimize` (Optimize)
- Optimization: Sharp (WebP/AVIF conversion, compression, resize)
- Rate limit: 50 req/min (Search), 30 req/min (Optimize)
```

**Ajouter nouvelle section** :
```markdown
### API Client Architecture

**Client** (`apps/web/src/lib/ankilang-api-client.ts`):
- Unified API client for all external services
- JWT authentication via Appwrite
- RFC 7807 error format
- Rate limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`)
- Type-safe with Zod validation on API side

**Types** (`apps/web/src/types/ankilang-api.ts`):
- TypeScript types for all API requests/responses
- DeepL (30 source langs, 40+ target langs)
- Revirada (fr-oc, oc-fr with lengadocian/gascon dialects)
- Votz (file/url modes)
- ElevenLabs (multilingual_v2, turbo_v2, monolingual_v1)
- Pexels (search + optimize)

**Helpers**:
- `apps/web/src/utils/audio-helpers.ts` - Base64 ↔ Blob conversion, playback, download
- `apps/web/src/utils/image-helpers.ts` - Data URL handling, display, download
```

#### 5.4 Mettre à jour `.cursorrules` (si applicable)

**Fichier** : `.cursorrules`

**Ajouter** :
```markdown
## API Client Usage

- ALL external API calls MUST go through `AnkilangApiClient` (`apps/web/src/lib/ankilang-api-client.ts`)
- NEVER call API endpoints directly with `fetch()`
- JWT authentication is handled automatically by the client
- API errors follow RFC 7807 format (`AnkilangApiError`)
- Rate limits are tracked via response headers

Example:
```typescript
import { createAnkilangApiClient } from '@/lib/ankilang-api-client'
const api = createAnkilangApiClient(jwtToken)
const result = await api.translateWithDeepL({ text, sourceLang, targetLang })
```
```

---

## 📋 Checklist finale

### Phase 1 : Infrastructure ✅
```
[ ] Créer apps/web/src/types/ankilang-api.ts
[ ] Créer apps/web/src/lib/ankilang-api-client.ts
[ ] Créer apps/web/src/utils/audio-helpers.ts
[ ] Créer apps/web/src/utils/image-helpers.ts
[ ] Ajouter variables d'environnement (.env)
[ ] (Optionnel) Créer apps/web/src/hooks/useAnkilangApi.ts
```

### Phase 2 : Migration services ⚠️
```
[ ] Migrer apps/web/src/services/pexels.ts
[ ] Tester pexelsSearchPhotos() avec query='test'
[ ] Tester optimizeAndUploadImage() avec URL Pexels

[ ] Migrer apps/web/src/services/votz.ts
[ ] Tester ttsToBlob() avec 'Bonjorn'
[ ] Tester ttsToObjectURL() et lecture audio

[ ] Migrer apps/web/src/services/translate.ts
[ ] Tester translate() EN→FR (DeepL)
[ ] Tester translate() FR→OC (Revirada)

[ ] Migrer apps/web/src/services/elevenlabs-appwrite.ts
[ ] Tester ttsViaAppwrite() mode preview
[ ] Tester ttsViaAppwrite() mode save_to_storage
```

### Phase 3 : Orchestrateur ⚠️
```
[ ] Vérifier apps/web/src/services/tts.ts
[ ] Tester generateTTS() avec language_code='oc'
[ ] Tester generateTTS() avec language_code='fr'
[ ] Tester cache IDB (2 appels identiques)
```

### Phase 4 : Composants React ⚠️
```
[ ] Vérifier StepEnhance.tsx (imports services)
[ ] Tester création de carte avec TTS
[ ] Tester création de carte avec traduction
[ ] Tester création de carte avec image Pexels
[ ] Rechercher autres composants utilisant services
```

### Phase 5 : Nettoyage 🧹
```
[ ] Marquer fonctions obsolètes @deprecated
[ ] Nettoyer variables d'environnement inutilisées
[ ] Mettre à jour CLAUDE.md
[ ] (Optionnel) Mettre à jour .cursorrules
[ ] Supprimer logs console de debug
[ ] Vérifier qu'aucun import direct API n'existe
```

### Phase 6 : Tests finaux ✅
```
[ ] Test E2E : Créer une carte Basic avec TTS FR
[ ] Test E2E : Créer une carte Basic avec TTS OC
[ ] Test E2E : Créer une carte avec traduction EN→FR
[ ] Test E2E : Créer une carte avec traduction FR→OC
[ ] Test E2E : Créer une carte avec image Pexels
[ ] Vérifier cache IDB (DevTools → Application → IndexedDB)
[ ] Vérifier rate limits (faire 10+ requêtes rapides)
[ ] Tester gestion erreur 401 (JWT invalide)
[ ] Tester gestion erreur 429 (rate limit)
```

---

## 🚨 Points d'attention critiques

### Sécurité
- ⚠️ **JWT expiration** : Le client doit gérer le refresh automatique du JWT si expiré
- ⚠️ **Secrets** : JAMAIS exposer `VITE_ANKILANG_API_URL` avec clés API (déjà géré côté Vercel)
- ⚠️ **CORS** : L'API Vercel doit autoriser `https://ankilang.com` dans les headers

### Performance
- ✅ **Cache IDB** : Garder intact dans `tts.ts` (déjà optimal)
- ✅ **Rate limiting** : Afficher message utilisateur si 429
- ⚠️ **Blob URLs** : Toujours appeler `URL.revokeObjectURL()` après usage (déjà fait dans `CacheManager`)

### Compatibilité
- ⚠️ **Anciens appels** : Garder les anciens exports avec `@deprecated` pendant 1-2 versions
- ⚠️ **Export Anki** : Vérifier que `exporter.js` utilise bien les nouvelles URLs audio
- ⚠️ **Offline mode** : L'API Vercel nécessite réseau (cache IDB pour pallier)

### Breaking changes potentiels
- ⚠️ **Format audio Votz** : L'API Vercel retourne WAV, l'ancien retournait MP3 (vérifier compatibilité)
- ⚠️ **ElevenLabs params** : L'API Vercel expose stability/similarityBoost, l'ancien non (nouveaux params par défaut)
- ⚠️ **Pexels optimize** : Nouvelle feature (optimisation Sharp) inexistante avant

---

## 📊 Métriques de succès

### Avant migration
- ✅ Services dispersés (3 endpoints Netlify)
- ❌ Translation non fonctionnel (stub)
- ❌ Pas de rate limiting unifié
- ❌ Pas d'optimisation d'images
- ❌ Polling manuel ElevenLabs

### Après migration
- ✅ API unifiée (1 endpoint Vercel)
- ✅ Translation fonctionnel (DeepL + Revirada)
- ✅ Rate limiting avec headers
- ✅ Optimisation d'images (Sharp)
- ✅ ElevenLabs direct (pas de polling)
- ✅ Contrôles vocaux exposés
- ✅ RFC 7807 errors

---

## 🆘 Rollback plan

En cas de problème critique, rollback possible via :

1. **Garder les anciens services** (marqués `@deprecated`)
2. **Commenter les nouveaux imports** dans les composants
3. **Restaurer les anciens imports** :
   ```typescript
   // import { ttsToBlob } from './votz' // ANCIEN
   import { ttsToBlob } from './votz-v2' // NOUVEAU (renommer temporairement)
   ```
4. **Restaurer variables d'environnement** :
   ```env
   VITE_VOTZ_URL=https://ankilangvotz.netlify.app/.netlify/functions/votz
   VITE_PEXELS_URL=https://ankilangpexels.netlify.app/.netlify/functions/pexels
   ```

---

## 📅 Timeline estimé

| Phase | Durée estimée | Risque |
|-------|--------------|--------|
| Phase 1 : Infrastructure | 1-2h | Faible |
| Phase 2 : Migration services | 3-4h | Moyen |
| Phase 3 : Orchestrateur | 1h | Faible |
| Phase 4 : Composants React | 2-3h | Moyen |
| Phase 5 : Nettoyage | 1h | Faible |
| Phase 6 : Tests finaux | 2-3h | Faible |
| **TOTAL** | **10-14h** | **Moyen** |

---

## 📚 Documentation finale à créer

Après migration complète :

1. **MIGRATION-DONE.md** - Résumé de ce qui a été fait
2. **API-CLIENT-GUIDE.md** - Guide d'utilisation du client API pour développeurs
3. **TROUBLESHOOTING.md** - Guide de dépannage pour erreurs courantes (401, 429, 502)

---

## ✅ Validation finale

La migration est considérée réussie quand :

- [ ] Tous les tests E2E passent
- [ ] Aucune régression UI détectée
- [ ] Performance cache IDB maintenue
- [ ] Rate limits gérés gracieusement
- [ ] Documentation à jour
- [ ] Code obsolète marqué `@deprecated`
- [ ] Variables d'environnement nettoyées
- [ ] Déploiement production sans erreur

---

**Auteur** : Claude Code
**Dernière mise à jour** : 2025-10-18
