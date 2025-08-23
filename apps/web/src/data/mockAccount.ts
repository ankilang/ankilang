import { z } from 'zod'
import { getJSON, setJSON } from '../utils/storage'

// Types
export type ThemeMode = 'system' | 'light' | 'dark'
export type TextSize = 'sm' | 'md' | 'lg'
export type SubscriptionPlan = 'free' | 'pro'
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled'

export interface UserProfile {
  id: string
  displayName: string
  email: string
  username: string
  bio?: string
  location?: string
  avatarUrl?: string
  createdAt: string
}

export interface Subscription {
  plan: SubscriptionPlan
  status: SubscriptionStatus
  renewsAt?: string
}

export interface Session {
  id: string
  device: string
  browser: string
  ip: string
  lastActive: string
  current?: boolean
}

export interface Preferences {
  ui: {
    theme: ThemeMode
    language: string
    reducedMotion: boolean
    dyslexicFont: boolean
    textSize: TextSize
  }
  study: {
    dailyGoal: number
  }
  notifications: {
    email: boolean
    push: boolean
  }
}

export interface Account {
  user: UserProfile
  subscription: Subscription
  preferences: Preferences
  sessions: Session[]
}

// Schémas Zod
export const zThemeMode = z.enum(['system', 'light', 'dark'])
export const zTextSize = z.enum(['sm', 'md', 'lg'])
export const zSubscriptionPlan = z.enum(['free', 'pro'])
export const zSubscriptionStatus = z.enum(['active', 'past_due', 'canceled'])

export const zUserProfile = z.object({
  id: z.string(),
  displayName: z.string().min(2),
  email: z.string().email(),
  username: z.string().min(3),
  bio: z.string().max(160).optional(),
  location: z.string().max(60).optional(),
  avatarUrl: z.string().url().optional(),
  createdAt: z.string()
})

export const zSubscription = z.object({
  plan: zSubscriptionPlan,
  status: zSubscriptionStatus,
  renewsAt: z.string().optional()
})

export const zSession = z.object({
  id: z.string(),
  device: z.string(),
  browser: z.string(),
  ip: z.string(),
  lastActive: z.string(),
  current: z.boolean().optional()
})

export const zPreferences = z.object({
  ui: z.object({
    theme: zThemeMode,
    language: z.string(),
    reducedMotion: z.boolean(),
    dyslexicFont: z.boolean(),
    textSize: zTextSize
  }),
  study: z.object({
    dailyGoal: z.number().min(0).max(60)
  }),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean()
  })
})

export const zAccount = z.object({
  user: zUserProfile,
  subscription: zSubscription,
  preferences: zPreferences,
  sessions: z.array(zSession)
})

// Constantes
export const ACCOUNT_KEY = 'ankilang:account'

export const DEFAULT_ACCOUNT: Account = {
  user: {
    id: 'user-1',
    displayName: 'Utilisateur Ankilang',
    email: 'user@ankilang.com',
    username: 'user_ankilang',
    bio: 'Passionné d\'apprentissage des langues',
    location: 'Paris, France',
    createdAt: new Date().toISOString()
  },
  subscription: {
    plan: 'free',
    status: 'active'
  },
  preferences: {
    ui: {
      theme: 'system',
      language: 'fr',
      reducedMotion: false,
      dyslexicFont: false,
      textSize: 'md'
    },
    study: {
      dailyGoal: 10
    },
    notifications: {
      email: true,
      push: false
    }
  },
  sessions: [
    {
      id: 'session-1',
      device: 'MacBook Pro',
      browser: 'Chrome 120.0',
      ip: '192.168.1.100',
      lastActive: new Date().toISOString(),
      current: true
    },
    {
      id: 'session-2',
      device: 'iPhone 15',
      browser: 'Safari Mobile',
      ip: '192.168.1.101',
      lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'session-3',
      device: 'Windows PC',
      browser: 'Firefox 121.0',
      ip: '192.168.1.102',
      lastActive: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
}

// Helpers
export function getAccount(): Account {
  const stored = getJSON(ACCOUNT_KEY, zAccount)
  return stored || DEFAULT_ACCOUNT
}

export function updateProfile(patch: Partial<UserProfile>): Account {
  const account = getAccount()
  const updatedAccount: Account = {
    ...account,
    user: { ...account.user, ...patch }
  }
  setJSON(ACCOUNT_KEY, updatedAccount)
  return updatedAccount
}

export function updateSubscription(patch: Partial<Subscription>): Account {
  const account = getAccount()
  const updatedAccount: Account = {
    ...account,
    subscription: { ...account.subscription, ...patch }
  }
  setJSON(ACCOUNT_KEY, updatedAccount)
  return updatedAccount
}

export function updatePreferences(patch: Partial<Preferences>): Account {
  const account = getAccount()
  const updatedAccount: Account = {
    ...account,
    preferences: { ...account.preferences, ...patch }
  }
  setJSON(ACCOUNT_KEY, updatedAccount)
  return updatedAccount
}

export function revokeSession(sessionId: string): Account {
  const account = getAccount()
  const updatedAccount: Account = {
    ...account,
    sessions: account.sessions.filter(session => session.id !== sessionId)
  }
  setJSON(ACCOUNT_KEY, updatedAccount)
  return updatedAccount
}

export function revokeAllSessions(): Account {
  const account = getAccount()
  const updatedAccount: Account = {
    ...account,
    sessions: account.sessions.filter(session => session.current)
  }
  setJSON(ACCOUNT_KEY, updatedAccount)
  return updatedAccount
}
