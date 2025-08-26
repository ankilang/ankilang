import { Plus, FileText, Tag, Sparkles, Brain, Type } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Card } from '@ankilang/shared'
import CardActions from './CardActions'

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
      {/* Header avec compteur et bouton d'ajout */}
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
              Prêtes pour l'apprentissage
            </p>
          </div>
        </div>
        
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
          <span className="hidden sm:inline font-sans">Ajouter une carte</span>
          <span className="sm:hidden font-sans">Ajouter</span>
        </motion.button>
      </motion.div>

      {/* Liste des cartes avec animations en cascade */}
      <div className="space-y-4 sm:space-y-6">
        {cards.map((card, index) => (
          <motion.div 
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -2, scale: 1.01 }}
            className="group"
          >
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/80">
              {/* Header de la carte */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: themeColors.secondary }}
                  >
                    {card.type === 'basic' ? (
                      <Brain className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: themeColors.accent }} />
                    ) : (
                      <Type className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: themeColors.accent }} />
                    )}
                  </div>
                  <div>
                    <span 
                      className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold"
                      style={{ 
                        backgroundColor: themeColors.secondary,
                        color: themeColors.accent 
                      }}
                    >
                      {card.type === 'basic' ? 'Question/Réponse' : 'Texte à trous'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-xs text-dark-charcoal/50 font-sans">
                    #{index + 1}
                  </div>
                  <CardActions
                    card={card}
                    onEdit={onEditCard}
                    onDelete={onDeleteCard}
                    themeColors={themeColors}
                  />
                </div>
              </div>

              {/* Contenu de la carte */}
              <div className="space-y-3 sm:space-y-4">
                {card.type === 'basic' ? (
                  <>
                    <div>
                      <div className="text-xs font-medium text-dark-charcoal/60 mb-1 font-sans uppercase tracking-wide">
                        Question
                      </div>
                      <div className="font-sans text-dark-charcoal bg-white/50 rounded-xl p-3 border border-white/60">
                        {card.frontFR}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-dark-charcoal/60 mb-1 font-sans uppercase tracking-wide">
                        Réponse
                      </div>
                      <div className="font-sans text-dark-charcoal bg-white/50 rounded-xl p-3 border border-white/60">
                        {card.backText}
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <div className="text-xs font-medium text-dark-charcoal/60 mb-1 font-sans uppercase tracking-wide">
                      Texte à trous
                    </div>
                    <div className="font-sans text-dark-charcoal bg-white/50 rounded-xl p-3 border border-white/60">
                      {card.clozeTextTarget}
                    </div>
                  </div>
                )}

                {/* Extra et tags */}
                {(card.extra || (card.tags && card.tags.length > 0)) && (
                  <div className="pt-3 border-t border-white/40 space-y-2">
                    {card.extra && (
                      <div>
                        <div className="text-xs font-medium text-dark-charcoal/60 mb-1 font-sans uppercase tracking-wide">
                          Information supplémentaire
                        </div>
                        <div className="font-sans text-sm text-dark-charcoal/80 bg-white/30 rounded-lg p-2">
                          {card.extra}
                        </div>
                      </div>
                    )}
                    
                    {card.tags && card.tags.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Tag className="w-3 h-3 text-dark-charcoal/50" />
                        {card.tags.map((tag, tagIndex) => (
                          <span 
                            key={tagIndex}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-white/60 text-dark-charcoal/70 border border-white/40"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bouton d'ajout en bas */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: cards.length * 0.1 + 0.3 }}
        className="mt-8 text-center"
      >
        <motion.button
          onClick={onAddCard}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold border-2 border-dashed transition-all duration-300 hover:bg-white/50"
          style={{ 
            borderColor: themeColors.primary + '40',
            color: themeColors.accent 
          }}
        >
          <Plus className="w-5 h-5" />
          <span className="font-sans">Ajouter une nouvelle carte</span>
        </motion.button>
      </motion.div>
    </div>
  )
}
