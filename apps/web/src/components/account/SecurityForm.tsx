import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, Lock, Mail, Eye, EyeOff, 
  Key, AlertTriangle, CheckCircle, 
  Smartphone, Save, QrCode,
  Copy, RefreshCw, Clock, Globe
} from 'lucide-react'

interface SecurityFormProps {
  onEmailChange: () => void
}

export default function SecurityForm({ onEmailChange }: SecurityFormProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [lastPasswordChange, setLastPasswordChange] = useState('2024-01-15')

  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 25
    if (/[^A-Za-z0-9]/.test(password)) strength += 25
    return strength
  }

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value)
    setPasswordStrength(calculatePasswordStrength(value))
  }

  const validatePasswords = () => {
    const newErrors: Record<string, string> = {}

    if (!currentPassword) {
      newErrors.current = 'Mot de passe actuel requis'
    }

    if (!newPassword) {
      newErrors.new = 'Nouveau mot de passe requis'
    } else if (newPassword.length < 8) {
      newErrors.new = 'Le mot de passe doit contenir au moins 8 caractères'
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirm = 'Les mots de passe ne correspondent pas'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validatePasswords()) return

    setIsChangingPassword(true)
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsChangingPassword(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordStrength(0)
    setLastPasswordChange(new Date().toISOString().split('T')[0] || '')
    alert('Mot de passe modifié avec succès !')
  }

  const handleEnable2FA = async () => {
    if (!twoFactorEnabled) {
      setShowQRCode(true)
      // Simuler la génération de codes de récupération
      const codes = Array.from({ length: 8 }, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      )
      setBackupCodes(codes)
    }
    setTwoFactorEnabled(!twoFactorEnabled)
  }

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'))
    alert('Codes de récupération copiés !')
  }

  const getStrengthColor = (strength: number) => {
    if (strength < 25) return 'bg-red-500'
    if (strength < 50) return 'bg-orange-500'
    if (strength < 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStrengthText = (strength: number) => {
    if (strength < 25) return 'Faible'
    if (strength < 50) return 'Moyen'
    if (strength < 75) return 'Bon'
    return 'Excellent'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const securityScore = 65 + (twoFactorEnabled ? 25 : 0) + (passwordStrength > 75 ? 10 : 0)

  return (
    <div className="space-y-6">
      {/* Score de sécurité */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-white/60 backdrop-blur-md rounded-3xl shadow-xl border border-white/40 p-8 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-pastel-purple/20 rounded-full blur-2xl" />
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-6 h-6 text-pastel-purple" />
            <h3 className="font-display text-xl font-bold text-dark-charcoal">
              Score de sécurité
            </h3>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  className={securityScore > 80 ? 'text-green-500' : securityScore > 60 ? 'text-yellow-500' : 'text-red-500'}
                  initial={{ strokeDasharray: "0 251.2" }}
                  animate={{ strokeDasharray: `${(securityScore / 100) * 251.2} 251.2` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-xl font-bold text-dark-charcoal">
                  {securityScore}%
                </span>
              </div>
            </div>
            
            <div className="flex-1">
              <h4 className="font-sans text-lg font-semibold text-dark-charcoal mb-2">
                {securityScore > 80 ? 'Excellent' : securityScore > 60 ? 'Bon' : 'À améliorer'}
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {twoFactorEnabled ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                  )}
                  <span className="font-sans text-sm text-dark-charcoal/70">
                    Authentification à deux facteurs
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="font-sans text-sm text-dark-charcoal/70">
                    Mot de passe récent ({formatDate(lastPasswordChange)})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Changement de mot de passe */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative bg-white/60 backdrop-blur-md rounded-3xl shadow-xl border border-white/40 p-8 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-pastel-green/20 rounded-full blur-2xl" />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Lock className="w-6 h-6 text-pastel-green" />
              <h3 className="font-display text-xl font-bold text-dark-charcoal">
                Mot de passe
              </h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-dark-charcoal/60">
              <Clock className="w-4 h-4" />
              <span className="font-sans">Modifié le {formatDate(lastPasswordChange)}</span>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-6">
            {/* Mot de passe actuel */}
            <div>
              <label className="block font-sans text-sm font-medium text-dark-charcoal mb-2">
                Mot de passe actuel *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`w-full px-4 py-3 pr-12 bg-white/60 backdrop-blur-sm border-2 rounded-xl focus:outline-none transition-colors font-sans ${
                    errors.current 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-white/40 focus:border-pastel-green'
                  }`}
                  placeholder="Votre mot de passe actuel"
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </motion.button>
              </div>
              <AnimatePresence>
                {errors.current && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-1 text-sm text-red-600 flex items-center gap-1"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    {errors.current}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Nouveau mot de passe */}
            <div>
              <label className="block font-sans text-sm font-medium text-dark-charcoal mb-2">
                Nouveau mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => handleNewPasswordChange(e.target.value)}
                  className={`w-full px-4 py-3 pr-12 bg-white/60 backdrop-blur-sm border-2 rounded-xl focus:outline-none transition-colors font-sans ${
                    errors.new 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-white/40 focus:border-pastel-green'
                  }`}
                  placeholder="Votre nouveau mot de passe"
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </motion.button>
              </div>
              
              {/* Indicateur de force amélioré */}
              {newPassword && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 p-3 bg-white/40 backdrop-blur-sm rounded-lg border border-white/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-sans text-xs font-medium text-dark-charcoal/70">
                      Force du mot de passe
                    </span>
                    <span className={`font-sans text-xs font-bold ${
                      passwordStrength < 50 ? 'text-red-600' : 
                      passwordStrength < 75 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {getStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${passwordStrength}%` }}
                      transition={{ duration: 0.3 }}
                      className={`h-2 rounded-full ${getStrengthColor(passwordStrength)}`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`flex items-center gap-1 ${newPassword.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                      <CheckCircle className="w-3 h-3" />
                      <span>8+ caractères</span>
                    </div>
                    <div className={`flex items-center gap-1 ${/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                      <CheckCircle className="w-3 h-3" />
                      <span>Majuscule</span>
                    </div>
                    <div className={`flex items-center gap-1 ${/[0-9]/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                      <CheckCircle className="w-3 h-3" />
                      <span>Chiffre</span>
                    </div>
                    <div className={`flex items-center gap-1 ${/[^A-Za-z0-9]/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                      <CheckCircle className="w-3 h-3" />
                      <span>Symbole</span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <AnimatePresence>
                {errors.new && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-1 text-sm text-red-600 flex items-center gap-1"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    {errors.new}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Confirmation */}
            <div>
              <label className="block font-sans text-sm font-medium text-dark-charcoal mb-2">
                Confirmer le nouveau mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-3 pr-12 bg-white/60 backdrop-blur-sm border-2 rounded-xl focus:outline-none transition-colors font-sans ${
                    errors.confirm 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-white/40 focus:border-pastel-green'
                  }`}
                  placeholder="Confirmez votre nouveau mot de passe"
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </motion.button>
              </div>
              <AnimatePresence>
                {errors.confirm && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-1 text-sm text-red-600 flex items-center gap-1"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    {errors.confirm}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              type="submit"
              disabled={isChangingPassword}
              whileHover={{ scale: isChangingPassword ? 1 : 1.02 }}
              whileTap={{ scale: isChangingPassword ? 1 : 0.98 }}
              className="w-full sm:w-auto px-6 py-3 font-sans font-semibold text-white bg-gradient-to-r from-pastel-green to-pastel-purple rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isChangingPassword ? (
                <div className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Modification...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Changer le mot de passe
                </div>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>

      {/* Authentification à deux facteurs enrichie */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative bg-white/60 backdrop-blur-md rounded-3xl shadow-xl border border-white/40 p-8 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-pastel-rose/20 rounded-full blur-2xl" />
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-6">
            <Smartphone className="w-6 h-6 text-pastel-rose" />
            <h3 className="font-display text-xl font-bold text-dark-charcoal">
              Authentification à deux facteurs
            </h3>
          </div>

          <p className="font-sans text-sm text-dark-charcoal/70 mb-6">
            Protégez votre compte avec une couche de sécurité supplémentaire. Utilisez une application comme Google Authenticator ou Authy.
          </p>

          <div className="flex items-center justify-between p-4 bg-white/40 backdrop-blur-sm rounded-xl border border-white/30 mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                twoFactorEnabled ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {twoFactorEnabled ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Key className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <div>
                <div className="font-sans text-sm font-medium text-dark-charcoal">
                  {twoFactorEnabled ? 'Activée' : 'Désactivée'}
                </div>
                <div className="font-sans text-xs text-dark-charcoal/60">
                  {twoFactorEnabled ? 'Votre compte est protégé' : 'Recommandé pour la sécurité'}
                </div>
              </div>
            </div>
            
            <motion.button
              onClick={handleEnable2FA}
              whileTap={{ scale: 0.95 }}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                twoFactorEnabled ? 'bg-pastel-rose' : 'bg-gray-300'
              }`}
            >
              <motion.div
                animate={{ x: twoFactorEnabled ? 24 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
              />
            </motion.button>
          </div>

          {/* QR Code et codes de récupération */}
          <AnimatePresence>
            {showQRCode && twoFactorEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* QR Code */}
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/30 text-center">
                    <QrCode className="w-8 h-8 mx-auto mb-4 text-pastel-rose" />
                    <h4 className="font-sans text-sm font-medium text-dark-charcoal mb-2">
                      Scanner avec votre app
                    </h4>
                    <div className="w-32 h-32 mx-auto bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                      <span className="font-sans text-xs text-gray-500">QR Code</span>
                    </div>
                    <p className="font-sans text-xs text-dark-charcoal/60">
                      Scannez ce code avec Google Authenticator ou Authy
                    </p>
                  </div>

                  {/* Codes de récupération */}
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-sans text-sm font-medium text-dark-charcoal">
                        Codes de récupération
                      </h4>
                      <motion.button
                        onClick={copyBackupCodes}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 text-pastel-rose hover:bg-pastel-rose/10 rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </motion.button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {backupCodes.map((code, index) => (
                        <div key={index} className="font-mono text-xs bg-gray-100 rounded px-2 py-1 text-center">
                          {code}
                        </div>
                      ))}
                    </div>
                    <p className="font-sans text-xs text-dark-charcoal/60">
                      Sauvegardez ces codes dans un endroit sûr. Ils vous permettront d'accéder à votre compte si vous perdez votre téléphone.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Changement d'email */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="relative bg-white/60 backdrop-blur-md rounded-3xl shadow-xl border border-white/40 p-8 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-pastel-purple/20 rounded-full blur-2xl" />
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-6">
            <Mail className="w-6 h-6 text-pastel-purple" />
            <h3 className="font-display text-xl font-bold text-dark-charcoal">
              Adresse email
            </h3>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/40 backdrop-blur-sm rounded-xl border border-white/30 mb-6">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-sans text-sm font-medium text-dark-charcoal">
                  utilisateur@example.com
                </div>
                <div className="font-sans text-xs text-dark-charcoal/60">
                  Adresse principale vérifiée
                </div>
              </div>
            </div>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>

          <p className="font-sans text-sm text-dark-charcoal/70 mb-6">
            Modifiez l'adresse email associée à votre compte. Un email de confirmation sera envoyé à la nouvelle adresse avant la validation du changement.
          </p>

          <motion.button
            onClick={onEmailChange}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto px-6 py-3 font-sans font-semibold text-white bg-gradient-to-r from-pastel-purple to-pastel-rose rounded-xl shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Changer d'adresse email
            </div>
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
