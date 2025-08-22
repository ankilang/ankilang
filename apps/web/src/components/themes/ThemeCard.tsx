import { Link } from 'react-router-dom'
import { BookOpen, Calendar, Tag } from 'lucide-react'
import { getLanguageLabel } from '../../constants/languages'
import type { Theme } from '@ankilang/shared'

interface ThemeCardProps {
  theme: Theme
}

export default function ThemeCard({ theme }: ThemeCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <Link to={`/app/themes/${theme.id}`} className="block p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {theme.name}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{theme.cardCount} cartes</span>
              </div>
              <div className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                <span>{getLanguageLabel(theme.targetLang)}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              theme.shareStatus === 'community' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {theme.shareStatus === 'community' ? 'Communauté' : 'Privé'}
            </span>
          </div>
        </div>

        {theme.tags && theme.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
                            {theme.tags.slice(0, 3).map((tag: string, index: number) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-50 text-blue-700"
                  >
                    {tag}
                  </span>
                ))}
            {theme.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-50 text-gray-600">
                +{theme.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>
              {theme.updatedAt 
                ? new Date(theme.updatedAt).toLocaleDateString('fr-FR')
                : 'Récemment'
              }
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}
