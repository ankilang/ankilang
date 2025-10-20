import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search, Check } from 'lucide-react'
import { LANGUAGES, getLanguageByCode } from '../../constants/languages'
import { useIsMobile } from '../../hooks/useMediaQuery'
import FlagIcon from './FlagIcon'

interface LanguageSelectorProps {
  value: string
  onChange: (value: string) => void
  onFocus?: () => void
  error?: string
  className?: string
}

export default function LanguageSelector({
  value,
  onChange,
  onFocus,
  error,
  className = ''
}: LanguageSelectorProps) {
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const selectedLanguage = getLanguageByCode(value)

  // Grouper les langues : Occitan en premier, puis par popularité
  const groupedLanguages = (() => {
    const occitan = LANGUAGES.find(l => l.code === 'oc')
    const popular = ['en-GB', 'en-US', 'es', 'de', 'it', 'fr', 'pt-PT', 'pt-BR', 'zh-HANS', 'ja', 'ko', 'ru', 'ar']
    const popularLanguages = LANGUAGES.filter(l => popular.includes(l.code))
    const otherLanguages = LANGUAGES.filter(l => l.code !== 'oc' && !popular.includes(l.code))
    
    return [
      ...(occitan ? [occitan] : []),
      ...popularLanguages,
      ...otherLanguages
    ]
  })()

  // Filtrer les langues selon la recherche
  const filteredLanguages = searchQuery.trim()
    ? groupedLanguages.filter(lang => {
        const query = searchQuery.toLowerCase()
        return (
          lang.code.toLowerCase().includes(query) ||
          lang.label.toLowerCase().includes(query) ||
          (lang.nativeName?.toLowerCase() || '').includes(query)
        )
      })
    : groupedLanguages

  // Fermer le dropdown en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => { document.removeEventListener('mousedown', handleClickOutside); }
    }
    
    return undefined
  }, [isOpen])

  // Focus sur la recherche quand le dropdown s'ouvre
  useEffect(() => {
    if (isOpen && isMobile && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100)
    }
  }, [isOpen, isMobile])

  const handleLanguageSelect = (languageCode: string) => {
    onChange(languageCode)
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleTriggerClick = () => {
    if (isMobile) {
      setIsOpen(!isOpen)
      onFocus?.()
    }
  }

  // Mode Desktop : Grille de langues (comportement actuel)
  if (!isMobile) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Recherche de langue */}
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); }}
            placeholder="Rechercher une langue (code, nom, natif)"
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pastel-purple transition-colors font-sans"
            aria-label="Rechercher une langue"
          />
        </div>

        {/* Grille de langues améliorée */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {filteredLanguages.map((language) => (
            <motion.label
              key={language.code}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative cursor-pointer p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 ${
                value === language.code
                  ? language.code === 'oc' 
                    ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-red-50 shadow-lg'
                    : 'border-purple-500 bg-purple-50 shadow-lg'
                  : language.code === 'oc'
                    ? 'border-yellow-300 bg-gradient-to-br from-yellow-100 to-red-100 hover:border-yellow-400'
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50'
              }`}
            >
              <input
                type="radio"
                value={language.code}
                checked={value === language.code}
                onChange={() => { onChange(language.code); }}
                onFocus={onFocus}
                className="sr-only"
              />
              <div className="text-center">
                <div className="text-lg sm:text-2xl mb-1 sm:mb-2 flex justify-center items-center">
                  <FlagIcon 
                    languageCode={language.code}
                    size={32}
                    alt={`Drapeau ${language.label}`}
                    className="sm:w-8 sm:h-8 w-6 h-6"
                  />
                </div>
                <div className="font-sans font-medium text-xs sm:text-sm text-dark-charcoal leading-tight">
                  {language.label}
                </div>
                {language.nativeName && (
                  <div className="font-sans text-xs text-dark-charcoal/50 mt-1">
                    {language.nativeName}
                  </div>
                )}
                {language.code === 'oc' && (
                  <div className="absolute -top-1 -right-1 px-1 sm:px-2 py-0.5 sm:py-1 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full text-xs text-white font-bold shadow-lg">
                    <span className="hidden sm:inline">GRATUIT</span>
                    <span className="sm:hidden">✨</span>
                  </div>
                )}
              </div>
            </motion.label>
          ))}
        </div>

        {error && (
          <p className="text-red-600 text-sm font-sans mt-2">{error}</p>
        )}
      </div>
    )
  }

  // Mode Mobile : Dropdown
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <motion.button
        type="button"
        onClick={handleTriggerClick}
        onFocus={onFocus}
        whileTap={{ scale: 0.98 }}
        className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
          error 
            ? 'border-red-300 bg-red-50' 
            : isOpen 
              ? 'border-purple-500 bg-purple-50' 
              : 'border-gray-200 bg-white hover:border-purple-300'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Sélectionner une langue"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedLanguage ? (
              <>
                <FlagIcon 
                  languageCode={selectedLanguage.code}
                  size={24}
                  alt={`Drapeau ${selectedLanguage.label}`}
                  className="w-6 h-6"
                />
                <div>
                  <div className="font-sans font-medium text-dark-charcoal">
                    {selectedLanguage.label}
                  </div>
                  {selectedLanguage.nativeName && (
                    <div className="font-sans text-sm text-dark-charcoal/60">
                      {selectedLanguage.nativeName}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="font-sans text-dark-charcoal/60">
                Sélectionner une langue
              </div>
            )}
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-dark-charcoal/40 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </div>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-50 max-h-80 overflow-hidden"
            role="listbox"
          >
            {/* Search Input */}
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); }}
                  placeholder="Rechercher une langue..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 font-sans text-sm"
                />
              </div>
            </div>

            {/* Language List */}
            <div className="max-h-60 overflow-y-auto">
              {filteredLanguages.length > 0 ? (
                filteredLanguages.map((language) => (
                  <motion.button
                    key={language.code}
                    type="button"
                    onClick={() => { handleLanguageSelect(language.code); }}
                    className={`w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors ${
                      value === language.code ? 'bg-purple-50' : ''
                    }`}
                    role="option"
                    aria-selected={value === language.code}
                  >
                    <FlagIcon 
                      languageCode={language.code}
                      size={20}
                      alt={`Drapeau ${language.label}`}
                      className="w-5 h-5 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-sans font-medium text-dark-charcoal text-sm">
                        {language.label}
                        {language.code === 'oc' && (
                          <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                            GRATUIT
                          </span>
                        )}
                      </div>
                      {language.nativeName && (
                        <div className="font-sans text-xs text-dark-charcoal/60">
                          {language.nativeName}
                        </div>
                      )}
                    </div>
                    {value === language.code && (
                      <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    )}
                  </motion.button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 font-sans text-sm">
                  Aucune langue trouvée
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-red-600 text-sm font-sans mt-2">{error}</p>
      )}
    </div>
  )
}
