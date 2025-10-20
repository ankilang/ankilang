import { memo, useState, useEffect } from 'react'

interface FlagIconProps {
  languageCode: string
  size?: number
  className?: string
  alt?: string
}

// In-memory cache for loaded flags
const flagCache = new Map<string, string>()

// Dynamic flag loader with caching
async function loadFlag(code: string): Promise<string> {
  // Return cached flag if available
  if (flagCache.has(code)) {
    return flagCache.get(code)!
  }

  try {
    // Dynamic import with Vite
    const module = await import(`../../assets/flags/${code}.svg`)
    const flagUrl = module.default
    flagCache.set(code, flagUrl)
    return flagUrl
  } catch (error) {
    console.warn(`Flag not found: ${code}, using fallback`)
    // Return empty string to trigger fallback emoji
    return ''
  }
}

const COUNTRY_MAP: Record<string, string> = {
  'en-gb': 'gb',
  'en-us': 'us',
  en: 'gb',
  es: 'es',
  'es-419': 'mx',
  'pt-pt': 'pt',
  'pt-br': 'br',
  pt: 'pt',
  'zh-hans': 'cn',
  'zh-hant': 'tw',
  zh: 'cn',
  nb: 'no',
  oc: 'oc',
  'oc-gascon': 'oc',
  fr: 'fr',
  de: 'de',
  it: 'it',
  nl: 'nl',
  pl: 'pl',
  sv: 'se',
  da: 'dk',
  fi: 'fi',
  ru: 'ru',
  ja: 'jp',
  ko: 'kr',
  ar: 'sa',
  tr: 'tr',
  bg: 'bg',
  cs: 'cz',
  el: 'gr',
  et: 'ee',
  he: 'il',
  hu: 'hu',
  id: 'id',
  lt: 'lt',
  lv: 'lv',
  ro: 'ro',
  sk: 'sk',
  sl: 'si',
  th: 'th',
  uk: 'ua',
  vi: 'vn'
}

function getCountryCode(languageCode: string): string {
  const normalized = languageCode.toLowerCase()
  return COUNTRY_MAP[normalized] || normalized
}

export default memo(function FlagIcon({
  languageCode,
  size = 24,
  className = '',
  alt
}: FlagIconProps) {
  const [flagUrl, setFlagUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)

  const isGascon = languageCode.toLowerCase() === 'oc-gascon'
  const altText = alt || `Drapeau ${languageCode.toUpperCase()}`

  useEffect(() => {
    const countryCode = getCountryCode(languageCode)

    loadFlag(countryCode)
      .then(url => {
        setFlagUrl(url)
        setLoading(false)
      })
      .catch(() => {
        setFlagUrl('')
        setLoading(false)
      })
  }, [languageCode])

  // Loading skeleton
  if (loading) {
    return (
      <div
        className={`inline-block rounded bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`}
        style={{ width: size, height: size }}
        aria-label="Chargement du drapeau..."
      />
    )
  }

  // Fallback if flag not found
  if (!flagUrl) {
    return (
      <span
        className={`inline-block ${className}`}
        style={{ fontSize: size * 0.8, lineHeight: 1 }}
        title={altText}
        role="img"
        aria-label={altText}
      >
        🌍
      </span>
    )
  }

  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      <img
        src={flagUrl}
        alt={altText}
        width={size}
        height={size}
        className={`inline-block object-contain ${className}`}
        style={{ minWidth: size, minHeight: size }}
        loading="lazy"
      />
      {isGascon && (
        <span
          className="absolute -bottom-0.5 -right-0.5 bg-orange-600 text-white font-bold rounded-sm flex items-center justify-center"
          style={{
            fontSize: Math.max(6, size * 0.3),
            width: Math.max(8, size * 0.35),
            height: Math.max(8, size * 0.35),
            lineHeight: 1
          }}
          title="Gascon"
          aria-label="Dialecte gascon"
        >
          G
        </span>
      )}
    </div>
  )
})
