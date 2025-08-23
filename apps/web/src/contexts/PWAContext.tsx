import { createContext, useContext, type ReactNode } from 'react'
import { usePWA } from '../hooks/usePWA'

interface PWAContextType {
  isStandalone: boolean
  isInstalled: boolean
}

const PWAContext = createContext<PWAContextType | undefined>(undefined)

interface PWAProviderProps {
  children: ReactNode
}

export function PWAProvider({ children }: PWAProviderProps) {
  const pwaState = usePWA()

  return (
    <PWAContext.Provider value={pwaState}>
      {children}
    </PWAContext.Provider>
  )
}

export function usePWAContext(): PWAContextType {
  const context = useContext(PWAContext)
  
  if (context === undefined) {
    throw new Error('usePWAContext must be used within a PWAProvider')
  }
  
  return context
}
