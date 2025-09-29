export interface Language {
  code: string
  label: string
  nativeName?: string
  flag: string // Maintenant utilisé pour les SVG via FlagIcon
  color: string
}

export const LANGUAGES: Language[] = [
  // Spécial app - Occitan utilise un style texte personnalisé
  { code: 'oc', label: 'Occitan', nativeName: 'Occitan', flag: 'oc', color: 'from-amber-400 to-orange-500' },

  // Anglais (DeepL nécessite une variante)
  { code: 'en-GB', label: 'Anglais (UK)', nativeName: 'English (UK)', flag: 'en-GB', color: 'from-blue-500 to-indigo-600' },
  { code: 'en-US', label: 'Anglais (US)', nativeName: 'English (US)', flag: 'en-US', color: 'from-blue-500 to-indigo-600' },

  // Espagnol
  { code: 'es', label: 'Espagnol', nativeName: 'Español', flag: 'es', color: 'from-red-400 to-pink-500' },
  { code: 'es-419', label: 'Espagnol (Am. latine)', nativeName: 'Español (LatAm)', flag: 'es-419', color: 'from-red-400 to-pink-500' },

  // Portugais
  { code: 'pt-PT', label: 'Portugais (PT)', nativeName: 'Português (PT)', flag: 'pt-PT', color: 'from-red-500 to-rose-600' },
  { code: 'pt-BR', label: 'Portugais (BR)', nativeName: 'Português (BR)', flag: 'pt-BR', color: 'from-red-500 to-rose-600' },

  // Chinois
  { code: 'zh-HANS', label: 'Chinois (simplifié)', nativeName: '中文（简体）', flag: 'zh-HANS', color: 'from-red-600 to-orange-500' },
  { code: 'zh-HANT', label: 'Chinois (traditionnel)', nativeName: '中文（繁體）', flag: 'zh-HANT', color: 'from-red-600 to-orange-500' },

  // Autres langues supportées DeepL
  { code: 'fr', label: 'Français', nativeName: 'Français', flag: 'fr', color: 'from-blue-400 to-cyan-500' },
  { code: 'de', label: 'Allemand', nativeName: 'Deutsch', flag: 'de', color: 'from-yellow-500 to-amber-600' },
  { code: 'it', label: 'Italien', nativeName: 'Italiano', flag: 'it', color: 'from-green-400 to-emerald-500' },
  { code: 'nl', label: 'Néerlandais', nativeName: 'Nederlands', flag: 'nl', color: 'from-orange-400 to-red-500' },
  { code: 'pl', label: 'Polonais', nativeName: 'Polski', flag: 'pl', color: 'from-red-400 to-pink-400' },
  { code: 'sv', label: 'Suédois', nativeName: 'Svenska', flag: 'sv', color: 'from-blue-400 to-cyan-400' },
  { code: 'da', label: 'Danois', nativeName: 'Dansk', flag: 'da', color: 'from-red-500 to-orange-400' },
  { code: 'nb', label: 'Norvégien (Bokmål)', nativeName: 'Norsk (Bokmål)', flag: 'nb', color: 'from-blue-500 to-indigo-500' },
  { code: 'fi', label: 'Finnois', nativeName: 'Suomi', flag: 'fi', color: 'from-blue-400 to-slate-500' },
  { code: 'ru', label: 'Russe', nativeName: 'Русский', flag: 'ru', color: 'from-blue-600 to-slate-700' },
  { code: 'ja', label: 'Japonais', nativeName: '日本語', flag: 'ja', color: 'from-red-500 to-pink-600' },
  { code: 'ko', label: 'Coréen', nativeName: '한국어', flag: 'ko', color: 'from-blue-500 to-purple-600' },
  { code: 'ar', label: 'Arabe', nativeName: 'العربية', flag: 'ar', color: 'from-green-500 to-teal-600' },
  { code: 'tr', label: 'Turc', nativeName: 'Türkçe', flag: 'tr', color: 'from-red-500 to-rose-500' },
  { code: 'bg', label: 'Bulgare', nativeName: 'Български', flag: 'bg', color: 'from-green-400 to-emerald-500' },
  { code: 'cs', label: 'Tchèque', nativeName: 'Čeština', flag: 'cs', color: 'from-blue-400 to-indigo-500' },
  { code: 'el', label: 'Grec', nativeName: 'Ελληνικά', flag: 'el', color: 'from-blue-400 to-cyan-500' },
  { code: 'et', label: 'Estonien', nativeName: 'Eesti', flag: 'et', color: 'from-blue-400 to-cyan-500' },
  { code: 'he', label: 'Hébreu', nativeName: 'עברית', flag: 'he', color: 'from-blue-400 to-cyan-500' },
  { code: 'hu', label: 'Hongrois', nativeName: 'Magyar', flag: 'hu', color: 'from-red-400 to-pink-500' },
  { code: 'id', label: 'Indonésien', nativeName: 'Bahasa Indonesia', flag: 'id', color: 'from-red-400 to-pink-500' },
  { code: 'lt', label: 'Lituanien', nativeName: 'Lietuvių', flag: 'lt', color: 'from-yellow-400 to-amber-500' },
  { code: 'lv', label: 'Letton', nativeName: 'Latviešu', flag: 'lv', color: 'from-red-400 to-rose-500' },
  { code: 'ro', label: 'Roumain', nativeName: 'Română', flag: 'ro', color: 'from-yellow-400 to-amber-500' },
  { code: 'sk', label: 'Slovaque', nativeName: 'Slovenčina', flag: 'sk', color: 'from-blue-400 to-indigo-500' },
  { code: 'sl', label: 'Slovène', nativeName: 'Slovenščina', flag: 'sl', color: 'from-green-400 to-emerald-500' },
  { code: 'th', label: 'Thaï', nativeName: 'ไทย', flag: 'th', color: 'from-red-400 to-rose-500' },
  { code: 'uk', label: 'Ukrainien', nativeName: 'Українська', flag: 'uk', color: 'from-blue-400 to-cyan-500' },
  { code: 'vi', label: 'Vietnamien', nativeName: 'Tiếng Việt', flag: 'vi', color: 'from-green-400 to-emerald-500' }
]

