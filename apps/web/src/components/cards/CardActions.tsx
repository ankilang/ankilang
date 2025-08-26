import { useState, useRef, useEffect } from 'react'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Card } from '@ankilang/shared'

interface CardActionsProps {
  card: Card
  onEdit: (card: Card) => void
  onDelete: (card: Card) => void
  themeColors: {
    primary: string
    secondary: string
    accent: string
    gradient: string
  }
}

export default function CardActions({ card, onEdit, onDelete, themeColors }: CardActionsProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMenuOpen(false)
    onEdit(card)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMenuOpen(false)
    if (confirm(`Supprimer la carte "${card.type === 'basic' ? card.frontFR : card.clozeTextTarget}" ? Cette action est définitive.`)) {
      onDelete(card)
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        onClick={(e) => {
          e.stopPropagation()
          setIsMenuOpen(!isMenuOpen)
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/60"
        aria-label={`Options pour la carte ${card.id}`}
      >
        <MoreVertical className="w-4 h-4 text-dark-charcoal/60" />
      </motion.button>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-lg border border-white/40 backdrop-blur-sm z-50 overflow-hidden"
            role="menu"
          >
            <motion.button
              onClick={handleEdit}
              whileHover={{ backgroundColor: themeColors.secondary + '20' }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
              role="menuitem"
              style={{ color: themeColors.accent }}
            >
              <Pencil className="w-4 h-4" />
              Modifier
            </motion.button>
            
            <motion.button
              onClick={handleDelete}
              whileHover={{ backgroundColor: '#FEE2E2' }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 transition-colors"
              role="menuitem"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
