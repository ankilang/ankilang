import { Link } from 'react-router-dom'
import { ArrowLeft, Plus, BookOpen, Calendar, TrendingUp, Users } from 'lucide-react'
import PageMeta from '../../components/seo/PageMeta'
import { mockThemes } from '../../data/mockData'

export default function Dashboard() {
  // Calculer les statistiques mock
  const totalCards = mockThemes.reduce((sum, theme) => sum + theme.cardCount, 0)
  const totalThemes = mockThemes.length
  const communityThemes = mockThemes.filter(theme => theme.shareStatus === 'community').length
  const recentThemes = mockThemes.slice(0, 3) // 3 thèmes les plus récents

  return (
    <>
      <PageMeta 
        title="Tableau de bord — Ankilang" 
        description="Vue d'ensemble de vos thèmes et statistiques d'apprentissage." 
      />
      
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="p-3 text-gray-600 hover:text-gray-900 transition-colors rounded-md focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
              <Link 
                to="/app/themes/new" 
                className="px-4 py-3 sm:py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
              >
                <Plus size={16} />
                Nouveau thème
              </Link>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Statistiques */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Thèmes</p>
                  <p className="text-2xl font-bold text-gray-900">{totalThemes}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cartes totales</p>
                  <p className="text-2xl font-bold text-gray-900">{totalCards}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Partagés</p>
                  <p className="text-2xl font-bold text-gray-900">{communityThemes}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Moyenne</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalThemes > 0 ? Math.round(totalCards / totalThemes) : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mes thèmes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Mes thèmes</h2>
              <Link 
                to="/app/themes" 
                className="px-3 py-2 text-blue-600 hover:text-blue-800 transition-colors font-medium rounded-md focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
              >
                Voir tous →
              </Link>
            </div>

            {recentThemes.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun thème créé
                </h3>
                <p className="text-gray-600 mb-6">
                  Commencez par créer votre premier thème pour organiser vos flashcards.
                </p>
                <Link 
                  to="/app/themes/new" 
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Plus size={16} />
                  Créer un thème
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentThemes.map((theme) => (
                  <div key={theme.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <h3 className="font-semibold text-gray-900 mb-2">{theme.name}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>{theme.cardCount} cartes</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        theme.shareStatus === 'community' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {theme.shareStatus === 'community' ? 'Partagé' : 'Privé'}
                      </span>
                    </div>
                    <Link 
                      to={`/app/themes/${theme.id}`}
                      className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
                    >
                      Voir le thème →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions rapides */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Créer un nouveau thème
              </h3>
              <p className="text-gray-600 mb-4">
                Organisez vos flashcards par thème et langue cible.
              </p>
              <Link 
                to="/app/themes/new" 
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus size={16} />
                Nouveau thème
              </Link>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Explorer la communauté
              </h3>
              <p className="text-gray-600 mb-4">
                Découvrez des thèmes partagés par d'autres utilisateurs.
              </p>
              <Link 
                to="/app/community" 
                className="btn-secondary inline-flex items-center gap-2"
              >
                <Users size={16} />
                Voir la communauté
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
