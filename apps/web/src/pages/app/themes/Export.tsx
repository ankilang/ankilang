import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, FileText, CheckCircle } from 'lucide-react'
import { getThemeById, getCardsByThemeId } from '../../../data/mockData'
import { getLanguageLabel } from '../../../constants/languages'
import PageMeta from '../../../components/seo/PageMeta'
// @ts-expect-error JS module without types
import { useAnkiLang } from '../../../exporter/hooks/useAnkiLang.js'

export default function ThemeExport() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const { isReady, isLoading, error, generateBasicDeck, generateClozeDeck, generateCombinedDeck } = useAnkiLang()

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

  const safeFile = (name: string) =>
    name
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9-_ ]/g, '')
      .trim()
      .replace(/\s+/g, '-')

  const toBasic = (c: any) => ({
    front: c.frontFR || '',
    back: c.backText || '',
    media: {
      image: c.imageUrl || undefined,
      audio: c.audioUrl || undefined,
    },
    tags: c.tags || [],
    notes: c.extra || '',
  })

  const toClozePair = (c: any) => {
    const src = c.clozeTextTarget || ''
    // Normaliser en format natif {{cN::...}}
    const clozeText = /\(\(c\d+::/.test(src)
      ? src.replace(/\(\(c(\d+)::([^:)]*?)(?::([^)]*?))?\)\)/g, (_m: string, n: string, ans: string, hint?: string) => `{{c${n}::${ans}${hint ? `:${hint}` : ''}}}`)
      : src
    // Texte plein: retirer les clozes
    const text = clozeText.replace(/\{\{c\d+::([^}|]+?)(?::[^}|]+?)?\}\}/g, '$1')
    return {
      text,
      clozeText,
      media: {
        image: c.imageUrl || undefined,
        audio: c.audioUrl || undefined,
      },
      tags: c.tags || [],
      notes: c.extra || '',
    }
  }

  const { basicCards, clozeCards } = useMemo(() => {
    const basics = cards.filter(c => c.type === 'basic').map(toBasic)
    const clozes = cards.filter(c => c.type === 'cloze').map(toClozePair)
    return { basicCards: basics, clozeCards: clozes }
  }, [cards])

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      const base = safeFile(theme.name || 'ankilang-deck')

      if (basicCards.length > 0 && clozeCards.length === 0) {
        await generateBasicDeck(base, basicCards, `${base}.apkg`)
      } else if (clozeCards.length > 0 && basicCards.length === 0) {
        await generateClozeDeck(base, clozeCards, `${base}.apkg`)
      } else if (basicCards.length > 0 && clozeCards.length > 0) {
        await generateCombinedDeck(base, basicCards, clozeCards, base)
      } else {
        throw new Error('Aucune carte à exporter')
      }

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
                    Export terminé !
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Le(s) fichier(s) .apkg ont été générés et téléchargés.
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
                      Export au format .apkg compatible Anki. 
                      Cartes Basic et Cloze exportées; si les deux types sont présents, deux fichiers seront générés.
                    </p>
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={handleExport}
                      disabled={isExporting || cards.length === 0 || isLoading || !isReady || !!error}
                      className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download size={16} />
                      {isExporting ? 'Export en cours...' : 'Exporter (.apkg)'}
                    </button>
                    
                    <button
                      onClick={() => navigate(`/app/themes/${theme.id}`)}
                      className="btn-secondary"
                    >
                      Retour au thème
                    </button>
                  </div>
                  
                  {(cards.length === 0 || !!error) && (
                    <p className="text-sm text-gray-500">
                      ⚠️ {error ? `Erreur d'initialisation export: ${error}` : 'Impossible d\'exporter un thème sans cartes.'}
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
