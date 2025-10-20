import { useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Download, Settings, Lock, Users, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import VirtualizedCardList from '../../../components/cards/VirtualizedCardList'
import NewCardModal from '../../../components/cards/NewCardModal'
import EditCardModal from '../../../components/cards/EditCardModal'
import { persistTTS } from '../../../services/tts'
import { useAuth } from '../../../hooks/useAuth'
import { useTheme, useCreateCard, useUpdateCard, useDeleteCard, useVirtualizedCardsInfinite } from '../../../hooks'
import { ErrorBoundary } from '../../../components/error/ErrorBoundary'
import { ThemeDetailSkeleton } from '../../../components/ui/Skeletons'
import { LANGUAGES } from '../../../constants/languages'
import { getLanguageColor } from '../../../utils/languageColors'
import { CreateCardSchema } from '../../../types/shared'
import type { z } from 'zod'
import type { Card } from '../../../types/shared'
import PageMeta from '../../../components/seo/PageMeta'
import FlagIcon from '../../../components/ui/FlagIcon'

export default function ThemeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<Card | null>(null)

  // 🚀 Utilisation séparée: thème (simple) + cartes en pagination infinie
  const themeQuery = useTheme(id!, user!.$id)
  const cardsInfinite = useVirtualizedCardsInfinite(id!, user!.$id)

  // Hooks de mutations avec optimistic updates
  const createCardMutation = useCreateCard()
  const updateCardMutation = useUpdateCard()
  const deleteCardMutation = useDeleteCard()

  const language = LANGUAGES.find(lang => lang.code === themeQuery.data?.targetLang)
  const colors = getLanguageColor(themeQuery.data?.targetLang || 'default')

  // 🚀 NOUVEAU: Conversion des cartes Appwrite vers le format attendu
  const formattedCards: Card[] = (cardsInfinite.cards)?.map((card: any) => ({
    id: card.$id,
    userId: card.userId,
    themeId: card.themeId,
    type: card.type,
    frontFR: card.frontFR,
    backText: card.backText,
    clozeTextTarget: card.clozeTextTarget,
    extra: card.extra,
    imageUrl: card.imageUrl,
    imageUrlType: card.imageUrlType || 'external',
    audioUrl: card.audioUrl,
    tags: card.tags,
    createdAt: card.$createdAt,
    updatedAt: card.$updatedAt
  })) || []

  // États de chargement et d'erreur (déplacés après tous les hooks pour respecter l'ordre des hooks)

  const handleAddCard = useCallback(() => {
    setIsModalOpen(true)
  }, [])

  const handleEditCard = useCallback((card: Card) => {
    setEditingCard(card)
    setIsEditModalOpen(true)
  }, [])

  // 🚀 NOUVEAU: Gestion optimiste de la suppression de carte
  const handleDeleteCard = useCallback(async (card: Card) => {
    if (!user || !id) return

    try {
      await deleteCardMutation.mutateAsync({
        cardId: card.id,
        userId: user.$id
      })
      
      // Si on supprimait la carte actuellement en édition, fermer la modale
      if (editingCard?.id === card.id) {
        setIsEditModalOpen(false)
        setEditingCard(null)
      }
      console.log('✅ Carte supprimée avec succès (médias inclus)')
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de la carte:', error)
      // L'erreur est déjà gérée par le hook avec rollback automatique
    }
  }, [deleteCardMutation, id, user, editingCard?.id])

  // 🚀 NOUVEAU: Gestion optimiste de la création de carte
  const handleCardSubmit = async (data: z.infer<typeof CreateCardSchema>) => {
    if (!user || !id) return
    
    try {
      console.log('Creating card in Appwrite:', data)
      
      // Créer la carte avec optimistic update
      const newCard = await createCardMutation.mutateAsync({
        userId: user.$id,
        themeId: id,
        cardData: {
          type: data.type,
          themeId: id,
          frontFR: data.frontFR,
          backText: data.backText,
          clozeTextTarget: data.clozeTextTarget,
          extra: data.extra,
          imageUrl: data.imageUrl || '',
          imageUrlType: data.imageUrlType || 'external',
          audioUrl: data.audioUrl || '',
          tags: data.tags || []
        }
      })
      
      // Sauvegarder l'audio TTS si du texte est présent
      const textToTts = data.type === 'basic' ? data.backText : data.clozeTextTarget
      if (textToTts?.trim() && !data.audioUrl) {
        try {
          console.log('🎵 Génération audio TTS (persist via Vercel API) ...')
          const { url } = await persistTTS({
            text: textToTts,
            language_code: themeQuery.data?.targetLang || 'en',
            voice_id: '21m00Tcm4TlvDq8ikWAM'
          })
          // Mettre à jour la carte avec l'URL audio Appwrite renvoyée
          await updateCardMutation.mutateAsync({
            cardId: newCard.$id,
            userId: user.$id,
            updates: { audioUrl: url }
          })
          console.log('✅ Audio TTS sauvegardé et lié à la carte')
        } catch (error) {
          console.error('❌ Erreur lors de la génération audio TTS:', error)
          // Continue sans audio si erreur
        }
      }
      
      setIsModalOpen(false)
      console.log('✅ Carte créée avec succès dans Appwrite')
    } catch (err) {
      console.error('❌ Erreur lors de la création de la carte:', err)
      // L'erreur est déjà gérée par le hook avec rollback automatique
    }
  }

  // 🚀 NOUVEAU: Gestion optimiste de la mise à jour de carte
  const handleEditCardSubmit = async (data: z.infer<typeof CreateCardSchema>) => {
    if (!editingCard || !user) return
    
    try {
      console.log('Updating card in Appwrite:', data)
      
      // Mettre à jour la carte avec optimistic update
      await updateCardMutation.mutateAsync({
        cardId: editingCard.id,
        userId: user.$id,
        updates: {
          type: data.type,
          themeId: data.themeId,
          frontFR: data.frontFR,
          backText: data.backText,
          clozeTextTarget: data.clozeTextTarget,
          extra: data.extra,
          imageUrl: data.imageUrl || '',
          audioUrl: data.audioUrl || '',
          tags: data.tags || []
        }
      })
      
      setIsEditModalOpen(false)
      setEditingCard(null)
      console.log('✅ Carte mise à jour avec succès dans Appwrite')
    } catch (err) {
      console.error('❌ Erreur lors de la modification de la carte:', err)
      // Si la carte n'existe plus (404), fermer la modale et nettoyer l'état
      const message = (err instanceof Error ? err.message : String(err)).toLowerCase()
      if (message.includes('not found')) {
        setIsEditModalOpen(false)
        setEditingCard(null)
      }
      // L'erreur est déjà gérée par le hook avec rollback automatique
    }
  }

  // Affichages conditionnels après déclaration de tous les hooks
  if (themeQuery.isLoading || cardsInfinite.isLoading) {
    return <ThemeDetailSkeleton />
  }

  if (themeQuery.error || !themeQuery.data) {
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
            {themeQuery.error instanceof Error ? themeQuery.error.message : 'Thème introuvable'}
          </h1>
          <p className="font-sans text-dark-charcoal/70 mb-6">
            {themeQuery.error instanceof Error && (themeQuery.error.message.includes('not found') || themeQuery.error.message.includes('Document not found'))
              ? 'Le thème que vous recherchez n\'existe pas dans vos thèmes.'
              : 'Une erreur est survenue lors du chargement.'}
          </p>
          <motion.button
            onClick={() => { navigate('/app/themes'); }}
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

  return (
    <ErrorBoundary>
      <PageMeta 
        title={`${themeQuery.data.name} — Ankilang`}
        description={`Thème de flashcards en ${language?.label} avec ${themeQuery.data.cardCount} cartes.`}
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
                  onClick={() => { navigate('/app/themes'); }}
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
                      languageCode={themeQuery.data.targetLang}
                      size={48}
                      alt={`Drapeau ${language?.label || themeQuery.data.targetLang}`}
                      className="w-10 h-10 sm:w-12 sm:h-12"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-dark-charcoal mb-1 sm:mb-2 line-clamp-2">
                      {themeQuery.data.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-dark-charcoal/70">
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-medium">{language?.label}</span>
                        {themeQuery.data.targetLang === 'oc' && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                            GRATUIT
                          </span>
                        )}
                      </div>
                      <span className="hidden sm:inline">•</span>
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" style={{ color: colors.accent }} />
                        <span className="font-sans">{themeQuery.data.cardCount} cartes</span>
                      </div>
                      <span className="hidden sm:inline">•</span>
                      <div className="flex items-center gap-1">
                        {themeQuery.data.shareStatus === 'community' ? (
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
                    to={`/app/themes/${themeQuery.data.$id}/export`}
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
          {themeQuery.data.tags && themeQuery.data.tags.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6 sm:mb-8"
            >
              <div className="flex flex-wrap gap-2">
                {themeQuery.data.tags.map((tag: string, index: number) => (
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
          <VirtualizedCardList
            cards={formattedCards}
            onAddCard={handleAddCard}
            onEditCard={handleEditCard}
            onDeleteCard={handleDeleteCard}
            themeName={themeQuery.data.name}
            themeColors={colors}
            onEndReached={cardsInfinite.loadMore}
            hasMore={cardsInfinite.hasMore}
            isLoadingMore={cardsInfinite.isLoadingMore}
          />
          </motion.div>
        </main>

        {/* Modale d'ajout de carte */}
        <NewCardModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); }}
          onSubmit={handleCardSubmit}
          isLoading={createCardMutation.isPending}
          error={createCardMutation.error?.message}
          themeId={themeQuery.data.$id}
          themeLanguage={themeQuery.data.targetLang}
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
            isLoading={updateCardMutation.isPending}
            error={updateCardMutation.error?.message}
            card={editingCard}
            themeColors={colors}
          />
        )}
      </div>
    </ErrorBoundary>
  )
}
