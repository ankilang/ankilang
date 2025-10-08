import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface AudioPlayerProps {
  src: string
  onDelete: () => void
  onPlay?: () => void
  size?: 'sm' | 'md'
}

export default function AudioPlayer({ src, onDelete, onPlay, size = 'md' }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm'
  }

  const handlePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
      if (onPlay) onPlay()
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
      setIsLoading(false)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.addEventListener('timeupdate', handleTimeUpdate)
      audio.addEventListener('loadedmetadata', handleLoadedMetadata)
      audio.addEventListener('ended', handleEnded)
      
      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate)
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
        audio.removeEventListener('ended', handleEnded)
      }
    }
    return undefined
  }, [])

  return (
    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
      {/* Audio element caché */}
      <audio ref={audioRef} src={src} preload="metadata" />
      
      {/* Bouton play/pause */}
      <motion.button
        onClick={handlePlay}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          ${sizeClasses[size]}
          rounded-full flex items-center justify-center
          bg-green-500 text-white hover:bg-green-600
          transition-colors duration-200
          ${isPlaying ? 'animate-pulse' : ''}
        `}
        title={isPlaying ? 'Pause' : 'Lecture'}
      >
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full"
          />
        ) : isPlaying ? (
          <Pause className="w-3 h-3" />
        ) : (
          <Play className="w-3 h-3" />
        )}
      </motion.button>

      {/* Informations audio */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-700">Audio généré</div>
        <div className="text-xs text-gray-500">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Bouton supprimer */}
      <motion.button
        onClick={onDelete}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="text-red-500 hover:text-red-700 transition-colors p-1"
        title="Supprimer l'audio"
      >
        <Trash2 className="w-4 h-4" />
      </motion.button>
    </div>
  )
}
