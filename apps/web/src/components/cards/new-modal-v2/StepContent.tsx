import type { ThemeColors } from './NewCardModalV2'

export default function StepContent({ selectedType, recto, verso, clozeText, onRectoChange, onVersoChange, onClozeChange, themeLanguage, themeColors }: { selectedType: 'basic'|'cloze'; recto: string; verso: string; clozeText: string; onRectoChange: (v: string) => void; onVersoChange: (v: string) => void; onClozeChange: (v: string) => void; themeLanguage: string; themeColors: ThemeColors }) {
  return (
    <section aria-labelledby="step-content-title" className="space-y-4">
      <h3 id="step-content-title" className="font-sans text-sm font-medium text-dark-charcoal">Étape 2 — Rédaction</h3>

      {selectedType === 'basic' && (
        <div className="bg-white/60 rounded-2xl p-4 border border-white/60 space-y-3">
          <label className="block text-xs text-dark-charcoal/70">Recto (FR)</label>
          <textarea value={recto} onChange={(e) => onRectoChange(e.target.value)} rows={3} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pastel-purple text-sm" placeholder="Texte en français à traduire" />

          <div className="flex items-center justify-between">
            <label className="block text-xs text-dark-charcoal/70">Verso ({themeLanguage?.toUpperCase()})</label>
            <button type="button" className="text-xs text-blue-600 hover:text-blue-800">Traduire</button>
          </div>
          <textarea value={verso} onChange={(e) => onVersoChange(e.target.value)} rows={3} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pastel-purple text-sm" placeholder="Résultat traduction" />
        </div>
      )}

      {selectedType === 'cloze' && (
        <div className="bg-white/60 rounded-2xl p-4 border border-white/60">
          <label className="block text-xs text-dark-charcoal/70 mb-1">Cloze</label>
          <textarea value={clozeText} onChange={(e) => onClozeChange(e.target.value)} rows={3} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pastel-purple text-sm" placeholder="La capitale de la France est {{c1::Paris}}." />
          <p className="mt-1 text-xs text-dark-charcoal/60">Utilisez le format {'{{c1::réponse}}'} pour créer un trou</p>
        </div>
      )}
    </section>
  )
}
