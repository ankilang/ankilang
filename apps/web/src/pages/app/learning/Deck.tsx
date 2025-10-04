import { useParams, Navigate } from 'react-router-dom'
import { BookOpen, ArrowLeft } from 'lucide-react'
import PageMeta from '../../../components/seo/PageMeta'

export default function LearningDeck() {
  const { deckId } = useParams<{ deckId: string }>()
  
  if (!deckId) {
    return <Navigate to="/app/learning" replace />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageMeta 
        title="Deck d'apprentissage — Ankilang"
        description="Les decks d'apprentissage arrivent bientôt sur Ankilang."
      />

      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
          <BookOpen className="w-10 h-10 text-blue-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Decks d'apprentissage en cours de développement
        </h1>
        
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Nous travaillons actuellement sur un catalogue de decks d'apprentissage 
          premium pour enrichir votre expérience. Cette fonctionnalité sera 
          disponible prochainement.
        </p>
        
        <a
          href="/app/learning"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'apprentissage
        </a>
      </div>
    </div>
  )
}