# Plan de simplification — Médias sans cache (images + audios)

Date: 2025-10-19

Objectif
- Un seul bucket Appwrite pour images et audios.
- Aucun cache partagé (pas de dédup inter‑utilisateurs à ce stade).
- Aucune écriture Appwrite tant que l’utilisateur n’a pas cliqué « Enregistrer ».
- Prévisualisations (traductions, image, audio) sans upload.
- Au Submit: upload unique via l’API Vercel; la flashcard stocke les URLs Appwrite; suppression en cascade Carte/Thème → suppression des médias associés.
- Les images sont toujours optimisées (Sharp côté API) avant upload.

Vue d’ensemble des flux
- Traduction (DeepL/Revirada): appel direct → texte traduit (aucun média).
- Image (Pexels):
  - Preview: /api/pexels-optimize (upload=false) → base64 → Blob → Object URL → affichage.
  - Submit: /api/pexels-optimize (upload=true) → upload Appwrite → { fileId, url } → la carte enregistre `imageUrl=url`.
- Audio (TTS: ElevenLabs/Votz):
  - Preview: /api/(elevenlabs|votz) (upload=false) → audio base64 → Blob → lecture (Object URL).
  - Submit (si audio choisi): /api/(elevenlabs|votz) (upload=true) → upload Appwrite → { fileId, url } → la carte enregistre `audioUrl=url`.
- Suppression carte: supprimer fichiers associés (image/audio) du bucket puis supprimer la carte.
- Suppression thème: lister cartes du thème → supprimer leurs médias puis les cartes.

Modèle côté carte (DB Appwrite — déjà en place)
- `themeId: string` — association explicite au thème
- `imageUrl?: string` — URL Appwrite de l’image (optionnelle)
- `audioUrl?: string` — URL Appwrite de l’audio (optionnelle)
- (Optionnel) `imageMime?/audioMime?` si utile

Séparation des responsabilités
- Front (ce repo): prévisualisations en base64 → Blob (Object URL), upload uniquement au Submit, association carte→médias→thème.
- API Vercel: prévisualisations sans upload (upload=false), upload unique et optimisation au Submit (upload=true), CORS robuste.
- Appwrite (MCP): bucket unique configuré, fileSecurity=true, extensions autorisées, CORS/origins projet.

---

## 1) À faire dans ce repo (Front — ankilang)

Résumé
- Supprimer toute logique de « cache » pour les images.
- Image/TTS preview via base64 → Blob → Object URL (aucun upload).
- Submit: upload via API Vercel; carte enregistre les URLs Appwrite.
- Suppression carte/thème: suppression médias associés puis documents.

Tâches détaillées
1. Images (Pexels)
- Services (apps/web/src/services/pexels.ts):
  - Ajouter `pexelsOptimizePreview({ imageUrl, width, height, quality, format }): Promise<{ optimizedImage: string; format; width; height; originalSize; optimizedSize; compressionRatio }>`
    - POST /api/pexels-optimize avec `{ upload:false }`.
  - Ajouter `pexelsOptimizePersist({ imageUrl, width, height, quality, format, filename? }): Promise<{ fileId: string; url: string; format; width; height; originalSize; optimizedSize; compressionRatio }>`
    - POST /api/pexels-optimize avec `{ upload:true }`.
- UI:
  - NewCardModal/EditCardModal:
    - Preview: au clic sur l’image → `pexelsOptimizePreview` → convertir base64 en Blob → `URL.createObjectURL` → set preview (aucun upload Appwrite).
    - Submit: si une image a été choisie → `pexelsOptimizePersist` → récupérer `{ url }` → persister dans la carte: `imageUrl=url`, `imageUrlType='appwrite'`.
  - Annuler: révoquer Object URLs (pas d’upload déjà fait → aucun orphelin).

2. Audio (TTS)
- Types (apps/web/src/types/ankilang-vercel-api.ts):
  - Étendre `ElevenLabsRequest`/`VotzRequest` avec `upload?: boolean`, `filename?: string` (ou `fileId?: string`).
- Services:
  - apps/web/src/services/elevenlabs.ts / votz.ts:
    - Preview: `upload:false` → audio base64 → Blob → Object URL (lecture), aucun upload.
    - Persist: `upload:true` (filename optionnel, ex: `${cardId}-audio.mp3`) → `{ fileId, url }`.
  - apps/web/src/services/tts.ts:
    - Router Preview → `generateTTS({ upload:false })` → Blob/URL.
    - Ajouter `persistTTS({ text, lang, voice, filename? })` → upload=true → `{ fileId, url }`.
- UI:
  - Preview audio: bouton Play (Blob URL), pas d’upload.
  - Submit: si un audio a été généré en preview → `persistTTS` → `audioUrl = url`.

3. Suppression & cascade
- apps/web/src/services/cards.service.ts:
  - createCard/updateCard: enregistrer `imageUrl`/`audioUrl` renvoyées par l’API.
  - deleteCard(cardId, userId):
    - Lire `card.imageUrl`/`card.audioUrl` → extraire `fileId` depuis `/files/{fileId}/view` → `StorageService.deleteFile(bucket, fileId)`.
    - Supprimer le document carte.
  - deleteCardsByThemeId(themeId, userId):
    - Lister les cartes puis, pour chacune, supprimer ses fichiers; ensuite supprimer la carte.

