import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Plus, ArrowDown } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import PageMeta from '../../components/seo/PageMeta'
import ActionCard from '../../components/dashboard/ActionCard'
import { useAuth } from '../../hooks/useAuth'
import { themesService } from '../../services/themes.service'

export default function Dashboard() {
  const { user } = useAuth()

  const { data: themes, isLoading, isError } = useQuery({
    queryKey: ['themes-dashboard', user?.$id],
    queryFn: () => {
      if (!user?.$id) throw new Error('Utilisateur non connecté')
      return themesService.getUserThemes(user.$id)
    },
    enabled: Boolean(user?.$id),
    staleTime: 1000 * 60 * 5,
  })

  const sortedThemes = themes ? [...themes] : []
  const lastTheme = sortedThemes.sort((a, b) => b.$createdAt.localeCompare(a.$createdAt))[0] || null
  const mostCardsTheme = themes?.reduce<typeof themes[number] | null>((max, current) => {
    const currentCount = current.cardCount || 0
    const maxCount = max?.cardCount || 0
    return currentCount > maxCount ? current : max
  }, null) ?? null

  const firstName = user?.name?.split(' ')[0] || 'Ankilang'
  const username = firstName

  return (
    <>
      <PageMeta
        title="Tableau de bord — Ankilang"
        description="Vue d'ensemble de vos thèmes et statistiques d'apprentissage."
      />

      <section className="bg-gradient-to-br from-pastel-green/90 to-pastel-purple/60">
        <div className="w-full px-6 lg:px-12 py-16">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl bg-white/85 backdrop-blur-sm shadow-xl border border-white/60 px-6 sm:px-10 py-10"
            >
              <div className="flex flex-col gap-6">
                <div>
                  <h1 className="font-playfair text-4xl sm:text-5xl font-bold text-dark-charcoal">
                    Bonjour, <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">{username}</span> 👋
                  </h1>
                  <p className="mt-3 text-dark-charcoal/70 text-base sm:text-lg">
                    Retrouvez vos créations et poursuivez l'ajout de nouvelles cartes.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link to="/app/themes/new" className="btn-primary">Créer un thème</Link>
                  <Link to="/app/themes" className="btn-secondary">Voir mes thèmes</Link>
                </div>

                <div className="space-y-4">
                  <h2 className="text-sm uppercase tracking-wide text-purple-600 font-semibold">
                    À continuer
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DashboardThemeCard
                      title="Dernier thème créé"
                      theme={lastTheme}
                      isLoading={isLoading}
                      isError={isError}
                      emptyLabel="Aucun thème pour le moment"
                    />
                    <DashboardThemeCard
                      title="Plus grand nombre de cartes"
                      theme={mostCardsTheme}
                      isLoading={isLoading}
                      isError={isError}
                      emptyLabel="Ajoutez des cartes pour voir ce thème ici"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="w-full px-6 lg:px-12">
          <div className="max-w-5xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-playfair text-4xl font-semibold text-dark-charcoal mb-12 text-center"
            >
              Actions rapides
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ActionCard
                icon={Plus}
                title="Nouveau thème"
                subtitle="Créer des flashcards"
                to="/app/themes/new"
                color="purple"
                delay={0.2}
              />
              <ActionCard
                icon={ArrowDown}
                title="Exporter vers Anki"
                subtitle="Générer un paquet .apkg"
                to="/app/themes"
                color="green"
                delay={0.3}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

interface DashboardThemeCardProps {
  title: string
  theme?: Awaited<ReturnType<typeof themesService.getUserThemes>>[number] | null
  isLoading: boolean
  isError: boolean
  emptyLabel: string
}

function DashboardThemeCard({ title, theme, isLoading, isError, emptyLabel }: DashboardThemeCardProps) {
  return (
    <div className="rounded-2xl border border-pastel-purple/40 bg-white/90 px-5 py-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-purple-600 font-semibold">{title}</div>
      {isLoading ? (
        <div className="mt-3 h-16 bg-pastel-purple/20 rounded-lg animate-pulse" />
      ) : isError ? (
        <p className="mt-3 text-sm text-red-600">Impossible de charger ce thème.</p>
      ) : theme ? (
        <div className="mt-3">
          <div className="font-display text-lg text-dark-charcoal">{theme.name}</div>
          <div className="text-sm text-dark-charcoal/70">
            {(theme.cardCount || 0)} carte{(theme.cardCount || 0) > 1 ? 's' : ''}
          </div>
          <Link to={`/app/themes/${theme.$id}`} className="mt-2 inline-block text-sm text-purple-600 hover:text-purple-800">
            Ouvrir le thème →
          </Link>
        </div>
      ) : (
        <p className="mt-3 text-sm text-dark-charcoal/60">{emptyLabel}</p>
      )}
    </div>
  )
}
