/**
 * Helpers to detect cache-backed media stored in Appwrite Storage.
 * Cache fileIds are produced by AppwriteStorageCache with sanitized prefixes:
 *  - Images (Pexels):    cache.pexels__cache_<sha40>.<ext>
 *  - TTS Votz:          cache.tts.votz__cache_<sha40>.mp3
 *  - TTS ElevenLabs:    cache.tts.elevenlabs__cache_<sha40>.mp3
 * Legacy (older) fileIds may contain slashes (e.g., cache/pexels/...). We support both.
 */

const APPWRITE_FILES_PATH = '/v1/storage/buckets/';

export function extractFileIdFromAppwriteUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/');
    const idx = parts.indexOf('files');
    if (idx >= 0 && idx + 1 < parts.length) return parts[idx + 1] || null;
    return null;
  } catch {
    return null;
  }
}

export function isCacheFileId(fileId: string): boolean {
  if (!fileId) return false;
  // Sanitized prefixes (no slash)
  if (fileId.startsWith('cache.pexels__')) return true;
  if (fileId.startsWith('cache.tts.votz__')) return true;
  if (fileId.startsWith('cache.tts.elevenlabs__')) return true;
  // Legacy slash-based prefixes
  if (fileId.startsWith('cache/pexels/')) return true;
  if (fileId.startsWith('cache/tts/votz/')) return true;
  if (fileId.startsWith('cache/tts/elevenlabs/')) return true;
  return false;
}

export function isCacheUrl(url: string): boolean {
  const id = extractFileIdFromAppwriteUrl(url);
  return id ? isCacheFileId(id) : false;
}

export function isAppwriteUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.pathname.startsWith(APPWRITE_FILES_PATH);
  } catch {
    return false;
  }
}

