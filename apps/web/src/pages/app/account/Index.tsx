import { motion } from 'framer-motion'
import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageMeta from '../../../components/seo/PageMeta'
import { useAuth } from '../../../hooks/useAuth'
import { useSubscription } from '../../../contexts/SubscriptionContext'

function getInitials(name?: string | null) {
  if (!name || !name.trim()) return 'A'
  const parts = name.trim().split(/\s+/)
  const initials = [parts[0]?.[0], parts[1]?.[0]].filter(Boolean).join('')
  return initials.toUpperCase() || name.slice(0, 2).toUpperCase()
}

export default function AccountIndex() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { plan, upgradeToPremium } = useSubscription()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-purple/60 via-white to-pastel-rose/40">
      <PageMeta
        title="Profil — Ankilang"
        description="Gérez les informations essentielles de votre compte et accédez à la version Pro."
      />

      <header className="container mx-auto px-4 sm:px-6 pt-10 pb-6 text-center">
        <button
          onClick={() => navigate('/app')}
          className="inline-flex items-center gap-2 text-sm text-dark-charcoal/70 transition-colors hover:text-dark-charcoal"
        >
          <span aria-hidden>←</span>
          Retour à l'application
        </button>
        <h1 className="mt-4 font-display text-3xl sm:text-4xl font-bold text-dark-charcoal">
          Mon profil
        </h1>
        <p className="mt-2 text-dark-charcoal/70">
          Informations essentielles de votre compte et accès rapide à Ankilang Pro.
        </p>
      </header>

      <main className="container mx-auto px-4 sm:px-6 pb-12">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mx-auto max-w-xl rounded-3xl bg-white/95 p-8 shadow-xl backdrop-blur border border-white/60"
        >
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pastel-purple to-pastel-rose text-2xl font-bold text-white">
              {getInitials(user?.name || user?.email)}
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold text-dark-charcoal">
                {user?.name || 'Utilisateur Ankilang'}
              </h2>
              <p className="mt-1 text-sm text-dark-charcoal/70">{user?.email}</p>
            </div>

            <div className="w-full rounded-xl border border-pastel-purple/40 bg-pastel-purple/10 px-4 py-3 text-sm text-dark-charcoal">
              <span className="font-semibold">Plan actuel :</span>{' '}
              {plan === 'premium' ? 'Premium' : 'Free'}
            </div>

            <div className="flex w-full flex-col gap-3">
              <button
                onClick={upgradeToPremium}
                className="w-full rounded-xl bg-gradient-to-r from-pastel-purple to-pastel-rose px-4 py-3 font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-pastel-purple"
              >
                Passer en version Pro
              </button>

              <button
                onClick={handleLogout}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-300"
              >
                <LogOut className="h-4 w-4" />
                Se déconnecter
              </button>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  )
}
