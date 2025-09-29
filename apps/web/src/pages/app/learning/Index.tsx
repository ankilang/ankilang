import { useState, useMemo, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, TrendingUp, Clock, Sparkles, X } from 'lucide-react'
import { getLearningDecks } from '../../../data/learningDecks'
import { LANGUAGES } from '../../../constants/languages'
import DeckCard from '../../../components/learning/DeckCard'
import Skeleton from '../../../components/ui/Skeleton'
import PageMeta from '../../../components/seo/PageMeta'
import LearningOrbit from '../../../components/illustrations/LearningOrbit'

type SortOption = 'recent' | 'popular'

export default function LearningIndex() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [isLoading, setIsLoading] = useState(true)
  const [hasInitializedFromURL, setHasInitializedFromURL] = useState(false)
  const [isPremium, setIsPremium] = useState(false) // Simulation de l'état premium
  const [isCtaVisible, setIsCtaVisible] = useState(false)

  // Gérer la visibilité du bandeau CTA
  useEffect(() => {
    const ctaDismissed = localStorage.getItem('ankilang_premiumCtaDismissed')
    if (ctaDismissed !== 'true') {
      setIsCtaVisible(true)
    }
  }, [])

  const handleDismissCta = () => {
    setIsCtaVisible(false)
    localStorage.setItem('ankilang_premiumCtaDismissed', 'true')
  }

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
    let decks = getLearningDecks()

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
      <>
        <PageMeta 
          title="Apprentissage — Ankilang" 
          description="Accélérez votre maîtrise avec notre catalogue de decks premium, conçus pour un apprentissage efficace."
        />
        {/* Hero pastel */}
        <section className="bg-pastel-mint relative overflow-hidden min-h-[40vh] flex items-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-pastel-purple/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-pastel-rose/30 rounded-full blur-2xl" />
          <div className="relative w-full px-6 lg:px-12 py-12">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="font-playfair text-4xl sm:text-5xl font-bold text-dark-charcoal mb-4">
                  Apprentissage
                </h1>
                <p className="font-inter text-lg text-dark-charcoal/70 max-w-2xl">
                  Accélérez votre maîtrise avec notre catalogue de decks premium.
                </p>
              </div>
              <div className="hidden lg:block">
                <LearningOrbit className="mx-auto" />
              </div>
            </div>
          </div>
        </section>
        <div className="w-full px-6 lg:px-12 py-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" aria-busy="true">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} variant="card" ariaLabel="Chargement du deck..." />
            ))}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PageMeta 
        title="Apprentissage — Ankilang" 
        description="Accélérez votre maîtrise avec notre catalogue de decks premium, conçus pour un apprentissage efficace."
      />

      {/* Hero pastel avec illustration */}
      <section className="bg-pastel-mint relative overflow-hidden min-h-[50vh] flex items-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pastel-purple/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-pastel-rose/30 rounded-full blur-2xl" />
        <div className="relative w-full px-6 lg:px-12 py-12">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl font-bold text-dark-charcoal mb-4">
                Apprentissage
              </h1>
              <p className="font-inter text-lg sm:text-xl text-dark-charcoal/70 mb-6 max-w-2xl">
                Explorez des decks inspirants, filtrez par langue et niveau, et trouvez votre prochain apprentissage.
              </p>
              {/* Barre de recherche, intégrée au hero */}
              <div className="relative max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher des decks..."
                  defaultValue={searchTerm}
                  onChange={(e) => debouncedSetSearchTerm(e.target.value)}
                  className="input-field pl-10 py-3 bg-white/80 backdrop-blur border-2 border-pastel-purple focus:border-purple-400"
                  aria-label="Rechercher des decks"
                />
              </div>
            </div>
            <div className="hidden lg:block">
              <LearningOrbit className="mx-auto" />
            </div>
          </div>
        </div>
      </section>

      <div className="w-full px-6 lg:px-12 py-10 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Bandeau d'incitation Premium */}
          {!isPremium && isCtaVisible && (
            <div 
              className="bg-pastel-purple/20 border-2 border-pastel-purple rounded-2xl p-4 mb-8 flex items-center justify-between gap-4"
              role="alert"
            >
              <div className="flex items-center gap-4">
                <Sparkles className="w-8 h-8 text-purple-600 hidden sm:block" />
                <div>
                  <h3 className="font-bold text-dark-charcoal">Passez à Ankilang Premium</h3>
                  <p className="text-dark-charcoal/80 text-sm">Débloquez tous les decks, l'accès hors ligne et des fonctionnalités avancées.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-secondary whitespace-nowrap">Découvrir</button>
                <button 
                  onClick={handleDismissCta} 
                  className="p-2 rounded-full hover:bg-pastel-purple/40 transition-colors"
                  aria-label="Fermer le bandeau"
                >
                  <X className="w-5 h-5 text-dark-charcoal/70" />
                </button>
              </div>
            </div>
          )}

          {/* Bandeau hors ligne */}
          {isOffline && (
            <div 
              className="bg-yellow-50 border-2 border-pastel-yellow rounded-xl p-4 mb-6"
              role="status"
              aria-live="polite"
            >
              <p className="text-dark-charcoal">
                Mode hors ligne — certaines fonctionnalités peuvent être limitées
              </p>
            </div>
          )}

          {/* Filtres */}
          <div className="mb-8 space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              {/* Langue */}
              <select
                value={selectedLanguage}
                onChange={(e) => {
                  setSelectedLanguage(e.target.value)
                  updateURL('lang', e.target.value)
                }}
                className="px-4 py-3 bg-white border-2 border-pastel-purple rounded-xl focus:outline-none focus:border-purple-400"
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
                className="px-4 py-3 bg-white border-2 border-pastel-purple rounded-xl focus:outline-none focus:border-purple-400"
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
                  className={`px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none ${
                    sortBy === 'recent'
                      ? 'bg-pastel-purple text-dark-charcoal border-pastel-purple'
                      : 'bg-white text-dark-charcoal border-pastel-purple hover:bg-pastel-purple/10'
                  }`}
                  aria-pressed={sortBy === 'recent'}
                  aria-label="Trier par date récente"
                >
                  <Clock className="w-4 h-4 inline mr-2 text-purple-600" />
                  Récent
                </button>
                <button
                  onClick={() => {
                    setSortBy('popular')
                    updateURL('sort', 'popular')
                  }}
                  className={`px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none ${
                    sortBy === 'popular'
                      ? 'bg-pastel-purple text-dark-charcoal border-pastel-purple'
                      : 'bg-white text-dark-charcoal border-pastel-purple hover:bg-pastel-purple/10'
                  }`}
                  aria-pressed={sortBy === 'popular'}
                  aria-label="Trier par popularité"
                >
                  <TrendingUp className="w-4 h-4 inline mr-2 text-purple-600" />
                  Populaire
                </button>
              </div>
            </div>
          </div>

          {/* Résultats */}
          <div className="space-y-6">
            {/* Statistiques */}
            <div className="text-sm font-inter text-dark-charcoal/70">
              {filteredAndSortedDecks.length} deck{filteredAndSortedDecks.length !== 1 ? 's' : ''} trouvé{filteredAndSortedDecks.length !== 1 ? 's' : ''}
            </div>

            {/* Grille des decks */}
            {filteredAndSortedDecks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredAndSortedDecks.map((deck) => (
                  <DeckCard 
                    key={deck.id} 
                    deck={deck} 
                    isLocked={!deck.isFree && !isPremium} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-dark-charcoal/60 mb-4">
                  <Search className="w-12 h-12 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-dark-charcoal mb-2">
                    Aucun deck trouvé
                  </h3>
                  <p className="text-dark-charcoal/70">
                    Essayez de modifier vos critères de recherche ou de filtres
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
