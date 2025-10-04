import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'

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

const DEFAULT_PLAN: 'free' | 'premium' | 'test' = process.env.NODE_ENV === 'development' ? 'test' : 'free'
export const TESTER_ID = '68df8ef900381fdfe12e'
const STORAGE_KEY = 'ankilang:planOverride'

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [plan, setPlan] = useState<'free' | 'premium' | 'test'>(DEFAULT_PLAN)

  const isTester = user?.$id === TESTER_ID

  useEffect(() => {
    if (!isTester) {
      setPlan(DEFAULT_PLAN)
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY)
      }
      return
    }

    const storedPlan = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    if (storedPlan === 'premium' || storedPlan === 'free') {
      setPlan(storedPlan as 'free' | 'premium')
    } else {
      setPlan('premium')
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, 'premium')
      }
    }
  }, [isTester])

  const features = useMemo(() => (plan === 'free' ? FREE_FEATURES : PREMIUM_FEATURES), [plan])

  const upgradeToPremium = () => {
    console.log('🚀 Redirection vers page de paiement...')
    // TODO: Implémenter la logique de paiement
    alert('Redirection vers la page de paiement (à implémenter)')
  }

  const toggleTestMode = () => {
    if (isTester) {
      setPlan(current => {
        const next = current === 'premium' ? 'free' : 'premium'
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, next)
        }
        console.log('🔄 Plan testeur basculé vers:', next)
        return next
      })
      return
    }

    if (process.env.NODE_ENV === 'development') {
      setPlan(current => {
        const next = current === 'test' ? 'free' : 'test'
        console.log('🔄 Mode basculé vers:', next)
        return next
      })
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
