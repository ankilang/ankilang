import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import { CATEGORIES } from '../../constants/categories'
import { type ThemeCategory } from '../../types/shared'

interface CategorySelectorProps {
  value: ThemeCategory
  onChange: (category: ThemeCategory) => void
  onFocus?: () => void
  error?: string
  className?: string
  preselectedCategory?: ThemeCategory // Pour la présélection contextuelle
}

export default function CategorySelector({
  value,
  onChange,
  onFocus,
  error,
  className = '',
  preselectedCategory
}: CategorySelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<ThemeCategory>(
    preselectedCategory || value || 'language'
  )

  // Synchroniser l'état local avec la valeur du formulaire
  useEffect(() => {
    if (value && value !== selectedCategory) {
      setSelectedCategory(value)
    }
  }, [value, selectedCategory])

  const handleCategorySelect = (category: ThemeCategory) => {
    setSelectedCategory(category)
    onChange(category)
    onFocus?.()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Grille des catégories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CATEGORIES.map((category) => (
          <motion.button
            key={category.id}
            type="button"
            onClick={() => { handleCategorySelect(category.id); }}
            onFocus={onFocus}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
              selectedCategory === category.id
                ? 'border-purple-500 bg-purple-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">{category.icon}</div>
              <div className="flex-1">
                <div className="font-sans font-semibold text-dark-charcoal text-sm">
                  {category.label}
                </div>
                <div className="font-sans text-xs text-dark-charcoal/60 mt-1">
                  {category.description}
                </div>
              </div>
              {selectedCategory === category.id && (
                <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
              )}
            </div>
            
            {/* Indicateur de sélection */}
            {selectedCategory === category.id && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-violet-500/10 pointer-events-none" />
            )}
          </motion.button>
        ))}
      </div>

      {/* Message de confirmation */}
      {selectedCategory && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 py-3 px-4 bg-green-50 border border-green-200 rounded-xl"
        >
          <div className="text-lg">
            {CATEGORIES.find(c => c.id === selectedCategory)?.icon}
          </div>
          <span className="font-sans text-sm text-green-800">
            <strong>{CATEGORIES.find(c => c.id === selectedCategory)?.label}</strong> sélectionné
          </span>
          <CheckCircle className="w-4 h-4 text-green-600" />
        </motion.div>
      )}

      {error && (
        <p className="text-red-600 text-sm font-sans mt-2">{error}</p>
      )}
    </div>
  )
}
