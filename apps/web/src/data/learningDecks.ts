export interface LearningDeck {
  id: string
  name: string
  author: string
  targetLang: string
  tags: string[]
  level: 'beginner' | 'intermediate' | 'advanced'
  cardCount: number
  downloads: number
  description?: string
  updatedAt: string
  isFree?: boolean
  previewCards: Array<{
    type: 'basic' | 'cloze'
    frontFR?: string
    backText?: string
    clozeTextTarget?: string
  }>
}

export const mockLearningDecks: LearningDeck[] = [
  {
    id: '1',
    name: 'Vocabulaire de base - Anglais',
    author: 'Marie Dubois',
    targetLang: 'en',
    tags: ['vocabulaire', 'débutant', 'basique'],
    level: 'beginner',
    cardCount: 45,
    downloads: 1247,
    description: 'Un deck complet pour apprendre les mots de base en anglais. Parfait pour les débutants qui veulent construire une base solide.',
    updatedAt: '2024-01-20T14:30:00Z',
    isFree: true,
    previewCards: [
      {
        type: 'basic',
        frontFR: 'Comment dit-on "bonjour" en anglais ?',
        backText: 'Hello'
      },
      {
        type: 'basic',
        frontFR: 'Comment dit-on "merci" en anglais ?',
        backText: 'Thank you'
      },
      {
        type: 'cloze',
        clozeTextTarget: 'The {{c1::cat}} {{c2::sleeps}} on the {{c3::bed}}'
      }
    ]
  },
  {
    id: '2',
    name: 'Grammaire espagnole avancée',
    author: 'Carlos Rodriguez',
    targetLang: 'es',
    tags: ['grammaire', 'avancé', 'conjugaison'],
    level: 'advanced',
    cardCount: 78,
    downloads: 892,
    description: 'Maîtrisez les subtilités de la grammaire espagnole avec ce deck complet couvrant les temps verbaux complexes et les exceptions.',
    updatedAt: '2024-01-18T09:15:00Z',
    previewCards: [
      {
        type: 'basic',
        frontFR: 'Comment conjugue-t-on "haber" au subjonctif présent ?',
        backText: 'haya, hayas, haya, hayamos, hayáis, hayan'
      },
      {
        type: 'cloze',
        clozeTextTarget: 'Si {{c1::hubiera}} sabido, {{c2::habría}} venido antes'
      }
    ]
  },
  {
    id: '3',
    name: 'Expressions occitanes du quotidien',
    author: 'Jean-Pierre Martin',
    targetLang: 'oc',
    tags: ['expressions', 'culture', 'quotidien'],
    level: 'intermediate',
    cardCount: 32,
    downloads: 156,
    description: 'Découvrez les expressions occitanes utilisées dans la vie de tous les jours. Un voyage culturel et linguistique.',
    updatedAt: '2024-01-22T16:45:00Z',
    previewCards: [
      {
        type: 'basic',
        frontFR: 'Comment dit-on "comment allez-vous ?" en occitan ?',
        backText: 'Coma vas ?'
      },
      {
        type: 'basic',
        frontFR: 'Que signifie "plan" en occitan ?',
        backText: 'Bien, très bien'
      }
    ]
  },
  {
    id: '4',
    name: 'Verbes allemands irréguliers',
    author: 'Anna Schmidt',
    targetLang: 'de',
    tags: ['verbes', 'irréguliers', 'allemand'],
    level: 'intermediate',
    cardCount: 67,
    downloads: 2341,
    description: 'Apprenez les verbes irréguliers allemands les plus importants avec leurs conjugaisons complètes.',
    updatedAt: '2024-01-15T11:20:00Z',
    previewCards: [
      {
        type: 'basic',
        frontFR: 'Conjugaison de "sein" au présent : ich...',
        backText: 'bin'
      },
      {
        type: 'basic',
        frontFR: 'Conjugaison de "haben" au présent : du...',
        backText: 'hast'
      },
      {
        type: 'cloze',
        clozeTextTarget: 'Ich {{c1::bin}} müde, aber du {{c2::bist}} nicht'
      }
    ]
  },
  {
    id: '5',
    name: 'Vocabulaire business italien',
    author: 'Marco Rossi',
    targetLang: 'it',
    tags: ['business', 'professionnel', 'vocabulaire'],
    level: 'intermediate',
    cardCount: 89,
    downloads: 567,
    description: 'Maîtrisez le vocabulaire professionnel italien pour vos échanges commerciaux et réunions d\'affaires.',
    updatedAt: '2024-01-19T13:10:00Z',
    previewCards: [
      {
        type: 'basic',
        frontFR: 'Comment dit-on "réunion" en italien ?',
        backText: 'riunione'
      },
      {
        type: 'basic',
        frontFR: 'Que signifie "fattura" ?',
        backText: 'Facture'
      }
    ]
  },
  {
    id: '6',
    name: 'Phrases utiles en portugais',
    author: 'Sofia Santos',
    targetLang: 'pt',
    tags: ['phrases', 'utile', 'voyage'],
    level: 'beginner',
    cardCount: 28,
    downloads: 423,
    description: 'Les phrases essentielles pour voyager au Portugal et au Brésil. Communication de base pour tous les voyageurs.',
    updatedAt: '2024-01-21T10:30:00Z',
    previewCards: [
      {
        type: 'basic',
        frontFR: 'Comment dit-on "où est la gare ?" en portugais ?',
        backText: 'Onde fica a estação ?'
      },
      {
        type: 'basic',
        frontFR: 'Comment demander "combien ça coûte ?" ?',
        backText: 'Quanto custa ?'
      }
    ]
  },
  {
    id: '7',
    name: 'Grammaire russe - Cas nominatif',
    author: 'Elena Petrov',
    targetLang: 'ru',
    tags: ['grammaire', 'cas', 'russe'],
    level: 'beginner',
    cardCount: 34,
    downloads: 189,
    description: 'Apprenez les bases du système de cas russes, en commençant par le nominatif. Fondamentaux de la grammaire russe.',
    updatedAt: '2024-01-17T15:45:00Z',
    previewCards: [
      {
        type: 'basic',
        frontFR: 'Comment dit-on "maison" au nominatif ?',
        backText: 'дом'
      },
      {
        type: 'cloze',
        clozeTextTarget: 'Это {{c1::дом}}'
      }
    ]
  },
  {
    id: '8',
    name: 'Kanji japonais - Niveau N5',
    author: 'Yuki Tanaka',
    targetLang: 'ja',
    tags: ['kanji', 'JLPT', 'N5'],
    level: 'beginner',
    cardCount: 103,
    downloads: 3456,
    description: 'Les kanji essentiels pour passer le JLPT N5. Inclut lectures on et kun, ainsi que des exemples d\'usage.',
    updatedAt: '2024-01-16T08:20:00Z',
    previewCards: [
      {
        type: 'basic',
        frontFR: 'Comment se lit le kanji 人 ?',
        backText: 'じん (jin) / ひと (hito)'
      },
      {
        type: 'basic',
        frontFR: 'Que signifie le kanji 大 ?',
        backText: 'Grand, gros'
      }
    ]
  },
  {
    id: '9',
    name: 'Expressions coréennes courantes',
    author: 'Min-ji Kim',
    targetLang: 'ko',
    tags: ['expressions', 'courant', 'coréen'],
    level: 'intermediate',
    cardCount: 56,
    downloads: 234,
    description: 'Les expressions coréennes les plus utilisées dans la conversation quotidienne. Améliorez votre fluidité naturelle.',
    updatedAt: '2024-01-23T12:15:00Z',
    previewCards: [
      {
        type: 'basic',
        frontFR: 'Comment dit-on "c\'est dommage" en coréen ?',
        backText: '아쉽다 (aswipda)'
      },
      {
        type: 'basic',
        frontFR: 'Que signifie "맛있어요" ?',
        backText: 'C\'est délicieux'
      }
    ]
  },
  {
    id: '10',
    name: 'Vocabulaire chinois HSK 1',
    author: 'Li Wei',
    targetLang: 'zh',
    tags: ['HSK', 'vocabulaire', 'chinois'],
    level: 'beginner',
    cardCount: 150,
    downloads: 2891,
    description: 'Tous les mots du HSK niveau 1 avec pinyin et exemples. Parfait pour débuter en chinois mandarin.',
    updatedAt: '2024-01-14T14:50:00Z',
    previewCards: [
      {
        type: 'basic',
        frontFR: 'Comment dit-on "bonjour" en chinois ?',
        backText: '你好 (nǐ hǎo)'
      },
      {
        type: 'basic',
        frontFR: 'Que signifie "谢谢" ?',
        backText: 'Merci (xiè xie)'
      }
    ]
  },
  {
    id: '11',
    name: 'Grammaire arabe - Verbes',
    author: 'Ahmed Hassan',
    targetLang: 'ar',
    tags: ['grammaire', 'verbes', 'arabe'],
    level: 'intermediate',
    cardCount: 73,
    downloads: 178,
    description: 'Maîtrisez la conjugaison des verbes arabes avec ce deck complet couvrant les temps principaux.',
    updatedAt: '2024-01-20T16:30:00Z',
    previewCards: [
      {
        type: 'basic',
        frontFR: 'Comment conjugue-t-on "كتب" au présent ?',
        backText: 'أكتب، تكتب، يكتب، نكتب، تكتبون، يكتبون'
      }
    ]
  },
  {
    id: '12',
    name: 'Hindi de base',
    author: 'Priya Patel',
    targetLang: 'hi',
    tags: ['hindi', 'débutant', 'basique'],
    level: 'beginner',
    cardCount: 41,
    downloads: 156,
    description: 'Les bases du hindi pour communiquer dans la vie quotidienne. Inclut l\'écriture devanagari.',
    updatedAt: '2024-01-22T11:40:00Z',
    previewCards: [
      {
        type: 'basic',
        frontFR: 'Comment dit-on "bonjour" en hindi ?',
        backText: 'नमस्ते (namaste)'
      },
      {
        type: 'basic',
        frontFR: 'Que signifie "धन्यवाद" ?',
        backText: 'Merci (dhanyavaad)'
      }
    ]
  },
  {
    id: '13',
    name: 'Turc conversationnel',
    author: 'Mehmet Yilmaz',
    targetLang: 'tr',
    tags: ['conversation', 'turc', 'pratique'],
    level: 'intermediate',
    cardCount: 62,
    downloads: 89,
    description: 'Apprenez le turc conversationnel avec des phrases utiles et des expressions idiomatiques.',
    updatedAt: '2024-01-18T13:25:00Z',
    previewCards: [
      {
        type: 'basic',
        frontFR: 'Comment dit-on "comment allez-vous ?" en turc ?',
        backText: 'Nasılsınız ?'
      },
      {
        type: 'basic',
        frontFR: 'Que signifie "teşekkür ederim" ?',
        backText: 'Je vous remercie'
      }
    ]
  },
  {
    id: '14',
    name: 'Polonais pour voyageurs',
    author: 'Katarzyna Nowak',
    targetLang: 'pl',
    tags: ['voyage', 'polonais', 'pratique'],
    level: 'beginner',
    cardCount: 38,
    downloads: 234,
    description: 'Les phrases essentielles pour voyager en Pologne. Communication de base pour tous les voyageurs.',
    updatedAt: '2024-01-21T09:15:00Z',
    previewCards: [
      {
        type: 'basic',
        frontFR: 'Comment dit-on "bonjour" en polonais ?',
        backText: 'Dzień dobry'
      },
      {
        type: 'basic',
        frontFR: 'Comment demander "où est..." ?',
        backText: 'Gdzie jest... ?'
      }
    ]
  },
  {
    id: '15',
    name: 'Suédois - Premiers pas',
    author: 'Erik Johansson',
    targetLang: 'sv',
    tags: ['suédois', 'débutant', 'premiers pas'],
    level: 'beginner',
    cardCount: 29,
    downloads: 167,
    description: 'Commencez votre apprentissage du suédois avec ce deck de base. Parfait pour les débutants complets.',
    updatedAt: '2024-01-19T14:20:00Z',
    previewCards: [
      {
        type: 'basic',
        frontFR: 'Comment dit-on "bonjour" en suédois ?',
        backText: 'Hej'
      },
      {
        type: 'basic',
        frontFR: 'Que signifie "tack" ?',
        backText: 'Merci'
      }
    ]
  }
]

export const getLearningDeckById = (id: string): LearningDeck | undefined => {
  return mockLearningDecks.find(deck => deck.id === id)
}

export const getLearningDecks = (): LearningDeck[] => {
  return mockLearningDecks
}
