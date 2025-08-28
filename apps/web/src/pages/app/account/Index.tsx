import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Settings, Shield, Database, 
  CheckCircle, AlertTriangle,
  ArrowLeft
} from 'lucide-react'
import { getAccount, updateSubscription } from '../../../data/mockAccount'
import ProfileCard from '../../../components/account/ProfileCard'
import ProfileForm from '../../../components/account/ProfileForm'
import SubscriptionBadge from '../../../components/account/SubscriptionBadge'
import SecurityForm from '../../../components/account/SecurityForm'
import SessionsList from '../../../components/account/SessionsList'
import DataControls from '../../../components/account/DataControls'

import ConfirmModal from '../../../components/ui/ConfirmModal'
import PageMeta from '../../../components/seo/PageMeta'
import { useNavigate } from 'react-router-dom'

export default function AccountIndex() {
  const navigate = useNavigate()
  const [account, setAccount] = useState(getAccount())
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences' | 'data'>('profile')
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const isOffline = !navigator.onLine

  const handleProfileUpdate = (updatedUser: any) => {
    setAccount(prev => ({ ...prev, user: updatedUser }))
    setIsEditingProfile(false)
    setMessage({ type: 'success', text: 'Profil mis à jour avec succès' })
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

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'preferences', label: 'Préférences', icon: Settings },
    { id: 'data', label: 'Données', icon: Database }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-purple via-pastel-green/30 to-pastel-rose/20">
      <PageMeta 
        title="Mon compte — Ankilang" 
        description="Profil, abonnement et préférences de votre compte."
      />
      
      {/* Éléments décoratifs */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-pastel-rose/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-80 h-80 bg-pastel-purple/30 rounded-full blur-2xl pointer-events-none" />
      
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-white/60 backdrop-blur-md border-b border-white/40"
        style={{ paddingTop: 'var(--safe-top, 0px)' }}
      >
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <motion.button
              onClick={() => navigate('/app')}
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/20 text-dark-charcoal hover:bg-white transition-colors"
            >
              <ArrowLeft size={18} />
            </motion.button>
            
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-dark-charcoal">
                Mon Compte
              </h1>
              <p className="font-sans text-dark-charcoal/70 mt-1">
                Gérez votre profil et vos préférences
              </p>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-sans font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-dark-charcoal shadow-lg border border-white/40'
                      : 'bg-white/40 text-dark-charcoal/70 hover:bg-white/60 border border-white/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </motion.button>
              )
            })}
          </div>
        </div>
      </motion.header>

      {/* Message de notification */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-4 z-50"
          >
            <div className={`px-4 py-3 rounded-xl shadow-lg backdrop-blur-md border ${
              message.type === 'success' 
                ? 'bg-green-50/90 border-green-200 text-green-800' 
                : 'bg-red-50/90 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center gap-2">
                {message.type === 'success' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                <span className="font-sans text-sm font-medium">{message.text}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenu principal */}
      <main className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  {/* Carte de profil */}
                  <ProfileCard 
                    user={account.user} 
                    subscription={account.subscription}
                    onEdit={() => setIsEditingProfile(true)}
                  />
                  
                  {/* Formulaire d'édition */}
                  {isEditingProfile && (
                    <ProfileForm
                      user={account.user}
                      onUpdate={handleProfileUpdate}
                    />
                  )}

                  {/* Badge d'abonnement */}
                  <SubscriptionBadge
                    plan={account.subscription.plan}
                    status={account.subscription.status}
                  />
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <SecurityForm />
                  <SessionsList
                    sessions={account.sessions}
                    onSessionsUpdate={handleSessionsUpdate}
                  />
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-white/40">
                  <h3 className="text-lg font-semibold text-dark-charcoal mb-4">Préférences</h3>
                  <p className="text-dark-charcoal/70">Les préférences seront bientôt disponibles.</p>
                </div>
              )}

              {activeTab === 'data' && (
                <DataControls accountId={account.user.id} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Modales */}
      <ConfirmModal
        open={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onConfirm={() => {
          handleEmailChange()
          setShowEmailModal(false)
        }}
        title="Changer d'adresse email"
        description="Êtes-vous sûr de vouloir changer votre adresse email ? Un lien de confirmation sera envoyé à votre nouvelle adresse."
        confirmLabel="Confirmer"
      />

      <ConfirmModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => {
          handleCancelSubscription()
          setShowCancelModal(false)
        }}
        title="Annuler l'abonnement"
        description="Êtes-vous sûr de vouloir annuler votre abonnement ? Vous perdrez l'accès aux fonctionnalités premium à la fin de la période de facturation."
        confirmLabel="Annuler l'abonnement"
        isDanger={true}
      />

      {/* Indicateur hors ligne */}
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 left-4 right-4 bg-orange-100/90 backdrop-blur-md border border-orange-200 rounded-xl p-4 shadow-lg"
        >
          <div className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-sans text-sm font-medium">
              Mode hors ligne - Certaines fonctionnalités peuvent être limitées
            </span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
