import { useState } from 'react'
import { getAccount, updateSubscription } from '../../../data/mockAccount'
import ProfileCard from '../../../components/account/ProfileCard'
import ProfileForm from '../../../components/account/ProfileForm'
import SubscriptionBadge from '../../../components/account/SubscriptionBadge'
import SecurityForm from '../../../components/account/SecurityForm'
import SessionsList from '../../../components/account/SessionsList'
import DataControls from '../../../components/account/DataControls'
import ConfirmModal from '../../../components/ui/ConfirmModal'
import PageMeta from '../../../components/seo/PageMeta'

export default function AccountIndex() {
  const [account, setAccount] = useState(getAccount())
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const isOffline = !navigator.onLine

  const handleProfileUpdate = (updatedUser: any) => {
    setAccount(prev => ({ ...prev, user: updatedUser }))
    setIsEditingProfile(false)
  }

  const handleSessionsUpdate = (sessions: any[]) => {
    setAccount(prev => ({ ...prev, sessions }))
  }

  const handleCancelSubscription = () => {
    const updatedAccount = updateSubscription({ status: 'canceled', plan: 'free' })
    setAccount(updatedAccount)
    setMessage({ type: 'success', text: 'Abonnement annulé avec succès' })
  }

  const handleEmailChange = () => {
    console.log('request email change')
    setMessage({ type: 'success', text: 'Demande de changement d\'email envoyée' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageMeta 
        title="Mon compte — Ankilang" 
        description="Profil, abonnement et préférences de votre compte."
      />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Mon compte</h1>
            <p className="text-gray-600">
              Gérez votre profil, votre abonnement et vos paramètres de sécurité
            </p>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Bandeau hors-ligne */}
          {isOffline && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-yellow-800 text-sm font-medium">
                    Mode hors-ligne activé. Certaines fonctionnalités peuvent être limitées.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Message de feedback */}
          {message && (
            <div
              aria-live="polite"
              className={`p-4 rounded-lg border ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border-green-200' 
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Section Profil */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Profil</h2>
            
            {!isEditingProfile ? (
              <div className="space-y-4">
                <ProfileCard user={account.user} subscription={account.subscription} />
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                >
                  Modifier le profil
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <ProfileForm user={account.user} onUpdate={handleProfileUpdate} />
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-3 sm:py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:outline-none"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>

          {/* Section Abonnement */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Abonnement</h2>
            
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <SubscriptionBadge 
                  plan={account.subscription.plan} 
                  status={account.subscription.status}
                  renewsAt={account.subscription.renewsAt}
                />
              </div>
              
              {account.subscription.plan === 'pro' && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-4 py-3 sm:py-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
                >
                  Annuler l'abonnement
                </button>
              )}
            </div>
          </div>

          {/* Section Sécurité */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Sécurité</h2>
            
            <div className="space-y-6">
              {/* Email */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Adresse email</h3>
                  <p className="text-sm text-gray-500">{account.user.email}</p>
                </div>
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 transition-colors rounded-md focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                >
                  Modifier
                </button>
              </div>

              {/* Changement de mot de passe */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Changer le mot de passe</h3>
                <SecurityForm />
              </div>
            </div>
          </div>

          {/* Section Sessions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Sessions actives</h2>
            <SessionsList 
              sessions={account.sessions} 
              onSessionsUpdate={handleSessionsUpdate}
            />
          </div>

          {/* Section Données & Confidentialité */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Données & confidentialité</h2>
            <DataControls accountId={account.user.id} />
          </div>
        </div>
      </div>

      {/* Modales */}
      <ConfirmModal
        open={showEmailModal}
        title="Changer l'adresse email"
        description="Un email de confirmation sera envoyé à votre nouvelle adresse."
        confirmLabel="Envoyer la demande"
        onConfirm={handleEmailChange}
        onClose={() => setShowEmailModal(false)}
      />

      <ConfirmModal
        open={showCancelModal}
        title="Annuler l'abonnement"
        description="Êtes-vous sûr de vouloir annuler votre abonnement Pro ? Vous perdrez l'accès aux fonctionnalités premium."
        confirmLabel="Annuler l'abonnement"
        isDanger={true}
        onConfirm={handleCancelSubscription}
        onClose={() => setShowCancelModal(false)}
      />
    </div>
  )
}
