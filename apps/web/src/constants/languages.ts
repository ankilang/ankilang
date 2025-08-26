export interface Language {
  code: string
  label: string
  nativeName?: string
  flag: string
  color: string
}

export const LANGUAGES: Language[] = [
  { code: 'oc', label: 'Occitan', nativeName: 'Occitan', flag: '', color: 'from-amber-400 to-orange-500' }, // Jaune-Orange unique
  { code: 'en', label: 'Anglais', nativeName: 'English', flag: '🇬🇧', color: 'from-blue-500 to-indigo-600' }, // Bleu royal
  { code: 'es', label: 'Espagnol', nativeName: 'Español', flag: '🇪🇸', color: 'from-red-400 to-pink-500' }, // Rouge-Espagne
  { code: 'fr', label: 'Français', nativeName: 'Français', flag: '🇫🇷', color: 'from-blue-400 to-cyan-500' }, // Bleu-France
  { code: 'de', label: 'Allemand', nativeName: 'Deutsch', flag: '🇩🇪', color: 'from-yellow-500 to-amber-600' }, // Jaune-Allemagne
  { code: 'it', label: 'Italien', nativeName: 'Italiano', flag: '🇮🇹', color: 'from-green-400 to-emerald-500' }, // Vert-Italie
  { code: 'pt', label: 'Portugais', nativeName: 'Português', flag: '🇵🇹', color: 'from-red-500 to-rose-600' }, // Rouge-Portugal
  { code: 'nl', label: 'Néerlandais', nativeName: 'Nederlands', flag: '🇳🇱', color: 'from-orange-400 to-red-500' }, // Orange-Pays-Bas
  { code: 'ru', label: 'Russe', nativeName: 'Русский', flag: '🇷🇺', color: 'from-blue-600 to-slate-700' }, // Bleu foncé-Russie
  { code: 'ja', label: 'Japonais', nativeName: '日本語', flag: '🇯🇵', color: 'from-red-500 to-pink-600' }, // Rouge-Japon
  { code: 'ko', label: 'Coréen', nativeName: '한국어', flag: '🇰🇷', color: 'from-blue-500 to-purple-600' }, // Bleu-Corée
  { code: 'zh', label: 'Chinois', nativeName: '中文', flag: '🇨🇳', color: 'from-red-600 to-orange-500' }, // Rouge-Chine
  { code: 'ar', label: 'Arabe', nativeName: 'العربية', flag: '🇸🇦', color: 'from-green-500 to-teal-600' }, // Vert-Arabie
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', color: 'from-orange-500 to-amber-600' }, // Orange-Inde
  { code: 'tr', label: 'Turc', nativeName: 'Türkçe', flag: '🇹🇷', color: 'from-red-500 to-rose-500' }, // Rouge-Turquie
  { code: 'pl', label: 'Polonais', nativeName: 'Polski', flag: '🇵🇱', color: 'from-red-400 to-pink-400' }, // Rouge-Pologne
  { code: 'sv', label: 'Suédois', nativeName: 'Svenska', flag: '🇸🇪', color: 'from-blue-400 to-cyan-400' }, // Bleu-Suède
  { code: 'da', label: 'Danois', nativeName: 'Dansk', flag: '🇩🇰', color: 'from-red-500 to-orange-400' }, // Rouge-Danemark
  { code: 'no', label: 'Norvégien', nativeName: 'Norsk', flag: '🇳🇴', color: 'from-blue-500 to-indigo-500' }, // Bleu-Norvège
  { code: 'fi', label: 'Finnois', nativeName: 'Suomi', flag: '🇫🇮', color: 'from-blue-400 to-slate-500' } // Bleu-Finlande
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
  if (!language) return '🌍'
  return language.flag || '🌍'
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
    'hi': { bg: 'bg-gradient-to-br from-orange-100 to-amber-100', border: 'border-orange-300', accent: '#ea580c', secondary: '#fed7aa' },
    'tr': { bg: 'bg-gradient-to-br from-red-100 to-rose-100', border: 'border-red-300', accent: '#e11d48', secondary: '#ffe4e6' },
    'pl': { bg: 'bg-gradient-to-br from-red-100 to-pink-100', border: 'border-red-300', accent: '#f87171', secondary: '#fee2e2' },
    'sv': { bg: 'bg-gradient-to-br from-blue-100 to-cyan-100', border: 'border-blue-300', accent: '#0891b2', secondary: '#cffafe' },
    'da': { bg: 'bg-gradient-to-br from-red-100 to-orange-100', border: 'border-red-300', accent: '#ea580c', secondary: '#fed7aa' },
    'no': { bg: 'bg-gradient-to-br from-blue-100 to-indigo-100', border: 'border-blue-300', accent: '#4338ca', secondary: '#e0e7ff' },
    'fi': { bg: 'bg-gradient-to-br from-blue-100 to-slate-100', border: 'border-blue-300', accent: '#475569', secondary: '#f1f5f9' }
  }

  return colorMap[code] || {
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    accent: '#6b7280',
    secondary: '#f3f4f6'
  }
}
