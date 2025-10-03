
interface FlagIconProps {
  /** Code de la langue (ex: 'fr', 'en-GB', 'es') */
  languageCode: string
  /** Taille en pixels */
  size?: number
  /** Classe CSS additionnelle */
  className?: string
  /** Alt text pour l'accessibilité */
  alt?: string
}

/**
 * Composant d'icône de drapeau utilisant Twemoji
 * Résout les problèmes d'affichage des émojis sur Windows
 */

// Mapping des codes de langue vers les émojis de drapeaux
const getFlagEmoji = (languageCode: string): string => {
  const mapping: Record<string, string> = {
    // Anglais
    'en-gb': '🇬🇧',
    'en-us': '🇺🇸', 
    'en': '🇬🇧', // Fallback vers UK
    
    // Espagnol  
    'es': '🇪🇸',
    'es-419': '🇲🇽', // Amérique latine → Mexique
    
    // Portugais
    'pt-pt': '🇵🇹',
    'pt-br': '🇧🇷',
    'pt': '🇵🇹', // Fallback vers Portugal
    
    // Chinois
    'zh-hans': '🇨🇳',
    'zh-hant': '🇹🇼', // Chinois traditionnel → Taiwan
    'zh': '🇨🇳', // Fallback vers Chine
    
    // Norvégien
    'nb': '🇳🇴', // Bokmål → Norvège
    
    // Langues avec correspondance directe
    'fr': '🇫🇷',
    'de': '🇩🇪', 
    'it': '🇮🇹',
    'nl': '🇳🇱',
    'pl': '🇵🇱',
    'sv': '🇸🇪', // Suédois → Suède
    'da': '🇩🇰', // Danois → Danemark
    'fi': '🇫🇮',
    'ru': '🇷🇺',
    'ja': '🇯🇵', // Japonais → Japon
    'ko': '🇰🇷', // Coréen → Corée du Sud
    'ar': '🇸🇦', // Arabe → Arabie Saoudite
    'tr': '🇹🇷',
    'bg': '🇧🇬',
    'cs': '🇨🇿', // Tchèque → République Tchèque
    'el': '🇬🇷', // Grec → Grèce
    'et': '🇪🇪', // Estonien → Estonie
    'he': '🇮🇱', // Hébreu → Israël
    'hu': '🇭🇺',
    'id': '🇮🇩',
    'lt': '🇱🇹',
    'lv': '🇱🇻',
    'ro': '🇷🇴',
    'sk': '🇸🇰',
    'sl': '🇸🇮', // Slovène → Slovénie
    'th': '🇹🇭',
    'uk': '🇺🇦', // Ukrainien → Ukraine
    'vi': '🇻🇳', // Vietnamien → Vietnam
  }
  
  return mapping[languageCode.toLowerCase()] || '🌍' // Fallback vers monde
}

export default function FlagIcon({
  languageCode,
  size = 24,
  className = '',
  alt
}: FlagIconProps) {
  
  // Cas spécial pour l'Occitan - pas de drapeau
  if (languageCode === 'oc' || languageCode === 'oc-gascon') {
    return (
      <div 
        className={`inline-flex items-center justify-center font-bold text-transparent bg-gradient-to-r from-yellow-600 to-red-600 bg-clip-text ${className}`}
        style={{ 
          width: size, 
          height: size, 
          fontSize: Math.max(8, size * 0.4) 
        }}
        title={alt || 'Occitan'}
      >
        ÒC
      </div>
    )
  }
  
  const flagEmoji = getFlagEmoji(languageCode)
  const altText = alt || `Drapeau ${languageCode.toUpperCase()}`

  return (
    <span
      className={`inline-block ${className}`}
      style={{ 
        fontSize: `${size}px`,
        lineHeight: 1,
        display: 'inline-block'
      }}
      title={altText}
      role="img"
      aria-label={altText}
    >
      {flagEmoji}
    </span>
  )
}
