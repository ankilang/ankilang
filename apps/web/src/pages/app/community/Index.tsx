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

  // Initialiser l'état depuis l'URL au mount
  useEffect(() => {
    const q = searchParams.get('q') || ''
    const lang = searchParams.get('lang') || ''
    const lvl = searchParams.get('lvl') || ''
    const sort = (searchParams.get('sort') as SortOption) || 'recent'
    
    setSearchTerm(q)
    setSelectedLanguage(lang)
    setSelectedLevel(lvl)
    setSortBy(sort)
  }, [searchParams])

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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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

      {isOffline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 text-sm">
            Mode hors-ligne activé. Certaines fonctionnalités peuvent être limitées.
          </p>
        </div>
      )}

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher..."
              defaultValue={searchParams.get('q') || ''}
              onChange={(e) => debouncedSetSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Rechercher dans les decks"
            />
          </div>

          {/* Filtre langue */}
          <select
            value={selectedLanguage}
            onChange={(e) => {
              setSelectedLanguage(e.target.value)
              updateURL('lang', e.target.value)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Filtrer par langue"
          >
            <option value="">Toutes les langues</option>
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>

          {/* Filtre niveau */}
          <select
            value={selectedLevel}
            onChange={(e) => {
              setSelectedLevel(e.target.value)
              updateURL('lvl', e.target.value)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Filtrer par niveau"
          >
            <option value="">Tous les niveaux</option>
            <option value="beginner">Débutant</option>
            <option value="intermediate">Intermédiaire</option>
            <option value="advanced">Avancé</option>
          </select>

          {/* Tri */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSortBy('recent')
                updateURL('sort', 'recent')
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                sortBy === 'recent'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
              aria-label="Trier par date de mise à jour"
            >
              <Clock className="w-4 h-4" />
              <span className="text-sm">Récents</span>
            </button>
            <button
              onClick={() => {
                setSortBy('popular')
                updateURL('sort', 'popular')
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                sortBy === 'popular'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
              aria-label="Trier par popularité"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Populaires</span>
            </button>
          </div>
        </div>
      </div>

      {/* Résultats */}
      {filteredAndSortedDecks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun deck trouvé
          </h3>
          <p className="text-gray-600">
            Essayez de modifier vos critères de recherche ou de filtres.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedDecks.map(deck => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
        </div>
      )}

      {/* Statistiques */}
      <div className="mt-12 text-center text-sm text-gray-600">
        <p>
          {filteredAndSortedDecks.length} deck{filteredAndSortedDecks.length !== 1 ? 's' : ''} trouvé{filteredAndSortedDecks.length !== 1 ? 's' : ''}
          {searchTerm || selectedLanguage || selectedLevel ? ' avec les filtres appliqués' : ''}
        </p>
      </div>
    </div>
  )
}
