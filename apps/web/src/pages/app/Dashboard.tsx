import { Link } from 'react-router-dom'
import { Plus, BookOpen, TrendingUp, Users, Star, Target, Zap } from 'lucide-react'
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
      
      {/* Wrapper principal avec fond mesh et formes organiques */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-950">
        {/* Blobs décoratifs - formes organiques */}
        <div 
          aria-hidden="true" 
          className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-30 dark:opacity-40 bg-gradient-to-br from-blue-500 via-violet-500 to-fuchsia-500 motion-reduce:opacity-20 motion-reduce:blur-none" 
        />
        <div 
          aria-hidden="true" 
          className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full blur-3xl opacity-30 dark:opacity-40 bg-gradient-to-br from-fuchsia-500 via-violet-500 to-blue-500 motion-reduce:opacity-20 motion-reduce:blur-none" 
        />

        {/* Conteneur principal avec safe-area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-10">
          {/* Header "Learning" banner glass */}
          <header 
            role="region" 
            aria-labelledby="dashboard-title" 
            className="relative mb-6 sm:mb-8 rounded-2xl border bg-white/60 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/30 backdrop-blur-md shadow-lg shadow-black/10 p-5 sm:p-6"
          >
            <span className="inline-flex items-center rounded-full px-3 py-1 text-sm bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-300">
              Bon retour !
            </span>
            <h1 id="dashboard-title" className="mt-3 text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">
              Tableau de bord
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl">
              Continuez votre progression sereinement.
            </p>
          </header>

          {/* Statistiques - cartes glass avec micro-animations */}
          <section aria-labelledby="stats-title" className="mb-6 sm:mb-8">
            <h2 id="stats-title" className="sr-only">Statistiques</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Carte Thèmes */}
              <div className="group relative rounded-2xl border bg-white/80 dark:bg-slate-900/70 border-white/20 dark:border-slate-700/30 backdrop-blur-md shadow-lg shadow-black/10 p-4 sm:p-5 transition-transform duration-150 ease-out hover:-translate-y-[1px] hover:shadow-xl motion-reduce:transition-none motion-reduce:hover:transform-none">
                <div className="absolute left-4 top-3 h-1 w-10 rounded-full bg-gradient-to-r from-blue-500 to-fuchsia-500" aria-hidden="true" />
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Thèmes</p>
                    <p className="mt-1 text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">{totalThemes}</p>
                  </div>
                  <div className="shrink-0 h-8 w-8 rounded-xl bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <BookOpen className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Carte Cartes totales */}
              <div className="group relative rounded-2xl border bg-white/80 dark:bg-slate-900/70 border-white/20 dark:border-slate-700/30 backdrop-blur-md shadow-lg shadow-black/10 p-4 sm:p-5 transition-transform duration-150 ease-out hover:-translate-y-[1px] hover:shadow-xl motion-reduce:transition-none motion-reduce:hover:transform-none">
                <div className="absolute left-4 top-3 h-1 w-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500" aria-hidden="true" />
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cartes totales</p>
                    <p className="mt-1 text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">{totalCards}</p>
                  </div>
                  <div className="shrink-0 h-8 w-8 rounded-xl bg-green-500/10 dark:bg-green-400/10 flex items-center justify-center text-green-600 dark:text-green-400">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Carte Partagés */}
              <div className="group relative rounded-2xl border bg-white/80 dark:bg-slate-900/70 border-white/20 dark:border-slate-700/30 backdrop-blur-md shadow-lg shadow-black/10 p-4 sm:p-5 transition-transform duration-150 ease-out hover:-translate-y-[1px] hover:shadow-xl motion-reduce:transition-none motion-reduce:hover:transform-none">
                <div className="absolute left-4 top-3 h-1 w-10 rounded-full bg-gradient-to-r from-purple-500 to-violet-500" aria-hidden="true" />
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Partagés</p>
                    <p className="mt-1 text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">{communityThemes}</p>
                  </div>
                  <div className="shrink-0 h-8 w-8 rounded-xl bg-purple-500/10 dark:bg-purple-400/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Carte Moyenne */}
              <div className="group relative rounded-2xl border bg-white/80 dark:bg-slate-900/70 border-white/20 dark:border-slate-700/30 backdrop-blur-md shadow-lg shadow-black/10 p-4 sm:p-5 transition-transform duration-150 ease-out hover:-translate-y-[1px] hover:shadow-xl motion-reduce:transition-none motion-reduce:hover:transform-none">
                <div className="absolute left-4 top-3 h-1 w-10 rounded-full bg-gradient-to-r from-orange-500 to-amber-500" aria-hidden="true" />
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Moyenne</p>
                    <p className="mt-1 text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                      {totalThemes > 0 ? Math.round(totalCards / totalThemes) : 0}
                    </p>
                  </div>
                  <div className="shrink-0 h-8 w-8 rounded-xl bg-orange-500/10 dark:bg-orange-400/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
                    <Target className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Actions rapides */}
          <section aria-labelledby="quick-actions-title" className="mb-6 sm:mb-8">
            <h2 id="quick-actions-title" className="sr-only">Actions rapides</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <Link 
                to="/app/themes/new"
                className="min-h-[44px] rounded-xl border bg-white/50 dark:bg-slate-900/40 border-white/20 dark:border-slate-700/30 backdrop-blur-md shadow-md px-3 py-3 sm:px-3 sm:py-2 inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-slate-900/60 focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
              >
                <span className="h-5 w-5 rounded-lg bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Plus className="h-3 w-3" />
                </span>
                <span className="truncate text-sm">Nouveau thème</span>
              </Link>

              <Link 
                to="/app/themes"
                className="min-h-[44px] rounded-xl border bg-white/50 dark:bg-slate-900/40 border-white/20 dark:border-slate-700/30 backdrop-blur-md shadow-md px-3 py-3 sm:px-3 sm:py-2 inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-slate-900/60 focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
              >
                <span className="h-5 w-5 rounded-lg bg-green-500/10 dark:bg-green-400/10 flex items-center justify-center text-green-600 dark:text-green-400">
                  <BookOpen className="h-3 w-3" />
                </span>
                <span className="truncate text-sm">Mes thèmes</span>
              </Link>

              <Link 
                to="/app/community"
                className="min-h-[44px] rounded-xl border bg-white/50 dark:bg-slate-900/40 border-white/20 dark:border-slate-700/30 backdrop-blur-md shadow-md px-3 py-3 sm:px-3 sm:py-2 inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-slate-900/60 focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
              >
                <span className="h-5 w-5 rounded-lg bg-purple-500/10 dark:bg-purple-400/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Users className="h-3 w-3" />
                </span>
                <span className="truncate text-sm">Communauté</span>
              </Link>

              <Link 
                to="/app/lessons"
                className="min-h-[44px] rounded-xl border bg-white/50 dark:bg-slate-900/40 border-white/20 dark:border-slate-700/30 backdrop-blur-md shadow-md px-3 py-3 sm:px-3 sm:py-2 inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-slate-900/60 focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
              >
                <span className="h-5 w-5 rounded-lg bg-orange-500/10 dark:bg-orange-400/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <Star className="h-3 w-3" />
                </span>
                <span className="truncate text-sm">Leçons</span>
              </Link>

              <Link 
                to="/app/account"
                className="min-h-[44px] rounded-xl border bg-white/50 dark:bg-slate-900/40 border-white/20 dark:border-slate-700/30 backdrop-blur-md shadow-md px-3 py-3 sm:px-3 sm:py-2 inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-slate-900/60 focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
              >
                <span className="h-5 w-5 rounded-lg bg-slate-500/10 dark:bg-slate-400/10 flex items-center justify-center text-slate-600 dark:text-slate-400">
                  <Target className="h-3 w-3" />
                </span>
                <span className="truncate text-sm">Compte</span>
              </Link>

              <Link 
                to="/app/settings"
                className="min-h-[44px] rounded-xl border bg-white/50 dark:bg-slate-900/40 border-white/20 dark:border-slate-700/30 backdrop-blur-md shadow-md px-3 py-3 sm:px-3 sm:py-2 inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-slate-900/60 focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
              >
                <span className="h-5 w-5 rounded-lg bg-gray-500/10 dark:bg-gray-400/10 flex items-center justify-center text-gray-600 dark:text-gray-400">
                  <Zap className="h-3 w-3" />
                </span>
                <span className="truncate text-sm">Paramètres</span>
              </Link>
            </div>
          </section>

          {/* Activité récente */}
          <section aria-labelledby="activity-title" className="mb-8">
            <h2 id="activity-title" className="text-base font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
              Activité récente
            </h2>
            <div className="divide-y divide-gray-200 dark:divide-slate-800 rounded-2xl border bg-white/80 dark:bg-slate-900/70 border-white/20 dark:border-slate-700/30 backdrop-blur-md shadow-lg shadow-black/10">
              {recentThemes.length === 0 ? (
                <div className="grid grid-cols-[auto,1fr,auto] items-center gap-4 py-6 px-4">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-gray-900 dark:text-white">Aucune activité récente</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Commencez par créer votre premier thème.</p>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">—</span>
                </div>
              ) : (
                recentThemes.map((theme) => (
                  <div key={theme.id} className="grid grid-cols-[auto,1fr,auto] items-center gap-4 py-3 px-4">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center" aria-hidden="true">
                      <BookOpen className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-gray-900 dark:text-white">{theme.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{theme.cardCount} cartes</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      theme.shareStatus === 'community' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {theme.shareStatus === 'community' ? 'Partagé' : 'Privé'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </section>
    </>
  )
}
