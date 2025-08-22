import { Link } from 'react-router-dom'
import { Download, User, Tag, TrendingUp } from 'lucide-react'
import { getLanguageLabel } from '../../constants/languages'
import type { CommunityDeck } from '../../data/mockCommunity'

interface DeckCardProps {
  deck: CommunityDeck
}

export default function DeckCard({ deck }: DeckCardProps) {
  const isPopular = deck.downloads > 100

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <Link to={`/app/community/${deck.id}`} className="block p-6"> aria-label={`Voir le détail du deck ${deck.name} par ${deck.author}`}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {deck.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <User className="w-4 h-4" />
              <span>{deck.author}</span> aria-label={`Auteur : ${deck.author}`}
            </div>
          </div>
          {isPopular && (
            <div className="flex items-center gap-1 text-orange-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium">Populaire</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Tag className="w-4 h-4" />
            <span>{getLanguageLabel(deck.targetLang)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            <span>{deck.downloads}</span> aria-label={`${deck.downloads} téléchargements`}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            deck.level === 'beginner' 
              ? 'bg-green-100 text-green-800'
              : deck.level === 'intermediate'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {deck.level === 'beginner' ? 'Débutant' : 
             deck.level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
          </span>
          <span className="text-sm text-gray-600">
            {deck.cardCount} cartes
          </span>
        </div>

        {deck.tags && deck.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {deck.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-50 text-blue-700"
              >
                {tag}
              </span>
            ))}
            {deck.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-50 text-gray-600">
                +{deck.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </Link>
    </div>
  )
}
