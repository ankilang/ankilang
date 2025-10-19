# 🔊 Migration TTS - Plan de Migration

**Date** : 2025-10-19

---

## 🎯 Objectif

Migrer les intégrations TTS (Votz pour Occitan + ElevenLabs pour autres langues) de Netlify Functions + Appwrite Functions vers Vercel API unifiée.

---

## 📊 État Actuel

### Architecture Actuelle

**Votz (Occitan)**:
- Endpoint: `https://ankilangvotz.netlify.app/.netlify/functions/votz`
- Fichier: `apps/web/src/services/votz.ts`
- Utilisation: TTS pour occitan (languedoc et gascon)
- Retourne: Blob audio (MP3)

**ElevenLabs (Autres langues)**:
- Via Appwrite Functions (Function ID: `68e3951700118da88425`)
- Fichier: `apps/web/src/services/elevenlabs-appwrite.ts`
- Utilisation: TTS pour 29+ langues
- Retourne: Base64 MP3 ou URL Storage Appwrite

**Routeur unifié**:
- Fichier: `apps/web/src/services/tts.ts`
- Fonction: `generateTTS()` - Route vers Votz ou ElevenLabs selon langue
- Cache: IndexedDB (1 semaine TTL)

---

## 🆕 API Vercel (DÉJÀ DISPONIBLE)

### Client déjà implémenté

**Fichier**: `apps/web/src/lib/vercel-api-client.ts`

**Méthodes disponibles**:
1. `generateVotzTTS(request: VotzRequest)` → `VotzResponse`
2. `generateElevenlabsTTS(request: ElevenLabsRequest)` → `ElevenLabsResponse`

**Endpoints Vercel**:
- `/api/votz` - TTS Occitan
- `/api/elevenlabs` - TTS Multilingual

**Types TypeScript**: Déjà définis dans `apps/web/src/types/ankilang-vercel-api.ts`

---

## 🔄 Changements Requis

### 1. Migration Votz (`apps/web/src/services/votz.ts`)

**Approche**: Wrapper autour du `VercelApiClient`

**Changements**:
```typescript
import { createVercelApiClient, VercelApiError } from '../lib/vercel-api-client'
import { getSessionJWT } from './appwrite'
import type { VotzRequest, VotzResponse } from '../types/ankilang-vercel-api'

let apiClient: ReturnType<typeof createVercelApiClient> | null = null

async function getApiClient() {
  if (!apiClient) {
    const jwt = await getSessionJWT()
    if (!jwt) throw new Error('User not authenticated')
    apiClient = createVercelApiClient(jwt)
  }
  return apiClient
}

export async function ttsToBlob(text: string, language: VotzLanguage = 'languedoc'): Promise<Blob> {
  const api = await getApiClient()

  const result = await api.generateVotzTTS({
    text,
    language,
    mode: 'file'
  })

  // VotzFileResponse retourne base64
  if ('audio' in result) {
    return base64ToBlob(result.audio)
  }

  throw new Error('Expected file mode response')
}
```

---

### 2. Migration ElevenLabs (Remplacer Appwrite Functions par Vercel API)

**Problème**: Actuellement utilise Appwrite Functions avec polling

**Solution**: Utiliser Vercel API directement

**Changements dans `tts.ts`**:
```typescript
// AVANT (Appwrite Functions)
import { ttsViaAppwrite } from './elevenlabs-appwrite'

result = await ttsViaAppwrite({
  text,
  language_code,
  voice_id,
  save_to_storage: save,
  output_format: 'mp3_44100_128'
})

// APRÈS (Vercel API)
import { generateElevenlabsTTS } from './elevenlabs'

const blob = await generateElevenlabsTTS({
  text,
  voiceId: voice_id ?? '21m00Tcm4TlvDq8ikWAM',
  modelId: 'eleven_multilingual_v2',
  // ... autres paramètres
})

const url = URL.createObjectURL(blob)
result = { url, mimeType: 'audio/mpeg', provider: 'elevenlabs' }
```

---

### 3. Nouveau Service ElevenLabs

**Créer**: `apps/web/src/services/elevenlabs.ts` (version Vercel API)

```typescript
import { createVercelApiClient, VercelApiError } from '../lib/vercel-api-client'
import { getSessionJWT } from './appwrite'
import type { ElevenLabsRequest, ElevenLabsResponse } from '../types/ankilang-vercel-api'

let apiClient: ReturnType<typeof createVercelApiClient> | null = null

async function getApiClient() {
  if (!apiClient) {
    const jwt = await getSessionJWT()
    if (!jwt) throw new Error('User not authenticated')
    apiClient = createVercelApiClient(jwt)
  }
  return apiClient
}

function base64ToBlob(base64: string, mimeType = 'audio/mpeg'): Blob {
  const byteCharacters = atob(base64)
  const byteArray = new Uint8Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteArray[i] = byteCharacters.charCodeAt(i)
  }
  return new Blob([byteArray], { type: mimeType })
}

export async function generateElevenlabsTTS(request: ElevenLabsRequest): Promise<Blob> {
  const api = await getApiClient()

  const result = await api.generateElevenlabsTTS({
    text: request.text,
    voiceId: request.voiceId,
    modelId: request.modelId || 'eleven_multilingual_v2',
    stability: request.stability,
    similarityBoost: request.similarityBoost,
    style: request.style,
    useSpeakerBoost: request.useSpeakerBoost
  })

  // Convertir base64 → Blob
  return base64ToBlob(result.audio)
}
```

