export interface Language {
  code: string
  label: string
  nativeName?: string
  flag: string // Maintenant utilisé pour les SVG via FlagIcon
  color: string
}

/**
 * Languages supported by DeepL Translation API + Revirada (Occitan)
 * Codes follow DeepL official specification (case-sensitive)
 * https://developers.deepl.com/docs/resources/supported-languages
 */
export const LANGUAGES: Language[] = [
  // Occitan (Revirada API - Regional languages)
  { code: 'oc', label: 'Occitan (Languedocien)', nativeName: 'Occitan', flag: 'oc', color: 'from-amber-400 to-orange-500' },
  { code: 'oc-gascon', label: 'Occitan (Gascon)', nativeName: 'Occitan - Gascon', flag: 'oc', color: 'from-amber-500 to-orange-600' },

  // Arabic
  { code: 'AR', label: 'Arabe', nativeName: 'العربية', flag: 'ar', color: 'from-green-500 to-teal-600' },

  // Bulgarian
  { code: 'BG', label: 'Bulgare', nativeName: 'Български', flag: 'bg', color: 'from-green-400 to-emerald-500' },

  // Czech
  { code: 'CS', label: 'Tchèque', nativeName: 'Čeština', flag: 'cs', color: 'from-blue-400 to-indigo-500' },

  // Danish
  { code: 'DA', label: 'Danois', nativeName: 'Dansk', flag: 'da', color: 'from-red-500 to-orange-400' },

  // German
  { code: 'DE', label: 'Allemand', nativeName: 'Deutsch', flag: 'de', color: 'from-yellow-500 to-amber-600' },

  // Greek
  { code: 'EL', label: 'Grec', nativeName: 'Ελληνικά', flag: 'el', color: 'from-blue-400 to-cyan-500' },

  // English (British)
  { code: 'EN-GB', label: 'Anglais (UK)', nativeName: 'English (UK)', flag: 'gb', color: 'from-blue-500 to-indigo-600' },

  // English (American)
  { code: 'EN-US', label: 'Anglais (US)', nativeName: 'English (US)', flag: 'us', color: 'from-blue-500 to-indigo-600' },

  // Spanish
  { code: 'ES', label: 'Espagnol', nativeName: 'Español', flag: 'es', color: 'from-red-400 to-pink-500' },

  // Spanish (Latin American)
  { code: 'ES-419', label: 'Espagnol (Am. latine)', nativeName: 'Español (LatAm)', flag: 'mx', color: 'from-red-400 to-pink-500' },

  // Estonian
  { code: 'ET', label: 'Estonien', nativeName: 'Eesti', flag: 'et', color: 'from-blue-400 to-cyan-500' },

  // Finnish
  { code: 'FI', label: 'Finnois', nativeName: 'Suomi', flag: 'fi', color: 'from-blue-400 to-slate-500' },

  // French
  { code: 'FR', label: 'Français', nativeName: 'Français', flag: 'fr', color: 'from-blue-400 to-cyan-500' },

  // Hebrew (next-gen models only)
  { code: 'HE', label: 'Hébreu', nativeName: 'עברית', flag: 'il', color: 'from-blue-400 to-cyan-500' },

  // Hungarian
  { code: 'HU', label: 'Hongrois', nativeName: 'Magyar', flag: 'hu', color: 'from-red-400 to-pink-500' },

  // Indonesian
  { code: 'ID', label: 'Indonésien', nativeName: 'Bahasa Indonesia', flag: 'id', color: 'from-red-400 to-pink-500' },

  // Italian
  { code: 'IT', label: 'Italien', nativeName: 'Italiano', flag: 'it', color: 'from-green-400 to-emerald-500' },

  // Japanese
  { code: 'JA', label: 'Japonais', nativeName: '日本語', flag: 'jp', color: 'from-red-500 to-pink-600' },

  // Korean
  { code: 'KO', label: 'Coréen', nativeName: '한국어', flag: 'kr', color: 'from-blue-500 to-purple-600' },

  // Lithuanian
  { code: 'LT', label: 'Lituanien', nativeName: 'Lietuvių', flag: 'lt', color: 'from-yellow-400 to-amber-500' },

  // Latvian
  { code: 'LV', label: 'Letton', nativeName: 'Latviešu', flag: 'lv', color: 'from-red-400 to-rose-500' },

  // Norwegian Bokmål
  { code: 'NB', label: 'Norvégien (Bokmål)', nativeName: 'Norsk (Bokmål)', flag: 'no', color: 'from-blue-500 to-indigo-500' },

  // Dutch
  { code: 'NL', label: 'Néerlandais', nativeName: 'Nederlands', flag: 'nl', color: 'from-orange-400 to-red-500' },

  // Polish
  { code: 'PL', label: 'Polonais', nativeName: 'Polski', flag: 'pl', color: 'from-red-400 to-pink-400' },

  // Portuguese (Brazilian)
  { code: 'PT-BR', label: 'Portugais (BR)', nativeName: 'Português (BR)', flag: 'br', color: 'from-green-400 to-yellow-500' },

  // Portuguese (European)
  { code: 'PT-PT', label: 'Portugais (PT)', nativeName: 'Português (PT)', flag: 'pt', color: 'from-red-500 to-rose-600' },

  // Romanian
  { code: 'RO', label: 'Roumain', nativeName: 'Română', flag: 'ro', color: 'from-yellow-400 to-amber-500' },

  // Russian
  { code: 'RU', label: 'Russe', nativeName: 'Русский', flag: 'ru', color: 'from-blue-600 to-slate-700' },

  // Slovak
  { code: 'SK', label: 'Slovaque', nativeName: 'Slovenčina', flag: 'sk', color: 'from-blue-400 to-indigo-500' },

  // Slovenian
  { code: 'SL', label: 'Slovène', nativeName: 'Slovenščina', flag: 'si', color: 'from-green-400 to-emerald-500' },

  // Swedish
  { code: 'SV', label: 'Suédois', nativeName: 'Svenska', flag: 'se', color: 'from-blue-400 to-cyan-400' },

  // Thai (next-gen models only)
  { code: 'TH', label: 'Thaï', nativeName: 'ไทย', flag: 'th', color: 'from-red-400 to-rose-500' },

  // Turkish
  { code: 'TR', label: 'Turc', nativeName: 'Türkçe', flag: 'tr', color: 'from-red-500 to-rose-500' },

  // Ukrainian
  { code: 'UK', label: 'Ukrainien', nativeName: 'Українська', flag: 'ua', color: 'from-blue-400 to-cyan-500' },

  // Vietnamese (next-gen models only)
  { code: 'VI', label: 'Vietnamien', nativeName: 'Tiếng Việt', flag: 'vn', color: 'from-green-400 to-emerald-500' },

  // Chinese (simplified)
  { code: 'ZH-HANS', label: 'Chinois (simplifié)', nativeName: '中文（简体）', flag: 'cn', color: 'from-red-600 to-orange-500' },

  // Chinese (traditional)
  { code: 'ZH-HANT', label: 'Chinois (traditionnel)', nativeName: '中文（繁體）', flag: 'tw', color: 'from-red-600 to-orange-500' }
]

