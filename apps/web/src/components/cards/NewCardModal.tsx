import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  X, Brain, Type, Sparkles, AlertCircle, Check, 
  Languages, Play, Pause, Image as ImageIcon,
  Volume2, Trash2, Search
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { CreateCardSchema } from '@ankilang/shared'

const basicCardSchema = z.object({
  type: z.literal('basic'),
  // RECTO
  recto: z.string().min(1, 'Le contenu du recto est requis'),
  rectoImage: z.string().optional(),
  // VERSO
  verso: z.string().min(1, 'Le contenu du verso est requis'),
  versoImage: z.string().optional(),
  versoAudio: z.string().optional(),
  // EXTRA
  extra: z.string().optional(),
  tags: z.string().optional()
})

const clozeCardSchema = z.object({
  type: z.literal('cloze'),
  clozeTextTarget: z.string().min(1, 'Le texte à trous est requis').refine(
    (text) => /\{\{c\d+::[^}]+\}\}/.test(text),
    'Le texte doit contenir au moins un trou au format {{cN::...}}'
  ),
  clozeImage: z.string().optional(),
  extra: z.string().optional(),
  tags: z.string().optional()
})

const cardSchema = z.discriminatedUnion('type', [basicCardSchema, clozeCardSchema])
type CardFormData = z.infer<typeof cardSchema>

interface NewCardModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: z.infer<typeof CreateCardSchema>) => void
  isLoading?: boolean
  error?: string
  themeId: string
  themeLanguage: string // 'fr', 'en', 'oc', etc.
  themeColors: {
    primary: string
    secondary: string
    accent: string
    gradient: string
  }
}

