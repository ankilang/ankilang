import { useState, useMemo, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, TrendingUp, Clock } from 'lucide-react'
import { getCommunityDecks } from '../../../data/mockCommunity'
import { LANGUAGES } from '../../../constants/languages'
import DeckCard from '../../../components/community/DeckCard'
import Skeleton from '../../../components/ui/Skeleton'
import PageMeta from '../../../components/seo/PageMeta'

type SortOption = 'recent' | 'popular'

export default function CommunityIndex() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [isLoading, setIsLoading] = useState(true)
  const [hasInitializedFromURL, setHasInitializedFromURL] = useState(false)

  // Initialiser l'état depuis l'URL au mount (une seule fois)
  useEffect(() => {
    if (!hasInitializedFromURL) {
      const q = searchParams.get('q') || ''
      const lang = searchParams.get('lang') || ''
      const lvl = searchParams.get('lvl') || ''
      const sort = (searchParams.get('sort') as SortOption) || 'recent'
      
      setSearchTerm(q)
      setSelectedLanguage(lang)
      setSelectedLevel(lvl)
      setSortBy(sort)
      setHasInitializedFromURL(true)
    }
  }, [searchParams, hasInitializedFromURL])

  // Debounce pour la recherche
  const debouncedSetSearchTerm = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (value: string) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          setSearchTerm(value)
          const newSearchParams = new URLSearchParams(searchParams)
          if (value) {
            newSearchParams.set('q', value)
          } else {
            newSearchParams.delete('q')
          }
          setSearchParams(newSearchParams, { replace: true })
        }, 200)
      }
    })(),
    [searchParams, setSearchParams]
  )

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

  const filteredAndSortedDecks = useMemo(() => {
    let decks = getCommunityDecks()

    // Filtre par recherche
    if (searchTerm) {
      decks = decks.filter(deck => 
        deck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deck.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filtre par langue
    if (selectedLanguage) {
      decks = decks.filter(deck => deck.targetLang === selectedLanguage)
    }

    // Filtre par niveau
    if (selectedLevel) {
      decks = decks.filter(deck => deck.level === selectedLevel)
    }

    // Tri
    decks.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      } else {
        return b.downloads - a.downloads
      }
    })

    return decks
  }, [searchTerm, selectedLanguage, selectedLevel, sortBy])

  const isOffline = !navigator.onLine

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageMeta 
          title="Communauté — Ankilang" 
          description="Explorez des milliers de decks de cartes partagés par la communauté. Recherchez par langue, niveau et popularité."
        />
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Communauté</h1>
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          aria-busy="true"
        >
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} variant="card" ariaLabel="Chargement du deck..." />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageMeta 
        title="Communauté — Ankilang" 
        description="Explorez des milliers de decks de cartes partagés par la communauté. Recherchez par langue, niveau et popularité."
      />
      
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Communauté</h1>

      {/* Bandeau hors ligne */}
      {isOffline && (
        <div 
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"
          role="status"
          aria-live="polite"
        >
          <p className="text-yellow-800">
            Mode hors ligne - Certaines fonctionnalités peuvent être limitées
          </p>
        </div>
      )}

      {/* Filtres et recherche */}
      <div className="mb-8 space-y-4 sm:space-y-6">
        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher des decks..."
            defaultValue={searchTerm}
            onChange={(e) => debouncedSetSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Rechercher des decks"
          />
        </div>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          {/* Langue */}
          <select
            value={selectedLanguage}
            onChange={(e) => {
              setSelectedLanguage(e.target.value)
              updateURL('lang', e.target.value)
            }}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Filtrer par langue"
          >
            <option value="">Toutes les langues</option>
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>

          {/* Niveau */}
          <select
            value={selectedLevel}
            onChange={(e) => {
              setSelectedLevel(e.target.value)
              updateURL('lvl', e.target.value)
            }}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Filtrer par niveau"
          >
            <option value="">Tous les niveaux</option>
            <option value="beginner">Débutant</option>
            <option value="intermediate">Intermédiaire</option>
            <option value="advanced">Avancé</option>
          </select>

          {/* Tri */}
          <div className="flex gap-4 sm:gap-6">
            <button
              onClick={() => {
                setSortBy('recent')
                updateURL('sort', 'recent')
              }}
              className={`px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                sortBy === 'recent'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              aria-pressed={sortBy === 'recent'}
              aria-label="Trier par date récente"
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Récent
            </button>
            <button
              onClick={() => {
                setSortBy('popular')
                updateURL('sort', 'popular')
              }}
              className={`px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                sortBy === 'popular'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              aria-pressed={sortBy === 'popular'}
              aria-label="Trier par popularité"
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Populaire
            </button>
          </div>
        </div>
      </div>

      {/* Résultats */}
      <div className="space-y-6">
        {/* Statistiques */}
        <div className="text-sm text-gray-600">
          {filteredAndSortedDecks.length} deck{filteredAndSortedDecks.length !== 1 ? 's' : ''} trouvé{filteredAndSortedDecks.length !== 1 ? 's' : ''}
        </div>

        {/* Grille des decks */}
        {filteredAndSortedDecks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredAndSortedDecks.map((deck) => (
              <DeckCard key={deck.id} deck={deck} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Search className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun deck trouvé
              </h3>
              <p className="text-gray-600">
                Essayez de modifier vos critères de recherche ou de filtres
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
