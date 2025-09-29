import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Sparkles, Tag, Globe, Lock, Users, Wand2, CheckCircle } from 'lucide-react'
import { LANGUAGES, getLanguageByCode } from '../../constants/languages'
import { CreateThemeSchema } from '@ankilang/shared'
import FlagIcon from '../ui/FlagIcon'

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
  const selectedLanguage = getLanguageByCode(watchedValues.targetLang)
  const [ocDialect, setOcDialect] = useState<'oc' | 'oc-gascon'>('oc')
  const [langQuery, setLangQuery] = useState('')

  const handleFormSubmit = (data: ThemeFormData) => {
    const tags = data.tags 
      ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      : []
    
    onSubmit({
      name: data.name,
      targetLang: (data.targetLang === 'oc' ? ocDialect : data.targetLang),
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

      {/* Introduction directe */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-6"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-4xl mb-4"
        >
          ✨
        </motion.div>
        <h3 className="font-display text-xl font-semibold text-dark-charcoal mb-2">
          Créons votre thème ensemble
        </h3>
        <p className="font-sans text-dark-charcoal/70 max-w-md mx-auto">
          Quelques informations suffisent pour organiser parfaitement vos flashcards
        </p>
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
            className="input-field text-lg sm:text-base md:text-lg"
            placeholder="Ex: Vocabulaire de base, Expressions courantes..."
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className="error-message">
              {errors.name.message}
            </p>
          )}
        </motion.div>

        {/* Étape 2: Langue cible - SANS dropdown */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <label className="label-field flex items-center gap-2">
            <Globe className="w-4 h-4 text-purple-600" />
            Langue que vous souhaitez apprendre
          </label>
          
          {/* Recherche de langue */}
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={langQuery}
              onChange={(e) => setLangQuery(e.target.value)}
              placeholder="Rechercher une langue (code, nom, natif)"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pastel-purple transition-colors font-sans"
              aria-label="Rechercher une langue"
            />
          </div>

          {/* Grille de langues améliorée */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {(langQuery ? LANGUAGES.filter(l => {
              const q = langQuery.trim().toLowerCase()
              return (
                l.code.toLowerCase().includes(q) ||
                l.label.toLowerCase().includes(q) ||
                (l.nativeName?.toLowerCase() || '').includes(q)
              )
            }) : LANGUAGES).map((language) => (
              <motion.label
                key={language.code}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative cursor-pointer p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 ${
                  watchedValues.targetLang === language.code
                    ? language.code === 'oc' 
                      ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-red-50 shadow-lg'
                      : 'border-purple-500 bg-purple-50 shadow-lg'
                    : language.code === 'oc'
                      ? 'border-yellow-300 bg-gradient-to-br from-yellow-100 to-red-100 hover:border-yellow-400'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50'
                }`}
              >
                <input
                  type="radio"
                  value={language.code}
                  {...register('targetLang')}
                  onFocus={() => setCurrentStep(2)}

                  className="sr-only"
                />
                <div className="text-center">
                  <div className="text-lg sm:text-2xl mb-1 sm:mb-2 flex justify-center items-center">
                    <FlagIcon 
                      languageCode={language.code}
                      size={32}
                      alt={`Drapeau ${language.label}`}
                      className="sm:w-8 sm:h-8 w-6 h-6"
                    />
                  </div>
                  <div className="font-sans font-medium text-xs sm:text-sm text-dark-charcoal leading-tight">
                    {language.label}
                  </div>
                  {language.nativeName && (
                    <div className="font-sans text-xs text-dark-charcoal/50 mt-1">
                      {language.nativeName}
                    </div>
                  )}
                  {language.code === 'oc' && (
                    <div className="absolute -top-1 -right-1 px-1 sm:px-2 py-0.5 sm:py-1 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full text-xs text-white font-bold shadow-lg">
                      <span className="hidden sm:inline">GRATUIT</span>
                      <span className="sm:hidden">✨</span>
                    </div>
                  )}
                </div>
              </motion.label>
            ))}
          </div>

          {/* Dialecte occitan quand oc sélectionné */}
          {watchedValues.targetLang === 'oc' && (
            <div className="mt-5">
              <div className="font-sans text-sm font-semibold text-dark-charcoal mb-2">
                Dialecte occitan (pour la traduction Revirada)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`relative cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                    ocDialect === 'oc'
                      ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-red-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-yellow-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="ocDialect"
                    className="sr-only"
                    checked={ocDialect === 'oc'}
                    onChange={() => setOcDialect('oc')}
                  />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-red-500 flex items-center justify-center text-white font-bold">
                      ÒC
                    </div>
                    <div>
                      <div className="font-sans font-semibold text-dark-charcoal">Languedocien</div>
                      <div className="text-xs text-dark-charcoal/60">Code Revirada: <code>oci</code></div>
                    </div>
                  </div>
                </label>

                <label
                  className={`relative cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                    ocDialect === 'oc-gascon'
                      ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-red-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-yellow-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="ocDialect"
                    className="sr-only"
                    checked={ocDialect === 'oc-gascon'}
                    onChange={() => setOcDialect('oc-gascon')}
                  />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-red-500 flex items-center justify-center text-white font-bold">
                      GS
                    </div>
                    <div>
                      <div className="font-sans font-semibold text-dark-charcoal">Gascon</div>
                      <div className="text-xs text-dark-charcoal/60">Code Revirada: <code>oci_gascon</code></div>
                    </div>
                  </div>
                </label>
              </div>
              <p className="mt-2 text-xs text-dark-charcoal/60">Le dialecte choisi affinent la traduction occitane.</p>
            </div>
          )}
          
          {/* Message d'aide si aucune langue sélectionnée */}
          {!watchedValues.targetLang && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-dark-charcoal/60 text-center mt-3 font-sans"
            >
              Sélectionnez la langue que vous souhaitez apprendre
            </motion.p>
          )}
          
          {/* Message de confirmation de sélection */}
          {watchedValues.targetLang && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-3 py-3 px-4 bg-green-50 border border-green-200 rounded-xl mt-4"
            >
              <div className="text-xl">
                {selectedLanguage?.code === 'oc' ? (
                  <span className="font-bold text-transparent bg-gradient-to-r from-yellow-600 to-red-600 bg-clip-text">
                    ÒC
                  </span>
                ) : (
                  selectedLanguage?.flag
                )}
              </div>
              <span className="font-sans text-sm text-green-800">
                <strong>{selectedLanguage?.label}</strong> sélectionné
                {selectedLanguage?.code === 'oc' && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                    GRATUIT & ILLIMITÉ
                  </span>
                )}
              </span>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </motion.div>
          )}
          
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
          className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 text-white text-lg py-4 sm:text-base sm:py-3 rounded-2xl font-semibold shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden"
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
