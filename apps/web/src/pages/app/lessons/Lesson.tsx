import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft, Clock, Tag, Crown, ExternalLink } from 'lucide-react'
import { getLessonById } from '../../../data/mockLessons'
import { getLanguageLabel } from '../../../constants/languages'
import { getProStatus } from '../../../utils/pro'
import PageMeta from '../../../components/seo/PageMeta'

export default function LessonDetail() {
  const { lessonId } = useParams<{ lessonId: string }>()
  
  if (!lessonId) {
    return <Navigate to="/app/lessons" replace />
  }

  const lesson = getLessonById(lessonId)
  const isPro = getProStatus()

  if (!lesson) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Leçon introuvable</h1>
          <p className="text-gray-600 mb-6">
            La leçon que vous recherchez n'existe pas ou a été supprimée.
          </p>
          <Link
            to="/app/lessons"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux leçons
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageMeta 
        title={`${lesson.title} — Ankilang`}
        description={`Leçon de ${getLanguageLabel(lesson.targetLang)} - ${lesson.durationMin} minutes`}
      />

      {/* Navigation */}
      <Link
        to="/app/lessons"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux leçons
      </Link>

      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{lesson.title}</h1>
            
            <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{lesson.durationMin} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span>{getLanguageLabel(lesson.targetLang)}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                lesson.level === 'beginner' 
                  ? 'bg-green-100 text-green-800'
                  : lesson.level === 'intermediate'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {lesson.level === 'beginner' ? 'Débutant' : 
                 lesson.level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
              </span>
              {lesson.isPro && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  <Crown className="w-4 h-4" />
                  Pro
                </span>
              )}
            </div>
          </div>
        </div>

        {lesson.tags && lesson.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {lesson.tags.map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {lesson.sections.map(section => {
          const isLocked = section.proLocked && !isPro
          
          return (
            <div key={section.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{section.title}</h2>
              
              {isLocked ? (
                <div className="text-center py-8">
                  <div className="text-purple-600 mb-4">
                    <Crown className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Contenu réservé aux abonnés Pro
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Cette section nécessite un abonnement Pro pour y accéder.
                  </p>
                  <Link
                    to="/abonnement" aria-label="Passer à l'abonnement Pro pour accéder à cette section"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Crown className="w-4 h-4" />
                    Passer Pro
                  </Link>
                </div>
              ) : (
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {section.content}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Ressources */}
      {lesson.resources && lesson.resources.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ressources</h2>
          <div className="space-y-3">
            {lesson.resources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-gray-400" />
                <span className="text-blue-600 hover:text-blue-700">
                  {resource.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
