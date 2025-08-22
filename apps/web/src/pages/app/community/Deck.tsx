import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft, Download, User, Calendar, TrendingUp } from 'lucide-react'
import { getCommunityDeckById } from '../../../data/mockCommunity'
import { getLanguageLabel } from '../../../constants/languages'
import { guardPro } from '../../../utils/pro'
import PageMeta from '../../../components/seo/PageMeta'

export default function CommunityDeck() {
  const { deckId } = useParams<{ deckId: string }>()
  
  if (!deckId) {
    return <Navigate to="/app/community" replace />
  }

  const deck = getCommunityDeckById(deckId)

  if (!deck) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Deck introuvable</h1>
          <p className="text-gray-600 mb-6">
            Le deck que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <Link
            to="/app/community"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la communauté
          </Link>
        </div>
      </div>
    )
  }

  const handleImport = () => {
    guardPro(() => {
      console.log('Import du deck:', deck.id)
      // Simulation d'import
      alert('Deck importé avec succès !')
    }, (path) => window.location.href = path)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageMeta 
        title={`${deck.name} — Communauté Ankilang`}
        description={deck.description || `Deck de ${deck.author} pour apprendre ${getLanguageLabel(deck.targetLang)}`}
      />

      {/* Navigation */}
      <Link
        to="/app/community"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à la communauté
      </Link>

      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{deck.name}</h1>
            
            <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Par {deck.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Mis à jour le {new Date(deck.updatedAt).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span>{deck.downloads} téléchargements</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                deck.level === 'beginner' 
                  ? 'bg-green-100 text-green-800'
                  : deck.level === 'intermediate'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {deck.level === 'beginner' ? 'Débutant' : 
                 deck.level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {getLanguageLabel(deck.targetLang)}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                {deck.cardCount} cartes
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">Fonctionnalité Pro</span>
          </div>
        </div>

        {deck.description && (
          <p className="text-gray-700 leading-relaxed mb-6">{deck.description}</p>
        )}

        {deck.tags && deck.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {deck.tags.map((tag, index) => (
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

      {/* Aperçu des cartes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Aperçu des cartes</h2>
        
        <div className="space-y-4">
          {deck.previewCards.map((card, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                  card.type === 'basic' 
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {card.type === 'basic' ? 'Basic' : 'Cloze'}
                </span>
              </div>
              
              {card.type === 'basic' ? (
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Question :</span>
                    <p className="text-gray-900">{card.frontFR}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Réponse :</span>
                    <p className="text-gray-900">{card.backText}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <span className="text-sm font-medium text-gray-600">Texte à trous :</span>
                  <p className="text-gray-900">{card.clozeTextTarget}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center">
        <button
          onClick={handleImport} aria-label="Importer ce deck (fonctionnalité Pro)"
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          <Download className="w-5 h-5" />
          Importer ce deck (Pro)
        </button>
      </div>
    </div>
  )
}
