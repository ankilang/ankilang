import { useState } from 'react'
import { Volume2, Image, Pause } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Card } from '../../types/shared'

interface MediaIndicatorProps {
  card: Card
  onAudioClick?: () => void
  onImageClick?: () => void
  size?: 'sm' | 'md'
}

export default function MediaIndicator({ 
  card, 
  onAudioClick, 
  onImageClick, 
  size = 'md' 
}: MediaIndicatorProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  
  const sizeClasses = {
    sm: 'w-3 h-3 text-xs',
    md: 'w-4 h-4 text-sm'
  }

  const handleAudioClick = async () => {
    if (card.audioUrl && onAudioClick) {
      setIsPlaying(true)
      onAudioClick()
      // Simuler la fin de lecture après 3 secondes
      setTimeout(() => setIsPlaying(false), 3000)
    }
  }

  const handleImageClick = () => {
    if (card.imageUrl && onImageClick) {
      onImageClick()
    }
  }

  return (
    <div className="flex items-center gap-1">
      {/* Indicateur Audio */}
      {card.audioUrl && (
        <motion.button
          onClick={handleAudioClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`
            ${sizeClasses[size]}
            rounded-full flex items-center justify-center
            bg-green-100 text-green-600 hover:bg-green-200
            transition-colors duration-200
            ${isPlaying ? 'animate-pulse' : ''}
          `}
          title="Audio disponible - Cliquer pour écouter"
        >
          {isPlaying ? (
            <Pause className="w-2 h-2" />
          ) : (
            <Volume2 className="w-2 h-2" />
          )}
        </motion.button>
      )}

      {/* Indicateur Image */}
      {card.imageUrl && (
        <motion.button
          onClick={handleImageClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`
            ${sizeClasses[size]}
            rounded-full flex items-center justify-center
            bg-blue-100 text-blue-600 hover:bg-blue-200
            transition-colors duration-200
          `}
          title="Image disponible - Cliquer pour voir"
        >
          <Image className="w-2 h-2" />
        </motion.button>
      )}
    </div>
  )
}