---

## ⚠️ Points d'Attention

### 1. Format de Réponse

**Votz**:
- Mode `file`: Retourne `{ audio: string (base64), language, mode, size }`
- Mode `url`: Retourne `{ url: string, language, mode }`

**ElevenLabs**:
- Retourne toujours base64: `{ audio: string, voiceId, modelId, size }`

### 2. Sauvegarde Persistante

**Problème**: L'actuel `elevenlabs-appwrite.ts` peut sauvegarder l'audio dans Appwrite Storage via `save_to_storage`

**Solution**:
- Option A: Garder `elevenlabs-appwrite.ts` pour la sauvegarde uniquement
- Option B: Créer une fonction d'upload séparée côté client après génération
- **Recommandation**: Option B (cohérent avec Pexels)

```typescript
export async function saveAudioToAppwrite(blob: Blob, cardId: string): Promise<string> {
  const storage = new Storage(client)
  const file = new File([blob], `tts-${cardId}.mp3`, { type: 'audio/mpeg' })

  const uploaded = await storage.createFile('audio-bucket', ID.unique(), file)
  return storage.getFileView('audio-bucket', uploaded.$id).toString()
}
```

### 3. Cache IDB

**Actuel**: Cache IndexedDB avec clé déterministe
**Migration**: Garder tel quel (fonctionne avec Blob)

### 4. Modèle ElevenLabs

Selon vos informations:
- **Multilingual v2**: 29 langues, 1 crédit/caractère
- **Flash v2.5**: 32 langues, 0.5 crédit/caractère, <75ms latence

**Recommandation**: Permettre le choix via paramètre, défaut `eleven_multilingual_v2`

---

## 📋 Plan d'Action

### Étape 1: Migrer Votz
- [ ] Créer nouveau `services/votz.ts` (version Vercel)
- [ ] Implémenter `ttsToBlob()` avec Vercel API
- [ ] Garder compatibilité avec fonctions existantes (`ttsToObjectURL`, `playTTS`)

### Étape 2: Migrer ElevenLabs
- [ ] Créer nouveau `services/elevenlabs.ts` (version Vercel)
- [ ] Implémenter `generateElevenlabsTTS()`
- [ ] Créer `saveAudioToAppwrite()` pour sauvegarde optionnelle

### Étape 3: Mettre à Jour le Routeur TTS
- [ ] Modifier `services/tts.ts`
- [ ] Remplacer imports Netlify/Appwrite par Vercel
- [ ] Conserver la logique de cache IDB

### Étape 4: Tester
- [ ] Tester TTS Occitan (Votz)
- [ ] Tester TTS multilingue (ElevenLabs)
- [ ] Vérifier cache IDB fonctionne
- [ ] Tester sauvegarde dans cartes

### Étape 5: Nettoyage
- [ ] Renommer `votz.ts` en `votz.ts.netlify.backup`
- [ ] Renommer `elevenlabs-appwrite.ts` en `elevenlabs-appwrite.ts.backup`
- [ ] Supprimer imports obsolètes
- [ ] Nettoyer variables d'environnement (VITE_VOTZ_URL, etc.)

### Étape 6: Documentation
- [ ] Mettre à jour `CLAUDE.md`
- [ ] Documenter dans `API-DOCUMENTATION.txt`
- [ ] Ajouter exemples d'utilisation

---

## 🎯 Résultat Attendu

**Avant**:
```
Frontend → Netlify Votz (occitan)
        → Appwrite Functions → ElevenLabs API (autres langues)
        → Cache IDB
```

**Après**:
```
Frontend → Vercel API → Votz API (occitan)
                     → ElevenLabs API (autres langues)
        → Cache IDB (inchangé)
        → Upload Appwrite optionnel (client-side)
```

**Avantages**:
- ✅ API unifiée (même endpoint pour tout)
- ✅ Authentification cohérente (JWT Appwrite)
- ✅ Pas de polling Appwrite Functions
- ✅ Latence réduite
- ✅ Gestion d'erreurs RFC 7807
- ✅ Rate limiting unifié

**Inconvénients**:
- ⚠️ Sauvegarde Appwrite Storage nécessite appel séparé
- ⚠️ Migration peut casser sauvegarde auto dans cartes (à vérifier)

---

## ✅ Critères de Succès

- [ ] TTS Occitan fonctionne via Vercel API
- [ ] TTS ElevenLabs fonctionne via Vercel API
- [ ] Cache IDB fonctionne correctement
- [ ] Sauvegarde audio dans cartes fonctionne
- [ ] Pas de régression UI
- [ ] TypeScript compile sans erreur
- [ ] Ancien code Netlify/Appwrite Functions supprimé

---

**Créé le**: 2025-10-19
**Statut**: Planification terminée - Prêt pour implémentation
