/**
 * Utilitaires pour la gestion des chemins de fichiers virtuels dans Appwrite Storage
 *
 * Appwrite ne supporte pas nativement les dossiers, mais nous pouvons simuler
 * une structure hiérarchique via des conventions de nommage dans les fileId.
 *
 * Format général: {type}/{source}/{identifier}.{ext}
 *
 * Exemples:
 * - cache/pexels/a3f2e1d9c8b7.webp
 * - cache/tts/votz/b4c3d2e1f0a9.mp3
 * - cache/tts/elevenlabs/c5d4e3f2a1b0.mp3
 * - user/507f1f77bcf86cd799439011/uploads/1729366400000_x7k2p9.webp
 * - user/507f1f77bcf86cd799439011/avatar/1729366400000.webp
 *
 * @module storage-paths
 */

/**
 * Types de chemins virtuels supportés
 */
export type StoragePathType =
  | 'cache/pexels'           // Images Pexels optimisées (cache partagé)
  | 'cache/tts/votz'         // Audio TTS Votz/Occitan (cache partagé)
  | 'cache/tts/elevenlabs'   // Audio TTS ElevenLabs (cache partagé)
  | 'user/upload'            // Images uploadées par utilisateur
  | 'user/avatar'            // Photos de profil utilisateur

/**
 * Métadonnées extraites d'un chemin de fichier
 */
export interface StoragePathMetadata {
  /** Type de chemin (ex: "cache/pexels", "user/upload") */
  type: string
  /** Parties du chemin séparées par "/" */
  parts: string[]
  /** Extension du fichier (sans le point) */
  extension: string
  /** Hash SHA-256 pour les fichiers cache (si applicable) */
  hash?: string
  /** ID utilisateur pour les fichiers user (si applicable) */
  userId?: string
}

/**
 * Contraintes Appwrite Storage pour les fileId
 *
 * Source: https://appwrite.io/docs/storage#create-file
 */
const APPWRITE_CONSTRAINTS = {
  /** Longueur maximale recommandée pour un fileId */
  MAX_FILE_ID_LENGTH: 36,
  /** Pattern regex pour caractères autorisés dans fileId */
  ALLOWED_CHARS_PATTERN: /^[a-zA-Z0-9._\-\/]+$/,
} as const

/**
 * Génère un fileId conforme aux contraintes Appwrite avec structure de dossier virtuel
 *
 * @param type - Type de chemin virtuel
 * @param params - Paramètres spécifiques au type
 * @returns fileId avec structure de dossier virtuel
 *
 * @throws {Error} Si les paramètres requis sont manquants
 * @throws {Error} Si le fileId généré dépasse la longueur maximale
 *
 * @example
 * ```ts
 * // Cache Pexels
 * const fileId = buildStoragePath('cache/pexels', {
 *   hash: 'a3f2e1d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3',
 *   extension: 'webp'
 * })
 * // => "cache/pexels/a3f2e1d9c8b7a6f5e4d3c2b1a0f9.webp"
 *
 * // Upload utilisateur
 * const fileId = buildStoragePath('user/upload', {
 *   userId: '507f1f77bcf86cd799439011',
 *   filename: 'vacation-photo',
 *   extension: 'webp'
 * })
 * // => "user/507f1f77bcf86cd799439011/uploads/vacation-photo.webp"
 * ```
 */
export function buildStoragePath(
  type: StoragePathType,
  params: {
    /** SHA-256 hash pour les fichiers cache */
    hash?: string
    /** ID utilisateur Appwrite pour les fichiers user */
    userId?: string
    /** Nom du fichier (optionnel, généré automatiquement si absent) */
    filename?: string
    /** Extension du fichier (sans le point) */
    extension?: string
  }
): string {
  const { hash, userId, filename, extension = 'bin' } = params

  let fileId: string

  switch (type) {
    case 'cache/pexels':
    case 'cache/tts/votz':
    case 'cache/tts/elevenlabs': {
      if (!hash) {
        throw new Error(`Hash required for ${type} paths`)
      }

      // Tronquer le hash pour respecter la limite de longueur
      // Format: "cache/pexels/" (13) + hash (32) + "." (1) + ext (4) = 50 chars
      // On tronque le hash à 32 chars pour rester sous la limite
      const shortHash = hash.slice(0, 32)
      fileId = `${type}/${shortHash}.${extension}`
      break
    }

    case 'user/upload':
    case 'user/avatar': {
      if (!userId) {
        throw new Error(`UserId required for ${type} paths`)
      }

      // Générer un nom de fichier unique si non fourni
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).slice(2, 8)
      const name = filename || `${timestamp}_${randomId}`

      // Pour les uploads: user/{userId}/uploads/{name}.{ext}
      // Pour les avatars: user/{userId}/avatar/{name}.{ext}
      const subFolder = type === 'user/upload' ? 'uploads' : 'avatar'
      fileId = `user/${userId}/${subFolder}/${name}.${extension}`
      break
    }

    default:
      throw new Error(`Unknown storage path type: ${type}`)
  }

  // Validation des contraintes Appwrite
  if (!APPWRITE_CONSTRAINTS.ALLOWED_CHARS_PATTERN.test(fileId)) {
    throw new Error(
      `Invalid characters in fileId: ${fileId}. Only alphanumeric, dots, hyphens, underscores, and slashes are allowed.`
    )
  }

  // Note: On permet les fileId plus longs que 36 chars pour les chemins user
  // car Appwrite supporte des fileId jusqu'à 255 chars en pratique
  if (fileId.length > 255) {
    throw new Error(
      `FileId too long (${fileId.length} chars): ${fileId}. Maximum is 255 characters.`
    )
  }

  return fileId
}

