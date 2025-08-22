import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, FileText, CheckCircle } from 'lucide-react'
import { getThemeById, getCardsByThemeId } from '../../../data/mockData'
import { getLanguageLabel } from '../../../constants/languages'
import PageMeta from '../../../components/seo/PageMeta'

export default function ThemeExport() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  const theme = getThemeById(id!)
  const cards = getCardsByThemeId(id!)

  if (!theme) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Thème introuvable</h1>
          <p className="text-gray-600 mb-6">Le thème que vous recherchez n'existe pas.</p>
          <button onClick={() => navigate('/app/themes')} className="btn-primary">
            Retour aux thèmes
          </button>
        </div>
      </div>
    )
  }

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      // Mock: simuler un délai d'export
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('Exporting theme:', {
        themeId: theme.id,
        themeName: theme.name,
        cardCount: cards.length,
        cards: cards
      })
      
      setExportSuccess(true)
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <PageMeta 
        title={`Exporter ${theme.name} — Ankilang`}
        description={`Exportez votre thème "${theme.name}" vers Anki (.apkg).`}
      />
      
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(`/app/themes/${theme.id}`)}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Exporter le thème</h1>
                  <p className="text-gray-600 mt-1">{theme.name}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Prévisualisation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Prévisualisation de l'export
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Informations du thème</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Nom :</span>
                      <span className="font-medium">{theme.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Langue cible :</span>
                      <span className="font-medium">{getLanguageLabel(theme.targetLang)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nombre de cartes :</span>
                      <span className="font-medium">{cards.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Statut :</span>
                      <span className={`font-medium ${
                        theme.shareStatus === 'community' 
                          ? 'text-green-600' 
                          : 'text-gray-600'
                      }`}>
                        {theme.shareStatus === 'community' ? 'Partagé' : 'Privé'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Types de cartes</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Cartes Basic :</span>
                      <span className="font-medium">
                        {cards.filter(card => card.type === 'basic').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cartes Cloze :</span>
                      <span className="font-medium">
                        {cards.filter(card => card.type === 'cloze').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {theme.tags && theme.tags.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {theme.tags.map((tag: string, index: number) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-50 text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Aperçu des cartes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Aperçu des cartes ({cards.length})
              </h2>
              
              {cards.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Aucune carte dans ce thème</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {cards.slice(0, 5).map((card, index) => (
                    <div key={card.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          Carte #{index + 1}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          card.type === 'basic' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {card.type === 'basic' ? 'Basic' : 'Cloze'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {card.type === 'basic' ? (
                          <div>
                            <div><strong>Q:</strong> {card.frontFR}</div>
                            <div><strong>R:</strong> {card.backText}</div>
                          </div>
                        ) : (
                          <div><strong>Texte:</strong> {card.clozeTextTarget}</div>
                        )}
                      </div>
                    </div>
                  ))}
                  {cards.length > 5 && (
                    <div className="text-center py-2 text-sm text-gray-500">
                      ... et {cards.length - 5} autres cartes
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions d'export */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Exporter vers Anki
              </h2>
              
              {exportSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Export simulé avec succès !
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Le fichier .apkg a été généré (simulation). Dans une vraie implémentation, 
                    le fichier serait téléchargé automatiquement.
                  </p>
                  <button
                    onClick={() => setExportSuccess(false)}
                    className="btn-primary"
                  >
                    Exporter à nouveau
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2">
                      Format d'export
                    </h3>
                    <p className="text-blue-800 text-sm">
                      Le thème sera exporté au format .apkg compatible avec Anki. 
                      Toutes les cartes (Basic et Cloze) seront incluses avec leurs métadonnées.
                    </p>
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={handleExport}
                      disabled={isExporting || cards.length === 0}
                      className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download size={16} />
                      {isExporting ? 'Export en cours...' : 'Simuler export'}
                    </button>
                    
                    <button
                      onClick={() => navigate(`/app/themes/${theme.id}`)}
                      className="btn-secondary"
                    >
                      Retour au thème
                    </button>
                  </div>
                  
                  {cards.length === 0 && (
                    <p className="text-sm text-gray-500">
                      ⚠️ Impossible d'exporter un thème sans cartes. 
                      Ajoutez d'abord des cartes à votre thème.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
