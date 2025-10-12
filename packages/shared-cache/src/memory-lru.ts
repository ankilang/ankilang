import { LRUCache } from 'lru-cache';
import type { CacheAdapter, CacheSetOptions, CacheValue } from './types';
import { cacheLog } from './log';

export class MemoryLRUCache implements CacheAdapter {
  readonly name = 'memory-lru';
  private cache: LRUCache<string, CacheValue>;

  constructor(max = 500, ttlMs = 1000 * 60 * 60) {
    this.cache = new LRUCache({ max, ttl: ttlMs });
  }

  async get<T = CacheValue>(key: string): Promise<T | null> {
    const v = this.cache.get(key);
    if (v) {
      cacheLog.hit(this.name, key);
      return v as T;
    }
    cacheLog.miss(this.name, key);
    return null;
  }

  async set<T = CacheValue>(key: string, value: T, opts?: CacheSetOptions): Promise<void> {
    this.cache.set(key, value as CacheValue, { ttl: opts?.ttlMs });
    cacheLog.set(this.name, key, opts?.ttlMs);
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
    cacheLog.del(this.name, key);
  }

  async has(key: string): Promise<boolean> {
    return this.cache.has(key);
  }
}
