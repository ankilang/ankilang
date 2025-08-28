import { Link } from 'react-router-dom'
import { Crown } from 'lucide-react'
import { useSubscription } from '../../contexts/SubscriptionContext'

interface ProOnlyProps {
  children: React.ReactNode
}

export default function ProOnly({ children }: ProOnlyProps) {
  const { plan } = useSubscription()
  const isPro = plan !== 'free'

  if (isPro) return <>{children}</>

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-lg border-2 border-pastel-purple p-8 text-center">
        <div className="flex items-center justify-center mb-4 text-purple-600">
          <Crown className="w-10 h-10" />
        </div>
        <h1 className="font-playfair text-3xl font-bold text-dark-charcoal mb-3">
          Contenu réservé aux abonnés Pro
        </h1>
        <p className="font-inter text-dark-charcoal/70 mb-6">
          Cette section (Communauté et Leçons) est accessible avec un abonnement Pro.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/abonnement" className="btn-primary">
            Passer en Pro
          </Link>
          <Link to="/app" className="btn-secondary">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}

