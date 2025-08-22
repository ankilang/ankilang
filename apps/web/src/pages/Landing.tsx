import { Link } from 'react-router-dom'
import { BookOpen, Download, Languages } from 'lucide-react'
import PageMeta from '../components/seo/PageMeta'

export default function Landing() {
  return (
    <>
      <PageMeta 
        title="Ankilang — Flashcards & export Anki (.apkg)" 
        description="Crée des flashcards Basic & Cloze. Occitan illimité, PWA hors ligne, export direct Anki." 
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Crée tes flashcards<br />
              <span className="text-blue-600">Exporte vers Anki</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Crée des cartes Basic & Cloze pour l'apprentissage des langues. 
              Export direct vers Anki (.apkg) avec PWA hors ligne.
            </p>
            
            <Link 
              to="/app" 
              className="btn-primary text-lg px-8 py-3 inline-flex items-center gap-2"
            >
              <BookOpen size={20} />
              Commencer maintenant
            </Link>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Flashcards intelligentes
                </h3>
                <p className="text-gray-600">
                  Crée des cartes Basic et Cloze avec traduction automatique et prononciation.
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <Download className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Export Anki direct
                </h3>
                <p className="text-gray-600">
                  Exporte tes thèmes en .apkg pour les importer directement dans Anki.
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <Languages className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Multi-langues
                </h3>
                <p className="text-gray-600">
                  Support de nombreuses langues avec DeepL et Revirada pour la traduction.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link 
              to="/abonnement" 
              className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
            >
              Voir les tarifs →
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
