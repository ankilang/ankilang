export interface Language {
  code: string
  label: string
  nativeName?: string
}

export const LANGUAGES: Language[] = [
  { code: 'oc', label: 'Occitan', nativeName: 'Occitan' },
  { code: 'en', label: 'Anglais', nativeName: 'English' },
  { code: 'es', label: 'Espagnol', nativeName: 'Español' },
  { code: 'fr', label: 'Français', nativeName: 'Français' },
  { code: 'de', label: 'Allemand', nativeName: 'Deutsch' },
  { code: 'it', label: 'Italien', nativeName: 'Italiano' },
  { code: 'pt', label: 'Portugais', nativeName: 'Português' },
  { code: 'nl', label: 'Néerlandais', nativeName: 'Nederlands' },
  { code: 'ru', label: 'Russe', nativeName: 'Русский' },
  { code: 'ja', label: 'Japonais', nativeName: '日本語' },
  { code: 'ko', label: 'Coréen', nativeName: '한국어' },
  { code: 'zh', label: 'Chinois', nativeName: '中文' },
  { code: 'ar', label: 'Arabe', nativeName: 'العربية' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'tr', label: 'Turc', nativeName: 'Türkçe' },
  { code: 'pl', label: 'Polonais', nativeName: 'Polski' },
  { code: 'sv', label: 'Suédois', nativeName: 'Svenska' },
  { code: 'da', label: 'Danois', nativeName: 'Dansk' },
  { code: 'no', label: 'Norvégien', nativeName: 'Norsk' },
  { code: 'fi', label: 'Finnois', nativeName: 'Suomi' }
]

export const getLanguageByCode = (code: string): Language | undefined => {
  return LANGUAGES.find(lang => lang.code === code)
}

export const getLanguageLabel = (code: string): string => {
  const language = getLanguageByCode(code)
  return language ? language.label : code
}
