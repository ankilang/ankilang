import { motion } from 'framer-motion'
import { Edit3, Crown, Calendar, Mail, User, Sparkles } from 'lucide-react'
import type { UserProfile } from '../../data/mockAccount'

interface ProfileCardProps {
  user: UserProfile
  subscription: {
    plan: 'free' | 'pro'
    status: 'active' | 'past_due' | 'canceled'
  }
  onEdit?: () => void
}

export default function ProfileCard({ user, subscription, onEdit }: ProfileCardProps) {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative bg-white/60 backdrop-blur-md rounded-3xl shadow-xl border border-white/40 p-8 overflow-hidden"
    >
      {/* Éléments décoratifs */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-pastel-purple/20 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-pastel-rose/30 rounded-full blur-xl" />
      
      <div className="relative">
        {/* Header avec bouton d'édition */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-pastel-purple" />
            <h2 className="font-display text-2xl font-bold text-dark-charcoal">
              Profil
            </h2>
          </div>
          
          {onEdit && (
            <motion.button
              onClick={onEdit}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/40 text-dark-charcoal hover:bg-white transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span className="font-sans text-sm font-medium">Modifier</span>
            </motion.button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <motion.div 
            className="flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`Avatar de ${user.displayName}`}
                className="w-20 h-20 rounded-2xl object-cover shadow-lg border-2 border-white/60"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-pastel-purple to-pastel-rose rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/60">
                <span className="font-display text-2xl font-bold text-white">
                  {getInitials(user.displayName)}
                </span>
              </div>
            )}
          </motion.div>

          {/* Informations utilisateur */}
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="font-display text-2xl font-bold text-dark-charcoal mb-1">
                {user.displayName}
              </h3>
              <div className="flex items-center gap-2 text-dark-charcoal/70">
                <Mail className="w-4 h-4" />
                <span className="font-sans text-sm">{user.email}</span>
              </div>
            </div>

            {/* Informations détaillées */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-pastel-purple" />
                  <span className="font-sans text-xs font-medium text-dark-charcoal/60 uppercase tracking-wide">
                    Nom d'utilisateur
                  </span>
                </div>
                <p className="font-sans text-sm font-medium text-dark-charcoal">
                  {user.username}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-pastel-green" />
                  <span className="font-sans text-xs font-medium text-dark-charcoal/60 uppercase tracking-wide">
                    Membre depuis
                  </span>
                </div>
                <p className="font-sans text-sm font-medium text-dark-charcoal">
                  {formatDate(user.createdAt)}
                </p>
              </motion.div>
            </div>

            {/* Badge d'abonnement intégré */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex"
            >
              {subscription.plan === 'pro' ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-lg">
                  <Crown className="w-4 h-4 text-white" />
                  <span className="font-sans text-sm font-bold text-white">
                    Membre Premium
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl border border-gray-200">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="font-sans text-sm font-medium text-gray-700">
                    Membre Gratuit
                  </span>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
