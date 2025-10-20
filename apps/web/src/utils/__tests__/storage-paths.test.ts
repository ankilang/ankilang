/**
 * Tests unitaires pour storage-paths.ts
 *
 * Stratégie de tests:
 * 1. Validation des contraintes Appwrite (longueur, caractères)
 * 2. Génération correcte des chemins virtuels
 * 3. Parsing bidirectionnel (build → parse → build)
 * 4. Cas d'erreur et edge cases
 */

import { describe, it, expect } from 'vitest'
import {
  buildStoragePath,
  parseStoragePath,
  isVirtualFolderPath,
  getVirtualFolderPrefix,
  type StoragePathType,
} from '../storage-paths'

describe('storage-paths', () => {
  describe('buildStoragePath', () => {
    describe('cache/pexels', () => {
      it('should generate valid path with hash and extension', () => {
        const path = buildStoragePath('cache/pexels', {
          hash: 'a3f2e1d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3',
          extension: 'webp',
        })

        expect(path).toBe('cache/pexels/a3f2e1d9c8b7a6f5e4d3c2b1a0f9.webp')
      })

      it('should truncate long hash to 32 chars', () => {
        const longHash = 'a'.repeat(64)
        const path = buildStoragePath('cache/pexels', {
          hash: longHash,
          extension: 'webp',
        })

        const parsed = parseStoragePath(path)
        expect(parsed.hash?.length).toBe(32)
      })

      it('should throw if hash is missing', () => {
        expect(() =>
          buildStoragePath('cache/pexels', {
            extension: 'webp',
          })
        ).toThrow('Hash required for cache/pexels paths')
      })
    })

    describe('cache/tts/votz', () => {
      it('should generate valid path for Votz TTS', () => {
        const path = buildStoragePath('cache/tts/votz', {
          hash: 'b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9',
          extension: 'mp3',
        })

        expect(path).toBe('cache/tts/votz/b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9.mp3')
      })
    })

    describe('cache/tts/elevenlabs', () => {
      it('should generate valid path for ElevenLabs TTS', () => {
        const path = buildStoragePath('cache/tts/elevenlabs', {
          hash: 'c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0',
          extension: 'mp3',
        })

        expect(path).toBe('cache/tts/elevenlabs/c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0.mp3')
      })
    })

    describe('user/upload', () => {
      it('should generate valid path with userId and filename', () => {
        const path = buildStoragePath('user/upload', {
          userId: '507f1f77bcf86cd799439011',
          filename: 'vacation-photo',
          extension: 'webp',
        })

        expect(path).toBe('user/507f1f77bcf86cd799439011/uploads/vacation-photo.webp')
      })

      it('should auto-generate filename if not provided', () => {
        const path = buildStoragePath('user/upload', {
          userId: '507f1f77bcf86cd799439011',
          extension: 'webp',
        })

        expect(path).toMatch(/^user\/507f1f77bcf86cd799439011\/uploads\/\d+_[a-z0-9]+\.webp$/)
      })

      it('should throw if userId is missing', () => {
        expect(() =>
          buildStoragePath('user/upload', {
            filename: 'photo',
            extension: 'webp',
          })
        ).toThrow('UserId required for user/upload paths')
      })
    })

    describe('user/avatar', () => {
      it('should generate valid path for avatar', () => {
        const path = buildStoragePath('user/avatar', {
          userId: '507f1f77bcf86cd799439011',
          filename: 'profile-pic',
          extension: 'webp',
        })

        expect(path).toBe('user/507f1f77bcf86cd799439011/avatar/profile-pic.webp')
      })
    })

    describe('validation', () => {
      it('should reject invalid characters in fileId', () => {
        expect(() =>
          buildStoragePath('cache/pexels', {
            hash: 'invalid hash with spaces',
            extension: 'webp',
          })
        ).toThrow('Invalid characters in fileId')
      })

      it('should reject fileId longer than 255 chars', () => {
        const veryLongUserId = 'a'.repeat(250)
        expect(() =>
          buildStoragePath('user/upload', {
            userId: veryLongUserId,
            filename: 'photo',
            extension: 'webp',
          })
        ).toThrow('FileId too long')
      })
    })
  })

  describe('parseStoragePath', () => {
    it('should parse cache/pexels path correctly', () => {
      const metadata = parseStoragePath('cache/pexels/a3f2e1d9c8b7.webp')

      expect(metadata).toMatchObject({
        type: 'cache/pexels',
        extension: 'webp',
        hash: 'a3f2e1d9c8b7',
      })
      expect(metadata.parts).toEqual(['cache', 'pexels', 'a3f2e1d9c8b7.webp'])
    })

    it('should parse cache/tts/votz path correctly', () => {
      const metadata = parseStoragePath('cache/tts/votz/b4c3d2e1f0a9.mp3')

      expect(metadata).toMatchObject({
        type: 'cache/tts/votz',
        extension: 'mp3',
        hash: 'b4c3d2e1f0a9',
      })
    })

    it('should parse user/upload path correctly', () => {
      const metadata = parseStoragePath('user/507f1f77bcf86cd799439011/uploads/photo.webp')

      expect(metadata).toMatchObject({
        type: 'user/507f1f77bcf86cd799439011/uploads',
        extension: 'webp',
        userId: '507f1f77bcf86cd799439011',
      })
    })

    it('should parse user/avatar path correctly', () => {
      const metadata = parseStoragePath('user/507f1f77bcf86cd799439011/avatar/profile.webp')

      expect(metadata).toMatchObject({
        type: 'user/507f1f77bcf86cd799439011/avatar',
        extension: 'webp',
        userId: '507f1f77bcf86cd799439011',
      })
    })

    it('should handle files without extension', () => {
      const metadata = parseStoragePath('cache/pexels/abc123')

      expect(metadata.extension).toBe('')
      expect(metadata.hash).toBe('abc123')
    })

    it('should throw on empty fileId', () => {
      expect(() => parseStoragePath('')).toThrow('Invalid fileId')
    })
  })

  describe('isVirtualFolderPath', () => {
    it('should return true for valid cache paths', () => {
      expect(isVirtualFolderPath('cache/pexels/abc123.webp')).toBe(true)
      expect(isVirtualFolderPath('cache/tts/votz/def456.mp3')).toBe(true)
      expect(isVirtualFolderPath('cache/tts/elevenlabs/ghi789.mp3')).toBe(true)
    })

    it('should return true for valid user paths', () => {
      expect(isVirtualFolderPath('user/507f1f77/uploads/photo.webp')).toBe(true)
      expect(isVirtualFolderPath('user/507f1f77/avatar/profile.webp')).toBe(true)
    })

    it('should return false for legacy flat fileIds', () => {
      expect(isVirtualFolderPath('abc123xyz')).toBe(false)
      expect(isVirtualFolderPath('legacy-file-id.webp')).toBe(false)
    })

    it('should return false for invalid cache paths (too short)', () => {
      expect(isVirtualFolderPath('cache/pexels')).toBe(false)
      expect(isVirtualFolderPath('cache/')).toBe(false)
    })

    it('should return false for invalid user paths (too short)', () => {
      expect(isVirtualFolderPath('user/507f1f77')).toBe(false)
      expect(isVirtualFolderPath('user/507f1f77/uploads')).toBe(false)
    })

    it('should return false for unknown prefixes', () => {
      expect(isVirtualFolderPath('unknown/prefix/file.webp')).toBe(false)
    })
  })

  describe('getVirtualFolderPrefix', () => {
    it('should extract prefix from cache paths', () => {
      expect(getVirtualFolderPrefix('cache/pexels/abc123.webp')).toBe('cache/pexels')
      expect(getVirtualFolderPrefix('cache/tts/votz/def456.mp3')).toBe('cache/tts/votz')
    })

    it('should extract prefix from user paths', () => {
      expect(getVirtualFolderPrefix('user/507f1f77/uploads/photo.webp')).toBe(
        'user/507f1f77/uploads'
      )
      expect(getVirtualFolderPrefix('user/507f1f77/avatar/profile.webp')).toBe(
        'user/507f1f77/avatar'
      )
    })

    it('should handle single-level paths', () => {
      expect(getVirtualFolderPrefix('file.webp')).toBe('')
    })
  })

  describe('bidirectional conversion', () => {
    const testCases: Array<{
      type: StoragePathType
      params: Parameters<typeof buildStoragePath>[1]
    }> = [
      {
        type: 'cache/pexels',
        params: { hash: 'a3f2e1d9c8b7a6f5', extension: 'webp' },
      },
      {
        type: 'cache/tts/votz',
        params: { hash: 'b4c3d2e1f0a9b8c7', extension: 'mp3' },
      },
      {
        type: 'cache/tts/elevenlabs',
        params: { hash: 'c5d4e3f2a1b0c9d8', extension: 'mp3' },
      },
      {
        type: 'user/upload',
        params: { userId: '507f1f77', filename: 'photo', extension: 'webp' },
      },
      {
        type: 'user/avatar',
        params: { userId: '507f1f77', filename: 'profile', extension: 'webp' },
      },
    ]

    it.each(testCases)('should convert $type path bidirectionally', ({ type, params }: { type: StoragePathType; params: Parameters<typeof buildStoragePath>[1] }) => {
      const path = buildStoragePath(type, params)
      const parsed = parseStoragePath(path)

      expect(parsed.extension).toBe(params.extension)
      if (params.hash) {
        expect(parsed.hash).toBeTruthy()
      }
      if (params.userId) {
        expect(parsed.userId).toBe(params.userId)
      }
    })
  })
})
