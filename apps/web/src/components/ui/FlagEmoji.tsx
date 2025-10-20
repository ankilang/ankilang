import React from 'react'

interface FlagEmojiProps {
  flag: string
  className?: string
  fallback?: boolean
}

// Mapping des émojis drapeau vers des codes ISO pour les images de fallback
const flagToISO: Record<string, string> = {
  '🇫🇷': 'FR',
  '🇪🇸': 'ES', 
  '🇩🇪': 'DE',
  '🇮🇹': 'IT',
  '🇯🇵': 'JP',
  '🇬🇧': 'GB',
  '🇷🇺': 'RU',
  '🇨🇳': 'CN',
  '🇰🇷': 'KR',
  '🇵🇹': 'PT',
  '🇧🇷': 'BR',
  '🇦🇷': 'AR',
  '🇺🇸': 'US',
  '🇳🇱': 'NL',
  '🇵🇱': 'PL',
  '🇸🇪': 'SE',
  '🇩🇰': 'DK',
  '🇳🇴': 'NO',
  '🇫🇮': 'FI',
  '🇹🇼': 'TW',
  '🇸🇦': 'SA',
  '🇹🇷': 'TR',
  '🇧🇬': 'BG',
  '🇨🇿': 'CZ',
  '🇬🇷': 'GR',
  '🇪🇪': 'EE',
  '🇮🇱': 'IL',
  '🇭🇺': 'HU',
  '🇮🇩': 'ID',
  '🇱🇹': 'LT',
  '🇱🇻': 'LV',
  '🇷🇴': 'RO',
  '🇸🇰': 'SK',
  '🇸🇮': 'SI',
  '🇹🇭': 'TH',
  '🇺🇦': 'UA',
  '🇻🇳': 'VN',
  '🇲🇽': 'MX'
}

const FlagEmoji: React.FC<FlagEmojiProps> = ({ flag, className = '', fallback = true }) => {
  const [useFallback, setUseFallback] = React.useState(false)
  const isoCode = flagToISO[flag]
  
  // Détecter si l'émoji ne s'affiche pas (caractère de remplacement)
  React.useEffect(() => {
    if (!fallback) return
    
    // Créer un élément temporaire pour tester l'affichage
    const testElement = document.createElement('span')
    testElement.textContent = flag
    testElement.style.fontFamily = 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, Android Emoji'
    testElement.style.position = 'absolute'
    testElement.style.left = '-9999px'
    testElement.style.fontSize = '16px'
    document.body.appendChild(testElement)
    
    // Vérifier si l'émoji s'affiche correctement
    const rect = testElement.getBoundingClientRect()
    const isEmojiSupported = rect.width > 0 && rect.height > 0
    
    document.body.removeChild(testElement)
    
    if (!isEmojiSupported && isoCode) {
      setUseFallback(true)
    }
  }, [flag, fallback, isoCode])
  
  if (useFallback && isoCode) {
    return (
      <img
        src={`https://flagcdn.com/16x12/${isoCode.toLowerCase()}.png`}
        alt={`Drapeau ${isoCode}`}
        className={`inline-block ${className}`}
        style={{ width: '1em', height: '0.75em', objectFit: 'cover' }}
        onError={() => { setUseFallback(false); }}
      />
    )
  }
  
  return (
    <span className={`emoji-flag ${className}`}>
      {flag}
    </span>
  )
}

export default FlagEmoji
