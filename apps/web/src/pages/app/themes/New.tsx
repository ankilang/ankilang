import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import ThemeForm from '../../../components/themes/ThemeForm'
import { addMockTheme } from '../../../data/mockData'
import { CreateThemeSchema } from '@ankilang/shared'
import type { z } from 'zod'
import PageMeta from '../../../components/seo/PageMeta'

export default function NewTheme() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()

  const handleSubmit = async (data: z.infer<typeof CreateThemeSchema>) => {
    setIsLoading(true)
    setError(undefined)
    
    try {
      // Mock: simuler un délai de création
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Creating theme:', data)
      
      // Créer le thème mock
      const newTheme = addMockTheme(data)
      
      // Rediriger vers le détail du thème
      navigate(`/app/themes/${newTheme.id}`)
    } catch (err) {
      setError('Erreur lors de la création du thème. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <PageMeta 
        title="Nouveau thème — Ankilang" 
        description="Créez un nouveau thème de flashcards." 
      />
      
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/app/themes')}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Nouveau thème</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Créer un nouveau thème
                </h2>
                <p className="text-gray-600">
                  Organisez vos flashcards par thème et langue cible. Vous pourrez ensuite ajouter des cartes Basic et Cloze.
                </p>
              </div>

              <ThemeForm
                onSubmit={handleSubmit}
                isLoading={isLoading}
                error={error}
              />
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
