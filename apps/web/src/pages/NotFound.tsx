import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import PageMeta from '../components/seo/PageMeta'

export default function NotFound() {
  return (
    <>
      <PageMeta 
        title="Page introuvable — Ankilang" 
        description="La page demandée n'existe pas." 
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-8xl font-bold text-gray-300 mb-4">404</h1>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Page introuvable</h2>
            <p className="text-lg text-gray-600 mb-8">
              La page que vous recherchez n'existe pas ou a été déplacée.
            </p>
          </div>

          <div className="space-y-4">
            <Link 
              to="/" 
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Retour à l'accueil
            </Link>
            
            <Link 
              to="/app" 
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Aller au tableau de bord
            </Link>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Pages populaires :</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link 
                to="/abonnement" 
                className="text-blue-600 hover:text-blue-800 transition-colors text-sm"
              >
                Abonnement
              </Link>
              <span className="text-gray-400">•</span>
              <Link 
                to="/app/themes" 
                className="text-blue-600 hover:text-blue-800 transition-colors text-sm"
              >
                Mes thèmes
              </Link>
              <span className="text-gray-400">•</span>
              <Link 
                to="/app/community" 
                className="text-blue-600 hover:text-blue-800 transition-colors text-sm"
              >
                Communauté
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
