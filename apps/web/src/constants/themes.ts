// Palette de couleurs pastel pour les thèmes
export const PASTEL_CLASS_PALETTE = [
  { bg: 'bg-pastel-green',  border: 'border-pastel-green',  accent: '#7a8b7a' },
  { bg: 'bg-pastel-purple', border: 'border-pastel-purple', accent: '#6f5a7a' },
  { bg: 'bg-pastel-rose',   border: 'border-pastel-rose',   accent: '#9a6d67' },
  { bg: 'bg-pastel-blue',   border: 'border-pastel-blue',   accent: '#567aa3' },
  { bg: 'bg-pastel-mint',   border: 'border-pastel-mint',   accent: '#4f8a7c' },
  { bg: 'bg-pastel-lilac',  border: 'border-pastel-lilac',  accent: '#6f63a3' },
  { bg: 'bg-pastel-coral',  border: 'border-pastel-coral',  accent: '#a36459' },
  { bg: 'bg-pastel-sand',   border: 'border-pastel-sand',   accent: '#8e7a56' },
  { bg: 'bg-pastel-yellow', border: 'border-pastel-yellow', accent: '#a3822f' },
]

// Fonction de hash simple pour générer un index stable
function hashSeed(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i) | 0
  }
  return Math.abs(h)
}

// Obtient une couleur pastel stable pour un thème donné
export function getPastelForTheme(seed: string) {
  const idx = hashSeed(seed) % PASTEL_CLASS_PALETTE.length
  return PASTEL_CLASS_PALETTE[idx]
}

// Interface pour les couleurs de thème
export interface ThemeColors {
  bg: string
  border: string
  accent: string
}
