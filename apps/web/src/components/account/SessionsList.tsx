import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Smartphone, Monitor, Tablet, MapPin, 
  Calendar, Trash2, Shield, AlertTriangle,
  CheckCircle, Sparkles, Globe, Wifi,
  Chrome, Activity,
  Lock, Eye, Clock
} from 'lucide-react'

interface Session {
  id: string
  device: string
  browser: string
  ip: string
  lastActive: string
  current?: boolean
  // Propriétés optionnelles pour l'enrichissement
  deviceType?: 'desktop' | 'mobile' | 'tablet'
  location?: string
  isSecure?: boolean
  loginTime?: string
}

interface SessionsListProps {
  sessions: Session[]
  onSessionsUpdate: (sessions: Session[]) => void
}

export default function SessionsList({ sessions, onSessionsUpdate }: SessionsListProps) {
  const [isRevoking, setIsRevoking] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState<string | null>(null)

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType) {
      case 'mobile':
        return Smartphone
      case 'tablet':
        return Tablet
      default:
        return Monitor
    }
  }

  const getBrowserIcon = (browser: string) => {
    switch (browser.toLowerCase()) {
      case 'chrome':
        return Chrome
      default:
        return Globe
    }
  }

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'À l\'instant'
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes}min`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `Il y a ${diffInHours}h`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `Il y a ${diffInDays}j`
    
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short',
      year: diffInDays > 365 ? 'numeric' : undefined
    })
  }

  const formatLoginTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleRevokeSession = async (sessionId: string) => {
    setIsRevoking(sessionId)
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const updatedSessions = sessions.filter(session => session.id !== sessionId)
    onSessionsUpdate(updatedSessions)
    
    setIsRevoking(null)
    setShowConfirm(null)
  }

  const handleRevokeAllOthers = async () => {
    setIsRevoking('all')
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const currentSession = sessions.find(session => session.current)
    onSessionsUpdate(currentSession ? [currentSession] : [])
    
    setIsRevoking(null)
    setShowConfirm(null)
  }

  const otherSessions = sessions.filter(session => !session.current)
  const currentSession = sessions.find(session => session.current)
  const activeSessions = sessions.filter(session => {
    const lastActive = new Date(session.lastActive)
    const now = new Date()
    const diffInHours = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60)
    return diffInHours < 24
  }).length

  return (
    <div className="space-y-6">
      {/* Statistiques des sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-white/60 backdrop-blur-md rounded-3xl shadow-xl border border-white/40 p-8 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-pastel-green/20 rounded-full blur-2xl" />
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-6 h-6 text-pastel-green" />
            <h3 className="font-display text-xl font-bold text-dark-charcoal">
              Activité des sessions
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/30 text-center"
            >
              <Shield className="w-6 h-6 mx-auto mb-2 text-pastel-green" />
              <div className="font-display text-lg font-bold text-dark-charcoal">
                {sessions.length}
              </div>
              <div className="font-sans text-xs text-dark-charcoal/70">
                Sessions totales
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/30 text-center"
            >
              <Wifi className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <div className="font-display text-lg font-bold text-dark-charcoal">
                {activeSessions}
              </div>
              <div className="font-sans text-xs text-dark-charcoal/70">
                Actives (24h)
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/30 text-center"
            >
              <Lock className="w-6 h-6 mx-auto mb-2 text-green-500" />
                              <div className="font-display text-lg font-bold text-dark-charcoal">
                  {sessions.filter(s => s.isSecure !== false).length}
                </div>
              <div className="font-sans text-xs text-dark-charcoal/70">
                Sécurisées
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/30 text-center"
            >
              <Globe className="w-6 h-6 mx-auto mb-2 text-purple-500" />
              <div className="font-display text-lg font-bold text-dark-charcoal">
                {new Set(sessions.map(s => s.location?.split(',')[1]?.trim()).filter(Boolean)).size}
              </div>
              <div className="font-sans text-xs text-dark-charcoal/70">
                Pays différents
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Session actuelle */}
      {currentSession && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative bg-white/60 backdrop-blur-md rounded-3xl shadow-xl border border-white/40 p-8 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-pastel-purple/20 rounded-full blur-2xl" />
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle className="w-6 h-6 text-pastel-purple" />
              <h3 className="font-display text-xl font-bold text-dark-charcoal">
                Session actuelle
              </h3>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-pastel-purple/20 rounded-xl flex items-center justify-center">
                {(() => {
                  const DeviceIcon = getDeviceIcon(currentSession.deviceType)
                  return <DeviceIcon className="w-6 h-6 text-pastel-purple" />
                })()}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-sans text-lg font-semibold text-dark-charcoal">
                    {currentSession.device}
                  </h4>
                  <div className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                    <span className="font-sans text-xs font-medium">Actuelle</span>
                  </div>
                  {currentSession.isSecure !== false && (
                    <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      <span className="font-sans text-xs font-medium">Sécurisée</span>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-dark-charcoal/70">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const BrowserIcon = getBrowserIcon(currentSession.browser)
                      return <BrowserIcon className="w-4 h-4" />
                    })()}
                    <span className="font-sans">{currentSession.browser}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="font-sans">{currentSession.location || 'Localisation inconnue'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-sans">Connecté le {formatLoginTime(currentSession.loginTime || currentSession.lastActive)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-sans">{formatLastActive(currentSession.lastActive)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Autres sessions */}
      {otherSessions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative bg-white/60 backdrop-blur-md rounded-3xl shadow-xl border border-white/40 p-8 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-pastel-rose/20 rounded-full blur-2xl" />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-pastel-rose" />
                <h3 className="font-display text-xl font-bold text-dark-charcoal">
                  Autres sessions ({otherSessions.length})
                </h3>
              </div>
              
              {otherSessions.length > 1 && (
                <motion.button
                  onClick={() => setShowConfirm('all')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 font-sans text-sm font-medium text-red-600 bg-red-50/60 backdrop-blur-sm rounded-xl border border-red-200/40 hover:bg-red-100/60 transition-colors"
                >
                  Révoquer toutes
                </motion.button>
              )}
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {otherSessions.map((session, index) => {
                  const DeviceIcon = getDeviceIcon(session.deviceType)
                  const BrowserIcon = getBrowserIcon(session.browser)
                  const isRevokingThis = isRevoking === session.id
                  const showingDetails = showDetails === session.id
                  
                  return (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/30 overflow-hidden"
                    >
                      <div className="flex items-start gap-4 p-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <DeviceIcon className="w-5 h-5 text-gray-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-sans text-base font-medium text-dark-charcoal">
                              {session.device}
                            </h4>
                            {session.isSecure === false && (
                              <div className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                                <span className="font-sans text-xs font-medium">Non sécurisée</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-dark-charcoal/70">
                            <div className="flex items-center gap-2">
                              <BrowserIcon className="w-3 h-3" />
                              <span className="font-sans">{session.browser}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3" />
                              <span className="font-sans">{session.location || 'Localisation inconnue'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              <span className="font-sans">{formatLoginTime(session.loginTime || session.lastActive)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              <span className="font-sans">{formatLastActive(session.lastActive)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <motion.button
                            onClick={() => setShowDetails(showingDetails ? null : session.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 text-gray-500 hover:bg-gray-100/60 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          
                          {showConfirm === session.id ? (
                            <div className="flex gap-2">
                              <motion.button
                                onClick={() => setShowConfirm(null)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-3 py-1 font-sans text-xs text-gray-600 bg-white/60 rounded-lg border border-white/40"
                              >
                                Annuler
                              </motion.button>
                              <motion.button
                                onClick={() => handleRevokeSession(session.id)}
                                disabled={isRevokingThis}
                                whileHover={{ scale: isRevokingThis ? 1 : 1.05 }}
                                whileTap={{ scale: isRevokingThis ? 1 : 0.95 }}
                                className="px-3 py-1 font-sans text-xs text-white bg-red-500 rounded-lg disabled:opacity-50"
                              >
                                {isRevokingThis ? 'Révocation...' : 'Confirmer'}
                              </motion.button>
                            </div>
                          ) : (
                            <motion.button
                              onClick={() => setShowConfirm(session.id)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 text-red-500 hover:bg-red-50/60 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          )}
                        </div>
                      </div>

                      {/* Détails étendus */}
                      <AnimatePresence>
                        {showingDetails && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t border-white/20 p-4 bg-white/20"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-sans font-medium text-dark-charcoal/60">Adresse IP :</span>
                                <span className="font-mono text-dark-charcoal ml-2">{session.ip}</span>
                              </div>
                              <div>
                                <span className="font-sans font-medium text-dark-charcoal/60">Sécurité :</span>
                                <span className={`ml-2 ${session.isSecure !== false ? 'text-green-600' : 'text-orange-600'}`}>
                                  {session.isSecure !== false ? 'HTTPS' : 'HTTP'}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}

      {/* Confirmation pour révoquer toutes les sessions */}
      <AnimatePresence>
        {showConfirm === 'all' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative bg-red-50/60 backdrop-blur-md rounded-3xl shadow-xl border border-red-200/40 p-8 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-200/20 rounded-full blur-2xl" />
            
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h3 className="font-display text-xl font-bold text-red-800">
                  Révoquer toutes les autres sessions
                </h3>
              </div>
              
              <p className="font-sans text-sm text-red-700 mb-6">
                Cette action déconnectera tous vos autres appareils ({otherSessions.length} sessions). 
                Vous devrez vous reconnecter sur chacun d'eux avec vos identifiants.
              </p>
              
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setShowConfirm(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 font-sans font-medium text-gray-700 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 hover:bg-white/80 transition-colors"
                >
                  Annuler
                </motion.button>
                
                <motion.button
                  onClick={handleRevokeAllOthers}
                  disabled={isRevoking === 'all'}
                  whileHover={{ scale: isRevoking === 'all' ? 1 : 1.02 }}
                  whileTap={{ scale: isRevoking === 'all' ? 1 : 0.98 }}
                  className="px-4 py-2 font-sans font-semibold text-white bg-red-600 rounded-xl shadow-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isRevoking === 'all' ? (
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Révocation...
                    </div>
                  ) : (
                    `Révoquer ${otherSessions.length} sessions`
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message si aucune autre session */}
      {otherSessions.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative bg-white/60 backdrop-blur-md rounded-3xl shadow-xl border border-white/40 p-8 overflow-hidden text-center"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-pastel-green/20 rounded-full blur-2xl" />
          
          <div className="relative">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-pastel-green" />
            <h3 className="font-display text-lg font-bold text-dark-charcoal mb-2">
              Sécurité optimale
            </h3>
            <p className="font-sans text-sm text-dark-charcoal/70">
              Vous n'êtes connecté que sur cet appareil. Votre compte est parfaitement sécurisé.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
