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
    id: 'academic',
    label: 'Études',
    icon: '🎓',
    description: 'Médecine, histoire, sciences...',
    color: 'from-green-400 to-emerald-500',
    gradient: 'bg-gradient-to-br from-green-100 to-emerald-100'
  },
  {
    id: 'professional',
    label: 'Professionnel',
    icon: '💼',
    description: 'Compétences métier',
    color: 'from-purple-400 to-violet-500',
    gradient: 'bg-gradient-to-br from-purple-100 to-violet-100'
  },
  {
    id: 'personal',
    label: 'Personnel',
    icon: '🧠',
    description: 'Culture générale, développement',
    color: 'from-orange-400 to-red-500',
    gradient: 'bg-gradient-to-br from-orange-100 to-red-100'
  }
]

/**
 * Sujets spécialisés par catégorie académique
 */
export const ACADEMIC_SUBJECTS = [
  { id: 'medicine', label: 'Médecine', icon: '🩺' },
  { id: 'history', label: 'Histoire', icon: '📚' },
  { id: 'science', label: 'Sciences', icon: '🔬' },
  { id: 'law', label: 'Droit', icon: '⚖️' },
  { id: 'literature', label: 'Littérature', icon: '📖' },
  { id: 'philosophy', label: 'Philosophie', icon: '🤔' },
  { id: 'mathematics', label: 'Mathématiques', icon: '🔢' },
  { id: 'geography', label: 'Géographie', icon: '🌍' }
]

/**
 * Domaines professionnels
 */
export const PROFESSIONAL_DOMAINS = [
  { id: 'it', label: 'Informatique', icon: '💻' },
  { id: 'marketing', label: 'Marketing', icon: '📈' },
  { id: 'finance', label: 'Finance', icon: '💰' },
  { id: 'hr', label: 'Ressources Humaines', icon: '👥' },
  { id: 'sales', label: 'Ventes', icon: '🛒' },
  { id: 'design', label: 'Design', icon: '🎨' },
  { id: 'management', label: 'Management', icon: '📊' },
  { id: 'communication', label: 'Communication', icon: '📢' }
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
