# Plan d'implémentation — Cache d'images avec dossiers virtuels

Date: 2025-10-19

---

## Objectif

Mettre en place un système de cache d'images et médias avec organisation en "dossiers virtuels" dans Appwrite Storage, permettant:
1. Cache déterministe multi-niveau (IDB + Appwrite) pour les images Pexels
2. Organisation structurée des fichiers par type et source via conventions de nommage
3. Déduplication automatique et partage inter-utilisateurs des ressources communes

---

## Portée

- Côté repo (apps/web et packages/shared-cache)
  - Génération de clés déterministes via `@ankilang/shared-cache`
  - Utilitaire `image-cache` pour charger/optimiser/stocker/réutiliser les images
  - Intégration dans les composants d’édition/création de cartes
  - Métriques basiques et gestion des Object URLs
- Côté Appwrite
  - Vérification/creation du bucket `flashcard-images` et de ses permissions
  - Politique de rétention (TTL) et fonction de nettoyage “Cache Janitor”

---

## Résumé architecture cible

- Clé: `namespace=pexels + externalId=photo.id + extra(transform)`
  - Exemple d’extra: `v=1|w=600|h=400|fit=cover|fmt=webp|q=80|dpr=1`
- Local: IndexedDB (TTL 6 mois par défaut)
- Serveur: Appwrite Storage (ID de fichier déterministe, lecture publique)
- Déduplication des requêtes concurrentes côté client (in-flight map)

---

## Étapes côté repository

1) Créer l’utilitaire `image-cache`
- Fichier: `apps/web/src/services/image-cache.ts`
- Contenu attendu:
  - Instanciation des adapters `BrowserIDBCache` et `AppwriteStorageCache` de `@ankilang/shared-cache`
  - Génération de clé via `buildCacheKey({ namespace: 'pexels', externalId, extra })`
  - Map de déduplication des requêtes en vol par clé (`inFlight = Map<string, Promise<string|Blob>>`)
  - Fonction principale `getCachedImage(photo, opts)`:
    1. Construit la clé (inclure tous les paramètres influençant le rendu)
    2. Tente `IDB.get(key)` → hit: retourne `Blob` ou Object URL
    3. Tente `Appwrite.get(key)` (via `AppwriteStorageCache`) → si hit: hydrate IDB et retourne
    4. Miss: appelle l’optimisation via API Vercel, obtient le binaire (ou URL) puis:
       - Stocke en IDB (TTL ≈ 6 mois)
       - Upload vers Appwrite avec ID déterministe (cf. Étape 4: “Upload Appwrite”)
       - Retourne l’URL objet (ou le `Blob` selon choix d’API)
  - Option: retourner le `Blob` et laisser le composant créer/révoquer l’Object URL

2) Format de clé recommandé
- Exemple TypeScript:
```ts
import { buildCacheKey } from '@ankilang/shared-cache'

const key = await buildCacheKey({
  namespace: 'pexels',
  externalId: String(photo.id),
  extra: {
    v: '1',        // version d’algo/format
    w: 600,
    h: 400,
    fit: 'cover',
    fmt: 'webp',
    q: 80,
    dpr: 1,
  },
})
```
- Note: gardez `v` pour invalider proprement lors d’un changement d’optimisation

3) Déduplication des requêtes concurrentes
- Schéma:
```ts
const inFlight = new Map<string, Promise<Blob>>()

export function getCachedImage(...) {
  const task = (async () => {
    // ... logique principale décrite plus haut
  })()
  const existing = inFlight.get(key)
  if (existing) return existing
  inFlight.set(key, task)
  try { return await task } finally { inFlight.delete(key) }
}
```

4) Upload Appwrite avec ID déterministe
- Utiliser l’adapter `AppwriteStorageCache` qui dérive un `fileId` sûr depuis la clé
  - Si la clé dépasse la longueur/charset, fallback sur `cache_<sha256(key).slice(0,40)>`
