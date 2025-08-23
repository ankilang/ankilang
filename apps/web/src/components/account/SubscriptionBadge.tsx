import { Link } from 'react-router-dom'
import type { SubscriptionPlan, SubscriptionStatus } from '../../data/mockAccount'

interface SubscriptionBadgeProps {
  plan: SubscriptionPlan
  status: SubscriptionStatus
  renewsAt?: string
}

export default function SubscriptionBadge({ plan, status, renewsAt }: SubscriptionBadgeProps) {
  const getBadgeStyles = () => {
    if (plan === 'pro') {
      return 'bg-purple-100 text-purple-800 border-purple-200'
    }
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getStatusText = () => {
    switch (status) {
      case 'active':
        return plan === 'pro' ? 'Actif' : 'Gratuit'
      case 'past_due':
        return 'En retard'
      case 'canceled':
        return 'Annulé'
      default:
        return 'Inconnu'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getBadgeStyles()}`}>
          {plan === 'pro' ? 'Pro' : 'Gratuit'}
        </span>
        <p className="text-sm text-gray-600">
          {getStatusText()}
        </p>
        {renewsAt && plan === 'pro' && (
          <p className="text-sm text-gray-500">
            Renouvellement le {formatDate(renewsAt)}
          </p>
        )}
      </div>

      {plan === 'free' && (
        <Link
          to="/abonnement"
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
        >
          Passer à Pro
        </Link>
      )}
    </div>
  )
}
