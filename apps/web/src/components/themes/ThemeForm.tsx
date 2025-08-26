import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Sparkles, Tag, Globe, Lock, Users, Wand2 } from 'lucide-react'
import { LANGUAGES, getLanguageByCode } from '../../constants/languages'
import { CreateThemeSchema } from '@ankilang/shared'

const themeFormSchema = z.object({
  name: z.string().min(1, 'Le nom du thème est requis').max(128, 'Le nom est trop long'),
  targetLang: z.string().min(2, 'La langue cible est requise'),
  tags: z.string().optional(),
  shareStatus: z.enum(['private', 'community']).default('private')
})

type ThemeFormData = z.infer<typeof themeFormSchema>

interface ThemeFormProps {
  onSubmit: (data: z.infer<typeof CreateThemeSchema>) => void
  isLoading?: boolean
  error?: string
  initialData?: Partial<ThemeFormData>
}

export default function ThemeForm({ 
  onSubmit, 
  isLoading = false, 
  error,
  initialData 
}: ThemeFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedLang, setSelectedLang] = useState('')
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<ThemeFormData>({
    resolver: zodResolver(themeFormSchema),
    defaultValues: initialData
  })

  const watchedValues = watch()
  const selectedLanguage = getLanguageByCode(selectedLang || watchedValues.targetLang)

  const handleFormSubmit = (data: ThemeFormData) => {
    const tags = data.tags 
      ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      : []
    
    onSubmit({
      name: data.name,
      targetLang: data.targetLang,
      tags
    } as z.infer<typeof CreateThemeSchema>)
  }

  const steps = [
    { id: 1, title: 'Nom du thème', icon: Wand2 },
    { id: 2, title: 'Langue cible', icon: Globe },
    { id: 3, title: 'Personnalisation', icon: Sparkles }
  ]

  return (
    <div className="space-y-8">
      {/* Indicateur d'étapes */}
      <div className="flex items-center justify-center space-x-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            className="flex items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={`flex items-center justify-center w-12 h-12 rounded-2xl border-2 transition-all duration-300 ${
              currentStep >= step.id 
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 border-purple-500 text-white shadow-lg' 
                : 'bg-white border-gray-200 text-gray-400'
            }`}>
              <step.icon className="w-5 h-5" />
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-2 transition-colors duration-300 ${
                currentStep > step.id ? 'bg-purple-500' : 'bg-gray-200'
              }`} />
            )}
          </motion.div>
        ))}
      </div>

      {/* Prévisualisation en temps réel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-pastel-green to-pastel-purple/30 rounded-3xl p-6 border border-white/20 relative overflow-hidden"
      >
        {/* Effet de particules subtiles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-purple-300/30 rounded-full"
              animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 4,
                delay: i * 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                left: `${20 + i * 30}%`,
                top: `${30 + i * 20}%`
              }}
            />
          ))}
        </div>
        
        <h3 className="font-display text-lg font-semibold text-dark-charcoal mb-4 flex items-center gap-2 relative z-10">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Aperçu de votre thème
        </h3>
        
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/40 relative z-10"
          animate={watchedValues.name ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-3">
            {selectedLanguage && (
              <motion.span 
                className="text-2xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                {selectedLanguage.flag || (selectedLanguage.code === 'oc' ? '🏴󠁧󠁢󠁳󠁣󠁴󠁿' : '🌍')}
              </motion.span>
            )}
            <div>
              <motion.h4 
                className="font-display font-bold text-dark-charcoal"
                animate={watchedValues.name ? { color: ['#333333', '#7C3AED', '#333333'] } : {}}
                transition={{ duration: 1 }}
              >
                {watchedValues.name || 'Nom de votre thème'}
              </motion.h4>
              <p className="text-sm text-dark-charcoal/70">
                {selectedLanguage ? selectedLanguage.label : 'Langue cible'}
                {selectedLanguage?.code === 'oc' && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
                    GRATUIT
                  </span>
                )}
              </p>
            </div>
          </div>
          {watchedValues.tags && (
            <motion.div 
              className="flex flex-wrap gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {watchedValues.tags.split(',').slice(0, 3).map((tag, index) => (
                                 <motion.span 
                   key={index} 
                   className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   transition={{ delay: 0.1 * index }}
                 >
                   {tag.trim()}
                 </motion.span>
              ))}
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-red-50 border-2 border-red-200 rounded-xl"
            aria-live="polite"
          >
            <p className="text-red-800 text-sm font-sans">{error}</p>
          </motion.div>
        )}

        {/* Étape 1: Nom du thème */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label htmlFor="name" className="label-field flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-purple-600" />
            Donnez un nom à votre thème *
          </label>
          <motion.input
            whileFocus={{ scale: 1.02 }}
            id="name"
            type="text"
            {...register('name')}
            onFocus={() => setCurrentStep(1)}
            className="input-field text-lg"
            placeholder="Ex: Vocabulaire de base, Expressions courantes..."
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className="error-message">
              {errors.name.message}
            </p>
          )}
        </motion.div>

        {/* Étape 2: Langue cible */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label htmlFor="targetLang" className="label-field flex items-center gap-2">
            <Globe className="w-4 h-4 text-purple-600" />
            Choisissez votre langue cible *
          </label>
          
          {/* Sélecteur de langues avec drapeaux */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
            {LANGUAGES.slice(0, 8).map((language) => (
              language.code === 'oc' ? (
                <motion.label
                  key={language.code}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative cursor-pointer p-4 rounded-2xl border-2 transition-all duration-200 ${
                    watchedValues.targetLang === language.code
                      ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-red-50 shadow-lg'
                      : 'border-yellow-300 bg-gradient-to-br from-yellow-100 to-red-100 hover:border-yellow-400'
                  }`}
                >
                  <input
                    type="radio"
                    value={language.code}
                    {...register('targetLang')}
                    onFocus={() => setCurrentStep(2)}
                    onChange={(e) => setSelectedLang(e.target.value)}
                    className="sr-only"
                  />
                  <div className="text-center">
                    {/* Symbole spécial pour l'occitan au lieu du drapeau */}
                    <div className="text-2xl mb-2 font-bold text-transparent bg-gradient-to-r from-yellow-600 to-red-600 bg-clip-text">
                      ÒC
                    </div>
                    <div className="font-sans font-medium text-sm text-dark-charcoal">
                      {language.label}
                    </div>
                    {/* Badge "Gratuit" */}
                    <div className="absolute -top-1 -right-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full text-xs text-white font-bold shadow-lg">
                      GRATUIT
                    </div>
                  </div>
                </motion.label>
              ) : (
                <motion.label
                  key={language.code}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative cursor-pointer p-4 rounded-2xl border-2 transition-all duration-200 ${
                    watchedValues.targetLang === language.code
                      ? 'border-purple-500 bg-purple-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50'
                  }`}
                >
                  <input
                    type="radio"
                    value={language.code}
                    {...register('targetLang')}
                    onFocus={() => setCurrentStep(2)}
                    onChange={(e) => setSelectedLang(e.target.value)}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="text-2xl mb-2">{language.flag}</div>
                    <div className="font-sans font-medium text-sm text-dark-charcoal">
                      {language.label}
                    </div>
                  </div>
                </motion.label>
              )
            ))}
          </div>
          
          {/* Select classique pour toutes les langues */}
          <select
            {...register('targetLang')}
            onFocus={() => setCurrentStep(2)}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="input-field"
            aria-describedby={errors.targetLang ? 'targetLang-error' : undefined}
          >
            <option value="">Ou sélectionnez dans la liste complète</option>
            {LANGUAGES.map((language) => (
              <option key={language.code} value={language.code}>
                {language.flag} {language.label} {language.nativeName && `(${language.nativeName})`}
              </option>
            ))}
          </select>
          {errors.targetLang && (
            <p id="targetLang-error" className="error-message">
              {errors.targetLang.message}
            </p>
          )}
        </motion.div>

        {/* Étape 3: Personnalisation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <div>
            <label htmlFor="tags" className="label-field flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-600" />
              Tags pour organiser (optionnel)
            </label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              id="tags"
              type="text"
              {...register('tags')}
              onFocus={() => setCurrentStep(3)}
              className="input-field"
              placeholder="Ex: vocabulaire, débutant, grammaire, voyage..."
            />
            <p className="mt-2 text-sm text-dark-charcoal/70 font-sans">
              Séparez les tags par des virgules pour mieux organiser vos thèmes
            </p>
          </div>

          <div>
            <label className="label-field flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-purple-600" />
              Partage et visibilité
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.label
                whileHover={{ scale: 1.02 }}
                className={`cursor-pointer p-4 rounded-2xl border-2 transition-all duration-200 ${
                  watchedValues.shareStatus === 'private'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-purple-300'
                }`}
              >
                <input
                  type="radio"
                  value="private"
                  {...register('shareStatus')}
                  className="sr-only"
                />
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-sans font-semibold text-dark-charcoal">Privé</div>
                    <div className="text-sm text-dark-charcoal/70">Visible par vous uniquement</div>
                  </div>
                </div>
              </motion.label>
              
              <motion.label
                whileHover={{ scale: 1.02 }}
                className={`cursor-pointer p-4 rounded-2xl border-2 transition-all duration-200 ${
                  watchedValues.shareStatus === 'community'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-purple-300'
                }`}
              >
                <input
                  type="radio"
                  value="community"
                  {...register('shareStatus')}
                  className="sr-only"
                />
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-sans font-semibold text-dark-charcoal">Communauté</div>
                    <div className="text-sm text-dark-charcoal/70">Partageable avec d'autres</div>
                  </div>
                </div>
              </motion.label>
            </div>
          </div>
        </motion.div>

        {/* Bouton de soumission */}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(124, 58, 237, 0.3)" }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 text-white text-lg py-4 rounded-2xl font-semibold shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden"
        >
          {/* Effet de brillance au survol */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          />
          
          {isLoading ? (
            <span className="flex items-center justify-center gap-3 relative z-10">
              <motion.div 
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Création de votre thème...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-10 relative z-10">
              <Sparkles className="w-5 h-5" />
              Créer mon thème
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ✨
              </motion.div>
            </span>
          )}
        </motion.button>
      </form>
    </div>
  )
}
