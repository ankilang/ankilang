import { motion } from 'framer-motion'

interface LanguageBadgeProps {
  language: string
  size?: 'sm' | 'md'
}

const LANGUAGE_CODES: Record<string, string> = {
  'fr': 'FR',
  'en': 'EN', 
  'de': 'DE',
  'es': 'ES',
  'it': 'IT',
  'oc': 'OC',
  'oc-gascon': 'OC-G',
  'oc-languedoc': 'OC-L'
}

export default function LanguageBadge({ language, size = 'md' }: LanguageBadgeProps) {
  const displayCode = LANGUAGE_CODES[language] || language.toUpperCase()
  
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs'
  }

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        ${sizeClasses[size]}
        bg-gray-100 text-gray-700 rounded-md font-medium
        border border-gray-200
      `}
      title={`Langue cible: ${language}`}
    >
      {displayCode}
    </motion.span>
  )
}
