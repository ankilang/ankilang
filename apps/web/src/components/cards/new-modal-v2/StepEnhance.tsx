import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ThemeColors } from './NewCardModalV2'
import { pexelsSearchPhotos, pexelsCurated, optimizeAndUploadImage } from '../../../services/pexels'
import { Search, Trash2, Volume2, Square } from 'lucide-react'
import { generateTTS } from '../../../services/tts'
import { ttsToTempURL, type VotzLanguage } from '../../../services/votz'

export default function StepEnhance({
  themeId,
  themeLanguage,
  themeColors,
  recto,
  verso,
  clozeText,
  imageUrl,
  onChangeImage,
  onRemoveImage,
  audioUrl,
  onChangeAudio,
  onRemoveAudio,
  tags,
  onChangeTags,
}: {
  themeId: string
  themeLanguage: string
  themeColors: ThemeColors
  recto: string
  verso: string
  clozeText: string
  imageUrl: string
  onChangeImage: (url: string, type: 'appwrite' | 'external') => void
  onRemoveImage: () => void
  audioUrl: string
  onChangeAudio: (url: string) => void
  onRemoveAudio: () => void
  tags: string
  onChangeTags: (v: string) => void
}) {
  const [imageInput, setImageInput] = useState('')
  const [imageQuery, setImageQuery] = useState('')
  const [imagePage, setImagePage] = useState(1)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Pré-remplir la recherche avec le contenu saisi
  useEffect(() => {
    if (!imageInput) {
      const base = verso || recto || clozeText || ''
      if (base) setImageInput(base)
    }
  }, [recto, verso, clozeText])

  // Debounce de la recherche
  useEffect(() => {
    const t = setTimeout(() => {
      setImageQuery(imageInput.trim())
      setImagePage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [imageInput])

  const imagesQuery = useQuery({
    queryKey: ['pexels', imageQuery, imagePage],
    queryFn: () => {
      const common = { per_page: 12, page: imagePage, orientation: 'landscape', size: 'medium', locale: 'fr-FR' }
      if (imageQuery) return pexelsSearchPhotos(imageQuery, common)
      return pexelsCurated(common)
    },
    staleTime: 1000 * 60 * 5,
  })

  async function handlePickImage(src: string) {
    setIsOptimizing(true)
    try {
      const result = await optimizeAndUploadImage(src)
      if (result.success) {
        onChangeImage(result.fileUrl, 'appwrite')
      } else {
        onChangeImage(src, 'external')
      }
    } catch (e) {
      onChangeImage(src, 'external')
    } finally {
      setIsOptimizing(false)
    }
  }

  async function handleGenerateAudio() {
    const text = verso || recto || clozeText || ''
    if (!text.trim()) return
    setIsGeneratingAudio(true)
    try {
      // Occitan via Votz → retourne data:audio base64 (bon pour stockage)
      if (themeLanguage === 'oc' || themeLanguage === 'oc-gascon') {
        const dialect: VotzLanguage = themeLanguage === 'oc-gascon' ? 'gascon' : 'languedoc'
        const url = await ttsToTempURL(text, dialect)
        onChangeAudio(url)
      } else {
        // Autres langues: ElevenLabs via Appwrite Functions (url data: ou http)
        const res = await generateTTS({ text, language_code: themeLanguage, save: false })
        onChangeAudio(res.url)
      }
    } catch (e) {
      console.error('TTS error:', e)
    } finally {
      setIsGeneratingAudio(false)
    }
  }

  function togglePlayAudio() {
    try {
      if (!audioUrl) return
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl)
        audioRef.current.onended = () => { /* noop */ }
      }
      const a = audioRef.current
      if (!a) return
      if (a.paused) a.play()
      else a.pause()
    } catch {}
  }

  return (
    <section aria-labelledby="step-enhance-title" className="space-y-4">
      <h3 id="step-enhance-title" className="font-sans text-sm font-medium text-dark-charcoal">Étape 3 — Enrichir & prévisualiser</h3>

      {/* Image selector */}
      <div className="bg-white/60 rounded-2xl p-4 border border-white/60">
        <div className="flex items-center justify-between">
          <label className="block text-xs text-dark-charcoal/70">Image (Pexels)</label>
          {isOptimizing && (
            <span className="text-xs text-purple-600 font-medium flex items-center gap-2">
              <span className="animate-spin rounded-full h-3 w-3 border-2 border-purple-600 border-t-transparent" />
              Optimisation…
            </span>
          )}
        </div>

        {imageUrl ? (
          <div className="relative w-full h-40 bg-white rounded-xl border border-gray-200 flex items-center justify-center mt-3">
            <img src={imageUrl} alt="Sélection" className="max-w-full max-h-full object-contain" />
            <button type="button" onClick={onRemoveImage} className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="relative mt-2">
              <input
                type="text"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                placeholder="Rechercher une image sur Pexels…"
                className="w-full px-4 py-2.5 pl-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pastel-purple transition-colors font-sans text-sm"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            <div className="mt-3 min-h-10">
              {imagesQuery.isLoading && <div className="text-sm text-gray-500">Recherche d'images…</div>}
              {imagesQuery.isError && <div className="text-sm text-red-600">Erreur lors de la recherche d'images</div>}
              {imagesQuery.data && (
                <div className="grid grid-cols-3 gap-2">
                  {imagesQuery.data.photos?.map((p: any) => (
                    <button key={p.id} type="button" onClick={() => handlePickImage(p.src.medium)} className="aspect-[4/3] overflow-hidden rounded-lg border border-gray-200 hover:ring-2 hover:ring-purple-400">
                      <img src={p.src.medium} alt={p.alt || 'Pexels'} className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Tags */}
      <div className="bg-white/60 rounded-2xl p-4 border border-white/60">
        <label className="block text-xs text-dark-charcoal/70">Tags</label>
        <input value={tags} onChange={(e) => onChangeTags(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm" placeholder="science, vocabulaire, …" />
      </div>

      {/* Audio (TTS) */}
      <div className="bg-white/60 rounded-2xl p-4 border border-white/60">
        <div className="flex items-center justify-between">
          <label className="block text-xs text-dark-charcoal/70">Audio (TTS)</label>
          {isGeneratingAudio && (
            <span className="text-xs text-purple-600 font-medium flex items-center gap-2">
              <span className="animate-spin rounded-full h-3 w-3 border-2 border-purple-600 border-t-transparent" />
              Génération…
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <button type="button" onClick={handleGenerateAudio} disabled={isGeneratingAudio} className="px-3 py-2 text-sm rounded-xl bg-purple-600 text-white disabled:opacity-50">Générer</button>
          <button type="button" onClick={togglePlayAudio} disabled={!audioUrl} className="px-3 py-2 text-sm rounded-xl border-2 border-gray-200 disabled:opacity-50 inline-flex items-center gap-2">
            <Volume2 className="w-4 h-4" /> Écouter
          </button>
          {audioUrl && (
            <button type="button" onClick={onRemoveAudio} className="px-3 py-2 text-sm rounded-xl border-2 border-gray-200 inline-flex items-center gap-2">
              <Square className="w-4 h-4" /> Retirer
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
