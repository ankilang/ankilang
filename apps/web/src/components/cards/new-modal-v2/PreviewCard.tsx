import { useEffect, useRef, useState } from 'react'
import { Play, Pause } from 'lucide-react'
import type { ThemeColors } from './NewCardModalV2'

export default function PreviewCard({ themeColors, selectedType, recto, verso, clozeText, imageUrl, audioUrl }: { themeColors: ThemeColors; selectedType: 'basic'|'cloze'|null; recto: string; verso: string; clozeText: string; imageUrl?: string; audioUrl?: string }) {
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Reset player when URL changes
    if (audioRef.current) {
      try { audioRef.current.pause() } catch {}
    }
    setPlaying(false)
    audioRef.current = audioUrl ? new Audio(audioUrl) : null
    if (audioRef.current) {
      audioRef.current.onended = () => setPlaying(false)
      audioRef.current.onpause = () => setPlaying(false)
      audioRef.current.onplay = () => setPlaying(true)
    }
    return () => {
      if (audioRef.current) {
        try { audioRef.current.pause() } catch {}
        audioRef.current = null
      }
    }
  }, [audioUrl])

  const togglePlay = async () => {
    if (!audioRef.current) return
    try {
      if (audioRef.current.paused) {
        await audioRef.current.play()
      } else {
        audioRef.current.pause()
      }
    } catch {}
  }
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
      <div className="text-xs text-dark-charcoal/60 mb-2">Aperçu (style Anki) — placeholder</div>
      <div className="rounded-xl border border-gray-100 p-4">
        {selectedType === 'basic' && (
          <>
            <div className="text-sm text-gray-800">Recto: <span className="opacity-70">{recto || 'Votre question ici'}</span></div>
            <hr className="my-3" />
            <div className="text-sm text-gray-800">Verso: <span className="opacity-70">{verso || 'Votre réponse ici'}</span></div>
            {imageUrl && (
              <div className="mt-3">
                <img src={imageUrl} alt="Illustration" className="max-w-full max-h-48 rounded-lg border border-gray-200 object-contain" />
              </div>
            )}
          </>
        )}
        {selectedType === 'cloze' && (
          <div className="text-sm text-gray-800 whitespace-pre-wrap leading-7">
            {renderCloze(clozeText) || 'Votre texte Cloze ici'}
            {imageUrl && (
              <div className="mt-3">
                <img src={imageUrl} alt="Illustration" className="max-w-full max-h-48 rounded-lg border border-gray-200 object-contain" />
              </div>
            )}
          </div>
        )}
      </div>

      {audioUrl && (
        <div className="mt-3 flex items-center justify-center">
          <button
            type="button"
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md hover:bg-purple-700"
            aria-label={playing ? 'Pause audio' : 'Lire audio'}
          >
            {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
        </div>
      )}
    </div>
  )
}

function renderCloze(text?: string) {
  if (!text) return null
  const nodes: React.ReactNode[] = []
  const re = /\{\{c(\d+)::([^}|]+?)(?::([^}|]+?))?\}\}/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    const [full, num, answer, hint] = m
    if (m.index > last) {
      nodes.push(<span key={`txt-${last}`}>{text.slice(last, m.index)}</span>)
    }
    nodes.push(
      <span key={`blank-${m.index}`} className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 align-baseline">
        …
      </span>
    )
    if (hint) {
      nodes.push(
        <span key={`hint-${m.index}`} className="ml-1 px-1 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs align-baseline">
          {hint}
        </span>
      )
    }
    last = m.index + full.length
  }
  if (last < text.length) nodes.push(<span key={`tail-${last}`}>{text.slice(last)}</span>)
  return nodes
}
