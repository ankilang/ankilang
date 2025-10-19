import { sha256Hex } from './hash';
import type { CacheAdapter, CacheSetOptions, CacheValue } from './types';
import { cacheLog } from './log';

export interface AppwriteStorageDeps {
  storage: {
    getFileView: (b: string, f: string) => Promise<Blob>;
    createFile: (b: string, f: string, file: Blob, p?: string[]) => Promise<void>;
    getFile: (b: string, f: string) => Promise<any>;
    deleteFile: (b: string, f: string) => Promise<void>;
  };
}

export class AppwriteStorageCache implements CacheAdapter {
  readonly name = 'appwrite-storage';

  /**
   * @param deps - Dependencies (Appwrite Storage instance)
   * @param bucketId - Appwrite bucket ID
   * @param pathPrefix - Optional virtual folder prefix (e.g., 'cache/pexels', 'cache/tts/votz')
   *                     When provided, all fileIds will be prefixed with this path
   *                     Example: key 'abc123' with prefix 'cache/pexels' becomes 'cache/pexels/abc123'
   */
  constructor(
    private deps: AppwriteStorageDeps,
    private bucketId: string,
    private pathPrefix?: string
  ) {}

  /**
   * Get short prefix (1-2 chars) based on pathPrefix
   * Examples:
   * - 'cache/pexels' → 'p'
   * - 'cache/tts/votz' → 'tv'
   * - 'cache/tts/elevenlabs' → 'te'
   * - undefined → 'c' (generic cache)
   */
  private getShortPrefix(): string {
    if (!this.pathPrefix) return 'c';

    const lower = this.pathPrefix.toLowerCase();

    // Image types
    if (lower.includes('pexels')) return 'p';
    if (lower.includes('image')) return 'i';

    // TTS types
    if (lower.includes('votz')) return 'tv';
    if (lower.includes('elevenlabs') || lower.includes('eleven')) return 'te';
    if (lower.includes('tts')) return 't';

    // User content
    if (lower.includes('upload')) return 'u';
    if (lower.includes('avatar')) return 'a';

    // Generic cache
    return 'c';
  }

  /**
   * Extract format extension from key
   */
  private extractFormatFromKey(key: string): string | null {
    // Try to extract fmt from key extras e.g., (v=1|w=600|...|fmt=webp|q=80)
    const m = key.match(/\(.*?\)/);
    if (m) {
      const inside = m[0];
      const fm = inside.match(/(?:^|\|)fmt=([a-z0-9]+)/);
      if (fm && fm[1]) return fm[1];
    }
    // Heuristic based on path prefix for TTS
    if (this.pathPrefix?.includes('tts')) return 'mp3';
    return null;
  }

  /**
   * Generate short fileId with extension (max 36 chars for Appwrite)
   * Format: {prefix}-{hash16}.{ext}  (e.g., "p-330ac06ef292f0f0.webp")
   *
   * Appwrite constraints:
   * - Max 36 chars
   * - a-z A-Z 0-9 . - _ only
   * - Cannot start with special char
   * - File extension required by bucket settings
   */
  private async shortFileId(key: string): Promise<string> {
    const fullHash = await sha256Hex(key);
    const shortHash = fullHash.slice(0, 16); // 16 hex chars
    const prefix = this.getShortPrefix();
    const ext = this.extractFormatFromKey(key);

    // Format: {prefix}-{hash}.{ext}  (max 25 chars: "te-" + 16 + ".mp3" = 23)
    return ext ? `${prefix}-${shortHash}.${ext}` : `${prefix}-${shortHash}`;
  }

