import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import ThemeCard from '../../../components/themes/ThemeCard'
import { themesService, type AppwriteTheme } from '../../../services/themes.service'
import { useAuth } from '../../../hooks/useAuth'
import { LANGUAGES, getLanguageLabel } from '../../../constants/languages'
import PageMeta from '../../../components/seo/PageMeta'

export default function ThemesIndex() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [themes, setThemes] = useState<AppwriteTheme[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>()

  // Charger les thèmes depuis Appwrite
  useEffect(() => {
    if (user) {
      loadThemes()
    }
  }, [user])

  const loadThemes = async () => {
    if (!user) return

    setIsLoading(true)
    setError(undefined)
    
    try {
      const userThemes = await themesService.getUserThemes(user.$id)
      setThemes(userThemes)
    } catch (err) {
      console.error('Error loading themes:', err)
      setError('Erreur lors du chargement des thèmes')
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrer les thèmes
  const filteredThemes = themes.filter(theme => {
    const matchesSearch = theme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         theme.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesLanguage = !selectedLanguage || theme.targetLang === selectedLanguage
    return matchesSearch && matchesLanguage
  })

  const handleEdit = (theme: AppwriteTheme) => {
    navigate(`/app/themes/${theme.$id}?edit=1`)
  }

  const handleDelete = async (theme: AppwriteTheme) => {
    if (!confirm(`Supprimer le thème « ${theme.name} » ? Cette action est définitive.`)) return
    
    try {
      await themesService.deleteTheme(theme.$id, user!.$id)
      // Recharger la liste
      await loadThemes()
    } catch (err) {
      console.error('Error deleting theme:', err)
      alert('Erreur lors de la suppression du thème')
    }
  }

  // États de chargement et d'erreur
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white rounded-3xl p-8 shadow-xl"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-pastel-purple to-pastel-rose rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-dark-charcoal mb-2">Chargement...</h2>
          <p className="text-dark-charcoal/70">Récupération de vos thèmes depuis Appwrite</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white rounded-3xl p-8 shadow-xl"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-dark-charcoal mb-2">Erreur</h2>
          <p className="text-dark-charcoal/70 mb-4">{error}</p>
          <button 
            onClick={loadThemes} 
            className="btn-primary"
          >
            Réessayer
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <PageMeta 
        title="Mes thèmes — Ankilang" 
        description="Gérez vos thèmes de flashcards et créez de nouveaux contenus." 
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header Immersif */}
        <motion.header 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-pastel-green via-pastel-purple/30 to-pastel-rose/20 relative overflow-hidden"
          style={{ paddingTop: 'var(--safe-top, 0px)' }}
        >
          {/* Éléments décoratifs */}
          <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-pastel-purple/20 rounded-full blur-2xl sm:blur-3xl" />
          <div className="absolute bottom-0 left-0 w-40 h-40 sm:w-48 sm:h-48 bg-pastel-rose/20 rounded-full blur-xl sm:blur-2xl" />
          
          <div className="relative container mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4 lg:gap-6">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex-1"
              >
                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-dark-charcoal mb-1 sm:mb-2 lg:mb-3">
                  Ma Bibliothèque
                </h1>
                <p className="font-sans text-sm sm:text-base lg:text-lg text-dark-charcoal/70 max-w-2xl">
                  Organisez vos flashcards par thèmes et langues. Créez, partagez et apprenez efficacement.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 lg:gap-4 w-full sm:w-auto"
              >
                {/* Statistiques rapides */}
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                  <div className="text-center">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      className="text-lg sm:text-xl lg:text-2xl font-bold text-dark-charcoal font-display"
                    >
                      {themes.length}
                    </motion.div>
                    <div className="text-xs text-dark-charcoal/70 font-sans">Thèmes</div>
                  </div>
                  <div className="text-center">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.7 }}
                      className="text-lg sm:text-xl lg:text-2xl font-bold text-dark-charcoal font-display"
                    >
                      {themes.reduce((sum, theme) => sum + theme.cardCount, 0)}
                    </motion.div>
                    <div className="text-xs text-dark-charcoal/70 font-sans">Cartes</div>
                  </div>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto"
                >
                  <Link 
                    to="/app/themes/new" 
                    className="btn-primary inline-flex items-center gap-2 shadow-xl w-full sm:w-auto justify-center text-sm sm:text-base px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4"
                  >
                    <Plus size={14} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                    Nouveau thème
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Filtres Redesignés */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="container mx-auto px-4 sm:px-6 -mt-4 sm:-mt-6 relative z-10"
        >
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-3 sm:p-4 lg:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 items-end">
              {/* Recherche */}
              <div className="lg:col-span-2">
                <label htmlFor="search" className="label-field text-xs sm:text-sm lg:text-base">
                  Rechercher dans vos thèmes
                </label>
                <div className="relative">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-dark-charcoal/40 w-4 h-4 sm:w-5 sm:h-5" />
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    id="search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher par nom ou tags..."
                    className="input-field pl-10 sm:pl-12 text-sm sm:text-base lg:text-lg"
                  />
                </div>
              </div>

              {/* Filtre langue */}
              <div>
                <label htmlFor="language" className="label-field text-xs sm:text-sm lg:text-base">
                  Langue cible
                </label>
                <div className="relative">
                  <Filter className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-dark-charcoal/40 w-4 h-4 sm:w-5 sm:h-5" />
                  <motion.select
                    whileFocus={{ scale: 1.02 }}
                    id="language"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="input-field pl-10 sm:pl-12 text-sm sm:text-base lg:text-lg"
                  >
                    <option value="">Toutes les langues</option>
                    {LANGUAGES.map((language) => (
                      <option key={language.code} value={language.code}>
                        {language.label}
                      </option>
                    ))}
                  </motion.select>
                </div>
              </div>
            </div>

                        {/* Barre de résultats */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-3 sm:mt-4 lg:mt-6 pt-3 sm:pt-4 lg:pt-6 border-t border-gray-100"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 lg:gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 lg:gap-4">
                  <span className="font-sans text-dark-charcoal font-medium text-xs sm:text-sm lg:text-base">
                    {filteredThemes.length} thème{filteredThemes.length > 1 ? 's' : ''} 
                    {selectedLanguage && ` en ${getLanguageLabel(selectedLanguage)}`}
                  </span>
                  {filteredThemes.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                      {[...new Set(filteredThemes.map(t => t.targetLang))].map(lang => (
                        <span key={lang} className="px-2 py-1 bg-pastel-purple/20 text-purple-700 rounded-full text-xs font-medium">
                          {getLanguageLabel(lang)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                {(searchTerm || selectedLanguage) && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedLanguage('')
                    }}
                    className="px-2 sm:px-3 lg:px-4 py-1 sm:py-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 transition-colors rounded-xl font-medium font-sans text-xs sm:text-sm lg:text-base self-start sm:self-auto"
                  >
                    Effacer les filtres
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Grid de Thèmes en Mosaïque */}
        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12">
          {filteredThemes.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center py-8 sm:py-12 lg:py-20"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-pastel-purple to-purple-300 rounded-3xl flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6 shadow-lg">
                <Search className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
              </div>
              <h3 className="font-display text-lg sm:text-xl lg:text-2xl font-bold text-dark-charcoal mb-2 sm:mb-3">
                {searchTerm || selectedLanguage ? 'Aucun thème trouvé' : 'Votre bibliothèque vous attend'}
              </h3>
              <p className="font-sans text-dark-charcoal/70 mb-4 sm:mb-6 lg:mb-8 max-w-md mx-auto text-xs sm:text-sm lg:text-base px-4 sm:px-0">
                {searchTerm || selectedLanguage 
                  ? 'Essayez de modifier vos critères de recherche ou explorez d\'autres langues.'
                  : 'Commencez votre aventure d\'apprentissage en créant votre premier thème de flashcards.'
                }
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/app/themes/new" 
                  className="btn-primary inline-flex items-center gap-2 sm:gap-3 text-sm sm:text-base lg:text-lg px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 shadow-xl"
                >
                  <Plus size={16} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                  Créer mon premier thème
                </Link>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 xl:gap-8"
            >
              {filteredThemes.map((theme, index) => (
                <ThemeCard 
                  key={theme.$id} 
                  theme={theme} 
                  index={index}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </motion.div>
          )}
        </main>
      </div>
    </>
  )
}
