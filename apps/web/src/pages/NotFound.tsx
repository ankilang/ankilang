import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import PageMeta from '../components/seo/PageMeta'
import AnkilangLogo from '../components/ui/AnkilangLogo'

export default function NotFound() {
  return (
    <>
      <PageMeta 
        title="Page introuvable — Ankilang" 
        description="La page demandée n'existe pas. Retournez à l'accueil pour continuer votre apprentissage des langues." 
        keywords="404, page introuvable, erreur, ankilang, flashcards"
      />
      
      {/* Header cohérent avec la landing */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <AnkilangLogo size="default" animated={false} />
              <span className="text-xl font-bold text-slate-900">
                Ankilang
              </span>
            </Link>
          </div>
        </div>
      </header>

      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Illustration 404 */}
            <div className="mb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-32 h-32 mx-auto mb-6 bg-violet-100 rounded-full flex items-center justify-center"
              >
                <Search className="w-16 h-16 text-violet-600" />
              </motion.div>
              
              <h1 className="text-6xl sm:text-8xl font-bold text-slate-300 mb-4">404</h1>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                Oups, cette page n'existe pas
              </h2>
              <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
                La page que vous recherchez a peut-être été déplacée ou n'existe plus. 
                Pas de panique, nous vous aidons à retrouver votre chemin !
              </p>
            </div>

            {/* Actions principales */}
            <motion.div 
              className="space-y-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                <Home className="w-5 h-5" />
                Retour à l'accueil
              </Link>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/app" 
                  className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-lg font-semibold border border-slate-200 transition-colors duration-200"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Tableau de bord
                </Link>
                
                <button 
                  onClick={() => window.history.back()}
                  className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Page précédente
                </button>
              </div>
            </motion.div>

            {/* Pages populaires */}
            <motion.div 
              className="bg-white rounded-lg p-6 shadow-sm border border-slate-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h3 className="font-semibold text-slate-900 mb-4">Pages populaires :</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link 
                  to="/app/themes" 
                  className="text-violet-600 hover:text-violet-800 transition-colors text-sm font-medium"
                >
                  📚 Mes thèmes
                </Link>
                <Link 
                  to="/app/account" 
                  className="text-violet-600 hover:text-violet-800 transition-colors text-sm font-medium"
                >
                  ⚙️ Mon compte
                </Link>
                <Link 
                  to="/auth/register" 
                  className="text-violet-600 hover:text-violet-800 transition-colors text-sm font-medium"
                >
                  🚀 Commencer
                </Link>
              </div>
            </motion.div>

            {/* Message d'aide */}
            <motion.div 
              className="mt-8 text-sm text-slate-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <p>
                Besoin d'aide ? Contactez-nous à{' '}
                <a href="mailto:support@ankilang.com" className="text-violet-600 hover:text-violet-800">
                  support@ankilang.com
                </a>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
