import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Save, X, Upload, User, Mail, AtSign, 
  AlertCircle, Camera, Sparkles 
} from 'lucide-react'
import type { UserProfile } from '../../data/mockAccount'

interface ProfileFormProps {
  user: UserProfile
  onSubmit: (user: UserProfile) => void
  onCancel: () => void
}

export default function ProfileForm({ user, onSubmit, onCancel }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    displayName: user.displayName,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Le nom d\'affichage est requis'
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Le nom d\'utilisateur est requis'
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username = 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    
    // Simuler un délai d'API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    onSubmit({
      ...user,
      ...formData
    })
    
    setIsSubmitting(false)
  }

  const handleAvatarUpload = () => {
    // Simuler un upload d'avatar
    const mockAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`
    setFormData(prev => ({ ...prev, avatarUrl: mockAvatarUrl }))
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
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="relative bg-white/60 backdrop-blur-md rounded-3xl shadow-xl border border-white/40 p-8 overflow-hidden"
    >
      {/* Éléments décoratifs */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-pastel-green/20 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-pastel-purple/30 rounded-full blur-xl" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-pastel-green" />
            <h2 className="font-display text-2xl font-bold text-dark-charcoal">
              Modifier le profil
            </h2>
          </div>
          
          <motion.button
            onClick={onCancel}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-md border border-white/40 text-dark-charcoal hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {formData.avatarUrl ? (
                <img
                  src={formData.avatarUrl}
                  alt="Avatar"
                  className="w-24 h-24 rounded-2xl object-cover shadow-lg border-2 border-white/60"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-pastel-purple to-pastel-rose rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/60">
                  <span className="font-display text-2xl font-bold text-white">
                    {getInitials(formData.displayName || 'U')}
                  </span>
                </div>
              )}
              
              <motion.button
                type="button"
                onClick={handleAvatarUpload}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-pastel-purple text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white"
              >
                <Camera className="w-4 h-4" />
              </motion.button>
            </motion.div>
            
            <motion.button
              type="button"
              onClick={handleAvatarUpload}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-sm rounded-xl border border-white/30 text-dark-charcoal hover:bg-white/60 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span className="font-sans text-sm font-medium">Changer l'avatar</span>
            </motion.button>
          </div>

          {/* Champs du formulaire */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Nom d'affichage */}
            <div>
              <label htmlFor="displayName" className="block font-sans text-sm font-medium text-dark-charcoal mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nom d'affichage *
                </div>
              </label>
              <input
                id="displayName"
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                className={`w-full px-4 py-3 bg-white/60 backdrop-blur-sm border-2 rounded-xl focus:outline-none transition-colors font-sans ${
                  errors.displayName 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-white/40 focus:border-pastel-purple'
                }`}
                placeholder="Votre nom complet"
              />
              <AnimatePresence>
                {errors.displayName && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-1 text-sm text-red-600 flex items-center gap-1"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errors.displayName}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Nom d'utilisateur */}
            <div>
              <label htmlFor="username" className="block font-sans text-sm font-medium text-dark-charcoal mb-2">
                <div className="flex items-center gap-2">
                  <AtSign className="w-4 h-4" />
                  Nom d'utilisateur *
                </div>
              </label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className={`w-full px-4 py-3 bg-white/60 backdrop-blur-sm border-2 rounded-xl focus:outline-none transition-colors font-sans ${
                  errors.username 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-white/40 focus:border-pastel-purple'
                }`}
                placeholder="votre_nom_utilisateur"
              />
              <AnimatePresence>
                {errors.username && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-1 text-sm text-red-600 flex items-center gap-1"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errors.username}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block font-sans text-sm font-medium text-dark-charcoal mb-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Adresse email *
              </div>
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={`w-full px-4 py-3 bg-white/60 backdrop-blur-sm border-2 rounded-xl focus:outline-none transition-colors font-sans ${
                errors.email 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-white/40 focus:border-pastel-purple'
              }`}
              placeholder="votre@email.com"
            />
            <AnimatePresence>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-1 text-sm text-red-600 flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/20">
            <motion.button
              type="button"
              onClick={onCancel}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 font-sans font-medium text-dark-charcoal bg-white/40 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white/60 transition-colors"
            >
              Annuler
            </motion.button>
            
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className="px-6 py-3 font-sans font-semibold text-white bg-gradient-to-r from-pastel-purple to-pastel-green rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Enregistrement...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Enregistrer
                </div>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}
