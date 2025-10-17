import { useCallback, useRef } from 'react'
import { Plus } from 'lucide-react'
import type { ThemeColors } from './NewCardModalV2'

export default function StepContent({ selectedType, recto, verso, clozeText, onRectoChange, onVersoChange, onClozeChange, onTranslate, isTranslating, translateError, themeLanguage, themeColors }: { selectedType: 'basic'|'cloze'; recto: string; verso: string; clozeText: string; onRectoChange: (v: string) => void; onVersoChange: (v: string) => void; onClozeChange: (v: string) => void; onTranslate: () => void; isTranslating: boolean; translateError?: string; themeLanguage: string; themeColors: ThemeColors }) {
  return (
    <section aria-labelledby="step-content-title" className="space-y-4">
      <h3 id="step-content-title" className="font-sans text-sm font-medium text-dark-charcoal">Étape 2 — Rédaction</h3>

      {selectedType === 'basic' && (
        <div className="bg-white/60 rounded-2xl p-4 border border-white/60 space-y-3">
          <label className="block text-xs text-dark-charcoal/70">Recto (FR)</label>
          <textarea value={recto} onChange={(e) => onRectoChange(e.target.value)} rows={3} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pastel-purple text-sm" placeholder="Texte en français à traduire" />

          <div className="flex items-center justify-between">
            <label className="block text-xs text-dark-charcoal/70">Verso ({themeLanguage?.toUpperCase()})</label>
            <button type="button" onClick={onTranslate} disabled={isTranslating || !recto.trim()} className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50">
              {isTranslating ? 'Traduction…' : 'Traduire'}
            </button>
          </div>
          <textarea value={verso} onChange={(e) => onVersoChange(e.target.value)} rows={3} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pastel-purple text-sm" placeholder="Résultat traduction" />
          {translateError && <p className="text-xs text-red-600 mt-1">{translateError}</p>}
        </div>
      )}

      {selectedType === 'cloze' && (
        <ClozeEditor 
          value={clozeText} 
          onChange={onClozeChange} 
        />
      )}
    </section>
  )
}

function ClozeEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLTextAreaElement | null>(null)

  const getNextClozeIndex = useCallback((text: string) => {
    const re = /\{\{c(\d+)::/g
    let m: RegExpExecArray | null
    let max = 0
    while ((m = re.exec(text))) {
      const n = parseInt(m[1], 10)
      if (!Number.isNaN(n)) max = Math.max(max, n)
    }
    return max + 1
  }, [])

  const wrapSelection = useCallback(() => {
    const ta = ref.current
    if (!ta) return
    const start = ta.selectionStart ?? 0
    const end = ta.selectionEnd ?? 0
    const selected = value.slice(start, end)
    const index = getNextClozeIndex(value)
    const inner = selected || 'réponse'
    const insertion = `{{c${index}::${inner}}}`
    const next = value.slice(0, start) + insertion + value.slice(end)
    onChange(next)
    // replacer le caret après l'insertion
    requestAnimationFrame(() => {
      const pos = start + insertion.length
      ta.focus()
      try { ta.setSelectionRange(pos, pos) } catch {}
    })
  }, [getNextClozeIndex, onChange, value])

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMod = e.metaKey || e.ctrlKey
    if (isMod && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      wrapSelection()
    }
  }, [wrapSelection])

  return (
    <div className="bg-white/60 rounded-2xl p-4 border border-white/60">
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs text-dark-charcoal/70">Cloze</label>
        <button 
          type="button" 
          onClick={wrapSelection}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-purple-600 text-white hover:bg-purple-700"
          title="Ajouter un trou (Cmd/Ctrl+K)"
        >
          <Plus className="w-3 h-3" /> Ajouter un trou
        </button>
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        rows={3}
        className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pastel-purple text-sm"
        placeholder="La capitale de la France est {{c1::Paris}}."
      />
      <p className="mt-1 text-xs text-dark-charcoal/60">Utilisez le format {'{{c1::réponse}}'} ou le bouton ci‑dessus (Cmd/Ctrl+K) pour créer un trou</p>
    </div>
  )
}
