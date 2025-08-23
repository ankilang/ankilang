import { useState } from 'react'
import type { Session } from '../../data/mockAccount'
import { revokeSession, revokeAllSessions } from '../../data/mockAccount'
import ConfirmModal from '../ui/ConfirmModal'

interface SessionsListProps {
  sessions: Session[]
  onSessionsUpdate: (sessions: Session[]) => void
}

export default function SessionsList({ sessions, onSessionsUpdate }: SessionsListProps) {
  const [showRevokeModal, setShowRevokeModal] = useState(false)
  const [showRevokeAllModal, setShowRevokeAllModal] = useState(false)
  const [sessionToRevoke, setSessionToRevoke] = useState<Session | null>(null)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleRevokeSession = (session: Session) => {
    setSessionToRevoke(session)
    setShowRevokeModal(true)
  }

  const handleRevokeAllSessions = () => {
    setShowRevokeAllModal(true)
  }

  const confirmRevokeSession = () => {
    if (sessionToRevoke) {
      const updatedAccount = revokeSession(sessionToRevoke.id)
      onSessionsUpdate(updatedAccount.sessions)
      setSessionToRevoke(null)
    }
  }

  const confirmRevokeAllSessions = () => {
    const updatedAccount = revokeAllSessions()
    onSessionsUpdate(updatedAccount.sessions)
  }

  const otherSessions = sessions.filter(session => !session.current)

  return (
    <div className="space-y-4">
      {/* En-tête avec bouton révoquer toutes */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Sessions actives ({sessions.length})
        </h3>
        {otherSessions.length > 0 && (
                  <button
          onClick={handleRevokeAllSessions}
          className="px-4 py-3 sm:py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
        >
            Révoquer toutes
          </button>
        )}
      </div>

      {/* Liste des sessions */}
      <div className="space-y-4 sm:space-y-6">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-4 sm:gap-6 mb-1">
                <span className="font-medium text-gray-900 truncate">
                  {session.device}
                </span>
                {session.current && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0">
                    Cette session
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="truncate">{session.browser}</p>
                <p className="truncate">IP: {session.ip}</p>
                <p className="truncate">Dernière activité: {formatDate(session.lastActive)}</p>
              </div>
            </div>
            
            {!session.current && (
              <button
                onClick={() => handleRevokeSession(session)}
                className="px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors font-medium focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
              >
                Révoquer
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Modale de révocation d'une session */}
      <ConfirmModal
        open={showRevokeModal}
        title="Révoquer la session"
        description={`Êtes-vous sûr de vouloir révoquer la session sur ${sessionToRevoke?.device} ?`}
        confirmLabel="Révoquer"
        isDanger={true}
        onConfirm={confirmRevokeSession}
        onClose={() => {
          setShowRevokeModal(false)
          setSessionToRevoke(null)
        }}
      />

      {/* Modale de révocation de toutes les sessions */}
      <ConfirmModal
        open={showRevokeAllModal}
        title="Révoquer toutes les sessions"
        description="Êtes-vous sûr de vouloir révoquer toutes les autres sessions ? Vous resterez connecté sur cet appareil."
        confirmLabel="Révoquer toutes"
        isDanger={true}
        onConfirm={confirmRevokeAllSessions}
        onClose={() => setShowRevokeAllModal(false)}
      />
    </div>
  )
}
