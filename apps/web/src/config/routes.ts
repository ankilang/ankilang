/**
 * Configuration centralisée des routes de l'application
 * Définition de toutes les routes utilisées dans Ankilang avec leurs chemins et descriptions
 */

export const ROUTES = {
  // Routes publiques (accessibles sans authentification)
  HOME: '/',
  LANDING: '/',
  SUBSCRIPTION: '/abonnement',
  OFFLINE: '/offline',

  // Routes d'authentification
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  VERIFY_EMAIL: '/auth/verify-email',

  // Routes légales
  TERMS: '/legal/terms',
  PRIVACY: '/legal/privacy',

  // Routes de l'application (protégées - nécessitent une authentification)
  DASHBOARD: '/app',

  // Gestion des thèmes
  THEMES: '/app/themes',
  THEMES_NEW: '/app/themes/new',
  THEME_DETAIL: '/app/themes/:id',
  THEME_EXPORT: '/app/themes/:id/export',

  // Ressources et bibliothèque
  TIPS: '/app/tips',
  WORKSHOP: '/app/workshop',     // Pro uniquement
  LIBRARY: '/app/library',       // Pro uniquement

  // Gestion du compte
  ACCOUNT: '/app/account',

  // Routes de développement (uniquement en mode dev)
  AUDIO_TEST: '/app/test/audio',

  // Route catch-all pour les pages non trouvées
  NOT_FOUND: '*'
} as const

/**
 * Type TypeScript pour les clés des routes
 * Permet l'auto-complétion et la validation des chemins de routes
 */
export type RouteKeys = keyof typeof ROUTES

/**
 * Utilitaire pour générer une URL avec des paramètres
 * @param route - La clé de la route dans ROUTES
 * @param params - Les paramètres à remplacer dans la route (ex: { id: '123' })
 * @returns L'URL complète avec les paramètres substitués
 *
 * @example
 * ```typescript
 * const themeUrl = generateRouteUrl('THEME_DETAIL', { id: '123' })
 * // Résultat: '/app/themes/123'
 * ```
 */
export function generateRouteUrl<K extends RouteKeys>(
  route: K,
  params?: Record<string, string | number>
): string {
  let url = ROUTES[route] as string

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value))
    })
  }

  return url
}

/**
 * Utilitaire pour vérifier si une route nécessite une authentification
 * @param route - La clé de la route à vérifier
 * @returns true si la route nécessite une authentification
 */
export function requiresAuth(route: RouteKeys): boolean {
  const path = ROUTES[route] as string
  return path.startsWith('/app') && route !== 'AUDIO_TEST'
}

/**
 * Utilitaire pour vérifier si une route est réservée aux utilisateurs Pro
 * @param route - La clé de la route à vérifier
 * @returns true si la route nécessite un abonnement Pro
 */
export function requiresPro(route: RouteKeys): boolean {
  return route === 'WORKSHOP' || route === 'LIBRARY'
}

/**
 * Utilitaire pour vérifier si une route est en mode développement uniquement
 * @param route - La clé de la route à vérifier
 * @returns true si la route n'est disponible qu'en développement
 */
export function isDevOnly(route: RouteKeys): boolean {
  return route === 'AUDIO_TEST'
}
