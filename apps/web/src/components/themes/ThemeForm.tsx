import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LANGUAGES } from '../../constants/languages'
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
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ThemeFormData>({
    resolver: zodResolver(themeFormSchema),
    defaultValues: initialData
  })

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

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 sm:space-y-6">
      {error && (
        <div 
          className="p-4 bg-red-50 border border-red-200 rounded-lg"
          aria-live="polite"
        >
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Nom du thème *
        </label>
        <input
          id="name"
          type="text"
          {...register('name')}
          className="w-full px-4 py-3 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ex: Vocabulaire de base"
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id="name-error" className="mt-1 text-sm text-red-600">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="targetLang" className="block text-sm font-medium text-gray-700 mb-2">
          Langue cible *
        </label>
        <select
          id="targetLang"
          {...register('targetLang')}
          className="w-full px-4 py-3 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-describedby={errors.targetLang ? 'targetLang-error' : undefined}
        >
          <option value="">Sélectionnez une langue</option>
          {LANGUAGES.map((language) => (
            <option key={language.code} value={language.code}>
              {language.label} {language.nativeName && `(${language.nativeName})`}
            </option>
          ))}
        </select>
        {errors.targetLang && (
          <p id="targetLang-error" className="mt-1 text-sm text-red-600">
            {errors.targetLang.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
          Tags (optionnel)
        </label>
        <input
          id="tags"
          type="text"
          {...register('tags')}
          className="w-full px-4 py-3 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ex: vocabulaire, débutant, grammaire"
        />
        <p className="mt-1 text-sm text-gray-500">
          Séparez les tags par des virgules
        </p>
      </div>

      <div>
        <label htmlFor="shareStatus" className="block text-sm font-medium text-gray-700 mb-2">
          Statut de partage
        </label>
        <select
          id="shareStatus"
          {...register('shareStatus')}
          className="w-full px-4 py-3 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="private">Privé (seulement vous)</option>
          <option value="community">Communauté (partageable)</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium inline-flex items-center justify-center focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
      >
        {isLoading ? 'Création...' : 'Créer le thème'}
      </button>
    </form>
  )
}
