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
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-12">
          <h1 className="font-playfair text-3xl font-bold text-dark-charcoal mb-4">Deck introuvable</h1>
          <p className="font-inter text-dark-charcoal/70 mb-6">
            Le deck que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <Link
            to="/app/community"
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-pastel-purple rounded-xl text-purple-700 bg-white hover:bg-pastel-purple/10 transition-colors"
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
        className="inline-flex items-center gap-2 text-purple-700 hover:text-purple-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à la communauté
      </Link>

      {/* En-tête */}
      <div className="bg-white rounded-3xl shadow-lg border-2 border-pastel-purple p-8 mb-8 action-card">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-dark-charcoal mb-4">{deck.name}</h1>
            
            <div className="flex items-center gap-6 text-sm text-dark-charcoal/70 mb-4">
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
                  ? 'bg-pastel-green text-dark-charcoal'
                  : deck.level === 'intermediate'
                  ? 'bg-pastel-yellow text-dark-charcoal'
                  : 'bg-pastel-rose text-dark-charcoal'
              }`}>
                {deck.level === 'beginner' ? 'Débutant' : 
                 deck.level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pastel-blue text-dark-charcoal">
                {getLanguageLabel(deck.targetLang)}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pastel-sand text-dark-charcoal">
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
          <p className="font-inter text-dark-charcoal/80 leading-relaxed mb-6">{deck.description}</p>
        )}

        {deck.tags && deck.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {deck.tags.map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-pastel-blue text-dark-charcoal"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Aperçu des cartes */}
      <div className="bg-white rounded-3xl shadow-lg border-2 border-pastel-purple p-8 mb-8">
        <h2 className="font-playfair text-2xl font-semibold text-dark-charcoal mb-6">Aperçu des cartes</h2>
        
        <div className="space-y-4">
          {deck.previewCards.map((card, index) => (
            <div key={index} className="border-2 border-pastel-purple rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                  card.type === 'basic' 
                    ? 'bg-pastel-blue text-dark-charcoal'
                    : 'bg-pastel-green text-dark-charcoal'
                }`}>
                  {card.type === 'basic' ? 'Basic' : 'Cloze'}
                </span>
              </div>
              
              {card.type === 'basic' ? (
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-dark-charcoal/70">Question :</span>
                    <p className="text-dark-charcoal">{card.frontFR}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-dark-charcoal/70">Réponse :</span>
                    <p className="text-dark-charcoal">{card.backText}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <span className="text-sm font-medium text-dark-charcoal/70">Texte à trous :</span>
                  <p className="text-dark-charcoal">{card.clozeTextTarget}</p>
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
          className="btn-primary inline-flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Importer ce deck (Pro)
        </button>
      </div>
    </div>
  )
}
