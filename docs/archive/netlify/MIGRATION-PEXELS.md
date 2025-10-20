# 🖼️ Migration Pexels - Plan de Migration

**Date** : 2025-10-19

---

## 🎯 Objectif

Migrer l'intégration Pexels de Netlify Functions vers Vercel API (ankilang-api-monorepo)

---

## 📊 État Actuel

### Netlify Functions (À SUPPRIMER)

**Endpoint actuel** : `https://ankilangpexels.netlify.app/.netlify/functions/pexels`

**Fichier** : `apps/web/src/services/pexels.ts`

**Fonctions disponibles** :
1. `pexelsSearchPhotos(query, opts)` - Recherche d'images
2. `pexelsCurated(opts)` - Images curées
3. `pexelsPhoto(id)` - Détail d'une photo
4. `optimizeAndUploadImage(pexelsUrl)` - Optimisation + upload vers Appwrite Storage

**Authentification** : JWT Appwrite via `getSessionJWT()`

**Utilisé dans** :
- `apps/web/src/components/cards/new-modal-v2/StepEnhance.tsx` (principal)
- `apps/web/src/components/cards/EditCardModal.tsx`
- `apps/web/src/components/cards/NewCardModal.tsx`

---

## 🆕 API Vercel (DÉJÀ DISPONIBLE)

### Client déjà implémenté

**Fichier** : `apps/web/src/lib/vercel-api-client.ts`

**Méthodes disponibles** :
1. `searchPexels(request: PexelsSearchRequest)` → `PexelsSearchResponse`
2. `optimizeImage(request: PexelsOptimizeRequest)` → `PexelsOptimizeResponse`

**Endpoints Vercel** :
- `/api/pexels` - Recherche d'images
- `/api/pexels-optimize` - Optimisation d'images (Sharp)

**Types TypeScript** : Déjà définis dans `apps/web/src/types/ankilang-vercel-api.ts`

---

## 🔄 Changements Requis

### 1. Nouveau Service Pexels (`apps/web/src/services/pexels.ts`)

**Approche** : Wrapper autour du `VercelApiClient`

**Structure** :
```typescript
import { createVercelApiClient } from '../lib/vercel-api-client'
import { getSessionJWT } from './appwrite'
import type {
  PexelsSearchRequest,
  PexelsSearchResponse,
  PexelsOptimizeRequest,
  PexelsOptimizeResponse,
} from '../types/ankilang-vercel-api'

let apiClient: ReturnType<typeof createVercelApiClient> | null = null

async function getApiClient() {
  if (!apiClient) {
    const jwt = await getSessionJWT()
    if (!jwt) throw new Error('User not authenticated')
    apiClient = createVercelApiClient(jwt)
  }
  return apiClient
}

// Wrapper pour recherche
export async function pexelsSearchPhotos(
  query: string,
  opts: { per_page?: number; page?: number; locale?: string } = {}
): Promise<PexelsSearchResponse> {
  const api = await getApiClient()
  return api.searchPexels({
    query,
    perPage: opts.per_page || 15,
    locale: opts.locale || 'fr-FR',
  })
}

// Wrapper pour optimisation (à implémenter)
export async function optimizeAndUploadImage(pexelsUrl: string) {
  const api = await getApiClient()
  const result = await api.optimizeImage({
    imageUrl: pexelsUrl,
    width: 600,
    height: 400,
    quality: 80,
    format: 'webp',
  })

  // TODO: Upload vers Appwrite Storage
  // Pour l'instant, retourner la data URL base64
  return {
    success: true,
    optimizedImage: result.optimizedImage,
    originalSize: result.originalSize,
    optimizedSize: result.optimizedSize,
    compression: result.compression,
  }
}
```

---

### 2. Mise à Jour des Composants

**StepEnhance.tsx** :
- ✅ Déjà utilise `pexelsSearchPhotos()` et `pexelsCurated()`
- ⚠️ Vérifier le format de retour (compatible avec nouveau client ?)

**Changements requis** :
```typescript
// AVANT (Netlify)
const result = await optimizeAndUploadImage(src)
if (result.success) {
  onChangeImage(result.fileUrl, 'appwrite') // ❌ fileUrl n'existe plus
}

// APRÈS (Vercel)
const result = await optimizeAndUploadImage(src)
// result contient optimizedImage (base64)
// Besoin d'uploader vers Appwrite Storage manuellement
```

---

## 🔍 Différences API

### Netlify Functions vs Vercel API

| Fonctionnalité | Netlify | Vercel API | Action |
|----------------|---------|-----------|--------|
| **Recherche Pexels** | `/photos/search` | `/api/pexels` | ✅ Mapper |
| **Images curées** | `/photos/curated` | ❌ Non disponible | ⚠️ À implémenter ou fallback |
| **Photo detail** | `/photos/{id}` | ❌ Non disponible | ⚠️ Pas utilisé, peut ignorer |
| **Optimisation** | `/optimize` | `/api/pexels-optimize` | ✅ Mapper |
| **Upload Appwrite** | Intégré | ❌ Séparé | ⚠️ À implémenter côté client |

---

## ⚠️ Points d'Attention

### 1. Images Curées (pexelsCurated)

**Problème** : L'API Vercel ne semble pas avoir d'endpoint pour images curées

