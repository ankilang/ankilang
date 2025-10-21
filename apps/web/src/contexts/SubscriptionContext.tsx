import { createContext, useContext } from 'react'

interface SubscriptionFeatures {
  canAddImages: boolean
  canAddAudio: boolean
  canUseExtraField: boolean
  canUseTranslation: boolean
  maxCardsPerTheme: number
  maxThemes: number
}

interface SubscriptionContextType {
  features: SubscriptionFeatures
}

// Toutes les features activées pour tous les utilisateurs
const ALL_FEATURES: SubscriptionFeatures = {
  canAddImages: true,
  canAddAudio: true,
  canUseExtraField: true,
  canUseTranslation: true,
  maxCardsPerTheme: Infinity,
  maxThemes: Infinity
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  return (
    <SubscriptionContext.Provider value={{ features: ALL_FEATURES }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider')
  }
  return context
}
