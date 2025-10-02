import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Download, Settings, Lock, Users, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import CardList from '../../../components/cards/CardList'
import NewCardModal from '../../../components/cards/NewCardModal'
import EditCardModal from '../../../components/cards/EditCardModal'
import { getCardsByThemeId, addMockCard, updateMockCard } from '../../../data/mockData'
import { themesService, type AppwriteTheme } from '../../../services/themes.service'
import { cardsService } from '../../../services/cards.service'
import { useAuth } from '../../../hooks/useAuth'
import { LANGUAGES } from '../../../constants/languages'
import { getLanguageColor } from '../../../utils/languageColors'
import { CreateCardSchema } from '@ankilang/shared'
import type { z } from 'zod'
import type { Card } from '@ankilang/shared'
import PageMeta from '../../../components/seo/PageMeta'
import FlagIcon from '../../../components/ui/FlagIcon'

export default function ThemeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<Card | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [cards, setCards] = useState<Card[]>([])
  const [theme, setTheme] = useState<AppwriteTheme | null>(null)

  const language = LANGUAGES.find(lang => lang.code === theme?.targetLang)
  const colors = getLanguageColor(theme?.targetLang || 'default')

  // Charger le thème et les cartes depuis Appwrite
  useEffect(() => {
    if (id && user) {
      loadThemeData()
    }
  }, [id, user])

  const loadThemeData = async () => {
    if (!id || !user) return

    setIsLoading(true)
    setError(undefined)
    
    try {
      // Charger le thème depuis Appwrite
      const themeData = await themesService.getThemeById(id, user.$id)
      setTheme(themeData)
      
      // Pour l'instant, charger les cartes depuis les données mockées
      // TODO: Implémenter le service cards plus tard
      setCards(getCardsByThemeId(id))
      
    } catch (err) {
      console.error('Error loading theme:', err)
      if (err instanceof Error) {
        if (err.message.includes('not found') || err.message.includes('Document not found')) {
          setError('Thème introuvable')
        } else if (err.message.includes('non autorisé') || err.message.includes('unauthorized')) {
          setError('Accès non autorisé à ce thème')
        } else {
          setError('Erreur lors du chargement du thème')
        }
      } else {
        setError('Erreur inconnue')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // États de chargement et d'erreur
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pastel-purple/20 via-pastel-green/10 to-pastel-rose/20 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/20"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-pastel-purple to-pastel-rose rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-dark-charcoal mb-4">Chargement...</h1>
          <p className="font-sans text-dark-charcoal/70 mb-6">Récupération du thème depuis Appwrite</p>
        </motion.div>
      </div>
    )
  }

  if (error || !theme) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pastel-purple/20 via-pastel-green/10 to-pastel-rose/20 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/20"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-pastel-purple to-pastel-rose rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-dark-charcoal mb-4">
            {error || 'Thème introuvable'}
          </h1>
          <p className="font-sans text-dark-charcoal/70 mb-6">
            {error === 'Thème introuvable' 
              ? 'Le thème que vous recherchez n\'existe pas dans vos thèmes.'
              : 'Une erreur est survenue lors du chargement.'}
          </p>
          <motion.button
            onClick={() => navigate('/app/themes')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary"
          >
            Retour aux thèmes
          </motion.button>
        </motion.div>
      </div>
    )
  }

  const handleAddCard = () => {
    setIsModalOpen(true)
  }

  const handleEditCard = (card: Card) => {
    setEditingCard(card)
    setIsEditModalOpen(true)
  }

  const handleDeleteCard = async (card: Card) => {
    if (!user) return

    try {
      // Supprimer la carte d'Appwrite
      await cardsService.deleteCard(card.id, user.$id)
      
      // Mettre à jour l'état local
      setCards(prevCards => prevCards.filter(c => c.id !== card.id))
      
      // Mettre à jour le compteur du thème
      if (theme) {
        setTheme({
          ...theme,
          cardCount: Math.max(0, theme.cardCount - 1)
        })
      }
      
      console.log('✅ Carte supprimée avec succès')
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de la carte:', error)
      setError('Impossible de supprimer la carte. Veuillez réessayer.')
    }
  }

  const handleCardSubmit = async (data: z.infer<typeof CreateCardSchema>) => {
    setIsLoading(true)
    setError(undefined)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Creating card:', data)
      addMockCard(data)
      setCards(getCardsByThemeId(id!))
      setIsModalOpen(false)
    } catch (err) {
      setError('Erreur lors de la création de la carte. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditCardSubmit = async (data: z.infer<typeof CreateCardSchema>) => {
    if (!editingCard) return
    
    setIsLoading(true)
    setError(undefined)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Updating card:', data)
      updateMockCard(editingCard.id, data)
      setCards(getCardsByThemeId(id!))
      setIsEditModalOpen(false)
      setEditingCard(null)
    } catch (err) {
      setError('Erreur lors de la modification de la carte. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <PageMeta 
        title={`${theme.name} — Ankilang`}
        description={`Thème de flashcards en ${language?.label} avec ${theme.cardCount} cartes.`}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-pastel-purple/20 via-pastel-green/10 to-pastel-rose/20">
        {/* Header immersif avec couleurs thématiques */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.secondary}80 50%, white 100%)`
          }}
        >
          {/* Éléments décoratifs */}
          <div 
            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: colors.primary }}
          />
          <div 
            className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-2xl opacity-30"
            style={{ backgroundColor: colors.accent }}
          />
          
          <div className="relative container mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <motion.button
                  onClick={() => navigate('/app/themes')}
                  whileHover={{ scale: 1.1, x: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg border border-white/20 text-dark-charcoal hover:bg-white transition-colors"
                >
                  <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
                </motion.button>
                
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Drapeau de la langue */}
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md border border-white/40">
                    <FlagIcon 
                      languageCode={theme.targetLang}
                      size={48}
                      alt={`Drapeau ${language?.label || theme.targetLang}`}
                      className="w-10 h-10 sm:w-12 sm:h-12"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-dark-charcoal mb-1 sm:mb-2 line-clamp-2">
                      {theme.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-dark-charcoal/70">
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-medium">{language?.label}</span>
                        {theme.targetLang === 'oc' && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                            GRATUIT
                          </span>
                        )}
                      </div>
                      <span className="hidden sm:inline">•</span>
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" style={{ color: colors.accent }} />
                        <span className="font-sans">{theme.cardCount} cartes</span>
                      </div>
                      <span className="hidden sm:inline">•</span>
                      <div className="flex items-center gap-1">
                        {theme.shareStatus === 'community' ? (
                          <>
                            <Users className="w-4 h-4 text-green-600" />
                            <span className="font-sans text-green-700">Partagé</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 text-gray-600" />
                            <span className="font-sans text-gray-700">Privé</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2 sm:gap-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to={`/app/themes/${theme.$id}/export`}
                    className="btn-secondary inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3"
                  >
                    <Download size={16} />
                    <span className="hidden sm:inline">Exporter</span>
                  </Link>
                </motion.div>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg border border-white/20 text-dark-charcoal hover:bg-white transition-colors"
                >
                  <Settings size={18} className="sm:w-5 sm:h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.header>

        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Tags du thème */}
          {theme.tags && theme.tags.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6 sm:mb-8"
            >
              <div className="flex flex-wrap gap-2">
                {theme.tags.map((tag: string, index: number) => (
                  <motion.span 
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className="inline-flex items-center px-3 py-2 rounded-xl text-sm font-medium"
                    style={{ 
                      backgroundColor: colors.secondary,
                      color: colors.accent 
                    }}
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Container principal des cartes */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 p-6 sm:p-8"
          >
            <CardList
              cards={cards}
              onAddCard={handleAddCard}
              onEditCard={handleEditCard}
              onDeleteCard={handleDeleteCard}
              themeName={theme.name}
              themeColors={colors}
            />
          </motion.div>
        </main>

        {/* Modale d'ajout de carte */}
        <NewCardModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCardSubmit}
          isLoading={isLoading}
          error={error}
          themeId={theme.$id}
          themeLanguage={theme.targetLang}
          themeColors={colors}
        />

        {/* Modale d'édition de carte */}
        {editingCard && (
          <EditCardModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false)
              setEditingCard(null)
            }}
            onSubmit={handleEditCardSubmit}
            isLoading={isLoading}
            error={error}
            card={editingCard}
            themeColors={colors}
          />
        )}
      </div>
    </>
  )
}