4. Nettoyage code
- Supprimer/neutraliser tout **cache images** (ex: `image-cache.ts`, `storage.set` images, `optimizeAndUploadImage`).
- Conserver la logique Object URL + révocation pour previews.

5. Tests
- Preview image/audio: aucune écriture Appwrite (vérifier console Appwrite).
- Submit: 1 upload image si présente, 1 upload audio si présent; la carte contient les URLs Appwrite.
- Suppression carte: les fichiers associés sont supprimés.
- Suppression thème: cascade cartes + médias OK.

---

## 2) Prompt — repo Fonctions Vercel (ankilang-api-monorepo)

À copier/coller pour ouvrir une PR dans le repo API.

Titre: « Simplification médias — preview/persist, upload au Submit uniquement »

Objectif
- Préviews sans upload Appwrite.
- Upload unique au Submit: optimisation image via Sharp, TTS audio, écriture dans le bucket, retour `{ fileId, url }`.
- CORS robuste (OPTIONS + erreurs), formats propres.

Changements demandés
1) Validation (lib/utils/validation.ts)
- Pexels Optimize schema: `{ imageUrl:string, width?:number, height?:number, quality?:number, format?:'webp'|'jpeg'|'png', upload?:boolean, filename?:string }`.
- TTS (ElevenLabs/Votz): `{ text:string, voiceId?:string, modelId?:string, upload?:boolean, filename?:string }`.

2) Client Appwrite (lib/clients/appwrite.ts)
- `uploadToAppwrite({ buffer, mimeType, filename, fileId? }) → { fileId, url }`
  - `createFile(bucketId, fileId || ID.unique(), new File([buffer], filename, { type: mimeType }))`.
  - `buildFileUrl(fileId)` via SDK.

3) Endpoint Pexels (api/pexels-optimize.ts)
- upload=false (preview): télécharge & optimise (Sharp) → renvoie `{ optimizedImage: base64, format, width, height, originalSize, optimizedSize, compressionRatio }`.
- upload=true (persist): optimise → `uploadToAppwrite` (filename par défaut `<guid>.webp` ou `filename` reçu) → renvoie `{ fileId, url, format, width, height, originalSize, optimizedSize, compressionRatio }`.

4) Endpoints TTS (api/elevenlabs.ts, api/votz.ts)
- upload=false (preview): renvoie `{ audio: base64, size, modelId? | language? }` (aucun upload).
- upload=true (persist): génère binaire → `uploadToAppwrite` (filename `<guid>.mp3` ou `filename` reçu) → renvoie `{ fileId, url }`.

5) CORS & OPTIONS
- OPTIONS 204: `ACAO`, `ACAM: POST, OPTIONS`, `ACAH: Authorization, Content-Type`.
- Ajouter `ACAO` sur toutes les réponses (succès/erreurs).

Critères d’acceptation
- Preview image/audio: aucun fichier créé; base64 renvoyé.
- Submit: un fichier par média; URL Appwrite renvoyée.
- Suppression côté front: possible via `fileId` extraite des URLs.

---

## 3) Prompt — MCP Appwrite (validation du bucket)

Titre: « Vérification bucket unique médias (images + audios) »

Actions
1) Vérifier/Créer le bucket `flashcard-images` avec:
- `fileSecurity: true`
- `encryption: true`, `antivirus: true`
- `maximumFileSize: >= 10MB`
- `allowedFileExtensions: ['webp','jpg','jpeg','png','mp3','wav','ogg','m4a']`

2) Permissions
- Stratégie owner‑only (recommandé): `read/write/delete: Role.user(userId)`.
- Si besoin d’exposer publiquement certaines ressources, on ajustera plus tard (`read:any`).

3) CORS/Origins (côté projet)
- Ajouter `http://localhost:5173` et l’origin de prod.
- Vérifier que `getFileView` fonctionne via session (owner‑only) depuis le front.

4) Pas de « dossiers » ni métadonnées obligatoires
- L’association se fait via la carte (`imageUrl`/`audioUrl`) et `themeId`.
- Métadonnées fichier (optionnel): `cardId`, `themeId`, `kind: image|audio` pour audit.

---

## 4) Acceptation & Rollout

- [ ] Preview image/audio: aucune écriture Appwrite; affichage et lecture audio OK.
- [ ] Submit: images optimisées uploadées; audio uploadé si présent; URLs stockées dans la carte.
- [ ] Delete carte: suppression médias associés (image+audio) puis carte.
- [ ] Delete thème: suppression des cartes + médias en cascade.
- [ ] CORS robuste (OPTIONS + erreurs) côté API.
- [ ] UX claire (prévisualisation vs persist), logs allégés.

Risques & Mitigations
- Erreurs réseau preview: fallback sur URLs Pexels directes (images) ou message d’erreur audio.
- Quota Appwrite: `maximumFileSize` ≥ 10MB; resize/quality côté Sharp.
- Sécurité: owner‑only par défaut; pas d’URL publique tant que non requis.

Notes
- On optimise toujours les images (Sharp) avant upload.
- Aucun cache partagé: le but est la simplicité et la maîtrise des flux.

