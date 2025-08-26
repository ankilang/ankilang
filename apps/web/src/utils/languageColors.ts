export const LANGUAGE_COLORS = {
  // Langues principales avec couleurs distinctives
  'en': {
    primary: '#3B82F6',    // Bleu britannique
    secondary: '#DBEAFE',
    accent: '#1E40AF',
    gradient: 'from-blue-400 to-blue-600'
  },
  'es': {
    primary: '#EF4444',    // Rouge espagnol
    secondary: '#FEE2E2',
    accent: '#DC2626',
    gradient: 'from-red-400 to-red-600'
  },
  'fr': {
    primary: '#8B5CF6',    // Violet français
    secondary: '#EDE9FE',
    accent: '#7C3AED',
    gradient: 'from-purple-400 to-purple-600'
  },
  'de': {
    primary: '#10B981',    // Vert allemand
    secondary: '#D1FAE5',
    accent: '#059669',
    gradient: 'from-green-400 to-green-600'
  },
  'it': {
    primary: '#F59E0B',    // Orange italien
    secondary: '#FEF3C7',
    accent: '#D97706',
    gradient: 'from-amber-400 to-amber-600'
  },
  'pt': {
    primary: '#06B6D4',    // Cyan portugais
    secondary: '#CFFAFE',
    accent: '#0891B2',
    gradient: 'from-cyan-400 to-cyan-600'
  },
  'oc': {
    primary: '#F59E0B',    // Jaune-rouge occitan
    secondary: '#FEF3C7',
    accent: '#D97706',
    gradient: 'from-yellow-400 to-red-500'
  },
  // Couleur par défaut
  'default': {
    primary: '#6B7280',
    secondary: '#F3F4F6',
    accent: '#4B5563',
    gradient: 'from-gray-400 to-gray-600'
  }
};

export const getLanguageColor = (languageCode: string) => {
  return LANGUAGE_COLORS[languageCode as keyof typeof LANGUAGE_COLORS] || LANGUAGE_COLORS.default;
};
