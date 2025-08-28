import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Settings, ArrowLeft, Sparkles, Wifi, 
  WifiOff, CheckCircle, AlertTriangle
} from 'lucide-react'
import { getAccount } from '../../../data/mockAccount'
import PreferencesForm from '../../../components/settings/PreferencesForm'
import PageMeta from '../../../components/seo/PageMeta'
import { useNavigate } from 'react-router-dom'

export default function SettingsIndex() {
  const navigate = useNavigate()
  const [account, setAccount] = useState(getAccount())
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const isOffline = !navigator.onLine

  const handlePreferencesUpdate = (updatedPreferences: any) => {
    setAccount(prev => ({ ...prev, preferences: updatedPreferences }))
    setMessage({ type: 'success', text: 'Préférences mises à jour avec succès' })
    
    // Auto-hide message after 3 seconds
    setTimeout(() => setMessage(null), 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-green via-pastel-blue/30 to-pastel-purple/20">
      <PageMeta 
        title="Paramètres — Ankilang" 
        description="Préférences d'affichage et d'étude."
      />
      
      {/* Éléments décoratifs */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-pastel-blue/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-80 h-80 bg-pastel-green/30 rounded-full blur-2xl pointer-events-none" />
      
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
                Paramètres
              </h1>
              <p className="font-sans text-dark-charcoal/70 mt-1">
                Personnalisez votre expérience d'apprentissage
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Message de notification */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`relative bg-white/60 backdrop-blur-md rounded-2xl shadow-xl border p-4 ${
                  message.type === 'success' 
                    ? 'border-green-200/40 bg-green-50/60' 
                    : 'border-red-200/40 bg-red-50/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  )}
                  <span className={`font-sans font-medium ${
                    message.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {message.text}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bandeau hors-ligne */}
          <AnimatePresence>
            {isOffline && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="relative bg-yellow-50/60 backdrop-blur-md rounded-3xl shadow-xl border border-yellow-200/40 p-6 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200/20 rounded-full blur-2xl" />
                
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100/60 rounded-xl flex items-center justify-center">
                      <WifiOff className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-sans font-semibold text-yellow-800">
                        Mode hors-ligne activé
                      </h3>
                      <p className="font-sans text-sm text-yellow-700 mt-1">
                        Certaines fonctionnalités peuvent être limitées. Vos préférences sont sauvegardées localement.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Section des préférences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative bg-white/60 backdrop-blur-md rounded-3xl shadow-xl border border-white/40 p-8 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-pastel-green/20 rounded-full blur-2xl" />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-pastel-green/20 rounded-xl flex items-center justify-center">
                  <Settings className="w-6 h-6 text-pastel-green" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-dark-charcoal">
                    Préférences
                  </h2>
                  <p className="font-sans text-dark-charcoal/70 mt-1">
                    Configurez l'interface et vos habitudes d'étude
                  </p>
                </div>
              </div>

              <PreferencesForm 
                preferences={account.preferences} 
                onUpdate={handlePreferencesUpdate} 
              />
            </div>
          </motion.div>

          {/* Informations supplémentaires */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative bg-blue-50/60 backdrop-blur-md rounded-3xl shadow-xl border border-blue-200/40 p-8 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl" />
            
            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100/60 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-sans font-semibold text-blue-800 mb-2">
                    Sauvegarde automatique
                  </h3>
                  <p className="font-sans text-sm text-blue-700">
                    Toutes vos préférences sont sauvegardées automatiquement et synchronisées 
                    entre vos appareils. Elles restent disponibles même en mode hors-ligne.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Indicateur de statut de connexion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative bg-white/40 backdrop-blur-sm rounded-2xl border border-white/30 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  isOffline ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <span className="font-sans text-sm text-dark-charcoal/70">
                  {isOffline ? 'Mode hors-ligne' : 'Connecté'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isOffline ? (
                  <WifiOff className="w-4 h-4 text-yellow-500" />
                ) : (
                  <Wifi className="w-4 h-4 text-green-500" />
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
