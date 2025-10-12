import { normalizeLang, normalizeText, sha256Hex } from './hash';
import type { CacheKeyParams } from './types';

export async function buildCacheKey(params: CacheKeyParams): Promise<string> {
  const parts: string[] = [params.namespace];

  if (params.lang) parts.push(normalizeLang(params.lang));
  if (params.voice) parts.push(params.voice);
  if (params.speed !== undefined) parts.push(String(params.speed));
  if (params.variant) parts.push(params.variant);
  if (params.externalId) parts.push(params.externalId);

  let textHash = '';
  if (params.text) {
    textHash = (await sha256Hex(normalizeText(params.text))).slice(0, 32);
  }

  const extra = params.extra
    ? Object.entries(params.extra)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join('|')
    : '';

  return [
    parts.join(':'),
    textHash || undefined,
    extra ? `(${extra})` : undefined
  ].filter(Boolean).join(':');
}
