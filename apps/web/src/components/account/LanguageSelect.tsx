import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import FlagEmoji from '../ui/FlagEmoji'

interface LanguageSelectProps {
  value: string
  onChange: (value: string) => void
}

const languages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' }
]

export default function LanguageSelect({ value, onChange }: LanguageSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const selectedLanguage = languages.find(lang => lang.code === value) || languages[0]!

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border-2 border-white/40 rounded-xl focus:outline-none focus:border-pastel-purple transition-colors font-sans flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <FlagEmoji flag={selectedLanguage.flag} className="text-lg" />
          <span className="font-medium text-dark-charcoal">{selectedLanguage.name}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-600" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-md border border-white/40 rounded-xl shadow-xl overflow-hidden z-10"
          >
            <div className="max-h-60 overflow-y-auto">
              {languages.map((language) => (
                <motion.button
                  key={language.code}
                  onClick={() => {
                    onChange(language.code)
                    setIsOpen(false)
                  }}
                  whileHover={{ backgroundColor: 'rgba(147, 51, 234, 0.1)' }}
                  className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                    language.code === value ? 'bg-pastel-purple/10 text-pastel-purple' : 'text-dark-charcoal hover:bg-gray-50/50'
                  }`}
                >
                  <FlagEmoji flag={language.flag} className="text-lg" />
                  <span className="font-medium">{language.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
