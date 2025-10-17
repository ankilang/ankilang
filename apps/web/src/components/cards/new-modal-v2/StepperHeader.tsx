import { Sparkles } from 'lucide-react'
import type { ThemeColors } from './NewCardModalV2'

export default function StepperHeader({ themeLanguage, themeColors }: { themeLanguage: string; themeColors: ThemeColors }) {
  return (
    <div
      className="px-6 py-5 border-b"
      style={{
        background: `linear-gradient(135deg, ${themeColors.secondary} 0%, white 100%)`,
        borderColor: 'rgba(255,255,255,0.5)'
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: themeColors.primary + '20' }}>
            <Sparkles className="w-5 h-5" style={{ color: themeColors.accent }} />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-dark-charcoal">Nouvelle carte — V2 (aperçu)</h2>
            <p className="font-sans text-xs text-dark-charcoal/70">Langue cible: <span className="font-medium">{themeLanguage?.toUpperCase()}</span></p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs text-dark-charcoal/70">Brouillon auto (à venir)</span>
        </div>
      </div>
      {/* Placeholder du stepper */}
      <div className="mt-4 flex items-center gap-2 text-xs text-dark-charcoal/70">
        <span className="px-2 py-1 rounded-lg bg-white/70">1. Type</span>
        <span>›</span>
        <span className="px-2 py-1 rounded-lg bg-white/50">2. Rédaction</span>
        <span>›</span>
        <span className="px-2 py-1 rounded-lg bg-white/30">3. Enrichir</span>
      </div>
    </div>
  )
}

