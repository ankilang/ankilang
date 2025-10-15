import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, BookOpen } from 'lucide-react'
import { ACADEMIC_SUBJECTS, PROFESSIONAL_DOMAINS } from '../../constants/categories'
import { type ThemeCategory } from '../../types/shared'

interface SubjectOption {
  id: string
  label: string
  icon: string
}

interface SubjectSelectorProps {
  category: ThemeCategory
  value?: string
  onChange: (subject: string) => void
  onFocus?: () => void
  error?: string
  className?: string
}

export default function SubjectSelector({
  category,
  value,
  onChange,
  onFocus,
  error,
  className = ''
}: SubjectSelectorProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>(value || '')

  // Déterminer les sujets selon la catégorie
  const getSubjectsForCategory = (): SubjectOption[] => {
    switch (category) {
      case 'academic':
        return ACADEMIC_SUBJECTS
      case 'professional':
        return PROFESSIONAL_DOMAINS
      default:
        return []
    }
  }

  const subjects = getSubjectsForCategory()

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId)
    onChange(subjectId)
    onFocus?.()
  }

  // Ne pas afficher le sélecteur pour les catégories qui n'en ont pas besoin
  if (category === 'language' || category === 'personal' || subjects.length === 0) {
    return null
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-4 h-4 text-purple-600" />
        <span className="font-sans text-sm font-medium text-dark-charcoal">
          {category === 'academic' ? 'Choisissez votre matière' : 'Choisissez votre domaine'}
        </span>
      </div>

      {/* Grille des sujets */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        {subjects.map((subject) => (
          <motion.button
            key={subject.id}
            type="button"
            onClick={() => handleSubjectSelect(subject.id)}
            onFocus={onFocus}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 ${
              selectedSubject === subject.id
                ? 'border-purple-500 bg-purple-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50'
            }`}
          >
            <div className="text-center">
              <div className="text-lg sm:text-2xl mb-1 sm:mb-2">
                {subject.icon}
              </div>
              <div className="font-sans font-medium text-xs sm:text-sm text-dark-charcoal leading-tight">
                {subject.label}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Message de confirmation */}
      {selectedSubject && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 py-3 px-4 bg-green-50 border border-green-200 rounded-xl"
        >
          <div className="text-lg">
            {subjects.find(s => s.id === selectedSubject)?.icon}
          </div>
          <span className="font-sans text-sm text-green-800">
            <strong>{subjects.find(s => s.id === selectedSubject)?.label}</strong> sélectionné
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
