import { useState } from 'react'
import { Plus, FileText, Tag, Sparkles, Brain, Type, Grid3X3, List, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Card } from '../../types/shared'
import CardActions from './CardActions'
import MediaIndicator from './MediaIndicator'
import LanguageBadge from './LanguageBadge'
import StatusBadge from './StatusBadge'
import QuickActions from './QuickActions'
import { getCardStatus, getStatusMessage } from '../../utils/cardStatus'

interface CardListProps {
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
}

export default function CardList({ cards, onAddCard, onEditCard, onDeleteCard, themeName, themeColors }: CardListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const cardsPerPage = viewMode === 'grid' ? 12 : 20
  const totalPages = Math.ceil(cards.length / cardsPerPage)
  const startIndex = (currentPage - 1) * cardsPerPage
  const currentCards = cards.slice(startIndex, startIndex + cardsPerPage)

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
            <FileText className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: themeColors.accent }} />
          </div>
          {/* Particules flottantes */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{ 
                backgroundColor: themeColors.primary + '40',
                left: `${50 + (i - 1) * 25}%`,
                top: `${30 + i * 10}%`
              }}
              animate={{
                x: [0, 20, 0],
                y: [0, -15, 0],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{
                duration: 3,
                delay: i * 0.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>

        <motion.h3 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="font-display text-xl sm:text-2xl font-bold text-dark-charcoal mb-3"
        >
          Aucune carte dans "{themeName}"
        </motion.h3>
        
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="font-sans text-dark-charcoal/70 mb-8 max-w-md mx-auto leading-relaxed"
        >
          Commencez par créer votre première carte pour ce thème. Choisissez entre une carte Basic (question/réponse) ou Cloze (texte à trous).
        </motion.p>
        
        <motion.button
          onClick={onAddCard}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.05, boxShadow: `0 10px 30px ${themeColors.primary}30` }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold text-white shadow-lg transition-all duration-300"
          style={{ 
            background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.accent})`
          }}
        >
          <Plus className="w-5 h-5" />
          <span className="font-sans">Créer ma première carte</span>
          <Sparkles className="w-4 h-4" />
        </motion.button>
      </motion.div>
    )
  }

  return (
    <div>
      {/* Header avec sélecteur de vue */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6 sm:mb-8"
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: themeColors.secondary }}
          >
            <FileText className="w-5 h-5" style={{ color: themeColors.accent }} />
          </div>
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-dark-charcoal">
          {cards.length} carte{cards.length > 1 ? 's' : ''}
        </h2>
            <p className="font-sans text-sm text-dark-charcoal/70">
              {viewMode === 'grid' ? 'Vue grille' : 'Vue liste'} • Page {currentPage}/{totalPages}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Sélecteur de vue */}
          <div className="flex items-center bg-white/60 backdrop-blur-sm rounded-xl p-1 border border-white/40">
            <motion.button
              onClick={() => {
                setViewMode('grid')
                setCurrentPage(1)
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-white text-dark-charcoal shadow-md' 
                  : 'text-dark-charcoal/60 hover:bg-white/60'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              onClick={() => {
                setViewMode('list')
                setCurrentPage(1)
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-white text-dark-charcoal shadow-md' 
                  : 'text-dark-charcoal/60 hover:bg-white/60'
              }`}
            >
              <List className="w-4 h-4" />
            </motion.button>
      </div>

          {/* Bouton d'ajout */}
          <motion.button
            onClick={onAddCard}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl font-semibold text-white shadow-lg transition-all duration-300"
            style={{ 
              background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.accent})`
            }}
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline font-sans">Ajouter</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Affichage conditionnel selon le mode */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6"
          >
            {currentCards.map((card, index) => (
              <motion.div 
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="group"
              >
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/80 h-full flex flex-col">
                  {/* Header enrichi */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {/* Type de carte */}
                      <div 
                        className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: themeColors.secondary }}
                      >
                        {card.type === 'basic' ? (
                          <Brain className="w-3 h-3" style={{ color: themeColors.accent }} />
                        ) : (
                          <Type className="w-3 h-3" style={{ color: themeColors.accent }} />
                        )}
                      </div>
                      <span 
                        className="text-xs font-medium px-2 py-0.5 rounded-md"
                        style={{ 
                          backgroundColor: themeColors.secondary,
                          color: themeColors.accent 
                        }}
                      >
                        {card.type === 'basic' ? 'Q/R' : 'Cloze'}
                      </span>
                      
                      {/* Indicateurs médias */}
                      <MediaIndicator 
                        card={card}
                        onAudioClick={() => {
                          if (card.audioUrl) {
                            const audio = new Audio(card.audioUrl)
                            audio.play()
                          }
                        }}
                        onImageClick={() => {
                          if (card.imageUrl) {
                            window.open(card.imageUrl, '_blank')
                          }
                        }}
                        size="sm"
                      />
                      
                      {/* Badge de langue */}
                      <LanguageBadge 
                        language={card.targetLanguage || 'fr'} 
                        size="sm" 
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Statut de la carte */}
                      <StatusBadge 
                        status={getCardStatus(card)}
                        message={getStatusMessage(card, getCardStatus(card))}
                        size="sm"
                      />
                      
                      <span className="text-xs text-dark-charcoal/50 font-sans">#{startIndex + index + 1}</span>
                      <CardActions
                        card={card}
                        onEdit={onEditCard}
                        onDelete={onDeleteCard}
                        themeColors={themeColors}
                      />
                    </div>
                  </div>

                  {/* Contenu compact */}
                  <div className="space-y-2 flex-1">
              {card.type === 'basic' ? (
                <>
                  <div>
                          <div className="text-xs font-medium text-dark-charcoal/60 mb-1 font-sans">Question</div>
                          <div className="font-sans text-sm text-dark-charcoal bg-white/50 rounded-lg p-2 line-clamp-2">
                            {card.frontFR}
                          </div>
                  </div>
                  <div>
                          <div className="text-xs font-medium text-dark-charcoal/60 mb-1 font-sans">Réponse</div>
                          <div className="font-sans text-sm text-dark-charcoal bg-white/50 rounded-lg p-2 line-clamp-2">
                            {card.backText}
                          </div>
                  </div>
                </>
              ) : (
                <div>
                        <div className="text-xs font-medium text-dark-charcoal/60 mb-1 font-sans">Texte à trous</div>
                        <div className="font-sans text-sm text-dark-charcoal bg-white/50 rounded-lg p-2 line-clamp-3">
                          {card.clozeTextTarget}
                </div>
                </div>
              )}

                    {/* Footer enrichi */}
                    <div className="pt-2 border-t border-white/40 mt-auto">
                      {/* Tags */}
                      {card.tags && card.tags.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap mb-2">
                          <Tag className="w-3 h-3 text-dark-charcoal/50" />
                          {card.tags.slice(0, 2).map((tag, tagIndex) => (
                            <span 
                              key={tagIndex}
                              className="text-xs px-1.5 py-0.5 bg-white/60 text-dark-charcoal/70 rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                          {card.tags.length > 2 && (
                            <span className="text-xs text-dark-charcoal/50">+{card.tags.length - 2}</span>
                          )}
                        </div>
                      )}
                      
                      {/* Actions rapides au hover */}
                      <QuickActions 
                        card={card}
                        onPlay={(card) => {
                          if (card.audioUrl) {
                            const audio = new Audio(card.audioUrl)
                            audio.play()
                          }
                        }}
                        onEdit={onEditCard}
                        onDelete={onDeleteCard}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {currentCards.map((card, index) => (
              <motion.div 
                key={card.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                whileHover={{ x: 4, scale: 1.01 }}
                className="group"
              >
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40 shadow-md hover:shadow-lg transition-all duration-300 hover:bg-white/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: themeColors.secondary }}
                      >
                        {card.type === 'basic' ? (
                          <Brain className="w-4 h-4" style={{ color: themeColors.accent }} />
                        ) : (
                          <Type className="w-4 h-4" style={{ color: themeColors.accent }} />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span 
                            className="text-xs font-medium px-2 py-0.5 rounded-md"
                            style={{ 
                              backgroundColor: themeColors.secondary,
                              color: themeColors.accent 
                            }}
                          >
                            {card.type === 'basic' ? 'Question/Réponse' : 'Texte à trous'}
                          </span>
                          
                          {/* Indicateurs médias */}
                          <MediaIndicator 
                            card={card}
                            onAudioClick={() => {
                              if (card.audioUrl) {
                                const audio = new Audio(card.audioUrl)
                                audio.play()
                              }
                            }}
                            onImageClick={() => {
                              if (card.imageUrl) {
                                window.open(card.imageUrl, '_blank')
                              }
                            }}
                            size="sm"
                          />
                          
                          {/* Badge de langue */}
                          <LanguageBadge 
                            language={card.targetLanguage || 'fr'} 
                            size="sm" 
                          />
                          
                          {/* Statut de la carte */}
                          <StatusBadge 
                            status={getCardStatus(card)}
                            message={getStatusMessage(card, getCardStatus(card))}
                            size="sm"
                          />
                          
                          {card.tags && card.tags.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Tag className="w-3 h-3 text-dark-charcoal/50" />
                              <span className="text-xs text-dark-charcoal/50">
                                {card.tags.length} tag{card.tags.length > 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="font-sans text-sm text-dark-charcoal line-clamp-1">
                          {card.type === 'basic' ? card.frontFR : card.clozeTextTarget}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-dark-charcoal/50 font-sans">
                        #{startIndex + index + 1}
                      </div>
                      
                      {/* Actions rapides */}
                      <QuickActions 
                        card={card}
                        onPlay={(card) => {
                          if (card.audioUrl) {
                            const audio = new Audio(card.audioUrl)
                            audio.play()
                          }
                        }}
                        onEdit={onEditCard}
                        onDelete={onDeleteCard}
                      />
                      
                      <CardActions
                        card={card}
                        onEdit={onEditCard}
                        onDelete={onDeleteCard}
                        themeColors={themeColors}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-4 mt-8"
        >
          <motion.button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            whileHover={{ scale: currentPage > 1 ? 1.05 : 1 }}
            whileTap={{ scale: currentPage > 1 ? 0.95 : 1 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 border border-white/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-white/80"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="font-sans text-sm">Précédent</span>
          </motion.button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <motion.button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-8 h-8 rounded-lg font-sans text-sm transition-all duration-200 ${
                    currentPage === pageNum
                      ? 'text-white shadow-lg'
                      : 'bg-white/60 text-dark-charcoal hover:bg-white/80'
                  }`}
                  style={{
                    background: currentPage === pageNum 
                      ? `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.accent})`
                      : undefined
                  }}
                >
                  {pageNum}
                </motion.button>
              );
            })}
            
            {totalPages > 5 && (
              <>
                <span className="text-dark-charcoal/50">...</span>
                <span className="px-3 py-2 font-sans text-sm text-dark-charcoal/70">
                  {currentPage} / {totalPages}
                </span>
              </>
            )}
      </div>
          
          <motion.button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            whileHover={{ scale: currentPage < totalPages ? 1.05 : 1 }}
            whileTap={{ scale: currentPage < totalPages ? 0.95 : 1 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 border border-white/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-white/80"
          >
            <span className="font-sans text-sm">Suivant</span>
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