- Pour créer le fichier: `createFile(bucket, fileId, blob, ['role:all'])`
  - Gérer l’erreur `AlreadyExists/409` comme un succès idempotent
- TTL côté serveur non natif: l’expiration est gérée par la fonction “Cache Janitor” (voir section Appwrite)

5) Intégration dans les composants
- Fichiers à adapter:
  - `apps/web/src/components/cards/NewCardModal.tsx`
  - `apps/web/src/components/cards/EditCardModal.tsx`
- Remplacer les appels directs à `optimizeAndUploadImage()` par:
  - Recherche Pexels: inchangé via `pexelsSearchPhotos()`
  - Pour chaque image affichée/sélectionnée: appeler `getCachedImage(photo, { w, h, fmt, q })`
  - Utiliser le retour (Blob ou Object URL) pour l’aperçu et la valeur stockée sur la carte
- Important: si vous créez des Object URLs dans les composants, appelez `CacheManager.trackObjectUrl(url)` et révoquez-les au démontage (ou utilisez la méthode qui retourne directement un Blob)

6) Fallbacks & résilience
- Si `Appwrite.getFileView` échoue (non connecté/permissions/CORS), continuer avec le cache local
- Si l’optimisation échoue, retomber sur `photo.src[size]` sans stockage
- Implémenter une détection de format: `avif` si supporté > `webp` > `jpeg`; inclure `fmt` dans la clé

7) Métriques & logs
- Utiliser `packages/shared-cache/src/log.ts` pour tracer hits/miss/set
- Ajouter un compteur simple de hits/miss (optionnel) exposé dans le panneau `CacheJanitorPanel`

8) Configuration & env
- Ajouter/valider:
  - `VITE_APPWRITE_BUCKET_ID=flashcard-images`
  - `VITE_CACHE_PEXELS_TTL_DAYS=180`
  - `VITE_CACHE_ENABLE=true`
- Centraliser w/h/fit/fmt/q par défaut dans `apps/web/src/config/cache.ts` (nouveau, optionnel)

9) Tests manuels
- Scénarios:
  - A) Même image présente dans 2 recherches différentes → 1 seul téléchargement, re-hit
  - B) 2 onglets chargent la même image en parallèle → une seule optimisation/upload (dédup en vol)
  - C) Mode offline après premier chargement → lecture depuis IDB
  - D) Changement de `v` dans la clé → recalcul/rafraîchissement correct

10) Documentation
- Ajouter un paragraphe dans `docs/development/performance/cache-v4.md` pour les clés images et la politique d’expiration

---

## Étapes côté Appwrite (bucket + fonction)

1) Bucket `flashcard-images`
- Créer (ou vérifier) le bucket avec:
  - ID: `flashcard-images`
  - Permissions de bucket: autoriser la création avec `fileId` personnalisé
  - Par défaut: lecture publique des fichiers de cache (ou gérer via permissions par fichier `role:all`)
  - Types MIME autorisés: `image/webp`, `image/avif`, `image/jpeg`, `image/png`
  - Taille max par fichier: ~1–2 Mo (selon qualité)
  - CORS: autoriser l’origine du front (ankilang.com) et l’API Vercel si nécessaire

2) Politique d’accès
- Les fichiers de cache Pexels peuvent être en lecture publique (cache partagé inter‑utilisateurs)
- Les écritures/suppressions doivent être limitées aux fonctions/services (pas aux utilisateurs finaux)

3) Fonction “Cache Janitor”
- Créer la fonction Appwrite (ID: `ankilang-cache-janitor`)
  - Paramètres par défaut: `TTS_TTL_DAYS=90`, `PEXELS_TTL_DAYS=180`, `BUCKET_ID=flashcard-images`
  - Déploiement: runtime Node.js, permission exécution: rôle admin/app
  - Horaire: CRON quotidien (ou hebdo) selon quota
- Comportement: scanner le bucket et supprimer les objets expirés selon TTL
- Intégration front: déjà disponible via `apps/web/src/services/cache-janitor.function.ts` (panel UI -> `CacheJanitorPanel`)

