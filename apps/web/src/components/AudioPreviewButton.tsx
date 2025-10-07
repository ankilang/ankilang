import { Play, Pause, Loader2, Volume2 } from 'lucide-react'
import { useAudioPreview } from '../hooks/useAudioPreview'
import type { TTSRequest } from '../services/tts'

interface AudioPreviewButtonProps {
  text: string
  language: string
  voice?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function AudioPreviewButton({ 
  text, 
  language, 
  voice, 
  className = '',
  size = 'md'
}: AudioPreviewButtonProps) {
  const { isPlaying, isLoading, error, playPreview, stopPreview, clearError } = useAudioPreview()
  
  const handleClick = async () => {
    if (isPlaying) {
      stopPreview()
      return
    }
    
    if (error) {
      clearError()
      return
    }
    
    if (!text.trim()) {
      return
    }
    
    // Détection automatique du provider selon la langue (géré par generateTTS)
    
    const req: TTSRequest = {
      text: text.trim(),
      language_code: language,
      voice_id: voice
    }
    
    await playPreview(req)
  }
  
  const getIcon = () => {
    if (isLoading) {
      return <Loader2 className="animate-spin" />
    }
    
    if (error) {
      return <Volume2 />
    }
    
    if (isPlaying) {
      return <Pause />
    }
    
    return <Play />
  }
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8 text-sm'
      case 'lg':
        return 'w-12 h-12 text-lg'
      default:
        return 'w-10 h-10 text-base'
    }
  }
  
  const getButtonClasses = () => {
    const baseClasses = `inline-flex items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${getSizeClasses()}`
    
    if (error) {
      return `${baseClasses} bg-red-100 text-red-600 hover:bg-red-200 focus:ring-red-500`
    }
    
    if (isPlaying) {
      return `${baseClasses} bg-blue-100 text-blue-600 hover:bg-blue-200 focus:ring-blue-500`
    }
    
    if (isLoading) {
      return `${baseClasses} bg-gray-100 text-gray-600 cursor-not-allowed`
    }
    
    return `${baseClasses} bg-gray-100 text-gray-600 hover:bg-gray-200 focus:ring-gray-500`
  }
  
  return (
    <button
      onClick={handleClick}
      disabled={isLoading || !text.trim()}
      className={`${getButtonClasses()} ${className}`}
      title={
        error 
          ? `Erreur: ${error}` 
          : isPlaying 
            ? 'Arrêter la lecture' 
            : isLoading 
              ? 'Génération en cours...' 
              : 'Pré-écouter l\'audio'
      }
    >
      {getIcon()}
    </button>
  )
}
