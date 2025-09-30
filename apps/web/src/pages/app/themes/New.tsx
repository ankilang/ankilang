import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import ThemeForm from '../../../components/themes/ThemeForm'
import { themesService } from '../../../services/themes.service'
import { useAuth } from '../../../hooks/useAuth'
import { CreateThemeSchema } from '@ankilang/shared'
import type { z } from 'zod'
import PageMeta from '../../../components/seo/PageMeta'

export default function NewTheme() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()

  const handleSubmit = async (data: z.infer<typeof CreateThemeSchema>) => {
    if (!user) {
      setError('Vous devez être connecté pour créer un thème.')
      return
    }

    setIsLoading(true)
    setError(undefined)
    
    try {
      console.log('Creating theme with Appwrite:', data)
      
      // Créer le thème via Appwrite
      const newTheme = await themesService.createTheme(user.$id, data)
      
      console.log('Theme created successfully:', newTheme)
      
      // Rediriger vers le détail du thème
      navigate(`/app/themes/${newTheme.$id}`)
    } catch (err) {
      console.error('Error creating theme:', err)
      
      // Gérer les erreurs spécifiques d'Appwrite
      if (err instanceof Error) {
        if (err.message.includes('Collection') && err.message.includes('not found')) {
          setError('Collections Appwrite non créées. Vérifiez la configuration.')
        } else if (err.message.includes('permission')) {
          setError('Permissions insuffisantes. Vérifiez la configuration Appwrite.')
        } else {
          setError(`Erreur : ${err.message}`)
        }
      } else {
        setError('Erreur lors de la création du thème. Vérifiez votre connexion.')
      }
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
        {/* Header Simplifié - SANS statistiques */}
        <motion.header 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white shadow-sm border-b border-gray-100"
        >
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/app/themes')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Retour aux thèmes"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div>
                <h1 className="text-2xl font-playfair font-bold text-dark-charcoal">
                  Nouveau thème
                </h1>
                <p className="text-sm text-dark-charcoal/70 font-sans mt-1">
                  Créez un nouveau thème de flashcards pour apprendre une langue
                </p>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Contenu principal */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <ThemeForm
                onSubmit={handleSubmit}
                isLoading={isLoading}
                error={error}
                
              />
            </motion.div>
          </div>
        </main>
      </div>
    </>
  )
}
