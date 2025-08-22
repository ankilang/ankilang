import { Link } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import PageMeta from '../components/seo/PageMeta'

export default function Abonnement() {
  return (
    <>
      <PageMeta 
        title="Abonnement — Ankilang" 
        description="Comparez Gratuit vs Pro (4,99 €/mois ou 49,99 €/an) avec Stripe Tax." 
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Abonnement</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choisissez le plan qui correspond à vos besoins d'apprentissage
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Plan Gratuit */}
              <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Gratuit</h2>
                  <p className="text-gray-600">Pour commencer</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Carte Occitan illimitées</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>20 cartes/jour autres langues</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Export .apkg par thème</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>PWA hors ligne (lecture)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Aperçu communauté</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-gray-500">Modèles personnalisés</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-gray-500">Import en lots (CSV)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-gray-500">Priorité export haute</span>
                  </li>
                </ul>

                <div className="text-center">
                  <Link 
                    to="/app" 
                    className="btn-secondary w-full"
                  >
                    Commencer gratuitement
                  </Link>
                </div>
              </div>

              {/* Plan Pro */}
              <div className="bg-white rounded-lg shadow-xl p-8 border-2 border-blue-500 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Recommandé
                  </span>
                </div>
                
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Pro</h2>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-blue-600">4,99 €</span>
                    <span className="text-gray-600">/mois</span>
                  </div>
                  <p className="text-sm text-gray-500">ou 49,99 €/an (-17%)</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Tout du plan Gratuit</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Cartes illimitées toutes langues</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Export .apkg global</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>PWA hors ligne (édition)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Téléchargement & partage</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Modèles personnalisés</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Import en lots (CSV)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Priorité export haute</span>
                  </li>
                </ul>

                <div className="text-center">
                  <button className="btn-primary w-full">
                    Passer en Pro
                  </button>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <p className="text-gray-600 mb-4">
                Facturation sécurisée via Stripe • Annulation à tout moment
              </p>
              <Link 
                to="/legal/terms" 
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Voir les conditions d'utilisation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