export const getLanguageByCode = (code: string): Language | undefined => {
  const exact = LANGUAGES.find(lang => lang.code === code)
  if (exact) return exact
  // Variantes/alias non listées (ex: oc-gascon)
  if (code === 'oc-gascon') {
    const oc = LANGUAGES.find(l => l.code === 'oc')
    if (oc) return { ...oc, code: 'oc-gascon', label: 'Occitan (Gascon)', nativeName: 'Occitan - Gascon' }
  }
  return undefined
}

export const getLanguageLabel = (code: string): string => {
  const language = getLanguageByCode(code)
  return language ? language.label : code
}

export const getLanguageFlag = (code: string): string => {
  const language = getLanguageByCode(code)
  if (!language) return 'world' // Fallback code pour FlagIcon
  return language.flag || 'world'
}

export const getLanguageColor = (code: string): string => {
  const language = getLanguageByCode(code)
  return language ? language.color : 'from-gray-400 to-gray-600'
}

// Fonction pour générer les couleurs du thème à partir de la langue
export const getThemeColors = (code: string) => {
  const language = getLanguageByCode(code)
  if (!language) {
    return {
      bg: 'bg-gray-100',
      border: 'border-gray-300',
      accent: '#6b7280',
      secondary: '#f3f4f6'
    }
  }

  // Mapping des couleurs par langue avec des couleurs uniques
  const colorMap: Record<string, { bg: string; border: string; accent: string; secondary: string }> = {
    'oc': { bg: 'bg-gradient-to-br from-amber-100 to-orange-100', border: 'border-amber-300', accent: '#f59e0b', secondary: '#fef3c7' },
    'en': { bg: 'bg-gradient-to-br from-blue-100 to-indigo-100', border: 'border-blue-300', accent: '#3b82f6', secondary: '#dbeafe' },
    'es': { bg: 'bg-gradient-to-br from-red-100 to-pink-100', border: 'border-red-300', accent: '#ef4444', secondary: '#fee2e2' },
    'fr': { bg: 'bg-gradient-to-br from-blue-100 to-cyan-100', border: 'border-blue-300', accent: '#06b6d4', secondary: '#cffafe' },
    'de': { bg: 'bg-gradient-to-br from-yellow-100 to-amber-100', border: 'border-yellow-300', accent: '#eab308', secondary: '#fef3c7' },
    'it': { bg: 'bg-gradient-to-br from-green-100 to-emerald-100', border: 'border-green-300', accent: '#10b981', secondary: '#d1fae5' },
    'pt': { bg: 'bg-gradient-to-br from-red-100 to-rose-100', border: 'border-red-300', accent: '#f43f5e', secondary: '#ffe4e6' },
    'nl': { bg: 'bg-gradient-to-br from-orange-100 to-red-100', border: 'border-orange-300', accent: '#ea580c', secondary: '#fed7aa' },
    'ru': { bg: 'bg-gradient-to-br from-blue-100 to-slate-100', border: 'border-blue-300', accent: '#1e40af', secondary: '#dbeafe' },
    'ja': { bg: 'bg-gradient-to-br from-red-100 to-pink-100', border: 'border-red-300', accent: '#dc2626', secondary: '#fee2e2' },
    'ko': { bg: 'bg-gradient-to-br from-blue-100 to-purple-100', border: 'border-blue-300', accent: '#7c3aed', secondary: '#e9d5ff' },
    'zh': { bg: 'bg-gradient-to-br from-red-100 to-orange-100', border: 'border-red-300', accent: '#dc2626', secondary: '#fed7aa' },
    'ar': { bg: 'bg-gradient-to-br from-green-100 to-teal-100', border: 'border-green-300', accent: '#059669', secondary: '#ccfbf1' },
    'tr': { bg: 'bg-gradient-to-br from-red-100 to-rose-100', border: 'border-red-300', accent: '#e11d48', secondary: '#ffe4e6' },
    'pl': { bg: 'bg-gradient-to-br from-red-100 to-pink-100', border: 'border-red-300', accent: '#f87171', secondary: '#fee2e2' },
    'sv': { bg: 'bg-gradient-to-br from-blue-100 to-cyan-100', border: 'border-blue-300', accent: '#0891b2', secondary: '#e0e7ff' },
    'da': { bg: 'bg-gradient-to-br from-red-100 to-orange-100', border: 'border-red-300', accent: '#ea580c', secondary: '#fed7aa' },
    'no': { bg: 'bg-gradient-to-br from-blue-100 to-indigo-100', border: 'border-blue-300', accent: '#4338ca', secondary: '#dbeafe' },
    'fi': { bg: 'bg-gradient-to-br from-blue-100 to-slate-100', border: 'border-blue-300', accent: '#475569', secondary: '#f1f5f9' }
  }

  // Normaliser variantes → code de base pour couleurs
  const lower = code.toLowerCase()
  const base = lower.startsWith('en-') ? 'en'
    : lower.startsWith('pt-') ? 'pt'
    : lower.startsWith('zh-') ? 'zh'
    : lower === 'nb' ? 'no'
    : lower === 'es-419' ? 'es'
    : lower

  return colorMap[base] || {
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    accent: '#6b7280',
    secondary: '#f3f4f6'
  }
}
