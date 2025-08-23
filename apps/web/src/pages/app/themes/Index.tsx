import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter } from 'lucide-react'
import ThemeCard from '../../../components/themes/ThemeCard'
import { mockThemes } from '../../../data/mockData'
import { LANGUAGES, getLanguageLabel } from '../../../constants/languages'
import PageMeta from '../../../components/seo/PageMeta'

export default function ThemesIndex() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('')

  // Filtrer les thèmes
  const filteredThemes = mockThemes.filter(theme => {
    const matchesSearch = theme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         theme.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesLanguage = !selectedLanguage || theme.targetLang === selectedLanguage
    return matchesSearch && matchesLanguage
  })

  return (
    <>
      <PageMeta 
        title="Mes thèmes — Ankilang" 
        description="Gérez vos thèmes de flashcards et créez de nouveaux contenus." 
      />
      
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Mes thèmes</h1>
              <Link 
                to="/app/themes/new" 
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus size={16} />
                Nouveau thème
              </Link>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Filtres et recherche */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    id="search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher par nom ou tags..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrer par langue
                </label>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    id="language"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Toutes les langues</option>
                    {LANGUAGES.map((language) => (
                      <option key={language.code} value={language.code}>
                        {language.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Statistiques des filtres */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  {filteredThemes.length} thème{filteredThemes.length > 1 ? 's' : ''} trouvé{filteredThemes.length > 1 ? 's' : ''}
                  {selectedLanguage && ` en ${getLanguageLabel(selectedLanguage)}`}
                </span>
                {(searchTerm || selectedLanguage) && (
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedLanguage('')
                    }}
                    className="px-3 py-2 text-blue-600 hover:text-blue-800 transition-colors rounded-md focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                  >
                    Effacer les filtres
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Liste des thèmes */}
          {filteredThemes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || selectedLanguage ? 'Aucun thème trouvé' : 'Aucun thème créé'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedLanguage 
                  ? 'Essayez de modifier vos critères de recherche.'
                  : 'Commencez par créer votre premier thème pour organiser vos flashcards.'
                }
              </p>
              <Link 
                to="/app/themes/new" 
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus size={16} />
                Créer un thème
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredThemes.map((theme) => (
                <ThemeCard key={theme.id} theme={theme} />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  )
}
