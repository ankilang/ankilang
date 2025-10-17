export default function FooterActions({ onClose, onSubmit }: { onClose: () => void; onSubmit: () => void }) {
  return (
    <div className="px-6 py-4 border-t bg-white/80 flex items-center justify-between">
      <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border-2 border-gray-200 text-sm">Annuler</button>
      <div className="flex items-center gap-2">
        <button type="button" className="px-4 py-2 rounded-xl border-2 border-gray-200 text-sm">Précédent</button>
        <button type="button" className="px-4 py-2 rounded-xl border-2 border-gray-200 text-sm">Suivant</button>
        <button type="button" onClick={onSubmit} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm">Enregistrer</button>
      </div>
    </div>
  )
}