  /**
   * Legacy fileId formats for backward compatibility
   */
  private async legacyFileIds(key: string): Promise<string[]> {
    const h = await sha256Hex(key);
    const base = `cache_${h.slice(0, 40)}`;
    const fmt = this.extractFormatFromKey(key);

    const ids: string[] = [];

    // Old sanitized format with __ separator
    if (this.pathPrefix) {
      const sanitized = this.pathPrefix.replace(/[\/]+/g, '.').replace(/\.+$/,'') + '__';
      ids.push(`${sanitized}${base}${fmt ? `.${fmt}` : ''}`);
      ids.push(`${sanitized}${base}`);
    }

    // Old slash format (invalid but we tried it)
    if (this.pathPrefix) {
      ids.push(`${this.pathPrefix}/${base}${fmt ? `.${fmt}` : ''}`);
      ids.push(`${this.pathPrefix}/${base}`);
    }

    // Old format without prefix
    ids.push(`${base}${fmt ? `.${fmt}` : ''}`);
    ids.push(base);

    return ids;
  }

  async get<T = CacheValue>(key: string): Promise<T | null> {
    // Try new short format first
    try {
      const shortId = await this.shortFileId(key);
      const blob = await this.deps.storage.getFileView(this.bucketId, shortId);
      cacheLog.hit(this.name, key);
      return blob as T;
    } catch {
      // Try legacy formats for backward compatibility
      const legacyIds = await this.legacyFileIds(key);
      for (const legacyId of legacyIds) {
        try {
          const blob = await this.deps.storage.getFileView(this.bucketId, legacyId);
          cacheLog.hit(this.name, key);
          return blob as T;
        } catch {
          // Continue to next legacy format
        }
      }

      cacheLog.miss(this.name, key);
      return null;
    }
  }

  async set<T = CacheValue>(key: string, value: T, opts?: CacheSetOptions): Promise<void> {
    // Use new short format
    const id = await this.shortFileId(key);
    let blob: Blob;

    if (value instanceof Blob) blob = value;
    else if (value instanceof ArrayBuffer)
      blob = new Blob([value], { type: opts?.contentType ?? 'application/octet-stream' });
    else if (value instanceof Uint8Array)
      blob = new Blob([new Uint8Array(value)], { type: opts?.contentType ?? 'application/octet-stream' });
    else if (typeof value === 'string')
      blob = new Blob([value], { type: opts?.contentType ?? 'text/plain' });
    else blob = new Blob([JSON.stringify(value)], { type: 'application/json' });

    try {
      await this.deps.storage.createFile(this.bucketId, id, blob, opts?.publicRead ? ['role:all'] : undefined);
      cacheLog.set(this.name, key, opts?.ttlMs);
    } catch (e: any) {
      const msg = String(e ?? '');
      if (msg.includes('409') || msg.toLowerCase().includes('already')) {
        // Idempotent: file already exists → treat as success
        cacheLog.set(this.name, key, opts?.ttlMs);
      } else {
        console.warn(`[Cache][${this.name}] Failed set: ${msg}`);
      }
    }
  }

  async delete(key: string): Promise<void> {
    // Try new short format first
    try {
      const shortId = await this.shortFileId(key);
      await this.deps.storage.deleteFile(this.bucketId, shortId);
      cacheLog.del(this.name, key);
      return;
    } catch {}

    // Try legacy formats for backward compatibility
    const legacyIds = await this.legacyFileIds(key);
    for (const legacyId of legacyIds) {
      try {
        await this.deps.storage.deleteFile(this.bucketId, legacyId);
        cacheLog.del(this.name, key);
        return;
      } catch {
        // Continue to next legacy format
      }
    }
  }

  async has(key: string): Promise<boolean> {
    // Try new short format first
    try {
      const shortId = await this.shortFileId(key);
      await this.deps.storage.getFile(this.bucketId, shortId);
      return true;
    } catch {}

    // Try legacy formats for backward compatibility
    const legacyIds = await this.legacyFileIds(key);
    for (const legacyId of legacyIds) {
      try {
        await this.deps.storage.getFile(this.bucketId, legacyId);
        return true;
      } catch {
        // Continue to next legacy format
      }
    }

    return false;
  }
}
