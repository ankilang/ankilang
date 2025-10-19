import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  X, Brain, Type, Sparkles, AlertCircle, Check, Trash2, Search, Volume2, Eye
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { CreateCardSchema } from '../../types/shared'
import type { Card } from '../../types/shared'
import { pexelsSearchPhotos } from '../../services/pexels'
import { getCachedImage } from '../../services/image-cache'
import AudioPlayer from './AudioPlayer'
import { generateTTS } from '../../services/tts'

const basicCardSchema = z.object({
  type: z.literal('basic'),
  // RECTO
  recto: z.string().min(1, 'Le contenu du recto est requis'),
  rectoImage: z.string().optional(),
  rectoImageType: z.enum(['appwrite', 'external']).optional(),
  // VERSO
  verso: z.string().min(1, 'Le contenu du verso est requis'),
  versoImage: z.string().optional(),
  versoImageType: z.enum(['appwrite', 'external']).optional(),
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
  clozeImageType: z.enum(['appwrite', 'external']).optional(),
  extra: z.string().optional(),
  tags: z.string().optional()
})

const cardSchema = z.discriminatedUnion('type', [basicCardSchema, clozeCardSchema])

type CardFormData = z.infer<typeof cardSchema>

interface EditCardModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: z.infer<typeof CreateCardSchema>) => void
  isLoading?: boolean
  error?: string
  card: Card
  themeColors: {
    primary: string
    secondary: string
    accent: string
    gradient: string
  }
}

