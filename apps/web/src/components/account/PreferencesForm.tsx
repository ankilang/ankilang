import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Globe, Bell, Moon, Sun, Volume2, 
  Smartphone, Mail, MessageSquare, Sparkles,
  CheckCircle, Save
} from 'lucide-react'
import LanguageSelect from './LanguageSelect'

interface Preferences {
  language: string
  theme: 'light' | 'dark' | 'auto'
  notifications: {
    email: boolean
    push: boolean
    marketing: boolean
    reminders: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private'
    showProgress: boolean
  }
  learning: {
    dailyGoal: number
    reminderTime: string
    soundEffects: boolean
  }
}

interface PreferencesFormProps {
  preferences: Preferences
  onUpdate: (preferences: Preferences) => void
}

export default function PreferencesForm({ preferences, onUpdate }: PreferencesFormProps) {
  const [formData, setFormData] = useState<Preferences>(preferences)
  const [isSaving, setIsSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    
    // Simuler un délai d'API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    onUpdate(formData)
    setIsSaving(false)
    setSavedMessage(true)
    
    setTimeout(() => setSavedMessage(false), 3000)
  }

  const updatePreference = (path: string, value: any) => {
    const keys = path.split('.')
    setFormData(prev => {
      const newData = { ...prev } as any
      let current: any = newData
      
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i] as keyof typeof current
        if (current[key] === undefined) {
          current[key] = {}
        }
        current[key] = { ...current[key] }
        current = current[key]
      }
      
      const lastKey = keys[keys.length - 1] as keyof typeof current
      current[lastKey] = value
      return newData
    })
  }

  const themeOptions = [
    { value: 'light', label: 'Clair', icon: Sun },
    { value: 'dark', label: 'Sombre', icon: Moon },
    { value: 'auto', label: 'Automatique', icon: Smartphone }
  ]

  return (
    <div className="space-y-6">
      {/* Message de sauvegarde */}
      {savedMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-green-50/90 backdrop-blur-sm border border-green-200 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-4 h-4" />
            <span className="font-sans text-sm font-medium">
              Préférences sauvegardées avec succès
            </span>
          </div>
        </motion.div>
      )}

      {/* Langue et Thème */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-white/60 backdrop-blur-md rounded-3xl shadow-xl border border-white/40 p-8 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-pastel-purple/20 rounded-full blur-2xl" />
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-6">
            <Globe className="w-6 h-6 text-pastel-purple" />
            <h3 className="font-display text-xl font-bold text-dark-charcoal">
              Langue et Apparence
            </h3>
          </div>

          <div className="space-y-6">
            {/* Sélecteur de langue */}
            <div>
              <label className="block font-sans text-sm font-medium text-dark-charcoal mb-3">
                Langue de l'interface
              </label>
              <LanguageSelect
                value={formData.language}
                onChange={(value) => updatePreference('language', value)}
              />
            </div>

            {/* Thème */}
            <div>
              <label className="block font-sans text-sm font-medium text-dark-charcoal mb-3">
                Thème
              </label>
              <div className="grid grid-cols-3 gap-3">
                {themeOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <motion.button
                      key={option.value}
                      onClick={() => updatePreference('theme', option.value)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        formData.theme === option.value
                          ? 'border-pastel-purple bg-pastel-purple/10 shadow-lg'
                          : 'border-white/40 bg-white/40 hover:border-white/60'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${
                        formData.theme === option.value ? 'text-pastel-purple' : 'text-gray-600'
                      }`} />
                      <span className={`font-sans text-sm font-medium ${
                        formData.theme === option.value ? 'text-pastel-purple' : 'text-gray-700'
                      }`}>
                        {option.label}
                      </span>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative bg-white/60 backdrop-blur-md rounded-3xl shadow-xl border border-white/40 p-8 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-pastel-green/20 rounded-full blur-2xl" />
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-6">
            <Bell className="w-6 h-6 text-pastel-green" />
            <h3 className="font-display text-xl font-bold text-dark-charcoal">
              Notifications
            </h3>
          </div>

          <div className="space-y-4">
            {[
              { key: 'email', label: 'Notifications par email', icon: Mail },
              { key: 'push', label: 'Notifications push', icon: Smartphone },
              { key: 'marketing', label: 'Emails marketing', icon: MessageSquare },
              { key: 'reminders', label: 'Rappels d\'étude', icon: Bell }
            ].map((item) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.key}
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center justify-between p-4 bg-white/40 backdrop-blur-sm rounded-xl border border-white/30"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <span className="font-sans text-sm font-medium text-dark-charcoal">
                      {item.label}
                    </span>
                  </div>
                  
                  <motion.button
                    onClick={() => updatePreference(`notifications.${item.key}`, !formData.notifications[item.key as keyof typeof formData.notifications])}
                    whileTap={{ scale: 0.95 }}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                      formData.notifications[item.key as keyof typeof formData.notifications]
                        ? 'bg-pastel-green'
                        : 'bg-gray-300'
                    }`}
                  >
                    <motion.div
                      animate={{
                        x: formData.notifications[item.key as keyof typeof formData.notifications] ? 24 : 2
                      }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                    />
                  </motion.button>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* Apprentissage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative bg-white/60 backdrop-blur-md rounded-3xl shadow-xl border border-white/40 p-8 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-pastel-rose/20 rounded-full blur-2xl" />
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-pastel-rose" />
            <h3 className="font-display text-xl font-bold text-dark-charcoal">
              Apprentissage
            </h3>
          </div>

          <div className="space-y-6">
            {/* Objectif quotidien */}
            <div>
              <label className="block font-sans text-sm font-medium text-dark-charcoal mb-3">
                Objectif quotidien (cartes par jour)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={formData.learning.dailyGoal}
                  onChange={(e) => updatePreference('learning.dailyGoal', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-white/40 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="w-16 px-3 py-2 bg-white/60 backdrop-blur-sm rounded-lg border border-white/40 text-center">
                  <span className="font-sans text-sm font-bold text-dark-charcoal">
                    {formData.learning.dailyGoal}
                  </span>
                </div>
              </div>
            </div>

            {/* Heure de rappel */}
            <div>
              <label className="block font-sans text-sm font-medium text-dark-charcoal mb-3">
                Heure de rappel
              </label>
              <input
                type="time"
                value={formData.learning.reminderTime}
                onChange={(e) => updatePreference('learning.reminderTime', e.target.value)}
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border-2 border-white/40 rounded-xl focus:outline-none focus:border-pastel-rose transition-colors font-sans"
              />
            </div>

            {/* Effets sonores */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="flex items-center justify-between p-4 bg-white/40 backdrop-blur-sm rounded-xl border border-white/30"
            >
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-gray-600" />
                <span className="font-sans text-sm font-medium text-dark-charcoal">
                  Effets sonores
                </span>
              </div>
              
              <motion.button
                onClick={() => updatePreference('learning.soundEffects', !formData.learning.soundEffects)}
                whileTap={{ scale: 0.95 }}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                  formData.learning.soundEffects ? 'bg-pastel-rose' : 'bg-gray-300'
                }`}
              >
                <motion.div
                  animate={{ x: formData.learning.soundEffects ? 24 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Bouton de sauvegarde */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex justify-end"
      >
        <motion.button
          onClick={handleSave}
          disabled={isSaving}
          whileHover={{ scale: isSaving ? 1 : 1.02 }}
          whileTap={{ scale: isSaving ? 1 : 0.98 }}
          className="px-8 py-3 font-sans font-semibold text-white bg-gradient-to-r from-pastel-purple to-pastel-green rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          {isSaving ? (
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
              Sauvegarde...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Sauvegarder les préférences
            </div>
          )}
        </motion.button>
      </motion.div>
    </div>
  )
}
