import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  X, Brain, Type, Sparkles, AlertCircle, Check
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { CreateCardSchema } from '../../types/shared'
import type { Card } from '../../types/shared'

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

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue
  } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      type: card.type,
      recto: card.type === 'basic' ? card.frontFR || '' : '',
      verso: card.type === 'basic' ? card.backText || '' : '',
      clozeTextTarget: card.type === 'cloze' ? card.clozeTextTarget || '' : '',
      extra: card.extra || '',
      tags: card.tags ? card.tags.join(', ') : ''
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
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
