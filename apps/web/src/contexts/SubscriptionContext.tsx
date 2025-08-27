import { createContext, useContext, useState } from 'react'

interface SubscriptionFeatures {
  canAddImages: boolean
  canAddAudio: boolean
  canUseExtraField: boolean
  canUseTranslation: boolean
  maxCardsPerTheme: number
  maxThemes: number
}

interface SubscriptionContextType {
  plan: 'free' | 'premium' | 'test'
  features: SubscriptionFeatures
  upgradeToPremium: () => void
  toggleTestMode: () => void
}

const FREE_FEATURES: SubscriptionFeatures = {
  canAddImages: false,
  canAddAudio: false,
  canUseExtraField: false,
  canUseTranslation: false,
  maxCardsPerTheme: 20,
  maxThemes: 3
}

const PREMIUM_FEATURES: SubscriptionFeatures = {
  canAddImages: true,
  canAddAudio: true,
  canUseExtraField: true,
  canUseTranslation: true,
  maxCardsPerTheme: Infinity,
  maxThemes: Infinity
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState<'free' | 'premium' | 'test'>(
    process.env.NODE_ENV === 'development' ? 'test' : 'free'
  )

  const features = plan === 'free' ? FREE_FEATURES : PREMIUM_FEATURES

  const upgradeToPremium = () => {
    console.log('🚀 Redirection vers page de paiement...')
    // TODO: Implémenter la logique de paiement
    alert('Redirection vers la page de paiement (à implémenter)')
  }

  const toggleTestMode = () => {
    if (process.env.NODE_ENV === 'development') {
      setPlan(current => current === 'test' ? 'free' : 'test')
      console.log('🔄 Mode basculé vers:', plan === 'test' ? 'free' : 'test')
    }
  }

  return (
    <SubscriptionContext.Provider value={{
      plan,
      features,
      upgradeToPremium,
      toggleTestMode
    }}>
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
