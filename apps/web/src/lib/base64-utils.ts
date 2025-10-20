// ============================================
// BASE64 UTILITIES
// ============================================
// Utility functions for working with base64 encoded data

/**
 * Converts a base64 data URL to a Blob
 * More reliable than fetch() for large data URLs that may exceed header size limits
 *
 * @param dataUrl - Base64 data URL (e.g., "data:image/webp;base64,...")
 * @returns Blob object
 */
export function base64ToBlob(dataUrl: string): Blob {
  // Extract base64 data (everything after the comma)
  const parts = dataUrl.split(',')
  if (parts.length < 2) {
    throw new Error('Invalid data URL format')
  }
  const base64Data = parts[1]! // Safe because we checked length above

  // Extract MIME type from data URL
  const mimeMatch = dataUrl.match(/data:([^;]+);/)
  const mimeType = mimeMatch?.[1] || 'application/octet-stream'

  // Decode base64 string
  const byteCharacters = atob(base64Data)

  // Convert to byte array
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)

  // Create and return Blob
  return new Blob([byteArray], { type: mimeType })
}

/**
 * Converts a base64 data URL to an Object URL
 * Useful for creating temporary URLs for preview purposes
 *
 * @param dataUrl - Base64 data URL
 * @returns Object URL that can be used in img src, etc.
 */
export function base64ToObjectUrl(dataUrl: string): string {
  const blob = base64ToBlob(dataUrl)
  return URL.createObjectURL(blob)
}
