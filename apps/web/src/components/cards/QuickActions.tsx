import { motion } from 'framer-motion'
import { Play, Edit, Trash2 } from 'lucide-react'
import type { Card } from '../../types/shared'

interface QuickActionsProps {
  card: Card
  onPlay?: (card: Card) => void
  onEdit?: (card: Card) => void
  onDelete?: (card: Card) => void
}

export default function QuickActions({ 
  card, 
  onPlay, 
  onEdit, 
  onDelete
}: QuickActionsProps) {
  const handlePlay = () => {
    if (onPlay && card.audioUrl) {
      onPlay(card)
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(card)
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(card)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
    >
      {/* Bouton Play (seulement si audio disponible) */}
      {card.audioUrl && (
        <motion.button
          onClick={handlePlay}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-6 h-6 rounded-full bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center transition-colors duration-200"
          title="Écouter l'audio"
        >
          <Play className="w-3 h-3" />
        </motion.button>
      )}

      {/* Bouton Edit */}
      <motion.button
        onClick={handleEdit}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center justify-center transition-colors duration-200"
        title="Modifier la carte"
      >
        <Edit className="w-3 h-3" />
      </motion.button>

      {/* Bouton Delete */}
      <motion.button
        onClick={handleDelete}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-6 h-6 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center transition-colors duration-200"
        title="Supprimer la carte"
      >
        <Trash2 className="w-3 h-3" />
      </motion.button>
    </motion.div>
  )
}
