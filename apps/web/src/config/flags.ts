/**
 * Feature Flags pour le système de cache Ankilang
 * Permet un contrôle granulaire et un déploiement progressif
 */

export const FLAGS = {
  CACHE_ENABLE: import.meta.env.VITE_CACHE_ENABLE === 'true',
  CACHE_SERVER_SYNC: import.meta.env.VITE_CACHE_SERVER_SYNC === 'true',
  CACHE_METRICS: import.meta.env.VITE_CACHE_METRICS === 'true',
  SW_CACHE_VERSION: String(import.meta.env.VITE_SW_CACHE_VERSION ?? 'v4'),
  TTS_TTL_DAYS: Number(import.meta.env.VITE_CACHE_TTS_TTL_DAYS ?? 7),
  PEXELS_TTL_DAYS: Number(import.meta.env.VITE_CACHE_PEXELS_TTL_DAYS ?? 180),
} as const

/**
 * Vérification de la configuration des flags
 */
export function validateFlags(): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (FLAGS.TTS_TTL_DAYS < 1 || FLAGS.TTS_TTL_DAYS > 365) {
    errors.push('TTS_TTL_DAYS doit être entre 1 et 365 jours')
  }

  if (FLAGS.PEXELS_TTL_DAYS < 1 || FLAGS.PEXELS_TTL_DAYS > 365) {
    errors.push('PEXELS_TTL_DAYS doit être entre 1 et 365 jours')
  }

  if (!FLAGS.SW_CACHE_VERSION || FLAGS.SW_CACHE_VERSION.length < 2) {
    errors.push('SW_CACHE_VERSION doit être défini et avoir au moins 2 caractères')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Log de la configuration actuelle (dev seulement)
 */
export function logFlags(): void {
  if (import.meta.env.DEV) {
    console.info('[Cache][Flags] Configuration:', {
      CACHE_ENABLE: FLAGS.CACHE_ENABLE,
      CACHE_SERVER_SYNC: FLAGS.CACHE_SERVER_SYNC,
      CACHE_METRICS: FLAGS.CACHE_METRICS,
      SW_CACHE_VERSION: FLAGS.SW_CACHE_VERSION,
      TTS_TTL_DAYS: FLAGS.TTS_TTL_DAYS,
      PEXELS_TTL_DAYS: FLAGS.PEXELS_TTL_DAYS,
    })
  }
}
