import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Preferences } from '../../data/mockAccount'
import { updatePreferences, getAccount } from '../../data/mockAccount'
import { Switch } from '../ui/Switch'
import LanguageSelect from './LanguageSelect'

const preferencesSchema = z.object({
  ui: z.object({
    theme: z.enum(['system', 'light', 'dark']),
    language: z.string(),
    reducedMotion: z.boolean(),
    dyslexicFont: z.boolean(),
    textSize: z.enum(['sm', 'md', 'lg'])
  }),
  study: z.object({
    dailyGoal: z.number().min(0).max(60)
  }),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean()
  })
})

type PreferencesFormData = z.infer<typeof preferencesSchema>

interface PreferencesFormProps {
  preferences: Preferences
  onUpdate: (preferences: Preferences) => void
}

export default function PreferencesForm({ preferences, onUpdate }: PreferencesFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: preferences
  })

  const watchedValues = watch()

  const handleSubmitForm = async (data: PreferencesFormData) => {
    setIsSubmitting(true)
    setMessage(null)

    try {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mettre à jour les préférences
      const updatedAccount = updatePreferences(data)
      onUpdate(updatedAccount.preferences)
      
      setMessage({ type: 'success', text: 'Préférences enregistrées avec succès' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement des préférences' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    const account = getAccount()
    reset(account.preferences)
    setMessage({ type: 'success', text: 'Préférences réinitialisées' })
  }

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6 sm:space-y-10">
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
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {message.type === 'success' ? (
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          </div>
        </div>
      )}

      {/* Section Général */}
              <div className="space-y-4 sm:space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-xl font-semibold text-gray-900">Général</h3>
            <p className="text-gray-600 mt-1">Personnalisez l'apparence de l'interface</p>
          </div>
          
          <div className="space-y-4 sm:space-y-6">
          {/* Thème */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Thème
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {(['system', 'light', 'dark'] as const).map((theme) => (
                <label key={theme} className="relative flex cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm focus:outline-none hover:border-blue-500">
                  <input
                    {...register('ui.theme')}
                    type="radio"
                    value={theme}
                    className="sr-only"
                  />
                  <span className="flex flex-1">
                    <span className="flex flex-col">
                      <span className="block text-sm font-medium text-gray-900">
                        {theme === 'system' ? 'Système' : theme === 'light' ? 'Clair' : 'Sombre'}
                      </span>
                      <span className="mt-1 flex items-center text-sm text-gray-500">
                        {theme === 'system' ? 'Suivre les préférences système' : 
                         theme === 'light' ? 'Thème clair par défaut' : 'Thème sombre'}
                      </span>
                    </span>
                  </span>
                  <span className={`pointer-events-none absolute -inset-px rounded-lg border-2 ${
                    watchedValues.ui?.theme === theme ? 'border-blue-500' : 'border-transparent'
                  }`} />
                </label>
              ))}
            </div>
          </div>

          {/* Langue UI */}
          <LanguageSelect
            label="Langue de l'interface"
            value={watchedValues.ui?.language || ''}
            onChange={(value) => setValue('ui.language', value)}
            id="ui-language"
          />

          {/* Taille du texte */}
          <div>
            <label htmlFor="text-size" className="block text-sm font-medium text-gray-700 mb-2">
              Taille du texte
            </label>
            <select
              {...register('ui.textSize')}
              id="text-size"
              className="w-full px-4 py-3 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="sm">Petite</option>
              <option value="md">Moyenne</option>
              <option value="lg">Grande</option>
            </select>
          </div>

          {/* Réduction des animations */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <label htmlFor="reduced-motion" className="text-sm font-medium text-gray-700">
                Réduire les animations
              </label>
              <p className="text-sm text-gray-500 mt-1">
                Respecte la préférence système pour les animations réduites
              </p>
            </div>
            <Switch
              id="reduced-motion"
              checked={watchedValues.ui?.reducedMotion || false}
              onChange={(checked) => setValue('ui.reducedMotion', checked)}
            />
          </div>

          {/* Police dyslexique */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <label htmlFor="dyslexic-font" className="text-sm font-medium text-gray-700">
                Police adaptée à la dyslexie
              </label>
              <p className="text-sm text-gray-500 mt-1">
                Utilise une police plus lisible pour les personnes dyslexiques
              </p>
            </div>
            <Switch
              id="dyslexic-font"
              checked={watchedValues.ui?.dyslexicFont || false}
              onChange={(checked) => setValue('ui.dyslexicFont', checked)}
            />
          </div>
        </div>
      </div>

      {/* Section Apprentissage */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-xl font-semibold text-gray-900">Apprentissage</h3>
          <p className="text-gray-600 mt-1">Configurez vos habitudes d'étude</p>
        </div>
        
        <div className="space-y-6">
          {/* Langue cible par défaut */}
          <LanguageSelect
            label="Langue cible par défaut"
            value={watchedValues.ui?.language || ''}
            onChange={(value) => setValue('ui.language', value)}
            id="default-target-lang"
            placeholder="Choisir une langue cible"
          />

          {/* Objectif quotidien */}
          <div>
            <label htmlFor="daily-goal" className="block text-sm font-medium text-gray-700 mb-2">
              Objectif quotidien (cartes)
            </label>
            <input
              {...register('study.dailyGoal', { valueAsNumber: true })}
              type="number"
              id="daily-goal"
              min="0"
              max="60"
              className="w-full px-4 py-3 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-describedby={errors.study?.dailyGoal ? 'daily-goal-error' : undefined}
            />
            {errors.study?.dailyGoal && (
              <p id="daily-goal-error" className="mt-1 text-sm text-red-600">
                {errors.study.dailyGoal.message}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Nombre de cartes à réviser chaque jour (0-60)
            </p>
          </div>
        </div>
      </div>

      {/* Section Notifications */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-xl font-semibold text-gray-900">Notifications</h3>
          <p className="text-gray-600 mt-1">Gérez vos préférences de notifications</p>
        </div>
        
        <div className="space-y-4 sm:space-y-6">
          {/* Notifications email */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <label htmlFor="email-notifications" className="text-sm font-medium text-gray-700">
                Notifications par email
              </label>
              <p className="text-sm text-gray-500 mt-1">
                Recevoir des rappels et mises à jour par email
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={watchedValues.notifications?.email || false}
              onChange={(checked) => setValue('notifications.email', checked)}
            />
          </div>

          {/* Notifications push */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <label htmlFor="push-notifications" className="text-sm font-medium text-gray-700">
                Notifications push
              </label>
              <p className="text-sm text-gray-500 mt-1">
                Recevoir des notifications sur votre appareil
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={watchedValues.notifications?.push || false}
              onChange={(checked) => setValue('notifications.push', checked)}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-6 pt-8 border-t border-gray-200">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-3 sm:px-6 sm:py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium inline-flex items-center justify-center focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:outline-none"
        >
          Réinitialiser
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-3 sm:px-8 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium inline-flex items-center justify-center focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
        >
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer les préférences'}
        </button>
      </div>
    </form>
  )
}
