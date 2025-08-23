import { useState, useEffect } from 'react'

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() => {
    // État initial basé sur navigator.onLine
    if (typeof navigator !== 'undefined') {
      return navigator.onLine
    }
    return true // Fallback optimiste
  })

  useEffect(() => {
    const handleOnline = () => {
      console.log('[Online] Connection restored')
      setIsOnline(true)
    }

    const handleOffline = () => {
      console.log('[Online] Connection lost')
      setIsOnline(false)
    }

    // Écouteurs d'événements pour les changements de connectivité
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
    }

    // Cleanup
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
  }, [])

  return isOnline
}
