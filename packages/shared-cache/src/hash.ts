import { createSHA256 } from 'hash-wasm';

export async function sha256Hex(input: string): Promise<string> {
  const sha = await createSHA256();
  sha.init();
  sha.update(input);
  return sha.digest('hex');
}

export function normalizeText(input: string): string {
  return input ? input.normalize('NFC').trim().replace(/\s+/g, ' ') : '';
}

export function normalizeLang(lang?: string): string {
  return lang ? lang.toLowerCase().slice(0, 5) : 'und';
}