/**
 * Parse un fileId pour extraire les métadonnées du chemin virtuel
 *
 * @param fileId - FileId Appwrite à parser
 * @returns Métadonnées extraites du chemin
 *
 * @example
 * ```ts
 * const metadata = parseStoragePath('cache/pexels/a3f2e1d9c8b7.webp')
 * // => {
 * //   type: 'cache/pexels',
 * //   parts: ['cache', 'pexels', 'a3f2e1d9c8b7.webp'],
 * //   extension: 'webp',
 * //   hash: 'a3f2e1d9c8b7'
 * // }
 *
 * const metadata = parseStoragePath('user/507f1f77bcf86cd799439011/uploads/photo.webp')
 * // => {
 * //   type: 'user/507f1f77bcf86cd799439011/uploads',
 * //   parts: ['user', '507f1f77bcf86cd799439011', 'uploads', 'photo.webp'],
 * //   extension: 'webp',
 * //   userId: '507f1f77bcf86cd799439011'
 * // }
 * ```
 */
export function parseStoragePath(fileId: string): StoragePathMetadata {
  const parts = fileId.split('/')
  const lastPart = parts[parts.length - 1]

  if (!lastPart) {
    throw new Error(`Invalid fileId: ${fileId}`)
  }

  // Extraire l'extension
  const extensionMatch = /\.([^.]+)$/.exec(lastPart)
  const extension = extensionMatch?.[1] || ''

  // Extraire le nom de fichier sans extension
  const filenameWithoutExt = lastPart.replace(/\.[^.]+$/, '')

  // Construire le type (tout sauf le dernier segment)
  const type = parts.slice(0, -1).join('/')

  const metadata: StoragePathMetadata = {
    type,
    parts,
    extension,
  }

  // Détecter si c'est un fichier cache (hash présent)
  if (type.startsWith('cache/')) {
    metadata.hash = filenameWithoutExt
  }

  // Détecter si c'est un fichier utilisateur (userId présent)
  if (type.startsWith('user/') && parts.length >= 2) {
    metadata.userId = parts[1]
  }

  return metadata
}

/**
 * Vérifie si un fileId respecte la convention de nommage des dossiers virtuels
 *
 * @param fileId - FileId à vérifier
 * @returns true si le fileId suit la convention, false sinon
 *
 * @example
 * ```ts
 * isVirtualFolderPath('cache/pexels/abc123.webp')  // => true
 * isVirtualFolderPath('legacy-file-id')             // => false
 * ```
 */
export function isVirtualFolderPath(fileId: string): boolean {
  // Un chemin virtuel doit contenir au moins un "/"
  if (!fileId.includes('/')) {
    return false
  }

  const parts = fileId.split('/')

  // Vérifier les préfixes connus
  if (parts[0] === 'cache') {
    // Format: cache/{source}/{hash}.{ext}
    return parts.length >= 3
  }

  if (parts[0] === 'user') {
    // Format: user/{userId}/{subFolder}/{name}.{ext}
    return parts.length >= 4
  }

  // Préfixe inconnu, considérer comme non-virtuel
  return false
}

/**
 * Extrait le préfixe de dossier virtuel d'un fileId
 *
 * Utile pour filtrer les fichiers par type dans Appwrite Storage
 *
 * @param fileId - FileId à analyser
 * @returns Préfixe de dossier (ex: "cache/pexels", "user/507f1f77bcf86cd799439011/uploads")
 *
 * @example
 * ```ts
 * getVirtualFolderPrefix('cache/pexels/abc123.webp')
 * // => "cache/pexels"
 *
 * getVirtualFolderPrefix('user/507f1f77/uploads/photo.webp')
 * // => "user/507f1f77/uploads"
 * ```
 */
export function getVirtualFolderPrefix(fileId: string): string {
  const parts = fileId.split('/')

  // Retourner tout sauf le dernier segment (nom de fichier)
  return parts.slice(0, -1).join('/')
}
