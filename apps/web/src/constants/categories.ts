import { type ThemeCategory } from '../types/shared'

export interface CategoryOption {
  id: ThemeCategory
  label: string
  icon: string
  description: string
  color: string
  gradient: string
}

/**
 * Catégories de thèmes disponibles avec leurs métadonnées
 */
export const CATEGORIES: CategoryOption[] = [
  {
    id: 'language',
    label: 'Langues',
    icon: '🌍',
    description: 'Apprendre une langue étrangère',
    color: 'from-blue-400 to-cyan-500',
    gradient: 'bg-gradient-to-br from-blue-100 to-cyan-100'
  },
  {
    id: 'other',
    label: 'Autres',
    icon: '📚',
    description: 'Médecine, histoire, culture générale...',
    color: 'from-green-400 to-emerald-500',
    gradient: 'bg-gradient-to-br from-green-100 to-emerald-100'
  }
]


/**
 * Récupère une catégorie par son ID
 */
export const getCategoryById = (id: ThemeCategory): CategoryOption | undefined => {
  return CATEGORIES.find(cat => cat.id === id)
}

/**
 * Récupère le label d'une catégorie
 */
export const getCategoryLabel = (id: ThemeCategory): string => {
  const category = getCategoryById(id)
  return category?.label || 'Inconnue'
}

/**
 * Récupère les couleurs d'une catégorie
 */
export const getCategoryColors = (id: ThemeCategory) => {
  const category = getCategoryById(id)
  if (!category) {
    return {
      color: 'from-gray-400 to-gray-600',
      gradient: 'bg-gradient-to-br from-gray-100 to-gray-200'
    }
  }
  return {
    color: category.color,
    gradient: category.gradient
  }
}
