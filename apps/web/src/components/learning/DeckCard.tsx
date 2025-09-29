import { Link } from 'react-router-dom'
import { Download, User, Tag, TrendingUp } from 'lucide-react'
import { getLanguageLabel } from '../../constants/languages'
import type { LearningDeck } from '../../data/learningDecks'
import { motion } from 'framer-motion'

interface DeckCardProps {
  deck: LearningDeck
  isLocked: boolean
}

export default function DeckCard({ deck, isLocked }: DeckCardProps) {
  const isPopular = deck.downloads > 100

  // Couleurs pastel selon le niveau
  const levelClasses =
    deck.level === 'beginner'
      ? 'bg-pastel-green text-dark-charcoal'
      : deck.level === 'intermediate'
      ? 'bg-pastel-yellow text-dark-charcoal'
      : 'bg-pastel-rose text-dark-charcoal'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="action-card bg-white rounded-3xl border-2 border-pastel-purple hover:bg-pastel-purple/10 hover:border-purple-400 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden"
    >
      <Link
        to={`/app/learning/${deck.id}`}
        className="block h-full flex flex-col"
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-inter font-bold text-dark-charcoal text-lg mb-2 line-clamp-2 min-w-0">
                {deck.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-dark-charcoal/70 mb-2">
                <User className="w-4 h-4" />
                <span aria-label={`Auteur : ${deck.author}`}>{deck.author}</span>
              </div>
            </div>
            {isPopular && (
              <div className="flex items-center gap-1 text-rose-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">Populaire</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-dark-charcoal/70 mb-3">
            <div className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              <span>{getLanguageLabel(deck.targetLang)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              <span aria-label={`${deck.downloads} téléchargements`}>{deck.downloads}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${levelClasses}`}>
              {deck.level === 'beginner'
                ? 'Débutant'
                : deck.level === 'intermediate'
                ? 'Intermédiaire'
                : 'Avancé'}
            </span>
            <span className="text-sm text-dark-charcoal/70">{deck.cardCount} cartes</span>
          </div>

          {deck.tags && deck.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 min-w-0">
              {deck.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-pastel-blue text-dark-charcoal truncate max-w-20"
                >
                  {tag}
                </span>
              ))}
              {deck.tags.length > 2 && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-pastel-sand text-dark-charcoal/80">
                  +{deck.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
