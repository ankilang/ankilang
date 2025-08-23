import { useState, useMemo, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, Clock } from 'lucide-react'
import { getLessons } from '../../../data/mockLessons'
import { LANGUAGES } from '../../../constants/languages'
import LessonCard from '../../../components/lessons/LessonCard'
import Skeleton from '../../../components/ui/Skeleton'
import PageMeta from '../../../components/seo/PageMeta'

export default function LessonsIndex() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Initialiser l'état depuis l'URL au mount
  useEffect(() => {
    const lang = searchParams.get('lang') || ''
    const lvl = searchParams.get('lvl') || ''
    
    setSelectedLanguage(lang)
    setSelectedLevel(lvl)
  }, [searchParams])

  // Mettre à jour l'URL pour les filtres
  const updateURL = useCallback((key: string, value: string) => {
    const newSearchParams = new URLSearchParams(searchParams)
    if (value) {
      newSearchParams.set(key, value)
    } else {
      newSearchParams.delete(key)
    }
    setSearchParams(newSearchParams, { replace: true })
  }, [searchParams, setSearchParams])

  // Simuler le chargement
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const filteredLessons = useMemo(() => {
    let lessons = getLessons()

    // Filtre par langue
    if (selectedLanguage) {
      lessons = lessons.filter(lesson => lesson.targetLang === selectedLanguage)
    }

    // Filtre par niveau
    if (selectedLevel) {
      lessons = lessons.filter(lesson => lesson.level === selectedLevel)
    }

    // Tri par date de mise à jour (récent en premier)
    lessons.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )

    return lessons
  }, [selectedLanguage, selectedLevel])

  const isOffline = !navigator.onLine

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageMeta 
          title="Leçons — Ankilang" 
          description="Découvrez nos leçons interactives pour apprendre les langues. Filtrez par niveau et langue pour trouver votre prochaine leçon."
        />
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Leçons</h1>
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          aria-busy="true"
        >
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} variant="card" ariaLabel="Chargement de la leçon..." />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageMeta 
        title="Leçons — Ankilang" 
        description="Découvrez nos leçons interactives pour apprendre les langues. Filtrez par niveau et langue pour trouver votre prochaine leçon."
      />
      
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Leçons</h1>

      {isOffline && (
        <div 
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"
          role="status"
          aria-live="polite"
        >
          <p className="text-yellow-800 text-sm">
            Mode hors-ligne activé. Certaines fonctionnalités peuvent être limitées.
          </p>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Filtre langue */}
          <div>
            <label htmlFor="language-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Langue
            </label>
            <select
              id="language-filter"
              value={selectedLanguage}
              onChange={(e) => {
                setSelectedLanguage(e.target.value)
                updateURL('lang', e.target.value)
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Toutes les langues</option>
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre niveau */}
          <div>
            <label htmlFor="level-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Niveau
            </label>
            <select
              id="level-filter"
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(e.target.value)
                updateURL('lvl', e.target.value)
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les niveaux</option>
              <option value="beginner">Débutant</option>
              <option value="intermediate">Intermédiaire</option>
              <option value="advanced">Avancé</option>
            </select>
          </div>

          {/* Tri */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tri
            </label>
            <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Récents</span>
            </div>
          </div>
        </div>
      </div>

      {/* Résultats */}
      {filteredLessons.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Filter className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune leçon trouvée
          </h3>
          <p className="text-gray-600">
            Essayez de modifier vos critères de filtres.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredLessons.map(lesson => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      )}

      {/* Statistiques */}
      <div className="mt-12 text-center text-sm text-gray-600">
        <p>
          {filteredLessons.length} leçon{filteredLessons.length !== 1 ? 's' : ''} trouvée{filteredLessons.length !== 1 ? 's' : ''}
          {selectedLanguage || selectedLevel ? ' avec les filtres appliqués' : ''}
        </p>
      </div>
    </div>
  )
}
