import type { ThemeColors } from './NewCardModalV2'

export default function StepEnhance({ themeId, themeLanguage, themeColors }: { themeId: string; themeLanguage: string; themeColors: ThemeColors }) {
  return (
    <section aria-labelledby="step-enhance-title" className="space-y-4">
      <h3 id="step-enhance-title" className="font-sans text-sm font-medium text-dark-charcoal">Étape 3 — Enrichir & prévisualiser</h3>

      <div className="space-y-3">
        <div className="bg-white/60 rounded-2xl p-4 border border-white/60">
          <div className="flex items-center justify-between">
            <label className="block text-xs text-dark-charcoal/70">Image (Pexels)</label>
            <span className="text-xs text-dark-charcoal/60">Optimisation & upload (à venir)</span>
          </div>
          <div className="mt-2 flex gap-2">
            <input className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-xl text-sm" placeholder="Rechercher une image…" />
            <button type="button" className="px-3 py-2 text-sm rounded-xl bg-blue-600 text-white">Rechercher</button>
          </div>
        </div>

        <div className="bg-white/60 rounded-2xl p-4 border border-white/60">
          <div className="flex items-center justify-between">
            <label className="block text-xs text-dark-charcoal/70">Audio (TTS)</label>
            <span className="text-xs text-dark-charcoal/60">Votz / ElevenLabs (à venir)</span>
          </div>
          <div className="mt-2 flex gap-2">
            <button type="button" className="px-3 py-2 text-sm rounded-xl bg-purple-600 text-white">Générer</button>
            <button type="button" className="px-3 py-2 text-sm rounded-xl border-2 border-gray-200">Écouter</button>
          </div>
        </div>

        <div className="bg-white/60 rounded-2xl p-4 border border-white/60">
          <label className="block text-xs text-dark-charcoal/70">Tags</label>
          <input className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm" placeholder="science, vocabulaire, …" />
        </div>
      </div>
    </section>
  )
}

