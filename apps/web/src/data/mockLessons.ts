export interface Lesson {
  id: string
  title: string
  targetLang: string
  level: 'beginner' | 'intermediate' | 'advanced'
  durationMin: number
  tags: string[]
  isPro: boolean
  updatedAt: string
  sections: Array<{
    id: string
    title: string
    content: string
    proLocked?: boolean
  }>
  resources?: Array<{
    label: string
    url: string
  }>
}

export const mockLessons: Lesson[] = [
  {
    id: '1',
    title: 'Les bases de l\'anglais conversationnel',
    targetLang: 'en',
    level: 'beginner',
    durationMin: 45,
    tags: ['conversation', 'débutant', 'pratique'],
    isPro: false,
    updatedAt: '2024-01-20T10:00:00Z',
    sections: [
      {
        id: 'intro',
        title: 'Introduction',
        content: 'Dans cette leçon, vous apprendrez les expressions essentielles pour communiquer en anglais dans des situations quotidiennes. Nous nous concentrerons sur les salutations, les présentations et les questions de base.'
      },
      {
        id: 'greetings',
        title: 'Les salutations',
        content: 'Les salutations en anglais varient selon le moment de la journée et le niveau de formalité. "Good morning" (matin), "Good afternoon" (après-midi), "Good evening" (soirée) sont formels. "Hi" et "Hello" sont plus familiers.'
      },
      {
        id: 'introductions',
        title: 'Se présenter',
        content: 'Pour vous présenter, utilisez "My name is..." ou "I\'m...". Pour demander le nom de quelqu\'un : "What\'s your name?" ou "How do you do?" (formel).'
      }
    ],
    resources: [
      {
        label: 'Fiche de vocabulaire',
        url: '/resources/english-basics-vocab.pdf'
      },
      {
        label: 'Exercices audio',
        url: '/resources/english-basics-audio.mp3'
      }
    ]
  },
  {
    id: '2',
    title: 'Grammaire espagnole avancée',
    targetLang: 'es',
    level: 'advanced',
    durationMin: 90,
    tags: ['grammaire', 'avancé', 'subjonctif'],
    isPro: true,
    updatedAt: '2024-01-18T14:30:00Z',
    sections: [
      {
        id: 'intro',
        title: 'Introduction au subjonctif',
        content: 'Le subjonctif en espagnol exprime l\'incertitude, le doute, le désir ou l\'émotion. Il est utilisé dans des contextes spécifiques que nous allons explorer.'
      },
      {
        id: 'present',
        title: 'Le subjonctif présent',
        content: 'La formation du subjonctif présent suit des règles spécifiques. Pour les verbes réguliers : -ar → -e, -er/-ir → -a. Exemple : hablar → hable, comer → coma.'
      },
      {
        id: 'imperfect',
        title: 'Le subjonctif imparfait',
        content: 'L\'imparfait du subjonctif exprime des actions passées dans un contexte d\'incertitude ou de condition.',
        proLocked: true
      },
      {
        id: 'practice',
        title: 'Exercices pratiques',
        content: 'Pratiquez l\'utilisation du subjonctif dans des phrases complexes avec des exercices progressifs.',
        proLocked: true
      }
    ],
    resources: [
      {
        label: 'Tableaux de conjugaison',
        url: '/resources/spanish-subjunctive.pdf'
      }
    ]
  },
  {
    id: '3',
    title: 'Occitan : Découverte culturelle',
    targetLang: 'oc',
    level: 'beginner',
    durationMin: 60,
    tags: ['culture', 'occitan', 'découverte'],
    isPro: false,
    updatedAt: '2024-01-22T16:00:00Z',
    sections: [
      {
        id: 'intro',
        title: 'Introduction à l\'occitan',
        content: 'L\'occitan est une langue romane parlée dans le sud de la France. Découvrez son histoire, sa géographie et son importance culturelle.'
      },
      {
        id: 'basics',
        title: 'Les bases de l\'occitan',
        content: 'Apprenez les mots de base : bonjorn (bonjour), adieu (au revoir), mercés (merci), plan (bien). L\'occitan a plusieurs dialectes selon les régions.'
      },
      {
        id: 'culture',
        title: 'Culture occitane',
        content: 'Explorez la littérature, la musique et les traditions occitanes. De nombreux artistes et écrivains ont contribué à la richesse de cette culture.'
      }
    ]
  },
  {
    id: '4',
    title: 'Allemand : Les cas grammaticaux',
    targetLang: 'de',
    level: 'intermediate',
    durationMin: 75,
    tags: ['grammaire', 'cas', 'allemand'],
    isPro: true,
    updatedAt: '2024-01-15T11:00:00Z',
    sections: [
      {
        id: 'intro',
        title: 'Introduction aux cas',
        content: 'L\'allemand utilise quatre cas grammaticaux : nominatif, accusatif, datif et génitif. Chaque cas a une fonction spécifique dans la phrase.'
      },
      {
        id: 'nominativ',
        title: 'Le nominatif',
        content: 'Le nominatif indique le sujet de la phrase. Exemple : "Der Mann" (l\'homme) est au nominatif dans "Der Mann liest" (L\'homme lit).'
      },
      {
        id: 'akkusativ',
        title: 'L\'accusatif',
        content: 'L\'accusatif indique l\'objet direct. Exemple : "Den Mann" (l\'homme) est à l\'accusatif dans "Ich sehe den Mann" (Je vois l\'homme).',
        proLocked: true
      },
      {
        id: 'dativ',
        title: 'Le datif',
        content: 'Le datif indique l\'objet indirect. Exemple : "Dem Mann" (à l\'homme) est au datif dans "Ich gebe dem Mann ein Buch" (Je donne un livre à l\'homme).',
        proLocked: true
      }
    ],
    resources: [
      {
        label: 'Tableaux des déclinaisons',
        url: '/resources/german-cases.pdf'
      }
    ]
  },
  {
    id: '5',
    title: 'Italien : Conversation business',
    targetLang: 'it',
    level: 'intermediate',
    durationMin: 60,
    tags: ['business', 'conversation', 'italien'],
    isPro: true,
    updatedAt: '2024-01-19T13:00:00Z',
    sections: [
      {
        id: 'intro',
        title: 'Introduction au vocabulaire business',
        content: 'Maîtrisez le vocabulaire professionnel italien pour vos échanges commerciaux et réunions d\'affaires.'
      },
      {
        id: 'meetings',
        title: 'Les réunions',
        content: 'Apprenez les expressions pour organiser et participer à des réunions : "riunione" (réunion), "ordine del giorno" (ordre du jour).'
      },
      {
        id: 'negotiations',
        title: 'Les négociations',
        content: 'Expressions pour les négociations commerciales : "prezzo" (prix), "sconto" (remise), "contratto" (contrat).',
        proLocked: true
      }
    ]
  },
  {
    id: '6',
    title: 'Portugais : Voyage au Brésil',
    targetLang: 'pt',
    level: 'beginner',
    durationMin: 50,
    tags: ['voyage', 'brésil', 'portugais'],
    isPro: false,
    updatedAt: '2024-01-21T10:00:00Z',
    sections: [
      {
        id: 'intro',
        title: 'Préparer son voyage',
        content: 'Apprenez les phrases essentielles pour voyager au Brésil : demander son chemin, commander au restaurant, faire des achats.'
      },
      {
        id: 'transport',
        title: 'Les transports',
        content: 'Vocabulaire des transports : "ônibus" (bus), "metrô" (métro), "táxi" (taxi). Phrases utiles pour se déplacer.'
      },
      {
        id: 'food',
        title: 'La gastronomie',
        content: 'Découvrez la cuisine brésilienne : "feijoada", "caipirinha", "pão de queijo". Commandez au restaurant avec confiance.'
      }
    ]
  },
  {
    id: '7',
    title: 'Russe : L\'alphabet cyrillique',
    targetLang: 'ru',
    level: 'beginner',
    durationMin: 40,
    tags: ['alphabet', 'cyrillique', 'russe'],
    isPro: false,
    updatedAt: '2024-01-17T15:00:00Z',
    sections: [
      {
        id: 'intro',
        title: 'Découverte de l\'alphabet',
        content: 'L\'alphabet cyrillique russe compte 33 lettres. Certaines ressemblent au latin, d\'autres sont spécifiques au russe.'
      },
      {
        id: 'letters',
        title: 'Les lettres principales',
        content: 'Apprenez les lettres essentielles : А (a), Б (b), В (v), Г (g), Д (d). Pratiquez la lecture de mots simples.'
      },
      {
        id: 'reading',
        title: 'Première lecture',
        content: 'Lisez vos premiers mots en russe : "мама" (maman), "папа" (papa), "дом" (maison).'
      }
    ]
  },
  {
    id: '8',
    title: 'Japonais : Hiragana et Katakana',
    targetLang: 'ja',
    level: 'beginner',
    durationMin: 80,
    tags: ['écriture', 'hiragana', 'katakana'],
    isPro: true,
    updatedAt: '2024-01-16T08:00:00Z',
    sections: [
      {
        id: 'intro',
        title: 'Introduction aux syllabaires',
        content: 'Le japonais utilise trois systèmes d\'écriture : hiragana, katakana et kanji. Commençons par les syllabaires.'
      },
      {
        id: 'hiragana',
        title: 'Le hiragana',
        content: 'Le hiragana est utilisé pour les mots japonais natifs. Apprenez les 46 caractères de base : あ (a), い (i), う (u), え (e), お (o).'
      },
      {
        id: 'katakana',
        title: 'Le katakana',
        content: 'Le katakana est utilisé pour les mots d\'emprunt. Même sons que hiragana mais caractères différents : ア (a), イ (i), ウ (u).',
        proLocked: true
      },
      {
        id: 'practice',
        title: 'Exercices d\'écriture',
        content: 'Pratiquez l\'écriture des syllabaires avec des exercices progressifs.',
        proLocked: true
      }
    ]
  },
  {
    id: '9',
    title: 'Coréen : Hangul pour débutants',
    targetLang: 'ko',
    level: 'beginner',
    durationMin: 70,
    tags: ['hangul', 'écriture', 'coréen'],
    isPro: false,
    updatedAt: '2024-01-23T12:00:00Z',
    sections: [
      {
        id: 'intro',
        title: 'Introduction au Hangul',
        content: 'Le Hangul est l\'alphabet coréen créé par le roi Sejong en 1443. Il est considéré comme l\'un des systèmes d\'écriture les plus scientifiques.'
      },
      {
        id: 'consonants',
        title: 'Les consonnes',
        content: 'Apprenez les consonnes de base : ㄱ (g/k), ㄴ (n), ㄷ (d/t), ㄹ (r/l), ㅁ (m), ㅂ (b/p), ㅅ (s).'
      },
      {
        id: 'vowels',
        title: 'Les voyelles',
        content: 'Les voyelles : ㅏ (a), ㅓ (eo), ㅗ (o), ㅜ (u), ㅡ (eu), ㅣ (i).'
      }
    ]
  },
  {
    id: '10',
    title: 'Chinois : Pinyin et tons',
    targetLang: 'zh',
    level: 'beginner',
    durationMin: 65,
    tags: ['pinyin', 'tons', 'chinois'],
    isPro: true,
    updatedAt: '2024-01-14T14:00:00Z',
    sections: [
      {
        id: 'intro',
        title: 'Introduction au Pinyin',
        content: 'Le Pinyin est le système de romanisation du chinois mandarin. Il aide à prononcer les caractères chinois.'
      },
      {
        id: 'tones',
        title: 'Les quatre tons',
        content: 'Le chinois mandarin a quatre tons : premier ton (plat), deuxième ton (montant), troisième ton (descendant-montant), quatrième ton (descendant).'
      },
      {
        id: 'practice',
        title: 'Pratique des tons',
        content: 'Pratiquez la prononciation des tons avec des mots simples : mā (mère), má (chanvre), mǎ (cheval), mà (insulter).',
        proLocked: true
      }
    ]
  }
]

export const getLessonById = (id: string): Lesson | undefined => {
  return mockLessons.find(lesson => lesson.id === id)
}

export const getLessons = (): Lesson[] => {
  return mockLessons
}
