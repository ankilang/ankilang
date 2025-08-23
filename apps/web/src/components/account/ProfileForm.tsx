import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { UserProfile } from '../../data/mockAccount'
import { updateProfile } from '../../data/mockAccount'

const profileSchema = z.object({
  displayName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  bio: z.string().max(160, 'La bio ne peut pas dépasser 160 caractères').optional(),
  location: z.string().max(60, 'Le lieu ne peut pas dépasser 60 caractères').optional(),
  avatarFile: z.instanceof(File).optional()
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileFormProps {
  user: UserProfile
  onUpdate: (user: UserProfile) => void
}

export default function ProfileForm({ user, onUpdate }: ProfileFormProps) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarUrl || null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user.displayName,
      bio: user.bio || '',
      location: user.location || ''
    }
  })

  const watchedDisplayName = watch('displayName')

  // Gestion de l'upload d'avatar
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validation du fichier
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Veuillez sélectionner une image' })
        return
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setMessage({ type: 'error', text: 'L\'image doit faire moins de 5MB' })
        return
      }

      // Créer la preview
      const previewUrl = URL.createObjectURL(file)
      setAvatarPreview(previewUrl)
      setValue('avatarFile', file)
      setMessage(null)
    }
  }

  const handleRemoveAvatar = () => {
    setAvatarPreview(null)
    setValue('avatarFile', undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Cleanup des URLs d'object
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview !== user.avatarUrl) {
        URL.revokeObjectURL(avatarPreview)
      }
    }
  }, [avatarPreview, user.avatarUrl])

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true)
    setMessage(null)

    try {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mettre à jour le profil
      const updatedAccount = updateProfile({
        displayName: data.displayName,
        bio: data.bio,
        location: data.location,
        avatarUrl: avatarPreview || undefined
      })

      onUpdate(updatedAccount.user)
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du profil' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
      {/* Message de feedback */}
      {message && (
        <div
          aria-live="polite"
          className={`p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border-green-200' 
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Avatar */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Photo de profil
        </label>
        <div className="flex items-center gap-4">
          {/* Preview */}
          <div className="flex-shrink-0">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Aperçu de l'avatar"
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 text-lg">?</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 sm:gap-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              id="avatar-upload"
            />
            <label
              htmlFor="avatar-upload"
              className="px-4 py-3 sm:py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors inline-flex items-center justify-center focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            >
              Choisir une image
            </label>
            {avatarPreview && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="px-4 py-3 sm:py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors inline-flex items-center justify-center focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:outline-none"
              >
                Supprimer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Nom d'affichage */}
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
          Nom d'affichage *
        </label>
        <input
          {...register('displayName')}
          type="text"
          id="displayName"
          className={`w-full px-4 py-3 sm:px-3 sm:py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.displayName ? 'border-red-300' : 'border-gray-300'
          }`}
          aria-describedby={errors.displayName ? 'displayName-error' : undefined}
        />
        {errors.displayName && (
          <p id="displayName-error" className="mt-1 text-sm text-red-600">
            {errors.displayName.message}
          </p>
        )}
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
          Bio
        </label>
        <textarea
          {...register('bio')}
          id="bio"
          rows={3}
          maxLength={160}
          className={`w-full px-4 py-3 sm:px-3 sm:py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.bio ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Parlez-nous un peu de vous..."
          aria-describedby={errors.bio ? 'bio-error' : 'bio-help'}
        />
        {errors.bio && (
          <p id="bio-error" className="mt-1 text-sm text-red-600">
            {errors.bio.message}
          </p>
        )}
        <p id="bio-help" className="mt-1 text-sm text-gray-500">
          Maximum 160 caractères
        </p>
      </div>

      {/* Lieu */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
          Lieu
        </label>
        <input
          {...register('location')}
          type="text"
          id="location"
          maxLength={60}
          className={`w-full px-4 py-3 sm:px-3 sm:py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.location ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Ville, Pays"
          aria-describedby={errors.location ? 'location-error' : 'location-help'}
        />
        {errors.location && (
          <p id="location-error" className="mt-1 text-sm text-red-600">
            {errors.location.message}
          </p>
        )}
        <p id="location-help" className="mt-1 text-sm text-gray-500">
          Maximum 60 caractères
        </p>
      </div>

      {/* Bouton de soumission */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !watchedDisplayName.trim()}
          className="px-4 py-3 sm:px-6 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium inline-flex items-center justify-center"
        >
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}