4) Observabilité
- Activer les logs de la fonction et vérifier les métriques (scanned/deleted/errors)
- Mettre une alerte si `errors > 0` ou si durée d’exécution dépasse le max

---

## Dossiers virtuels dans Appwrite Storage

### Problématique

Appwrite Storage ne supporte pas nativement les dossiers/arborescence de fichiers. Tous les fichiers sont stockés à plat dans un bucket avec un `fileId` unique. Pour organiser logiquement les fichiers (images Pexels, audio TTS, images utilisateur, etc.), nous devons simuler une structure de dossiers via des conventions de nommage.

### Stratégie de nommage

**Format général**: `{type}/{source}/{identifier}.{ext}`

**Exemples concrets**:
- Images Pexels (cache): `cache/pexels/{sha256Hash}.webp`
- Audio TTS Votz (cache): `cache/tts/votz/{sha256Hash}.mp3`
- Audio TTS ElevenLabs (cache): `cache/tts/elevenlabs/{sha256Hash}.mp3`
- Images utilisateur uploadées: `user/{userId}/uploads/{timestamp}_{randomId}.webp`
- Images de profil: `user/{userId}/avatar/{timestamp}.webp`

### Implémentation technique

**1) Fonction de génération de `fileId` virtuel**

Créer un utilitaire `apps/web/src/utils/storage-paths.ts`:

```ts
import { buildCacheKey } from '@ankilang/shared-cache'

export type StoragePathType =
  | 'cache/pexels'
  | 'cache/tts/votz'
  | 'cache/tts/elevenlabs'
  | 'user/upload'
  | 'user/avatar'

/**
 * Génère un fileId conforme aux contraintes Appwrite:
 * - 36 caractères max (généralement)
 * - Caractères alphanumériques + _ - . autorisés
 * - Simule une structure de dossiers via préfixes
 */
export async function buildStoragePath(
  type: StoragePathType,
  params: {
    hash?: string          // SHA-256 pour cache
    userId?: string        // Pour fichiers utilisateur
    filename?: string      // Nom du fichier
    extension?: string     // Extension (.webp, .mp3, etc.)
  }
): Promise<string> {
  const { hash, userId, filename, extension = 'bin' } = params

  switch (type) {
    case 'cache/pexels':
    case 'cache/tts/votz':
    case 'cache/tts/elevenlabs':
      if (!hash) throw new Error('Hash required for cache paths')
      // Tronquer le hash si nécessaire pour respecter la limite
      const shortHash = hash.slice(0, 32)
      return `${type}/${shortHash}.${extension}`

    case 'user/upload':
    case 'user/avatar':
      if (!userId) throw new Error('UserId required for user paths')
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).slice(2, 8)
      const name = filename || `${timestamp}_${randomId}`
      return `${type}/${userId}/${name}.${extension}`

    default:
      throw new Error(`Unknown storage path type: ${type}`)
  }
}

/**
 * Parse un fileId pour extraire les métadonnées
 */
export function parseStoragePath(fileId: string): {
  type: string
  parts: string[]
  extension: string
} {
  const parts = fileId.split('/')
  const lastPart = parts[parts.length - 1]
  const extensionMatch = lastPart.match(/\.([^.]+)$/)

  return {
    type: parts.slice(0, -1).join('/'),
    parts,
    extension: extensionMatch?.[1] || ''
  }
}
```

**2) Adapter `AppwriteStorageCache` pour utiliser les paths virtuels**

Modifier `packages/shared-cache/src/appwrite-storage.ts` pour accepter un paramètre `pathPrefix`:

