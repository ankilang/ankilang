
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
 * Composant d'icône de drapeau utilisant les SVG Twemoji
 * Résout les problèmes d'affichage des émojis sur Windows
 */
export default function FlagIcon({ 
  languageCode, 
  size = 24, 
  className = '', 
  alt 
}: FlagIconProps) {
  // Mapping des codes de langue vers les codes de pays pour les drapeaux
  const getCountryCode = (langCode: string): string => {
    const mapping: Record<string, string> = {
      // Anglais
      'en-GB': 'gb',
      'en-US': 'us',
      'en': 'gb', // Fallback vers UK
      
      // Espagnol  
      'es': 'es',
      'es-419': 'mx', // Amérique latine → Mexique
      
      // Portugais
      'pt-PT': 'pt',
      'pt-BR': 'br',
      'pt': 'pt', // Fallback vers Portugal
      
      // Chinois
      'zh-HANS': 'cn',
      'zh-HANT': 'tw',
      'zh': 'cn', // Fallback vers Chine
      
      // Norvégien
      'nb': 'no', // Bokmål → Norvège
      
      // Langues avec correspondance directe
      'fr': 'fr',
      'de': 'de', 
      'it': 'it',
      'nl': 'nl',
      'pl': 'pl',
      'sv': 'se', // Suédois → Suède
      'da': 'dk', // Danois → Danemark
      'fi': 'fi',
      'ru': 'ru',
      'ja': 'jp', // Japonais → Japon
      'ko': 'kr', // Coréen → Corée du Sud
      'ar': 'sa', // Arabe → Arabie Saoudite
      'tr': 'tr',
      'bg': 'bg',
      'cs': 'cz', // Tchèque → République Tchèque
      'el': 'gr', // Grec → Grèce
      'et': 'ee', // Estonien → Estonie
      'he': 'il', // Hébreu → Israël
      'hu': 'hu',
      'id': 'id',
      'lt': 'lt',
      'lv': 'lv',
      'ro': 'ro',
      'sk': 'sk',
      'sl': 'si', // Slovène → Slovénie
      'th': 'th',
      'uk': 'ua', // Ukrainien → Ukraine
      'vi': 'vn', // Vietnamien → Vietnam
    }
    
    return mapping[langCode.toLowerCase()] || 'gb' // Fallback vers UK
  }
  
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
  
  const countryCode = getCountryCode(languageCode)
  const flagPath = `/flags/${countryCode}.svg`
  const altText = alt || `Drapeau ${languageCode.toUpperCase()}`
  
  return (
    <img
      src={flagPath}
      alt={altText}
      width={size}
      height={size}
      className={`inline-block object-contain ${className}`}
      style={{ 
        minWidth: size, 
        minHeight: size 
      }}
      onError={(e) => {
        // Fallback en cas d'erreur de chargement
        const target = e.target as HTMLImageElement
        target.style.display = 'none'
        // Créer un élément de fallback avec emoji
        const fallback = document.createElement('span')
        fallback.textContent = '🌍'
        fallback.style.fontSize = `${size * 0.8}px`
        fallback.title = altText
        target.parentNode?.appendChild(fallback)
      }}
    />
  )
}
