import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import InlineAlert from '../ui/InlineAlert'

const securitySchema = z.object({
  currentPassword: z.string().min(1, 'Le mot de passe actuel est requis'),
  newPassword: z.string()
    .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Za-z]/, 'Le mot de passe doit contenir au moins une lettre')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
})

type SecurityFormData = z.infer<typeof securitySchema>

export default function SecurityForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<SecurityFormData>({
    resolver: zodResolver(securitySchema)
  })

  const onSubmit = async (_data: SecurityFormData) => {
    setIsSubmitting(true)
    setShowSuccess(false)

    try {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock - log de la demande de changement
      console.log('change-password', { redacted: true })

      setShowSuccess(true)
      reset()
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {showSuccess && (
        <InlineAlert tone="success">
          Mot de passe mis à jour (mock)
        </InlineAlert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Mot de passe actuel */}
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Mot de passe actuel *
          </label>
          <input
            {...register('currentPassword')}
            type="password"
            id="currentPassword"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.currentPassword ? 'border-red-300' : 'border-gray-300'
            }`}
            aria-describedby={errors.currentPassword ? 'currentPassword-error' : undefined}
          />
          {errors.currentPassword && (
            <p id="currentPassword-error" className="mt-1 text-sm text-red-600">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        {/* Nouveau mot de passe */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Nouveau mot de passe *
          </label>
          <input
            {...register('newPassword')}
            type="password"
            id="newPassword"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.newPassword ? 'border-red-300' : 'border-gray-300'
            }`}
            aria-describedby={errors.newPassword ? 'newPassword-error' : 'newPassword-help'}
          />
          {errors.newPassword && (
            <p id="newPassword-error" className="mt-1 text-sm text-red-600">
              {errors.newPassword.message}
            </p>
          )}
          <p id="newPassword-help" className="mt-1 text-sm text-gray-500">
            Minimum 8 caractères, au moins une lettre et un chiffre
          </p>
        </div>

        {/* Confirmation du mot de passe */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirmer le nouveau mot de passe *
          </label>
          <input
            {...register('confirmPassword')}
            type="password"
            id="confirmPassword"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
            }`}
            aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
          />
          {errors.confirmPassword && (
            <p id="confirmPassword-error" className="mt-1 text-sm text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Bouton de soumission */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Mise à jour...' : 'Changer le mot de passe'}
          </button>
        </div>
      </form>
    </div>
  )
}
