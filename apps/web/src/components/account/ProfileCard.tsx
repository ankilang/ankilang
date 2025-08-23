import type { UserProfile } from '../../data/mockAccount'
import SubscriptionBadge from './SubscriptionBadge'

interface ProfileCardProps {
  user: UserProfile
  subscription: {
    plan: 'free' | 'pro'
    status: 'active' | 'past_due' | 'canceled'
  }
}

export default function ProfileCard({ user, subscription }: ProfileCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={`Avatar de ${user.displayName}`}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-lg">
                {getInitials(user.displayName)}
              </span>
            </div>
          )}
        </div>

        {/* Informations */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 sm:gap-6 mb-2">
            <h3 className="text-xl font-semibold text-gray-900 truncate">
              {user.displayName}
            </h3>
            <SubscriptionBadge plan={subscription.plan} status={subscription.status} />
          </div>
          
          <p className="text-gray-600 mb-1">
            {user.email}
          </p>
          
          <p className="text-sm text-gray-500 mb-2">
            @{user.username}
          </p>

          {/* Bio */}
          {user.bio && (
            <p className="text-gray-700 mb-2">
              {user.bio}
            </p>
          )}

          {/* Lieu */}
          {user.location && (
            <p className="text-sm text-gray-500 mb-2">
              📍 {user.location}
            </p>
          )}
          
          <p className="text-sm text-gray-500">
            Membre depuis le {formatDate(user.createdAt)}
          </p>
        </div>
      </div>
    </div>
  )
}
