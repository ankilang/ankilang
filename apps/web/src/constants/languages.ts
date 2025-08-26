export interface Language {
  code: string
  label: string
  nativeName?: string
  flag: string
  color: string
}

export const LANGUAGES: Language[] = [
  { code: 'oc', label: 'Occitan', nativeName: 'Occitan', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', color: 'from-yellow-400 to-red-500' }, // Pas de drapeau standard, utilise l'Écosse
  { code: 'en', label: 'Anglais', nativeName: 'English', flag: '🇬🇧', color: 'from-blue-500 to-red-500' },
  { code: 'es', label: 'Espagnol', nativeName: 'Español', flag: '🇪🇸', color: 'from-red-500 to-yellow-500' },
  { code: 'fr', label: 'Français', nativeName: 'Français', flag: '🇫🇷', color: 'from-blue-500 to-red-500' },
  { code: 'de', label: 'Allemand', nativeName: 'Deutsch', flag: '🇩🇪', color: 'from-red-500 to-yellow-500' },
  { code: 'it', label: 'Italien', nativeName: 'Italiano', flag: '🇮🇹', color: 'from-green-500 to-red-500' },
  { code: 'pt', label: 'Portugais', nativeName: 'Português', flag: '🇵🇹', color: 'from-green-500 to-red-500' },
  { code: 'nl', label: 'Néerlandais', nativeName: 'Nederlands', flag: '🇳🇱', color: 'from-red-500 to-blue-500' },
  { code: 'ru', label: 'Russe', nativeName: 'Русский', flag: '🇷🇺', color: 'from-blue-500 to-red-500' },
  { code: 'ja', label: 'Japonais', nativeName: '日本語', flag: '🇯🇵', color: 'from-red-500 to-white' },
  { code: 'ko', label: 'Coréen', nativeName: '한국어', flag: '🇰🇷', color: 'from-blue-500 to-red-500' },
  { code: 'zh', label: 'Chinois', nativeName: '中文', flag: '🇨🇳', color: 'from-red-500 to-yellow-500' },
  { code: 'ar', label: 'Arabe', nativeName: 'العربية', flag: '🇸🇦', color: 'from-green-500 to-white' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', color: 'from-orange-500 to-green-500' },
  { code: 'tr', label: 'Turc', nativeName: 'Türkçe', flag: '🇹🇷', color: 'from-red-500 to-white' },
  { code: 'pl', label: 'Polonais', nativeName: 'Polski', flag: '🇵🇱', color: 'from-white to-red-500' },
  { code: 'sv', label: 'Suédois', nativeName: 'Svenska', flag: '🇸🇪', color: 'from-blue-500 to-yellow-500' },
  { code: 'da', label: 'Danois', nativeName: 'Dansk', flag: '🇩🇰', color: 'from-red-500 to-white' },
  { code: 'no', label: 'Norvégien', nativeName: 'Norsk', flag: '🇳🇴', color: 'from-red-500 to-blue-500' },
  { code: 'fi', label: 'Finnois', nativeName: 'Suomi', flag: '🇫🇮', color: 'from-blue-500 to-white' }
]

export const getLanguageByCode = (code: string): Language | undefined => {
  return LANGUAGES.find(lang => lang.code === code)
}

export const getLanguageLabel = (code: string): string => {
  const language = getLanguageByCode(code)
  return language ? language.label : code
}

export const getLanguageFlag = (code: string): string => {
  const language = getLanguageByCode(code)
  return language ? language.flag : '🌍'
}

export const getLanguageColor = (code: string): string => {
  const language = getLanguageByCode(code)
  return language ? language.color : 'from-gray-400 to-gray-600'
}
