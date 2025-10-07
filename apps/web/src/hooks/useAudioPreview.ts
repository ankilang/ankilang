import { useState, useCallback, useRef } from 'react'
import { playTTS } from '../services/tts'
import type { TTSRequest } from '../services/tts'

export interface AudioPreviewState {
  isPlaying: boolean
  isLoading: boolean
  error: string | null
  currentAudio: HTMLAudioElement | null
}

export function useAudioPreview() {
  const [state, setState] = useState<AudioPreviewState>({
    isPlaying: false,
    isLoading: false,
    error: null,
    currentAudio: null
  })
  
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const playPreview = useCallback(async (req: TTSRequest) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      // Arrêter l'audio en cours s'il y en a un
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      
      // Générer et jouer le nouvel audio
      const audio = await playTTS(req)
      audioRef.current = audio
      
      // Gérer les événements audio
      const handlePlay = () => {
        setState(prev => ({ ...prev, isPlaying: true, isLoading: false }))
      }
      
      const handlePause = () => {
        setState(prev => ({ ...prev, isPlaying: false }))
      }
      
      const handleEnded = () => {
        setState(prev => ({ ...prev, isPlaying: false }))
        audioRef.current = null
      }
      
      const handleError = (e: Event) => {
        console.error('Erreur de lecture audio:', e)
        setState(prev => ({ 
          ...prev, 
          isPlaying: false, 
          isLoading: false, 
          error: 'Erreur de lecture audio' 
        }))
        audioRef.current = null
      }
      
      audio.addEventListener('play', handlePlay)
      audio.addEventListener('pause', handlePause)
      audio.addEventListener('ended', handleEnded)
      audio.addEventListener('error', handleError)
      
      // Démarrer la lecture
      await audio.play()
      
    } catch (error) {
      console.error('Erreur lors de la génération audio:', error)
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      }))
    }
  }, [])
  
  const stopPreview = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setState(prev => ({ ...prev, isPlaying: false }))
  }, [])
  
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    ...state,
    playPreview,
    stopPreview,
    clearError
  }
}