```ts
export class AppwriteStorageCache implements CacheAdapter {
  constructor(
    private deps: { storage: Storage },
    private bucketId: string,
    private pathPrefix?: string  // ✨ NOUVEAU: préfixe de dossier virtuel
  ) {}

  async set(key: string, value: CacheValue, options?: SetOptions): Promise<void> {
    const fileId = this.pathPrefix
      ? `${this.pathPrefix}/${this.sanitizeKey(key)}`
      : this.sanitizeKey(key)

    // ... reste de l'implémentation
  }

  async get(key: string): Promise<CacheValue | null> {
    const fileId = this.pathPrefix
      ? `${this.pathPrefix}/${this.sanitizeKey(key)}`
      : this.sanitizeKey(key)

    // ... reste de l'implémentation
  }
}
```

**3) Utilisation dans `image-cache.ts`**

```ts
import { buildCacheKey } from '@ankilang/shared-cache'
import { buildStoragePath } from '../utils/storage-paths'

const key = await buildCacheKey({
  namespace: 'pexels',
  externalId: String(photo.id),
  extra: { v: '1', w, h, fit: 'cover', fmt, q, dpr },
})

// Générer le fileId avec structure de dossier virtuel
const fileId = await buildStoragePath('cache/pexels', {
  hash: key,
  extension: fmt
})

// Exemple de résultat: "cache/pexels/a3f2e1d9c8b7a6f5e4d3c2b1a0f9e8d7.webp"
```

### Avantages

1. **Organisation lisible**: Les fichiers sont logiquement groupés dans l'interface Appwrite
2. **Filtrage facile**: Possibilité de lister tous les fichiers d'un type avec `storage.listFiles(bucket, [Query.startsWith('$id', 'cache/pexels/')])`
3. **Isolation**: Fichiers cache vs fichiers utilisateur clairement séparés
4. **Debugging**: Identifier rapidement le type de fichier à partir de son ID
5. **Migration future**: Si Appwrite ajoute le support natif des dossiers, migration simplifiée

### Considérations

- **Limite de caractères**: Vérifier que `type/source/hash.ext` reste sous la limite Appwrite (généralement 36 chars → utiliser hash tronqué)
- **Compatibilité**: Les anciens fichiers sans préfixe doivent être migrés ou co-exister via fallback
- **Cache Janitor**: Doit pouvoir filtrer par préfixe pour nettoyer sélectivement (ex: `cache/pexels/*` avec TTL 180j, `cache/tts/*` avec TTL 7j)

### Migration des fichiers existants

Si des fichiers existent déjà sans structure de dossiers:

```ts
// Script de migration (one-time)
async function migrateToVirtualFolders() {
  const files = await storage.listFiles(BUCKET_ID)

  for (const file of files.files) {
    const oldId = file.$id
    const metadata = parseOldFileId(oldId) // Custom logic
    const newId = await buildStoragePath(metadata.type, metadata.params)

    // Créer une copie avec le nouveau nom
    const blob = await storage.getFileView(BUCKET_ID, oldId)
    await storage.createFile(BUCKET_ID, newId, blob)

    // Supprimer l'ancien (après vérification)
    await storage.deleteFile(BUCKET_ID, oldId)
  }
}
```

---

## Remarques de compatibilité (API Vercel)

- Aujourd'hui, `POST /api/pexels-optimize` retourne `{ fileId, url }` et gère l'upload côté serveur.
- **Recommandation** (amélioration serveur): accepter un champ optionnel `virtualPath` ou `fileId` pour imposer le nom déterministe calculé côté client avec structure de dossiers virtuels.
- À défaut, maintenir l'upload côté client après optimisation pour garantir:
  - Déduplication inter-recherches
  - Contrôle total sur le naming avec dossiers virtuels
- Dans l'intervalle, le plan ci-dessus assure: dédup locale (IDB) immédiate + possibilité de basculer sur un ID serveur déterministe ultérieurement sans casser la clé (grâce à `v`).

---

## Checklist exécution

