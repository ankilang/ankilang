export default function FooterActions({ step, canNext, canSave, onPrev, onNext, onClose, onSubmit }: { step: 1|2|3; canNext: boolean; canSave: boolean; onPrev: () => void; onNext: () => void; onClose: () => void; onSubmit: () => void }) {
  return (
    <div className="px-6 py-4 border-t bg-white/80 flex items-center justify-between">
      <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border-2 border-gray-200 text-sm">Annuler</button>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onPrev} disabled={step===1} className="px-4 py-2 rounded-xl border-2 border-gray-200 text-sm disabled:opacity-50">Précédent</button>
        <button type="button" onClick={onNext} disabled={step===3 || !canNext} className="px-4 py-2 rounded-xl border-2 border-gray-200 text-sm disabled:opacity-50">Suivant</button>
        <button type="button" onClick={onSubmit} disabled={!canSave} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm disabled:opacity-50">Enregistrer</button>
      </div>
    </div>
  )
}
