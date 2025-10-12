export type CacheValue = Blob | ArrayBuffer | string | object | Uint8Array;

export interface CacheSetOptions {
  ttlMs?: number;
  contentType?: string;
  publicRead?: boolean;
}

export interface CacheAdapter {
  name: string;
  get<T = CacheValue>(key: string): Promise<T | null>;
  set<T = CacheValue>(key: string, value: T, opts?: CacheSetOptions): Promise<void>;
  delete(key: string): Promise<void>;
  has(key: string): Promise<boolean>;
  isDisabled?(): boolean; // Optionnel pour la compatibilité
}

export interface CacheKeyParams {
  namespace: 'tts' | 'pexels' | 'translation' | string;
  lang?: string;
  voice?: string;
  speed?: string | number;
  variant?: string;
  text?: string;
  externalId?: string;
  extra?: Record<string, string | number | boolean | null | undefined>;
}