export default function EditCardModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading = false, 
  error,
  card,
  themeColors
}: EditCardModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [selectedType, setSelectedType] = useState<'basic' | 'cloze'>(card.type)
  
  // États pour la gestion des images
  const [showImageSelector, setShowImageSelector] = useState(false)
  const [imageQuery, setImageQuery] = useState('')
  const [imageResults, setImageResults] = useState<any[]>([])
  const [isLoadingImages, setIsLoadingImages] = useState(false)
  const [isOptimizingImage, setIsOptimizingImage] = useState(false)
  const [currentImageField, setCurrentImageField] = useState<'versoImage' | 'clozeImage' | null>(null)
  
  // États pour la gestion de l'audio
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch
  } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      type: card.type,
      recto: card.type === 'basic' ? card.frontFR || '' : '',
      verso: card.type === 'basic' ? card.backText || '' : '',
      clozeTextTarget: card.type === 'cloze' ? card.clozeTextTarget || '' : '',
      extra: card.extra || '',
      tags: card.tags ? card.tags.join(', ') : '',
      // Images avec leurs types
      versoImage: card.imageUrl || '',
      versoImageType: card.imageUrlType || 'external',
      clozeImage: card.imageUrl || '',
      clozeImageType: card.imageUrlType || 'external',
      // Audio
      versoAudio: card.audioUrl || ''
    },
    mode: 'onChange'
  })

  useEffect(() => {
    if (isOpen) {
      // Pré-remplir le formulaire avec les données de la carte
      setSelectedType(card.type)
      setValue('type', card.type)
      if (card.type === 'basic') {
        setValue('recto', card.frontFR || '')
        setValue('verso', card.backText || '')
        setValue('clozeTextTarget', undefined as any)
      } else {
        setValue('clozeTextTarget', card.clozeTextTarget || '')
        setValue('recto', undefined as any)
        setValue('verso', undefined as any)
      }
      setValue('extra', card.extra || '')
      setValue('tags', card.tags ? card.tags.join(', ') : '')
    }
  }, [isOpen, card, setValue])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Fonctions de gestion des images
  const handleSearchImages = async () => {
    if (!imageQuery.trim()) return
    
    setIsLoadingImages(true)
    try {
      const results = await pexelsSearchPhotos(imageQuery, { per_page: 12 })
      setImageResults(results.photos || [])
    } catch (error) {
      console.error('Erreur lors de la recherche d\'images:', error)
      setImageResults([])
    } finally {
      setIsLoadingImages(false)
    }
  }

  const handleSelectImage = async (image: any) => {
    if (!currentImageField) return

    setIsOptimizingImage(true)
    try {
      // ✨ NOUVEAU: Utiliser le cache multi-niveau (IDB → Appwrite → API)
      const result = await getCachedImage(image, {
        width: 600,
        height: 400,
        format: 'webp',
        quality: 80
      })

      if (result.appwriteUrl) {
        // L'image est déjà dans le cache Appwrite, utiliser son URL publique
        console.log('✅ Image depuis cache Appwrite:', result.appwriteUrl)
        setValue(currentImageField, result.appwriteUrl)
        setValue(`${currentImageField}Type` as any, 'appwrite')
      } else {
        // Fallback: URL Pexels directe
        console.log('⚠️ Appwrite URL non disponible, fallback sur Pexels')
        setValue(currentImageField, image.src.medium)
        setValue(`${currentImageField}Type` as any, 'external')
      }

      // Révoquer l'Object URL car on n'en a plus besoin
      URL.revokeObjectURL(result.url)
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'image:', error)
      // Fallback: utiliser l'URL Pexels directe
      setValue(currentImageField, image.src.medium)
      setValue(`${currentImageField}Type` as any, 'external')
    } finally {
      setIsOptimizingImage(false)
      setShowImageSelector(false)
      setCurrentImageField(null)
    }
  }

  const handleRemoveImage = (field: 'versoImage' | 'clozeImage') => {
    setValue(field, '')
    setValue(`${field}Type` as any, 'external')
  }

  // Fonctions de gestion de l'audio
  const handleGenerateAudio = async () => {
    if (!watch('verso')) {
      alert('Veuillez d\'abord saisir la réponse')
      return
    }
    
    setIsGeneratingAudio(true)
    try {
      // Utiliser le système TTS existant
      const result = await generateTTS({
        text: watch('verso'),
        language_code: card.targetLanguage || 'fr',
        voice_id: '21m00Tcm4TlvDq8ikWAM',
        save: false
      })
      
      setValue('versoAudio', result.url)
    } catch (error) {
      console.error('Erreur lors de la génération audio:', error)
      alert('Erreur lors de la génération de l\'audio')
    } finally {
      setIsGeneratingAudio(false)
    }
  }

  const handleRemoveAudio = () => {
    setValue('versoAudio', '')
  }

  // Fonction utilitaire pour obtenir l'URL d'image
  const getImageUrl = (imageUrl: string, imageType: string) => {
    if (!imageUrl) return ''
    if (imageType === 'appwrite') {
      return imageUrl
    }
    return imageUrl
  }

  const handleOpenImageSelector = (field: 'versoImage' | 'clozeImage') => {
    setCurrentImageField(field)
    setShowImageSelector(true)
    setImageQuery('')
    setImageResults([])
  }

  const handleTypeChange = (type: 'basic' | 'cloze') => {
    setSelectedType(type)
    setValue('type', type)
    // Reset form fields when changing type
    if (type === 'basic') {
      setValue('recto', '')
      setValue('verso', '')
      setValue('clozeTextTarget', undefined as any)
    } else {
      setValue('clozeTextTarget', '')
      setValue('recto', undefined as any)
      setValue('verso', undefined as any)
    }
  }

  const handleFormSubmit = (data: CardFormData) => {
    const submitData = {
      ...data,
      themeId: card.themeId,
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      // Gestion des images avec leurs types
      imageUrl: selectedType === 'basic' ? (data as any).versoImage : (data as any).clozeImage,
      imageUrlType: selectedType === 'basic' ? (data as any).versoImageType : (data as any).clozeImageType,
      // Gestion de l'audio (uniquement pour les cartes Basic)
      audioUrl: selectedType === 'basic' ? (data as any).versoAudio : undefined
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
          {/* Backdrop blur */}
          <div className="absolute inset-0 backdrop-blur-sm" />
          
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden"
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
                        Modifier la carte
                      </h2>
                      <p className="font-sans text-sm text-dark-charcoal/70">
                        Modifiez le contenu de votre carte
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
                  {/* Sélecteur de type de carte */}
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
                            <div className="font-sans font-semibold">Basic</div>
                            <div className="text-xs opacity-70">Question/Réponse</div>
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

                  {/* Champs dynamiques selon le type */}
                  <AnimatePresence mode="wait">
                    {selectedType === 'basic' ? (
                      <motion.div
                        key="basic"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-4"
                      >
                        <div>
                                                      <label htmlFor="recto" className="block font-sans text-sm font-medium text-dark-charcoal mb-2">
                              Question *
                            </label>
                            <textarea
                              id="recto"
                              {...register('recto')}
                            rows={3}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pastel-purple transition-colors font-sans resize-none"
                            placeholder="Quelle est la capitale de la France ?"
                          />
                          {(errors as any).frontFR && (
                            <motion.p 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-1 text-sm text-red-600 flex items-center gap-1"
                            >
                              <AlertCircle className="w-4 h-4" />
                              {(errors as any).frontFR.message}
                            </motion.p>
                          )}
                        </div>

                        <div>
                                                      <label htmlFor="verso" className="block font-sans text-sm font-medium text-dark-charcoal mb-2">
                              Réponse *
                            </label>
                            <textarea
                              id="verso"
                              {...register('verso')}
                            rows={3}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pastel-purple transition-colors font-sans resize-none"
                            placeholder="Paris"
                          />
                          {(errors as any).backText && (
                            <motion.p 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-1 text-sm text-red-600 flex items-center gap-1"
                            >
                              <AlertCircle className="w-4 h-4" />
                              {(errors as any).backText.message}
                            </motion.p>
                          )}
                        </div>

                        {/* Section Image pour le verso */}
                        <div>
                          <label className="block font-sans text-sm font-medium text-dark-charcoal mb-2">
                            Image (optionnel)
                          </label>
                          
                          {/* Affichage de l'image actuelle */}
                          {watch('versoImage') && (
                            <div className="mb-3">
                              <div className="relative inline-block group">
                                <img 
                                  src={getImageUrl(watch('versoImage') || '', watch('versoImageType') || 'external')}
                                  alt="Image actuelle"
                                  className="w-32 h-24 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                  width="128"
                                  height="96"
                                  loading="lazy"
                                  decoding="async"
                                  onClick={() => window.open(getImageUrl(watch('versoImage') || '', watch('versoImageType') || 'external'), '_blank')}
                                />
                                
                                {/* Overlay "Voir en grand" */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                  <button
                                    type="button"
                                    onClick={() => window.open(getImageUrl(watch('versoImage') || '', watch('versoImageType') || 'external'), '_blank')}
                                    className="flex items-center gap-1 px-2 py-1 bg-white/90 text-gray-800 rounded-md text-xs font-medium hover:bg-white transition-colors"
                                  >
                                    <Eye size={12} />
                                    Voir en grand
                                  </button>
                                </div>
                                
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage('versoImage')}
                                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Boutons de gestion d'image */}
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenImageSelector('versoImage')}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              <Search size={16} />
                              {watch('versoImage') ? 'Modifier l\'image' : 'Ajouter une image'}
                            </button>
                            
                            {watch('versoImage') && (
                              <button
                                type="button"
                                onClick={() => handleRemoveImage('versoImage')}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                              >
                                <Trash2 size={16} />
                                Supprimer
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Section Audio pour les cartes Basic */}
                        <div>
                          <label className="block font-sans text-sm font-medium text-dark-charcoal mb-2">
                            Audio de prononciation
                          </label>
                          
                          {/* Affichage de l'audio actuel */}
                          {watch('versoAudio') && (
                            <div className="mb-3">
                              <AudioPlayer
                                src={watch('versoAudio') || ''}
                                onDelete={handleRemoveAudio}
                                size="md"
                              />
                            </div>
                          )}

                          {/* Boutons de gestion d'audio */}
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={handleGenerateAudio}
                              disabled={isGeneratingAudio || !watch('verso')}
                              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Volume2 size={16} />
                              {isGeneratingAudio ? 'Génération...' : (watch('versoAudio') ? 'Régénérer l\'audio' : 'Générer l\'audio')}
                            </button>
                            
                            {watch('versoAudio') && (
                              <button
                                type="button"
                                onClick={handleRemoveAudio}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                              >
                                <Trash2 size={16} />
                                Supprimer
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="cloze"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <div>
                          <label htmlFor="clozeTextTarget" className="block font-sans text-sm font-medium text-dark-charcoal mb-2">
                            Texte à trous *
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

                        {/* Section Image pour cloze */}
                        <div>
                          <label className="block font-sans text-sm font-medium text-dark-charcoal mb-2">
                            Image (optionnel)
                          </label>
                          
                          {/* Affichage de l'image actuelle */}
                          {watch('clozeImage') && (
                            <div className="mb-3">
                              <div className="relative inline-block">
                                <img 
                                  src={watch('clozeImageType') === 'appwrite' 
                                    ? `https://cloud.appwrite.io/v1/storage/buckets/flashcard-images/files/${watch('clozeImage')}/view?project=ankilang&mode=admin`
                                    : watch('clozeImage')
                                  }
                                  alt="Image actuelle"
                                  className="w-32 h-24 object-cover rounded-lg border-2 border-gray-200"
                                  width="128"
                                  height="96"
                                  loading="lazy"
                                  decoding="async"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage('clozeImage')}
                                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Boutons de gestion d'image */}
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenImageSelector('clozeImage')}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              <Search size={16} />
                              {watch('clozeImage') ? 'Modifier l\'image' : 'Ajouter une image'}
                            </button>
                            
                            {watch('clozeImage') && (
                              <button
                                type="button"
                                onClick={() => handleRemoveImage('clozeImage')}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                              >
                                <Trash2 size={16} />
                                Supprimer
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Champs communs */}
                  <div>
                    <label htmlFor="extra" className="block font-sans text-sm font-medium text-dark-charcoal mb-2">
                      Information supplémentaire (optionnel)
                    </label>
                    <textarea
                      id="extra"
                      {...register('extra')}
                      rows={2}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pastel-purple transition-colors font-sans resize-none"
                      placeholder="Contexte, mnémotechnique, exemple..."
                    />
                  </div>

                  <div>
                    <label htmlFor="tags" className="block font-sans text-sm font-medium text-dark-charcoal mb-2">
                      Tags (optionnel)
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

                  {/* Sélecteur d'images Pexels */}
                  {showImageSelector && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-sans font-semibold text-dark-charcoal">
                          Rechercher une image
                        </h3>
                        <button
                          type="button"
                          onClick={() => setShowImageSelector(false)}
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Barre de recherche */}
                      <div className="flex gap-2 mb-4">
                        <input
                          type="text"
                          value={imageQuery}
                          onChange={(e) => setImageQuery(e.target.value)}
                          placeholder="Rechercher une image..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          onKeyPress={(e) => e.key === 'Enter' && handleSearchImages()}
                        />
                        <button
                          type="button"
                          onClick={handleSearchImages}
                          disabled={!imageQuery.trim() || isLoadingImages}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isLoadingImages ? 'Recherche...' : 'Rechercher'}
                        </button>
                      </div>

                      {/* Résultats d'images */}
                      {imageResults.length > 0 && (
                        <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                          {imageResults.map((image, index) => (
                            <motion.button
                              key={index}
                              type="button"
                              onClick={() => handleSelectImage(image)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="relative group"
                            >
                              <img
                                src={image.src.small}
                                alt={image.alt || 'Image Pexels'}
                                className="w-full h-24 object-cover rounded-lg border-2 border-transparent group-hover:border-blue-500 transition-colors"
                                width="96"
                                height="96"
                                loading="lazy"
                                decoding="async"
                              />
                              {isOptimizingImage && (
                                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                </div>
                              )}
                            </motion.button>
                          ))}
                        </div>
                      )}

                      {imageResults.length === 0 && imageQuery && !isLoadingImages && (
                        <p className="text-center text-gray-500 py-4">
                          Aucune image trouvée pour "{imageQuery}"
                        </p>
                      )}
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
                          Modification...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          Modifier la carte
                        </div>
                      )}
                    </motion.button>
                  </div>

                  {/* Champs cachés pour les types d'images */}
                  <input type="hidden" {...register('versoImageType')} />
                  <input type="hidden" {...register('clozeImageType')} />
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
