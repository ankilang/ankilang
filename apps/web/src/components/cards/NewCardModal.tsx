import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { CreateCardSchema } from '@ankilang/shared'

const basicCardSchema = z.object({
  type: z.literal('basic'),
  frontFR: z.string().min(1, 'La question est requise'),
  backText: z.string().min(1, 'La réponse est requise'),
  extra: z.string().optional(),
  tags: z.string().optional()
})

const clozeCardSchema = z.object({
  type: z.literal('cloze'),
  clozeTextTarget: z.string().min(1, 'Le texte à trous est requis').refine(
    (text) => /\{\{c\d+::[^}]+\}\}/.test(text),
    'Le texte doit contenir au moins un trou au format {{cN::...}}'
  ),
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
  themeColors?: {
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
  themeColors 
}: NewCardModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      type: 'basic'
    }
  })

  const cardType = watch('type')

  useEffect(() => {
    if (!isOpen) {
      reset()
    }
  }, [isOpen, reset])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleFormSubmit = (data: CardFormData) => {
    const tags = data.tags 
      ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      : []
    
    onSubmit({
      themeId,
      type: data.type,
      frontFR: data.type === 'basic' ? data.frontFR : undefined,
      backText: data.type === 'basic' ? data.backText : undefined,
      clozeTextTarget: data.type === 'cloze' ? data.clozeTextTarget : undefined,
      extra: data.extra,
      tags
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
              Nouvelle carte
            </h2>
            <p id="modal-description" className="text-sm text-gray-600 mt-1">
              Créez une carte Basic ou Cloze pour votre thème
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fermer la modale"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {error && (
            <div 
              className="p-4 bg-red-50 border border-red-200 rounded-lg"
              aria-live="polite"
            >
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de carte *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="basic"
                  {...register('type')}
                  className="mr-2"
                />
                <span className="text-sm">Basic (Question/Réponse)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="cloze"
                  {...register('type')}
                  className="mr-2"
                />
                <span className="text-sm">Cloze (Texte à trous)</span>
              </label>
            </div>
          </div>

          {cardType === 'basic' ? (
            <>
              <div>
                <label htmlFor="frontFR" className="block text-sm font-medium text-gray-700 mb-2">
                  Question *
                </label>
                <textarea
                  id="frontFR"
                  {...register('frontFR')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Comment dit-on 'bonjour' en anglais ?"
                  aria-describedby={'frontFR-error'}
                />
                {(errors as any).frontFR && (
                  <p id="frontFR-error" className="mt-1 text-sm text-red-600">
                    {(errors as any).frontFR?.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="backText" className="block text-sm font-medium text-gray-700 mb-2">
                  Réponse *
                </label>
                <textarea
                  id="backText"
                  {...register('backText')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Hello"
                  aria-describedby={'backText-error'}
                />
                {(errors as any).backText && (
                  <p id="backText-error" className="mt-1 text-sm text-red-600">
                    {(errors as any).backText?.message}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div>
              <label htmlFor="clozeTextTarget" className="block text-sm font-medium text-gray-700 mb-2">
                Texte à trous *
              </label>
              <textarea
                id="clozeTextTarget"
                {...register('clozeTextTarget')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Le {{c1::chat}} {{c2::mange}} la {{c3::souris}}"
                aria-describedby={'clozeTextTarget-error'}
              />
              {(errors as any).clozeTextTarget && (
                <p id="clozeTextTarget-error" className="mt-1 text-sm text-red-600">
                  {(errors as any).clozeTextTarget?.message}
                </p>
              )}
                              <p className="mt-1 text-sm text-gray-500">
                  Utilisez {'{{c1::mot}}'} pour créer des trous numérotés
                </p>
            </div>
          )}

          <div>
            <label htmlFor="extra" className="block text-sm font-medium text-gray-700 mb-2">
              Informations supplémentaires (optionnel)
            </label>
            <textarea
              id="extra"
              {...register('extra')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Note de grammaire, exemple d'usage..."
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              Tags (optionnel)
            </label>
            <input
              id="tags"
              type="text"
              {...register('tags')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: vocabulaire, débutant, grammaire"
            />
            <p className="mt-1 text-sm text-gray-500">
              Séparez les tags par des virgules
            </p>
          </div>

          <div className="flex gap-4 sm:gap-6 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: themeColors?.primary || '#3B82F6',
                color: 'white'
              }}
            >
              {isLoading ? 'Création...' : 'Créer la carte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
