import { Plus, FileText, Type } from 'lucide-react'
import type { Card } from '@ankilang/shared'

interface CardListProps {
  cards: Card[]
  onAddCard: () => void
  themeName: string
}

export default function CardList({ cards, onAddCard, themeName }: CardListProps) {
  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Aucune carte dans "{themeName}"
        </h3>
        <p className="text-gray-600 mb-6">
          Commencez par créer votre première carte pour ce thème.
        </p>
        <button
          onClick={onAddCard}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter une carte
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {cards.length} carte{cards.length > 1 ? 's' : ''}
        </h2>
        <button
          onClick={onAddCard}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter une carte
        </button>
      </div>

      <div className="space-y-4">
        {cards.map((card, index) => (
          <div 
            key={card.id} 
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  card.type === 'basic' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  <Type className="w-3 h-3 mr-1" />
                  {card.type === 'basic' ? 'Basic' : 'Cloze'}
                </span>
                <span className="text-sm text-gray-500">#{index + 1}</span>
              </div>
            </div>

            <div className="space-y-2">
              {card.type === 'basic' ? (
                <>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Question :</span>
                    <p className="text-gray-900 mt-1">{card.frontFR || 'Non définie'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Réponse :</span>
                    <p className="text-gray-900 mt-1">{card.backText || 'Non définie'}</p>
                  </div>
                </>
              ) : (
                <div>
                  <span className="text-sm font-medium text-gray-700">Texte à trous :</span>
                  <p className="text-gray-900 mt-1">{card.clozeTextTarget || 'Non défini'}</p>
                </div>
              )}

              {card.extra && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Extra :</span>
                  <p className="text-gray-900 mt-1">{card.extra}</p>
                </div>
              )}

              {card.tags && card.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {card.tags.map((tag: string, tagIndex: number) => (
                    <span 
                      key={tagIndex}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-50 text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
