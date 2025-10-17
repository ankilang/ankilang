import type { ThemeColors } from './NewCardModalV2'

export default function PreviewCard({ themeColors, selectedType, recto, verso, clozeText }: { themeColors: ThemeColors; selectedType: 'basic'|'cloze'|null; recto: string; verso: string; clozeText: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
      <div className="text-xs text-dark-charcoal/60 mb-2">Aperçu (style Anki) — placeholder</div>
      <div className="rounded-xl border border-gray-100 p-4">
        {selectedType === 'basic' && (
          <>
            <div className="text-sm text-gray-800">Recto: <span className="opacity-70">{recto || 'Votre question ici'}</span></div>
            <hr className="my-3" />
            <div className="text-sm text-gray-800">Verso: <span className="opacity-70">{verso || 'Votre réponse ici'}</span></div>
          </>
        )}
        {selectedType === 'cloze' && (
          <div className="text-sm text-gray-800 whitespace-pre-wrap">
            {clozeText || 'Votre texte Cloze ici'}
          </div>
        )}
      </div>
    </div>
  )
}
