import { memo } from 'react'

interface FlagIconProps {
  languageCode: string
  size?: number
  className?: string
  alt?: string
}

const flagModules = import.meta.glob('../../assets/flags/*.svg', {
  eager: true,
  import: 'default'
}) as Record<string, string>

const SVG_FLAGS: Record<string, string> = Object.fromEntries(
  Object.entries(flagModules)
    .map(([path, url]) => {
      const match = /\/([\w-]+)\.svg$/.exec(path)
      const name = match?.[1]
      if (!name) return null
      return [name.toLowerCase(), url] as [string, string]
    })
    .filter((entry): entry is [string, string] => Array.isArray(entry))
)

const DEFAULT_FLAG = SVG_FLAGS.world

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

function getFlagPath(code: string) {
  const normalized = code.toLowerCase()
  const mapped = COUNTRY_MAP[normalized] || normalized
  return SVG_FLAGS[mapped] || DEFAULT_FLAG
}

export default memo(function FlagIcon({
  languageCode,
  size = 24,
  className = '',
  alt
}: FlagIconProps) {
  const flagPath = getFlagPath(languageCode)
  const isGascon = languageCode.toLowerCase() === 'oc-gascon'
  const altText = alt || `Drapeau ${languageCode.toUpperCase()}`

  if (!flagPath) {
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
        src={flagPath}
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
