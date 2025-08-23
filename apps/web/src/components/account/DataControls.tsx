import { useState } from 'react'
import ConfirmModal from '../ui/ConfirmModal'
import InlineAlert from '../ui/InlineAlert'

interface DataControlsProps {
  accountId: string
}

export default function DataControls({ accountId }: DataControlsProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const handleExportData = () => {
    console.log('export-user-data', accountId)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleDeleteAccount = () => {
    console.log('delete-account', accountId)
    // Ici on pourrait rediriger vers la page de déconnexion
  }



  return (
    <div className="space-y-6">
      {showSuccess && (
        <InlineAlert tone="success">
          Demande d'export envoyée (mock)
        </InlineAlert>
      )}

      {/* Section Export */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Export des données</h3>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 mb-3">
            Téléchargez toutes vos données personnelles au format JSON.
          </p>
          <button
            onClick={handleExportData}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            Exporter mes données (.json)
          </button>
        </div>
      </div>

      {/* Section Suppression */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Suppression du compte</h3>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 mb-3">
            <strong>Attention :</strong> Cette action est irréversible. Toutes vos données seront définitivement supprimées.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
          >
            Supprimer mon compte
          </button>
        </div>
      </div>

      {/* Modale de suppression */}
      <ConfirmModal
        open={showDeleteModal}
        title="Supprimer votre compte"
        description="Cette action est irréversible. Toutes vos données seront définitivement supprimées."
        confirmLabel="Supprimer définitivement"
        isDanger={true}
        onConfirm={handleDeleteAccount}
        onClose={() => {
          setShowDeleteModal(false)
          setDeleteConfirmation('')
        }}
      >
        <div className="space-y-4">
          <InlineAlert tone="warning">
            <strong>Attention :</strong> Cette action ne peut pas être annulée.
          </InlineAlert>
          
          <div>
            <label htmlFor="delete-confirmation" className="block text-sm font-medium text-gray-700 mb-2">
              Tapez "SUPPRIMER" pour confirmer
            </label>
            <input
              type="text"
              id="delete-confirmation"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="SUPPRIMER"
            />
          </div>
        </div>
      </ConfirmModal>
    </div>
  )
}
