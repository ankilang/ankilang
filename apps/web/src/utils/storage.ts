import { z } from 'zod'

// Clés de stockage typées
export const ACCOUNT_STORAGE_KEY = 'ankilang.account'
export const PREFERENCES_STORAGE_KEY = 'ankilang.preferences'

/**
 * Parse sécurisé avec Zod
 */
export function safeParse<T>(schema: z.ZodSchema<T>, value: unknown): T | null {
  const result = schema.safeParse(value)
  return result.success ? result.data : null
}

/**
 * Récupérer une valeur JSON depuis localStorage avec validation optionnelle
 */
export function getJSON<T>(key: string, schema?: z.ZodSchema<T>): T | null {
  try {
    const item = localStorage.getItem(key)
    if (!item) return null
    
    const parsed = JSON.parse(item)
    return schema ? safeParse(schema, parsed) : parsed
  } catch {
    return null
  }
}

/**
 * Alias pour getJSON avec validation
 */
export function readJSON<T>(key: string, schema?: z.ZodSchema<T>): T | null {
  return getJSON(key, schema)
}

/**
 * Sauvegarder une valeur JSON dans localStorage
 */
export function setJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Erreur lors de la sauvegarde dans localStorage:', error)
  }
}

/**
 * Alias pour setJSON
 */
export function writeJSON<T>(key: string, value: T): void {
  setJSON(key, value)
}

/**
 * Supprimer une clé du localStorage
 */
export function remove(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Erreur lors de la suppression du localStorage:', error)
  }
}
