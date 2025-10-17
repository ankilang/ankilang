import type { ThemeColors } from './NewCardModalV2'

export default function StepType({ themeLanguage, themeColors }: { themeLanguage: string; themeColors: ThemeColors }) {
  return (
    <section aria-labelledby="step-type-title" className="space-y-3">
      <h3 id="step-type-title" className="font-sans text-sm font-medium text-dark-charcoal">Étape 1 — Type & intention</h3>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" className="p-4 rounded-2xl border-2 border-gray-200 hover:border-gray-300 text-left">
          <div className="font-semibold">Basic</div>
          <div className="text-xs text-dark-charcoal/70">Question / Réponse</div>
        </button>
        <button type="button" className="p-4 rounded-2xl border-2 border-gray-200 hover:border-gray-300 text-left">
          <div className="font-semibold">Cloze</div>
          <div className="text-xs text-dark-charcoal/70">
            Texte à trous ({'{{c1::...}}'})
          </div>
        </button>
      </div>
      <div>
        <label className="block text-xs text-dark-charcoal/70 mb-1">Intention (optionnel)</label>
        <input className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pastel-purple text-sm" placeholder="Ex: vocabulaire cuisine" />
      </div>
      <p className="text-xs text-dark-charcoal/60">Langue cible: <span className="font-medium">{themeLanguage?.toUpperCase()}</span></p>
    </section>
  )
}