export default function NewCardModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading = false, 
  error,
  themeId,
  themeLanguage,
  themeColors
}: NewCardModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [selectedType, setSelectedType] = useState<'basic' | 'cloze'>('basic')
  const [isTranslating, setIsTranslating] = useState(false)
  const [audioPlaying, setAudioPlaying] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    setValue,
    getValues
  } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      type: 'basic',
      recto: '',
      verso: '',
      extra: '',
      tags: ''
    },
    mode: 'onChange'
  })

  const watchedValues = watch()

  // Fonction de traduction (mock pour l'instant)
  const handleTranslate = async () => {
    if (selectedType !== 'basic') return
    
    const rectoText = getValues('recto')
    if (!rectoText.trim()) return

    setIsTranslating(true)
    
    try {
      // Mock API call - remplacer par vraie API
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Simulation de traduction
      const translatedText = `[Traduit en ${themeLanguage}] ${rectoText}`
      setValue('verso', translatedText)
      
    } catch (error) {
      console.error('Erreur de traduction:', error)
    } finally {
      setIsTranslating(false)
    }
  }

  // Gestion des fichiers
  const handleImageUpload = (field: 'rectoImage' | 'versoImage' | 'clozeImage') => {
    // Mock upload - remplacer par vraie logique
    const mockImageUrl = `https://picsum.photos/400/300?random=${Date.now()}`
    setValue(field, mockImageUrl)
  }

  const handleAudioUpload = () => {
    // Mock upload - remplacer par vraie logique
    const mockAudioUrl = `audio_${Date.now()}.mp3`
    setValue('versoAudio', mockAudioUrl)
  }

  const removeMedia = (field: string) => {
    setValue(field as any, '')
  }

  useEffect(() => {
    if (isOpen) {
      reset()
      setSelectedType('basic')
      setValue('type', 'basic')
    }
  }, [isOpen, reset, setValue])

  const handleTypeChange = (type: 'basic' | 'cloze') => {
    setSelectedType(type)
    setValue('type', type)
    reset()
    setValue('type', type)
  }

  const handleFormSubmit = (data: CardFormData) => {
    const submitData = {
      ...data,
      themeId,
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
    }
    onSubmit(submitData as z.infer<typeof CreateCardSchema>)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="absolute inset-0 backdrop-blur-sm" />
          
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20">
              {/* Header */}
              <div 
                className="relative px-6 py-6 border-b border-white/20"
                style={{
                  background: `linear-gradient(135deg, ${themeColors.secondary} 0%, white 100%)`
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md"
                      style={{ backgroundColor: themeColors.primary + '20' }}
                    >
                      <Sparkles className="w-6 h-6" style={{ color: themeColors.accent }} />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-bold text-dark-charcoal">
                        Nouvelle carte
                      </h2>
                      <p className="font-sans text-sm text-dark-charcoal/70">
                        Langue cible : <span className="font-medium">{themeLanguage.toUpperCase()}</span>
                      </p>
                    </div>
                  </div>
                  <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-md border border-white/40 text-dark-charcoal hover:bg-white transition-colors"
                  >
                    <X size={20} />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                  {/* Sélecteur de type */}
                  <div>
                    <label className="block font-sans text-sm font-medium text-dark-charcoal mb-3">
                      Type de carte
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <motion.button
                        type="button"
                        onClick={() => handleTypeChange('basic')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                          selectedType === 'basic'
                            ? 'border-current shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{
                          backgroundColor: selectedType === 'basic' ? themeColors.secondary : 'white',
                          color: selectedType === 'basic' ? themeColors.accent : '#6B7280'
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Brain className="w-6 h-6" />
                          <div className="text-left">
                            <div className="font-sans font-semibold">Recto/Verso</div>
                            <div className="text-xs opacity-70">Carte classique</div>
                          </div>
                        </div>
                      </motion.button>

                      <motion.button
                        type="button"
                        onClick={() => handleTypeChange('cloze')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                          selectedType === 'cloze'
                            ? 'border-current shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{
                          backgroundColor: selectedType === 'cloze' ? themeColors.secondary : 'white',
                          color: selectedType === 'cloze' ? themeColors.accent : '#6B7280'
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Type className="w-6 h-6" />
                          <div className="text-left">
                            <div className="font-sans font-semibold">Cloze</div>
                            <div className="text-xs opacity-70">Texte à trous</div>
                          </div>
                        </div>
                      </motion.button>
                    </div>
                  </div>

                  {/* Contenu selon le type */}
                  <AnimatePresence mode="wait">
                    {selectedType === 'basic' ? (
                      <motion.div
                        key="basic"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                      >
                        {/* RECTO */}
                        <div className="bg-white/50 rounded-2xl p-6 border border-white/60">
                          <div className="flex items-center gap-2 mb-4">
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: themeColors.secondary }}
                            >
                              <span className="text-sm font-bold" style={{ color: themeColors.accent }}>R</span>
                            </div>
                            <h3 className="font-display text-lg font-semibold text-dark-charcoal">Recto</h3>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <label htmlFor="recto" className="block font-sans text-sm font-medium text-dark-charcoal mb-2">
                                Contenu principal *
                              </label>
                              <textarea
                                id="recto"
                                {...register('recto')}
                                rows={3}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pastel-purple transition-colors font-sans resize-none"
                                placeholder="Texte en français à traduire..."
                              />
                              {(errors as any).recto && (
                                <motion.p 
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="mt-1 text-sm text-red-600 flex items-center gap-1"
                                >
                                  <AlertCircle className="w-4 h-4" />
                                  {(errors as any).recto.message}
                                </motion.p>
                              )}
                            </div>

                            {/* Image Recto */}
                            <div>
                              <label className="block font-sans text-sm font-medium text-dark-charcoal mb-2">
                                Image (optionnelle)
                              </label>
                              {(watchedValues as any).rectoImage ? (
                                <div className="relative">
                                  <img 
                                    src={(watchedValues as any).rectoImage} 
                                    alt="Recto" 
                                    className="w-full h-32 object-cover rounded-xl border border-gray-200"
                                  />
                                  <motion.button
                                    type="button"
                                    onClick={() => removeMedia('rectoImage')}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </motion.button>
                                </div>
                              ) : (
                                <motion.button
                                  type="button"
                                  onClick={() => handleImageUpload('rectoImage')}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-gray-400 transition-colors"
                                >
                                  <ImageIcon className="w-8 h-8 text-gray-400" />
                                  <span className="font-sans text-sm text-gray-500">Ajouter une image</span>
                                </motion.button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* VERSO */}
                        <div className="bg-white/50 rounded-2xl p-6 border border-white/60">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: themeColors.secondary }}
                              >
                                <span className="text-sm font-bold" style={{ color: themeColors.accent }}>V</span>
                              </div>
                              <h3 className="font-display text-lg font-semibold text-dark-charcoal">Verso</h3>
                            </div>
                            
                            {/* Bouton Traduire */}
                            <motion.button
                              type="button"
                              onClick={handleTranslate}
                              disabled={isTranslating || !(watchedValues as any).recto?.trim()}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                              style={{ 
                                background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.accent})`
                              }}
                            >
                              {isTranslating ? (
                                <>
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                  />
                                  Traduction...
                                </>
                              ) : (
                                <>
                                  <Languages className="w-4 h-4" />
                                  Traduire
                                </>
                              )}
                            </motion.button>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <label htmlFor="verso" className="block font-sans text-sm font-medium text-dark-charcoal mb-2">
                                Contenu traduit *
                              </label>
                              <textarea
                                id="verso"
                                {...register('verso')}
                                rows={3}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pastel-purple transition-colors font-sans resize-none"
                                placeholder={`Traduction en ${themeLanguage}...`}
                              />
                              {(errors as any).verso && (
                                <motion.p 
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="mt-1 text-sm text-red-600 flex items-center gap-1"
                                >
                                  <AlertCircle className="w-4 h-4" />
                                  {(errors as any).verso.message}
                                </motion.p>
                              )}
                            </div>

                            {/* Audio Verso (spécial occitan) */}
                            {themeLanguage === 'oc' && (
                              <div>
                                <label className="block font-sans text-sm font-medium text-dark-charcoal mb-2">
                                  Audio occitan (optionnel)
                                </label>
                                {(watchedValues as any).versoAudio ? (
                                  <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl border border-gray-200">
                                    <motion.button
                                      type="button"
                                      onClick={() => setAudioPlaying(!audioPlaying)}
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg"
                                    >
                                      {audioPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                    </motion.button>
                                    <div className="flex-1">
                                      <div className="font-sans text-sm text-dark-charcoal">Audio enregistré</div>
                                      <div className="text-xs text-dark-charcoal/60">{(watchedValues as any).versoAudio}</div>
                                    </div>
                                    <motion.button
                                      type="button"
                                      onClick={() => removeMedia('versoAudio')}
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </motion.button>
                                  </div>
                                ) : (
                                  <motion.button
                                    type="button"
                                    onClick={handleAudioUpload}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full h-16 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 hover:border-gray-400 transition-colors"
                                  >
                                    <Volume2 className="w-6 h-6 text-gray-400" />
                                    <span className="font-sans text-sm text-gray-500">Enregistrer la prononciation</span>
                                  </motion.button>
                                )}
                              </div>
                            )}

                            {/* Image Verso avec recherche Pexels */}
                            <div>
                              <label className="block font-sans text-sm font-medium text-dark-charcoal mb-2">
                                Image d'illustration (optionnelle)
                              </label>
                              
                              {(watchedValues as any).versoImage ? (
                                <div className="relative">
                                  <img 
                                    src={(watchedValues as any).versoImage} 
                                    alt="Illustration verso" 
                                    className="w-full h-48 object-cover rounded-xl border border-gray-200"
                                  />
                                  <motion.button
                                    type="button"
                                    onClick={() => removeMedia('versoImage')}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </motion.button>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {/* Barre de recherche Pexels */}
                                  <div className="relative">
                                    <input
                                      type="text"
                                      placeholder="Rechercher une image sur Pexels..."
                                      className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pastel-purple transition-colors font-sans"
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault()
                                          // TODO: Appeler API Pexels
                                          console.log('Recherche Pexels:', (e.target as HTMLInputElement).value)
                                        }
                                      }}
                                    />
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                  </div>
                                  
                                  {/* Bouton d'ajout d'image */}
                                  <motion.button
                                    type="button"
                                    onClick={() => {
                                      // TODO: Ouvrir sélecteur Pexels ou upload local
                                      handleImageUpload('versoImage')
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-gray-400 transition-colors"
                                  >
                                    <ImageIcon className="w-8 h-8 text-gray-400" />
                                    <span className="font-sans text-sm text-gray-500">Ajouter une image</span>
                                    <span className="font-sans text-xs text-gray-400">Recherche Pexels ou upload local</span>
                                  </motion.button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="cloze"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                      >
                        {/* Cloze content */}
                        <div className="bg-white/50 rounded-2xl p-6 border border-white/60">
                          <div className="flex items-center gap-2 mb-4">
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: themeColors.secondary }}
                            >
                              <Type className="w-4 h-4" style={{ color: themeColors.accent }} />
                            </div>
                            <h3 className="font-display text-lg font-semibold text-dark-charcoal">Texte à trous</h3>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <label htmlFor="clozeTextTarget" className="block font-sans text-sm font-medium text-dark-charcoal mb-2">
                                Texte avec trous *
                              </label>
                              <textarea
                                id="clozeTextTarget"
                                {...register('clozeTextTarget')}
                                rows={4}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pastel-purple transition-colors font-sans resize-none"
                                placeholder="La capitale de la France est {{c1::Paris}}."
                              />
                              <p className="mt-1 text-xs text-dark-charcoal/60 font-sans">
                                Utilisez le format {'{{c1::réponse}}'} pour créer des trous
                              </p>
                              {(errors as any).clozeTextTarget && (
                                <motion.p 
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="mt-1 text-sm text-red-600 flex items-center gap-1"
                                >
                                  <AlertCircle className="w-4 h-4" />
                                  {(errors as any).clozeTextTarget.message}
                                </motion.p>
                              )}
                            </div>

                            {/* Image Cloze */}
                            <div>
                              <label className="block font-sans text-sm font-medium text-dark-charcoal mb-2">
                                Image (optionnelle)
                              </label>
                              {(watchedValues as any).clozeImage ? (
                                <div className="relative">
                                  <img 
                                    src={(watchedValues as any).clozeImage} 
                                    alt="Cloze" 
                                    className="w-full h-32 object-cover rounded-xl border border-gray-200"
                                  />
                                  <motion.button
                                    type="button"
                                    onClick={() => removeMedia('clozeImage')}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </motion.button>
                                </div>
                              ) : (
                                <motion.button
                                  type="button"
                                  onClick={() => handleImageUpload('clozeImage')}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-gray-400 transition-colors"
                                >
                                  <ImageIcon className="w-8 h-8 text-gray-400" />
                                  <span className="font-sans text-sm text-gray-500">Ajouter une image</span>
                                </motion.button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Section EXTRA commune */}
                  <div className="bg-white/30 rounded-2xl p-6 border border-white/40">
                    <h3 className="font-display text-lg font-semibold text-dark-charcoal mb-4">Informations supplémentaires</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="extra" className="block font-sans text-sm font-medium text-dark-charcoal mb-2">
                          Contexte, mnémotechnique, exemple...
                        </label>
                        <textarea
                          id="extra"
                          {...register('extra')}
                          rows={2}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pastel-purple transition-colors font-sans resize-none"
                          placeholder="Informations complémentaires pour aider à la mémorisation"
                        />
                      </div>

                      <div>
                        <label htmlFor="tags" className="block font-sans text-sm font-medium text-dark-charcoal mb-2">
                          Tags
                        </label>
                        <input
                          id="tags"
                          type="text"
                          {...register('tags')}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pastel-purple transition-colors font-sans"
                          placeholder="géographie, capitale, france"
                        />
                        <p className="mt-1 text-xs text-dark-charcoal/60 font-sans">
                          Séparez les tags par des virgules
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Message d'erreur */}
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-50 border border-red-200 rounded-xl"
                    >
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="font-sans text-sm text-red-700">{error}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                    <motion.button
                      type="button"
                      onClick={onClose}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 font-sans font-medium text-dark-charcoal bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Annuler
                    </motion.button>
                    
                    <motion.button
                      type="submit"
                      disabled={!isValid || isLoading}
                      whileHover={{ scale: isValid && !isLoading ? 1.02 : 1 }}
                      whileTap={{ scale: isValid && !isLoading ? 0.98 : 1 }}
                      className="px-6 py-3 font-sans font-semibold text-white rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                      style={{ 
                        background: isValid && !isLoading 
                          ? `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.accent})`
                          : '#9CA3AF'
                      }}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          />
                          Création...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          Créer la carte
                        </div>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
