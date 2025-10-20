import { useState, useEffect, memo } from 'react'
import { Plus, FileText, Tag, Brain, Type, Grid3X3, List } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Card } from '../../types/shared'
import { useVirtualizedCards } from '../../hooks/useVirtualizedCards'
import CardActions from './CardActions'
import MediaIndicator from './MediaIndicator'
import LanguageBadge from './LanguageBadge'
import StatusBadge from './StatusBadge'
import QuickActions from './QuickActions'
import { getCardStatus, getStatusMessage } from '../../utils/cardStatus'

interface VirtualizedCardListProps {
  cards: Card[]
  onAddCard: () => void
  onEditCard: (card: Card) => void
  onDeleteCard: (card: Card) => void
  themeName: string
  themeColors: {
    primary: string
    secondary: string
    accent: string
    gradient: string
  }
  onEndReached?: () => void
  hasMore?: boolean
  isLoadingMore?: boolean
}

export default function VirtualizedCardList({ 
  cards, 
  onAddCard, 
  onEditCard, 
  onDeleteCard, 
  themeName, 
  themeColors,
  onEndReached,
  hasMore = false,
  isLoadingMore = false,
}: VirtualizedCardListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // 🚀 NOUVEAU: Virtualisation pour les listes longues
  const {
    parentRef,
    virtualCards,
    totalSize,
    isVirtualized
  } = useVirtualizedCards(cards)

  // Intersection observer pour déclencher le chargement de la page suivante
  const sentinelId = 'infinite-sentinel'
  useEffect(() => {
    if (!onEndReached || !hasMore) return
    const root = parentRef.current
    if (!root) return
    const el = root.querySelector(`#${sentinelId}`)
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting && !isLoadingMore) {
          onEndReached()
        }
      },
      { root, rootMargin: '200px', threshold: 0 }
    )
    obs.observe(el)
    return () => { obs.disconnect(); }
  }, [onEndReached, hasMore, isLoadingMore, parentRef])

  if (cards.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 sm:py-16"
      >
        {/* Illustration artistique */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="relative mb-6"
        >
          <div 
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center mx-auto shadow-lg"
            style={{ backgroundColor: themeColors.secondary }}
          >
            <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-2 -right-2 text-2xl"
          >
            ✨
          </motion.div>
        </motion.div>

        <h3 className="font-display text-xl sm:text-2xl font-semibold text-dark-charcoal mb-3">
          Aucune carte pour le moment
        </h3>
        <p className="font-sans text-dark-charcoal/70 mb-6 max-w-md mx-auto">
          Commencez par créer votre première carte pour le thème <strong>{themeName}</strong>
        </p>

        <motion.button
          onClick={onAddCard}
          whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(124, 58, 237, 0.3)" }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary inline-flex items-center gap-3"
        >
          <Plus className="w-5 h-5" />
          Créer ma première carte
        </motion.button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header avec contrôles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-xl sm:text-2xl font-semibold text-dark-charcoal">
            Mes cartes ({cards.length})
          </h2>
          {isVirtualized && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full"
            >
              Virtualisé
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle de vue */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => { setViewMode('grid'); }}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white shadow-sm text-dark-charcoal'
                  : 'text-gray-500 hover:text-dark-charcoal'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setViewMode('list'); }}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white shadow-sm text-dark-charcoal'
                  : 'text-gray-500 hover:text-dark-charcoal'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Bouton d'ajout */}
          <motion.button
            onClick={onAddCard}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouvelle carte</span>
          </motion.button>
        </div>
      </div>

      {/* Liste virtualisée */}
      <div
        ref={parentRef}
        className="h-[600px] overflow-auto"
        style={{
          contain: 'strict',
        }}
      >
        <div
          style={{
            height: `${totalSize}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {isVirtualized ? (
            // 🚀 Rendu virtualisé pour les listes longues (animations minimisées)
            virtualCards.map((virtualCard) => {
              const style = {
                position: 'absolute' as const,
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualCard.virtualSize}px`,
                transform: `translateY(${virtualCard.virtualStart}px)`,
              }
              return (
                <div key={virtualCard.id} style={style}>
                  <CardItem
                    card={virtualCard as Card}
                    viewMode={viewMode}
                    onEditCard={onEditCard}
                    onDeleteCard={onDeleteCard}
                    themeColors={themeColors}
                    animated={false}
                  />
                </div>
              )
}, (prev: { card: Card; viewMode: 'grid' | 'list'; onEditCard: (card: Card) => void; onDeleteCard: (card: Card) => void; themeColors: any; animated: boolean }, next: { card: Card; viewMode: 'grid' | 'list'; onEditCard: (card: Card) => void; onDeleteCard: (card: Card) => void; themeColors: any; animated: boolean }) => {
  // Comparateur mémo: rerender seulement si visuel change
  const a = prev.card
  const b = next.card
  const sameCard = a.id === b.id && a.updatedAt === b.updatedAt
  const sameView = prev.viewMode === next.viewMode
  const sameAnim = prev.animated === next.animated
  const sameColors = prev.themeColors?.primary === next.themeColors?.primary
    && prev.themeColors?.secondary === next.themeColors?.secondary
    && prev.themeColors?.accent === next.themeColors?.accent
    && prev.themeColors?.gradient === next.themeColors?.gradient
  return sameCard && sameView && sameAnim && sameColors
})
          ) : (
            // Rendu normal pour les listes courtes
            cards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.3) }}
                className="mb-4"
              >
                <CardItem
                  card={card}
                  viewMode={viewMode}
                  onEditCard={onEditCard}
                  onDeleteCard={onDeleteCard}
                  themeColors={themeColors}
                  animated={true}
                />
              </motion.div>
            ))
          )}
        </div>
        {/* Sentinel pour pagination infinie */}
        {(hasMore || isLoadingMore) && (
          <div id={sentinelId} className="w-full py-3 flex items-center justify-center text-sm text-gray-500">
            {isLoadingMore ? 'Chargement...' : 'Continuer le défilement pour charger plus'}
          </div>
        )}
      </div>
    </div>
  )
}

