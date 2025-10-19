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

  private async baseIdForKey(key: string): Promise<string> {
    const h = await sha256Hex(key);
    return `cache_${h.slice(0, 40)}`;
  }

  private sanitizePrefix(prefix?: string, variant: 'sanitized' | 'slash' = 'sanitized'): string | undefined {
    if (!prefix) return undefined;
    if (variant === 'slash') return prefix; // legacy style with '/'
    return prefix.replace(/[\/]+/g, '.').replace(/\.+$/,'') + '__';
  }

  private async fileIdWithExt(key: string, variant: 'sanitized' | 'slash' = 'sanitized'): Promise<string> {
    const base = await this.baseIdForKey(key);
    const fmt = this.extractFormatFromKey(key) || 'bin';
    const id = `${base}.${fmt}`;
    const pref = this.sanitizePrefix(this.pathPrefix, variant);
    return pref ? `${pref}${id}` : id;
  }

  private async fileIdWithoutExt(key: string, variant: 'sanitized' | 'slash' = 'sanitized'): Promise<string> {
    const base = await this.baseIdForKey(key);
    const pref = this.sanitizePrefix(this.pathPrefix, variant);
    return pref ? `${pref}${base}` : base;
  }

  async get<T = CacheValue>(key: string): Promise<T | null> {
    const idWithExt = await this.fileIdWithExt(key, 'sanitized');
    try {
      const blob = await this.deps.storage.getFileView(this.bucketId, idWithExt);
      cacheLog.hit(this.name, key);
      return blob as T;
    } catch {
      // Try without extension for backward compatibility
      try {
        const idNoExt = await this.fileIdWithoutExt(key, 'sanitized');
        const blob = await this.deps.storage.getFileView(this.bucketId, idNoExt);
        cacheLog.hit(this.name, key);
        return blob as T;
      } catch {
        // Try legacy slash-based variants
        try {
          const legacyId = await this.fileIdWithExt(key, 'slash');
          const blob = await this.deps.storage.getFileView(this.bucketId, legacyId);
          cacheLog.hit(this.name, key);
          return blob as T;
        } catch {
          try {
            const legacyNoExt = await this.fileIdWithoutExt(key, 'slash');
            const blob = await this.deps.storage.getFileView(this.bucketId, legacyNoExt);
            cacheLog.hit(this.name, key);
            return blob as T;
          } catch {
            cacheLog.miss(this.name, key);
            return null;
          }
        }
      }
    }
  }

  async set<T = CacheValue>(key: string, value: T, opts?: CacheSetOptions): Promise<void> {
    const id = await this.fileIdWithExt(key, 'sanitized');
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
    try {
      const id = await this.fileIdWithExt(key, 'sanitized');
      await this.deps.storage.deleteFile(this.bucketId, id);
      cacheLog.del(this.name, key);
      return;
    } catch {}
    try {
      const idNoExt = await this.fileIdWithoutExt(key, 'sanitized');
      await this.deps.storage.deleteFile(this.bucketId, idNoExt);
      cacheLog.del(this.name, key);
      return;
    } catch {}
    try {
      const legacyId = await this.fileIdWithExt(key, 'slash');
      await this.deps.storage.deleteFile(this.bucketId, legacyId);
      cacheLog.del(this.name, key);
      return;
    } catch {}
    try {
      const legacyNoExt = await this.fileIdWithoutExt(key, 'slash');
      await this.deps.storage.deleteFile(this.bucketId, legacyNoExt);
      cacheLog.del(this.name, key);
    } catch {}
  }

  async has(key: string): Promise<boolean> {
    try {
      const id = await this.fileIdWithExt(key, 'sanitized');
      await this.deps.storage.getFile(this.bucketId, id);
      return true;
    } catch {}
    try {
      const idNoExt = await this.fileIdWithoutExt(key, 'sanitized');
      await this.deps.storage.getFile(this.bucketId, idNoExt);
      return true;
    } catch {}
    try {
      const legacyId = await this.fileIdWithExt(key, 'slash');
      await this.deps.storage.getFile(this.bucketId, legacyId);
      return true;
    } catch {}
    try {
      const legacyNoExt = await this.fileIdWithoutExt(key, 'slash');
      await this.deps.storage.getFile(this.bucketId, legacyNoExt);
      return true;
    } catch {
      return false;
    }
  }
}
