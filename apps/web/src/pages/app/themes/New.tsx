import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
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
        {/* Header Simplifié - SANS statistiques */}
        <motion.header 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-pastel-purple via-pastel-green/50 to-pastel-rose/30 relative overflow-hidden"
          style={{ paddingTop: 'var(--safe-top, 0px)' }}
        >
          {/* Éléments décoratifs */}
          <div className="absolute top-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-pastel-rose/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-40 sm:w-80 h-40 sm:h-80 bg-pastel-purple/30 rounded-full blur-2xl" />
          
          <div className="relative container mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <motion.button
                onClick={() => navigate('/app/themes')}
                whileHover={{ scale: 1.1, x: -2 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg border border-white/20 text-dark-charcoal hover:bg-white transition-colors"
              >
                <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
              </motion.button>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex-1"
              >
                <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold text-dark-charcoal mb-1 sm:mb-2">
                  Studio de Création
                </h1>
                <p className="font-sans text-sm sm:text-lg text-dark-charcoal/70 max-w-2xl">
                  Donnez vie à vos idées d'apprentissage. Créez un thème personnalisé pour organiser vos flashcards.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.header>

        <main className="container mx-auto px-6 py-12 -mt-6 relative z-10 sm:px-4 sm:py-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="max-w-4xl mx-auto sm:px-0"
          >
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8 lg:p-12 sm:p-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mb-8"
              >
                <h2 className="font-display text-2xl font-bold text-dark-charcoal mb-3">
                  Créer un nouveau thème
                </h2>
                <p className="font-sans text-dark-charcoal/70 leading-relaxed">
                  Un thème vous permet d'organiser vos flashcards par sujet ou langue. 
                  Vous pourrez ensuite y ajouter des cartes Basic et Cloze pour un apprentissage structuré.
                </p>
              </motion.div>

              <ThemeForm
                onSubmit={handleSubmit}
                isLoading={isLoading}
                error={error}
              />
            </div>
          </motion.div>
        </main>
      </div>
    </>
  )
}