// Composant CardItem réutilisable
const CardItem = memo(function CardItem({ 
  card, 
  viewMode, 
  onEditCard, 
  onDeleteCard, 
  themeColors,
  animated = true,
}: {
  card: Card
  viewMode: 'grid' | 'list'
  onEditCard: (card: Card) => void
  onDeleteCard: (card: Card) => void
  themeColors: any
  animated?: boolean
}) {
  const status = getCardStatus(card)
  const statusMessage = getStatusMessage(card, status)

  return (
    <motion.div
      whileHover={animated ? { scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" } : undefined}
      className={`bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden ${
        viewMode === 'grid' ? 'p-4' : 'p-6'
      }`}
    >
      <div className={`flex ${viewMode === 'grid' ? 'flex-col' : 'items-start gap-4'}`}>
        {/* Header de la carte */}
        <div className={`flex items-center gap-3 ${viewMode === 'grid' ? 'mb-3' : 'flex-shrink-0'}`}>
          <div 
            className={`rounded-xl flex items-center justify-center ${
              viewMode === 'grid' ? 'w-10 h-10' : 'w-12 h-12'
            }`}
            style={{ backgroundColor: themeColors.primary }}
          >
            {card.type === 'basic' ? (
              <Type className={`text-white ${viewMode === 'grid' ? 'w-5 h-5' : 'w-6 h-6'}`} />
            ) : (
              <Brain className={`text-white ${viewMode === 'grid' ? 'w-5 h-5' : 'w-6 h-6'}`} />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display font-semibold text-dark-charcoal truncate">
                {card.frontFR}
              </h3>
              <StatusBadge status={status} />
            </div>
            <div className="flex items-center gap-2 text-sm text-dark-charcoal/60">
              <LanguageBadge language={card.type === 'basic' ? 'Français' : 'Cloze'} />
              {card.tags && card.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  <span>{card.tags.length} tag{card.tags.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contenu de la carte */}
        <div className={`flex-1 ${viewMode === 'grid' ? 'space-y-2' : 'space-y-3'}`}>
          <div className="text-sm text-dark-charcoal/80">
            {card.type === 'basic' ? (
              <p className="line-clamp-2">{card.backText}</p>
            ) : (
              <p className="line-clamp-2">{card.clozeTextTarget}</p>
            )}
          </div>

          {/* Indicateurs de médias */}
          <div className="flex items-center gap-2">
            <MediaIndicator card={card} />
            {statusMessage && (
              <span className="text-xs text-dark-charcoal/60">
                {getStatusMessage(card, status)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className={`flex items-center gap-2 ${viewMode === 'grid' ? 'mt-3' : 'flex-shrink-0'}`}>
          <CardActions
            card={card}
            onEdit={onEditCard}
            onDelete={onDeleteCard}
            themeColors={themeColors}
          />
          <QuickActions 
            card={card}
            onEdit={onEditCard}
            onDelete={onDeleteCard}
          />
        </div>
      </div>
    </motion.div>
  )
});