**Solutions possibles** :
- **Option A** : Ajouter `/api/pexels-curated` dans l'API Vercel
- **Option B** : Utiliser une recherche par défaut (ex: "nature" ou "landscape")
- **Option C** : Supprimer la fonctionnalité (peu utilisée ?)

**Recommandation** : **Option B** (fallback sur recherche générique)

```typescript
export async function pexelsCurated(opts = {}) {
  // Fallback: recherche avec un mot-clé populaire
  return pexelsSearchPhotos('nature', opts)
}
```

---

### 2. Upload vers Appwrite Storage

**Problème** : L'API Vercel retourne une data URL base64, pas un `fileId` Appwrite

**Solution** : Uploader côté client après optimisation

**Implémentation** :
```typescript
import { storage } from './appwrite'
import { ID } from 'appwrite'

async function uploadBase64ToAppwrite(
  base64Data: string,
  userId: string
): Promise<{ fileId: string; fileUrl: string }> {
  // Convertir base64 → Blob
  const response = await fetch(base64Data)
  const blob = await response.blob()

  // Upload vers Appwrite Storage
  const file = await storage.createFile(
    'images', // bucketId
    ID.unique(),
    new File([blob], 'optimized-image.webp', { type: 'image/webp' })
  )

  const fileUrl = storage.getFileView('images', file.$id).toString()

  return {
    fileId: file.$id,
    fileUrl,
  }
}

export async function optimizeAndUploadImage(pexelsUrl: string) {
  const api = await getApiClient()
  const { getUser } = await import('./appwrite')
  const user = await getUser()

  if (!user) throw new Error('User not authenticated')

  // 1. Optimiser l'image via Vercel API
  const optimized = await api.optimizeImage({
    imageUrl: pexelsUrl,
    width: 600,
    height: 400,
    quality: 80,
    format: 'webp',
  })

  // 2. Upload vers Appwrite Storage
  const uploaded = await uploadBase64ToAppwrite(optimized.optimizedImage, user.$id)

  return {
    success: true,
    fileId: uploaded.fileId,
    fileUrl: uploaded.fileUrl,
    userId: user.$id,
    originalSize: optimized.originalSize,
    optimizedSize: optimized.optimizedSize,
    savings: `${optimized.compression}`,
  }
}
```

---

### 3. Gestion des Erreurs

**Format RFC 7807** : L'API Vercel utilise le format Problem Details

**Gestion** :
```typescript
try {
  return await api.searchPexels(request)
} catch (error) {
  if (error instanceof VercelApiError) {
    console.error('[Pexels] API error:', error.detail)
    throw new Error(`Image search failed: ${error.detail}`)
  }
  throw error
}
```

---

## 📋 Plan d'Action

### Étape 1 : Créer le Nouveau Service
- [x] Analyser l'API actuelle
- [ ] Créer `services/pexels.ts` (version Vercel)
- [ ] Implémenter `pexelsSearchPhotos()`
- [ ] Implémenter `pexelsCurated()` (fallback recherche)
- [ ] Implémenter `optimizeAndUploadImage()` (avec upload Appwrite)

### Étape 2 : Tester le Service
- [ ] Créer script de test `scripts/test-pexels-vercel.ts`
- [ ] Tester recherche d'images
- [ ] Tester optimisation + upload
- [ ] Vérifier gestion d'erreurs

### Étape 3 : Migrer les Composants
- [ ] Mettre à jour `StepEnhance.tsx`
- [ ] Vérifier `EditCardModal.tsx`
- [ ] Vérifier `NewCardModal.tsx`
- [ ] Tester UI (recherche, sélection, affichage)

### Étape 4 : Nettoyage
- [ ] Supprimer l'ancien `services/pexels.ts`
- [ ] Supprimer `pexels-cache.ts` (si obsolète)
- [ ] Retirer références à Netlify Pexels
- [ ] Nettoyer variables d'environnement

### Étape 5 : Documentation
- [ ] Mettre à jour `CLAUDE.md`
- [ ] Documenter dans `API-DOCUMENTATION.txt`
- [ ] Ajouter exemples d'utilisation

---

## 🎯 Résultat Attendu

**Avant** :
```
Netlify Functions (ankilangpexels.netlify.app)
  ↓
  Pexels API
  ↓
  Sharp (optimisation)
  ↓
  Appwrite Storage (upload intégré)
```

**Après** :
```
Frontend (ankilang.com)
  ↓
  Vercel API (ankilang-api-monorepo.vercel.app)
    ↓
    Pexels API
    ↓
    Sharp (optimisation)
    ↓
    Return base64
  ↓
  Frontend Upload → Appwrite Storage
```

**Avantages** :
- ✅ API unifiée (même endpoint pour traduction, TTS, images)
- ✅ Authentification cohérente (JWT Appwrite)
- ✅ Gestion d'erreurs RFC 7807
- ✅ Rate limiting unifié
- ✅ Pas de dépendance Netlify

**Inconvénients** :
- ⚠️ Upload Appwrite côté client (latence réseau)
- ⚠️ Images curées nécessitent fallback

---

## ✅ Critères de Succès

- [ ] Recherche d'images fonctionne
- [ ] Optimisation d'images fonctionne
- [ ] Upload vers Appwrite Storage fonctionne
- [ ] Pas de régression UI
- [ ] TypeScript compile sans erreur
- [ ] Ancien code Netlify supprimé

---

**Créé le** : 2025-10-19
**Statut** : Planification terminée - Prêt pour implémentation
