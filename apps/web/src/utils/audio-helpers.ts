// ============================================
// AUDIO HELPERS
// ============================================
// Utilities for converting and playing audio from base64

/**
 * Convert base64 audio to Blob
 * @param base64 - Base64 encoded audio data (without data URL prefix)
 * @param mimeType - MIME type (e.g., 'audio/wav', 'audio/mpeg')
 * @returns Blob
 */
export function base64ToBlob(base64: string, mimeType: string): Blob {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new Blob([bytes], { type: mimeType });
}

/**
 * Play base64 audio
 * @param base64 - Base64 encoded audio data
 * @param mimeType - MIME type (e.g., 'audio/wav', 'audio/mpeg')
 * @returns HTMLAudioElement
 */
export function playBase64Audio(base64: string, mimeType: string): HTMLAudioElement {
  const blob = base64ToBlob(base64, mimeType);
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);

  // Cleanup URL after audio ends
  audio.addEventListener('ended', () => {
    URL.revokeObjectURL(url);
  });

  // Cleanup URL on error
  audio.addEventListener('error', () => {
    URL.revokeObjectURL(url);
  });

  audio.play();
  return audio;
}

/**
 * Download base64 audio as file
 * @param base64 - Base64 encoded audio data
 * @param mimeType - MIME type (e.g., 'audio/wav', 'audio/mpeg')
 * @param filename - Filename for download
 */
export function downloadBase64Audio(
  base64: string,
  mimeType: string,
  filename: string
): void {
  const blob = base64ToBlob(base64, mimeType);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

/**
 * Create audio element from base64 with controls
 * @param base64 - Base64 encoded audio data
 * @param mimeType - MIME type (e.g., 'audio/wav', 'audio/mpeg')
 * @param options - Audio element options
 * @returns HTMLAudioElement
 */
export function createAudioElement(
  base64: string,
  mimeType: string,
  options: { controls?: boolean; autoplay?: boolean } = {}
): HTMLAudioElement {
  const blob = base64ToBlob(base64, mimeType);
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);

  if (options.controls) {
    audio.controls = true;
  }

  if (options.autoplay) {
    audio.autoplay = true;
  }

  // Cleanup URL when audio is no longer needed
  audio.addEventListener('ended', () => {
    if (!options.autoplay) {
      URL.revokeObjectURL(url);
    }
  });

  return audio;
}

/**
 * Convert Blob to base64 (useful for caching)
 * @param blob - Blob to convert
 * @returns Promise<string> - Base64 string (with data URL prefix)
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
