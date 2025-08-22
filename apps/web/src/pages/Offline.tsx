import { Link } from 'react-router-dom'
import { WifiOff, RefreshCw } from 'lucide-react'
import PageMeta from '../components/seo/PageMeta'

export default function Offline() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <>
      <PageMeta 
        title="Hors ligne — Ankilang" 
        description="Vous semblez hors ligne. Réessayez quand la connexion revient." 
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-8">
            <WifiOff className="w-24 h-24 text-gray-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Mode hors ligne</h1>
            <p className="text-lg text-gray-600 mb-6">
              Vous semblez être hors ligne. Certaines fonctionnalités peuvent ne pas être disponibles.
            </p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleRetry}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Réessayer
            </button>
            
            <Link 
              to="/" 
              className="btn-secondary w-full block"
            >
              Retour à l'accueil
            </Link>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold text-blue-900 mb-2">Fonctionnalités disponibles hors ligne :</h2>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Consultation des cartes déjà téléchargées</li>
              <li>• Création de nouvelles cartes (synchronisation différée)</li>
              <li>• Export des thèmes existants</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
