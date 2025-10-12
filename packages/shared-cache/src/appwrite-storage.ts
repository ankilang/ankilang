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
  constructor(private deps: AppwriteStorageDeps, private bucketId: string) {}

  private async safeFileId(key: string): Promise<string> {
    const clean = key.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
    return clean.length < 10 ? await sha256Hex(key).then(h => `cache_${h.slice(0, 40)}`) : clean;
  }

  async get<T = CacheValue>(key: string): Promise<T | null> {
    const id = await this.safeFileId(key);
    try {
      const blob = await this.deps.storage.getFileView(this.bucketId, id);
      cacheLog.hit(this.name, key);
      return blob as T;
    } catch {
      cacheLog.miss(this.name, key);
      return null;
    }
  }

  async set<T = CacheValue>(key: string, value: T, opts?: CacheSetOptions): Promise<void> {
    const id = await this.safeFileId(key);
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
    } catch (e) {
      console.warn(`[Cache][${this.name}] Failed set: ${String(e)}`);
    }
  }

  async delete(key: string): Promise<void> {
    const id = await this.safeFileId(key);
    try {
      await this.deps.storage.deleteFile(this.bucketId, id);
      cacheLog.del(this.name, key);
    } catch {}
  }

  async has(key: string): Promise<boolean> {
    const id = await this.safeFileId(key);
    try {
      await this.deps.storage.getFile(this.bucketId, id);
      return true;
    } catch {
      return false;
    }
  }
}