export const getLanguageByCode = (code: string): Language | undefined => {
  return LANGUAGES.find(lang => lang.code === code || lang.code.toLowerCase() === code.toLowerCase())
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
    'ar': { bg: 'bg-gradient-to-br from-green-100 to-teal-100', border: 'border-green-300', accent: '#059669', secondary: '#ccfbf1' },
    'bg': { bg: 'bg-gradient-to-br from-green-100 to-emerald-100', border: 'border-green-300', accent: '#10b981', secondary: '#d1fae5' },
    'cs': { bg: 'bg-gradient-to-br from-blue-100 to-indigo-100', border: 'border-blue-300', accent: '#4338ca', secondary: '#dbeafe' },
    'da': { bg: 'bg-gradient-to-br from-red-100 to-orange-100', border: 'border-red-300', accent: '#ea580c', secondary: '#fed7aa' },
    'de': { bg: 'bg-gradient-to-br from-yellow-100 to-amber-100', border: 'border-yellow-300', accent: '#eab308', secondary: '#fef3c7' },
    'el': { bg: 'bg-gradient-to-br from-blue-100 to-cyan-100', border: 'border-blue-300', accent: '#0891b2', secondary: '#e0e7ff' },
    'en': { bg: 'bg-gradient-to-br from-blue-100 to-indigo-100', border: 'border-blue-300', accent: '#3b82f6', secondary: '#dbeafe' },
    'es': { bg: 'bg-gradient-to-br from-red-100 to-pink-100', border: 'border-red-300', accent: '#ef4444', secondary: '#fee2e2' },
    'et': { bg: 'bg-gradient-to-br from-blue-100 to-cyan-100', border: 'border-blue-300', accent: '#0891b2', secondary: '#e0e7ff' },
    'fi': { bg: 'bg-gradient-to-br from-blue-100 to-slate-100', border: 'border-blue-300', accent: '#475569', secondary: '#f1f5f9' },
    'fr': { bg: 'bg-gradient-to-br from-blue-100 to-cyan-100', border: 'border-blue-300', accent: '#06b6d4', secondary: '#cffafe' },
    'he': { bg: 'bg-gradient-to-br from-blue-100 to-cyan-100', border: 'border-blue-300', accent: '#06b6d4', secondary: '#cffafe' },
    'hu': { bg: 'bg-gradient-to-br from-red-100 to-pink-100', border: 'border-red-300', accent: '#f87171', secondary: '#fee2e2' },
    'id': { bg: 'bg-gradient-to-br from-red-100 to-pink-100', border: 'border-red-300', accent: '#f87171', secondary: '#fee2e2' },
    'it': { bg: 'bg-gradient-to-br from-green-100 to-emerald-100', border: 'border-green-300', accent: '#10b981', secondary: '#d1fae5' },
    'ja': { bg: 'bg-gradient-to-br from-red-100 to-pink-100', border: 'border-red-300', accent: '#dc2626', secondary: '#fee2e2' },
    'ko': { bg: 'bg-gradient-to-br from-blue-100 to-purple-100', border: 'border-blue-300', accent: '#7c3aed', secondary: '#e9d5ff' },
    'lt': { bg: 'bg-gradient-to-br from-yellow-100 to-amber-100', border: 'border-yellow-300', accent: '#eab308', secondary: '#fef3c7' },
    'lv': { bg: 'bg-gradient-to-br from-red-100 to-rose-100', border: 'border-red-300', accent: '#f43f5e', secondary: '#ffe4e6' },
    'nb': { bg: 'bg-gradient-to-br from-blue-100 to-indigo-100', border: 'border-blue-300', accent: '#4338ca', secondary: '#dbeafe' },
    'nl': { bg: 'bg-gradient-to-br from-orange-100 to-red-100', border: 'border-orange-300', accent: '#ea580c', secondary: '#fed7aa' },
    'pl': { bg: 'bg-gradient-to-br from-red-100 to-pink-100', border: 'border-red-300', accent: '#f87171', secondary: '#fee2e2' },
    'pt': { bg: 'bg-gradient-to-br from-red-100 to-rose-100', border: 'border-red-300', accent: '#f43f5e', secondary: '#ffe4e6' },
    'ro': { bg: 'bg-gradient-to-br from-yellow-100 to-amber-100', border: 'border-yellow-300', accent: '#eab308', secondary: '#fef3c7' },
    'ru': { bg: 'bg-gradient-to-br from-blue-100 to-slate-100', border: 'border-blue-300', accent: '#1e40af', secondary: '#dbeafe' },
    'sk': { bg: 'bg-gradient-to-br from-blue-100 to-indigo-100', border: 'border-blue-300', accent: '#4338ca', secondary: '#dbeafe' },
    'sl': { bg: 'bg-gradient-to-br from-green-100 to-emerald-100', border: 'border-green-300', accent: '#10b981', secondary: '#d1fae5' },
    'sv': { bg: 'bg-gradient-to-br from-blue-100 to-cyan-100', border: 'border-blue-300', accent: '#0891b2', secondary: '#e0e7ff' },
    'th': { bg: 'bg-gradient-to-br from-red-100 to-rose-100', border: 'border-red-300', accent: '#e11d48', secondary: '#ffe4e6' },
    'tr': { bg: 'bg-gradient-to-br from-red-100 to-rose-100', border: 'border-red-300', accent: '#e11d48', secondary: '#ffe4e6' },
    'uk': { bg: 'bg-gradient-to-br from-blue-100 to-cyan-100', border: 'border-blue-300', accent: '#0891b2', secondary: '#e0e7ff' },
    'vi': { bg: 'bg-gradient-to-br from-green-100 to-emerald-100', border: 'border-green-300', accent: '#10b981', secondary: '#d1fae5' },
    'zh': { bg: 'bg-gradient-to-br from-red-100 to-orange-100', border: 'border-red-300', accent: '#dc2626', secondary: '#fed7aa' }
  }

  // Normaliser variantes → code de base pour couleurs (case-insensitive)
  const lower = code.toLowerCase()
  const base = lower.startsWith('en-') ? 'en'
    : lower.startsWith('pt-') ? 'pt'
    : lower.startsWith('zh-') ? 'zh'
    : lower.startsWith('es-') ? 'es'
    : lower.startsWith('oc-') ? 'oc'
    : lower

  return colorMap[base] || {
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    accent: '#6b7280',
    secondary: '#f3f4f6'
  }
}
