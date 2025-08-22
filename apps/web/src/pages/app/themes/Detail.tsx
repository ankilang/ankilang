import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Download, Settings } from 'lucide-react'
import CardList from '../../../components/cards/CardList'
import NewCardModal from '../../../components/cards/NewCardModal'
import { getThemeById, getCardsByThemeId, addMockCard } from '../../../data/mockData'
import { getLanguageLabel } from '../../../constants/languages'
import { CreateCardSchema } from '@ankilang/shared'
import type { z } from 'zod'
import PageMeta from '../../../components/seo/PageMeta'

export default function ThemeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()

  const theme = getThemeById(id!)
  const cards = getCardsByThemeId(id!)

  if (!theme) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Thème introuvable</h1>
          <p className="text-gray-600 mb-6">Le thème que vous recherchez n'existe pas.</p>
          <Link to="/app/themes" className="btn-primary">
            Retour aux thèmes
          </Link>
        </div>
      </div>
    )
  }

  const handleAddCard = () => {
    setIsModalOpen(true)
  }

  const handleCardSubmit = async (data: z.infer<typeof CreateCardSchema>) => {
    setIsLoading(true)
    setError(undefined)
    
    try {
      // Mock: simuler un délai de création
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Creating card:', data)
      
      // Créer la carte mock
      addMockCard(data)
      
      // Fermer la modale
      setIsModalOpen(false)
    } catch (err) {
      setError('Erreur lors de la création de la carte. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <PageMeta 
        title={`${theme.name} — Ankilang`}
        description={`Thème de flashcards en ${getLanguageLabel(theme.targetLang)} avec ${theme.cardCount} cartes.`}
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
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{theme.name}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span>{getLanguageLabel(theme.targetLang)}</span>
                    <span>•</span>
                    <span>{theme.cardCount} cartes</span>
                    <span>•</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      theme.shareStatus === 'community' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {theme.shareStatus === 'community' ? 'Partagé' : 'Privé'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/app/themes/${theme.id}/export`}
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <Download size={16} />
                  Exporter
                </Link>
                <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <Settings size={20} />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Tags du thème */}
          {theme.tags && theme.tags.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {theme.tags.map((tag: string, index: number) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Liste des cartes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <CardList
              cards={cards}
              onAddCard={handleAddCard}
              themeName={theme.name}
            />
          </div>
        </main>

        {/* Modale d'ajout de carte */}
        <NewCardModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCardSubmit}
          isLoading={isLoading}
          error={error}
          themeId={theme.id}
        />
      </div>
    </>
  )
}
