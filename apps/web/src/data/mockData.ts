import type { Theme, Card } from '../types/shared'

export const mockThemes: Theme[] = [
  {
    id: '1',
    userId: 'user1',
    name: 'Vocabulaire de base - Anglais',
    targetLang: 'en',
    cardCount: 15,
    shareStatus: 'private',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: '2',
    userId: 'user1',
    name: 'Grammaire espagnole',
    targetLang: 'es',
    cardCount: 8,
    shareStatus: 'public',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-18T16:45:00Z'
  },
  {
    id: '3',
    userId: 'user1',
    name: 'Expressions occitanes',
    targetLang: 'oc',
    cardCount: 12,
    shareStatus: 'public',
    createdAt: '2024-01-05T11:00:00Z',
    updatedAt: '2024-01-22T13:20:00Z'
  },
  {
    id: '4',
    userId: 'user1',
    name: 'Verbes allemands',
    targetLang: 'de',
    cardCount: 6,
    shareStatus: 'private',
    createdAt: '2024-01-12T15:00:00Z',
    updatedAt: '2024-01-19T10:15:00Z'
  }
]

// Helpers CRUD pour les thèmes (mock)
export const updateMockTheme = (id: string, patch: Partial<Theme>) => {
  const i = mockThemes.findIndex(t => t.id === id)
  if (i === -1) return
  mockThemes[i] = { 
    ...mockThemes[i], 
    ...patch, 
    updatedAt: new Date().toISOString() 
  } as Theme
}

export const deleteMockTheme = (id: string) => {
  const i = mockThemes.findIndex(t => t.id === id)
  if (i !== -1) mockThemes.splice(i, 1)
  if (mockCards[id]) delete mockCards[id]
}

export const mockCards: Record<string, Card[]> = {
  '1': [
    {
      id: '1-1',
      userId: 'user1',
      themeId: '1',
      type: 'basic',
      frontFR: 'Comment dit-on "bonjour" en anglais ?',
      backText: 'Hello',
      extra: 'Formel : Hello, Hi (familier)',
      tags: ['salutations', 'basique'],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '1-2',
      userId: 'user1',
      themeId: '1',
      type: 'basic',
      frontFR: 'Comment dit-on "au revoir" en anglais ?',
      backText: 'Goodbye',
      extra: 'Aussi : Bye, See you later',
      tags: ['salutations', 'basique'],
      createdAt: '2024-01-15T10:05:00Z',
      updatedAt: '2024-01-15T10:05:00Z'
    },
    {
      id: '1-3',
      userId: 'user1',
      themeId: '1',
      type: 'cloze',
      clozeTextTarget: 'The {{c1::cat}} {{c2::eats}} the {{c3::mouse}}',
      extra: 'Le chat mange la souris',
      tags: ['animaux', 'verbes'],
      createdAt: '2024-01-15T10:10:00Z',
      updatedAt: '2024-01-15T10:10:00Z'
    }
  ],
  '2': [
    {
      id: '2-1',
      userId: 'user1',
      themeId: '2',
      type: 'basic',
      frontFR: 'Comment dit-on "je suis" en espagnol ?',
      backText: 'Yo soy',
      extra: 'Verbe ser (être) - présent indicatif',
      tags: ['verbe être', 'présent'],
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-10T09:00:00Z'
    },
    {
      id: '2-2',
      userId: 'user1',
      themeId: '2',
      type: 'cloze',
      clozeTextTarget: '{{c1::Yo}} {{c2::soy}} {{c3::estudiante}}',
      extra: 'Je suis étudiant(e)',
      tags: ['verbe être', 'profession'],
      createdAt: '2024-01-10T09:05:00Z',
      updatedAt: '2024-01-10T09:05:00Z'
    }
  ],
  '3': [
    {
      id: '3-1',
      userId: 'user1',
      themeId: '3',
      type: 'basic',
      frontFR: 'Comment dit-on "bonjour" en occitan ?',
      backText: 'Bonjorn',
      extra: 'Formel : Bonjorn, familier : Adieu',
      tags: ['salutations', 'basique'],
      createdAt: '2024-01-05T11:00:00Z',
      updatedAt: '2024-01-05T11:00:00Z'
    }
  ],
  '4': [
    {
      id: '4-1',
      userId: 'user1',
      themeId: '4',
      type: 'basic',
      frontFR: 'Comment dit-on "je mange" en allemand ?',
      backText: 'Ich esse',
      extra: 'Verbe essen (manger) - présent indicatif',
      tags: ['verbe manger', 'présent'],
      createdAt: '2024-01-12T15:00:00Z',
      updatedAt: '2024-01-12T15:00:00Z'
    }
  ]
}

export const getThemeById = (id: string): Theme | undefined => {
  return mockThemes.find(theme => theme.id === id)
}

export const getCardsByThemeId = (themeId: string): Card[] => {
  return mockCards[themeId] || []
}

export const addMockTheme = (theme: { name: string; targetLang: string; tags: string[] }): Theme => {
  const newTheme: Theme = {
    ...theme,
    id: Date.now().toString(),
    userId: 'user1',
    cardCount: 0,
    shareStatus: 'private',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  mockThemes.push(newTheme)
  mockCards[newTheme.id] = []
  return newTheme
}

export const addMockCard = (card: Omit<Card, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Card => {
  const newCard: Card = {
    ...card,
    id: `${card.themeId}-${Date.now()}`,
    userId: 'user1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  if (!mockCards[card.themeId]) {
    mockCards[card.themeId] = []
  }
  mockCards[card.themeId]!.push(newCard)
  
  // Mettre à jour le nombre de cartes du thème
  const theme = mockThemes.find(t => t.id === card.themeId)
  if (theme) {
    theme.cardCount = mockCards[card.themeId]!.length
    theme.updatedAt = new Date().toISOString()
  }
  
  return newCard
}

// Helpers CRUD pour les cartes (mock)
export const updateMockCard = (id: string, patch: Partial<Card>) => {
  // Chercher la carte dans tous les thèmes
  for (const themeId in mockCards) {
    const cardIndex = mockCards[themeId]!.findIndex(c => c.id === id)
    if (cardIndex !== -1) {
      mockCards[themeId]![cardIndex] = { 
        ...mockCards[themeId]![cardIndex], 
        ...patch, 
        updatedAt: new Date().toISOString() 
      } as Card
      
      // Mettre à jour le nombre de cartes du thème
      const theme = mockThemes.find(t => t.id === themeId)
      if (theme) {
        theme.updatedAt = new Date().toISOString()
      }
      return
    }
  }
}

export const deleteMockCard = (id: string) => {
  // Chercher et supprimer la carte dans tous les thèmes
  for (const themeId in mockCards) {
    const cardIndex = mockCards[themeId]!.findIndex(c => c.id === id)
    if (cardIndex !== -1) {
      mockCards[themeId]!.splice(cardIndex, 1)
      
      // Mettre à jour le nombre de cartes du thème
      const theme = mockThemes.find(t => t.id === themeId)
      if (theme) {
        theme.cardCount = mockCards[themeId]!.length
        theme.updatedAt = new Date().toISOString()
      }
      return
    }
  }
}

export const getCardById = (id: string): Card | undefined => {
  // Chercher la carte dans tous les thèmes
  for (const themeId in mockCards) {
    const card = mockCards[themeId]!.find(c => c.id === id)
    if (card) return card
  }
  return undefined
}
