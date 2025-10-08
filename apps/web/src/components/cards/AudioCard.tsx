import { Play, Pause, Trash2, Volume2 } from 'lucide-react'

interface AudioCardProps {
  audioUrl: string
  onPlay: () => void
  onDelete: () => void
  isPlaying: boolean
}

export function AudioCard({ onPlay, onDelete, isPlaying }: AudioCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
      {/* Bouton de lecture/pause */}
      <button 
        type="button"
        onClick={onPlay}
        className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
        title={isPlaying ? 'Pause' : 'Lecture'}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 text-white" />
        ) : (
          <Play className="w-4 h-4 text-white" />
        )}
      </button>

      {/* Icône audio et informations */}
      <div className="flex items-center gap-2 flex-1">
        <Volume2 className="w-4 h-4 text-green-600" />
        <div>
          <div className="text-sm font-medium text-gray-700">Audio généré</div>
          <div className="text-xs text-gray-500">Prêt à être exporté</div>
        </div>
      </div>

      {/* Bouton de suppression */}
      <button 
        type="button"
        onClick={onDelete}
        className="text-red-500 hover:text-red-700 transition-colors p-1"
        title="Supprimer l'audio"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
