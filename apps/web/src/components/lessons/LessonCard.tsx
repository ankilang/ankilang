import { Link } from 'react-router-dom'
import { Clock, Tag, Crown } from 'lucide-react'
import { getLanguageLabel } from '../../constants/languages'
import type { Lesson } from '../../data/mockLessons'

interface LessonCardProps {
  lesson: Lesson
}

export default function LessonCard({ lesson }: LessonCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <Link to={`/app/lessons/${lesson.id}`} className="block p-6"> aria-label={`Voir le détail de la leçon ${lesson.title}`}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {lesson.title}
            </h3>
          </div>
          {lesson.isPro && (
            <div className="flex items-center gap-1 text-purple-600">
              <Crown className="w-4 h-4" />
              <span className="text-xs font-medium">Pro</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Tag className="w-4 h-4" />
            <span>{getLanguageLabel(lesson.targetLang)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{lesson.durationMin} min</span> aria-label={`Durée : ${lesson.durationMin} minutes`}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            lesson.level === 'beginner' 
              ? 'bg-green-100 text-green-800'
              : lesson.level === 'intermediate'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {lesson.level === 'beginner' ? 'Débutant' : 
             lesson.level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
          </span>
        </div>

        {lesson.tags && lesson.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {lesson.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-50 text-gray-600"
              >
                {tag}
              </span>
            ))}
            {lesson.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-50 text-gray-600">
                +{lesson.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </Link>
    </div>
  )
}