### Phase 1: Infrastructure de base
- [ ] Créer `apps/web/src/utils/storage-paths.ts` avec utilitaires de nommage virtuel
- [ ] Modifier `packages/shared-cache/src/appwrite-storage.ts` pour supporter `pathPrefix`
- [ ] Créer `apps/web/src/services/image-cache.ts` avec clé, IDB, Appwrite, dédup en vol
- [ ] Ajouter env `VITE_APPWRITE_BUCKET_ID`, `VITE_CACHE_PEXELS_TTL_DAYS`

### Phase 2: Configuration Appwrite
- [ ] Vérifier/créer bucket `flashcard-images` (permissions, MIME, CORS)
- [ ] Configurer permissions: lecture publique, écriture restreinte
- [ ] Déployer/planifier la fonction `ankilang-cache-janitor` avec support des dossiers virtuels

### Phase 3: Intégration frontend
- [ ] Intégrer `getCachedImage()` dans `NewCardModal.tsx`
- [ ] Intégrer `getCachedImage()` dans `EditCardModal.tsx`
- [ ] Migrer le service TTS pour utiliser les paths virtuels (`cache/tts/votz/`, `cache/tts/elevenlabs/`)

### Phase 4: Tests et validation
- [ ] Tester scénarios A/B/C/D et vérifier logs de hits/misses
- [ ] Vérifier structure des dossiers virtuels dans Appwrite Console
- [ ] Valider que Cache Janitor nettoie correctement par TTL et par type
- [ ] Test de migration des fichiers existants (si applicable)

---

## Extrait de squelette (référence rapide)

```ts
// apps/web/src/services/image-cache.ts (squelette)
import { BrowserIDBCache, AppwriteStorageCache, buildCacheKey } from '@ankilang/shared-cache'
import { Storage } from 'appwrite'
import client from './appwrite'
import type { PexelsPhoto } from '../types/ankilang-vercel-api'
import { createVercelApiClient } from '../lib/vercel-api-client'
import { getSessionJWT } from './appwrite'

const idb = new BrowserIDBCache('ankilang', 'cache')
const storage = new AppwriteStorageCache({
  storage: new Storage(client),
}, import.meta.env.VITE_APPWRITE_BUCKET_ID || 'flashcard-images')

const inFlight = new Map<string, Promise<Blob>>()

export async function getCachedImage(photo: PexelsPhoto, opts?: {
  w?: number; h?: number; fmt?: 'webp'|'avif'|'jpeg'|'png'; q?: number; dpr?: number;
}) {
  const fmt = opts?.fmt || 'webp'
  const w = opts?.w ?? 600
  const h = opts?.h ?? 400
  const q = opts?.q ?? 80
  const dpr = opts?.dpr ?? 1

  const key = await buildCacheKey({
    namespace: 'pexels',
    externalId: String(photo.id),
    extra: { v: '1', w, h, fit: 'cover', fmt, q, dpr },
  })

  const run = async (): Promise<Blob> => {
    // 1) IDB
    const local = await idb.get<Blob>(key)
    if (local) return local

    // 2) Appwrite
    const remote = await storage.get<Blob>(key)
    if (remote) { await idb.set(key, remote, { ttlMs: 1000*60*60*24*180, contentType: `image/${fmt}` }); return remote }

    // 3) Optimiser via API Vercel
    const jwt = await getSessionJWT()
    if (!jwt) throw new Error('Not authenticated')
    const api = createVercelApiClient(jwt)
    const optimized = await api.optimizeImage({ imageUrl: photo.src.medium, width: w, height: h, quality: q, format: fmt })

    // 4) Récupérer le Blob et écrire local + serveur (idempotent)
    const blob = await fetch(optimized.url).then(r => r.blob())
    await idb.set(key, blob, { ttlMs: 1000*60*60*24*180, contentType: `image/${fmt}` })
    await storage.set(key, blob, { contentType: `image/${fmt}`, publicRead: true })
    return blob
  }

  const existing = inFlight.get(key)
  if (existing) return existing
  const p = run()
  inFlight.set(key, p)
  try { return await p } finally { inFlight.delete(key) }
}
```

---

Fin du document.

