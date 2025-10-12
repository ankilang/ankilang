import localforage from 'localforage';
import type { CacheAdapter, CacheSetOptions, CacheValue } from './types';
import { cacheLog } from './log';

interface Stored {
  value: CacheValue;
  contentType?: string;
  exp?: number;
}

export class BrowserIDBCache implements CacheAdapter {
  readonly name = 'browser-idb';
  private store: LocalForage;
  private disabled = false;

  constructor(dbName = 'ankilang', storeName = 'cache') {
    this.store = localforage.createInstance({ name: dbName, storeName });
  }

  private async read(key: string): Promise<Stored | null> {
    const v = await this.store.getItem<Stored>(key);
    if (!v) return null;
    if (v.exp && Date.now() > v.exp) {
      await this.store.removeItem(key);
      return null;
    }
    return v;
  }

  async get<T = CacheValue>(key: string): Promise<T | null> {
    if (this.disabled) return null;
    
    const v = await this.read(key);
    if (v) {
      cacheLog.hit(this.name, key);
      return v.value as T;
    }
    cacheLog.miss(this.name, key);
    return null;
  }

  async set<T = CacheValue>(key: string, value: T, opts?: CacheSetOptions): Promise<void> {
    if (this.disabled) return;
    
    try {
      const exp = opts?.ttlMs ? Date.now() + opts.ttlMs : undefined;
      await this.store.setItem(key, { value, contentType: opts?.contentType, exp });
      cacheLog.set(this.name, key, opts?.ttlMs);
    } catch (err: any) {
      if (err?.name === 'QuotaExceededError' || err?.code === 22) {
        console.warn(`[Cache][${this.name}] Quota exceeded → switch to no-cache`);
        // Import dynamique pour éviter les dépendances circulaires
        import('./log').then(({ cacheLog }) => {
          cacheLog.del(this.name, 'quota_exceeded');
        });
        this.disabled = true;
        return; // ne jette pas
      }
      throw err;
    }
  }

  async delete(key: string): Promise<void> {
    await this.store.removeItem(key);
    cacheLog.del(this.name, key);
  }

  async has(key: string): Promise<boolean> {
    if (this.disabled) return false;
    
    const v = await this.read(key);
    return !!v;
  }

  async clear(): Promise<void> {
    try {
      await this.store.clear();
    } catch (err) {
      console.warn(`[Cache][${this.name}] clear() failed`, err);
    }
  }

  isDisabled(): boolean {
    return this.disabled;
  }
}
