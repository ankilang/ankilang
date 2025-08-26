import { Link } from 'react-router-dom'
import { BookOpen, Calendar, Tag, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { getLanguageLabel } from '../../constants/languages'
import type { Theme } from '@ankilang/shared'

interface ThemeCardProps {
  theme: Theme
  index: number
}

export default function ThemeCard({ theme, index }: ThemeCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  // Couleurs dynamiques par langue
  const languageColors = {
    'en': { bg: 'bg-pastel-purple', border: 'border-purple-300', accent: 'text-purple-700' },
    'es': { bg: 'bg-pastel-rose', border: 'border-rose-300', accent: 'text-rose-700' },
    'oc': { bg: 'bg-gradient-to-br from-yellow-200 to-red-200', border: 'border-yellow-300', accent: 'text-yellow-800' },
    'de': { bg: 'bg-pastel-green', border: 'border-green-300', accent: 'text-green-700' },
    'default': { bg: 'bg-pastel-green', border: 'border-green-300', accent: 'text-green-700' }
  }
  
  const colors = languageColors[theme.targetLang as keyof typeof languageColors] || languageColors.default
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative"
    >
      {/* Effet de particules au survol */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -inset-2 pointer-events-none"
        >
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0],
                x: [0, (Math.random() - 0.5) * 100],
                y: [0, (Math.random() - 0.5) * 100],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 2
              }}
              className="absolute top-1/2 left-1/2 w-1 h-1 bg-purple-400 rounded-full"
            />
          ))}
        </motion.div>
      )}
      
      <Link to={`/app/themes/${theme.id}`} className="block">
        <div className={`${colors.bg} ${colors.border} border-2 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden`}>
          {/* Effet de brillance */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent"
            animate={isHovered ? { x: ["-100%", "100%"] } : {}}
            transition={{ duration: 0.8 }}
          />
          
          {/* Header avec icône et statut */}
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${colors.bg} rounded-2xl flex items-center justify-center shadow-md border ${colors.border}`}>
                <BookOpen className={`w-6 h-6 ${colors.accent}`} />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-dark-charcoal mb-1 line-clamp-2">
                  {theme.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-dark-charcoal/70">
                  <span className="font-sans font-medium">{getLanguageLabel(theme.targetLang)}</span>
                  {theme.targetLang === 'oc' && (
                    <Sparkles className="w-4 h-4 text-yellow-600" />
                  )}
                </div>
              </div>
            </div>
            
            <motion.span 
              whileHover={{ scale: 1.1 }}
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                theme.shareStatus === 'community' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}
            >
              {theme.shareStatus === 'community' ? '🌍 Partagé' : '🔒 Privé'}
            </motion.span>
          </div>

          {/* Statistiques avec animation */}
          <div className="mb-4 relative z-10">
            <div className="flex items-center gap-4 text-sm">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1 bg-white/50 px-3 py-2 rounded-xl"
              >
                <BookOpen className="w-4 h-4 text-dark-charcoal/70" />
                <span className="font-sans font-bold text-dark-charcoal">{theme.cardCount}</span>
                <span className="font-sans text-dark-charcoal/70">cartes</span>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1 bg-white/50 px-3 py-2 rounded-xl"
              >
                <Calendar className="w-4 h-4 text-dark-charcoal/70" />
                <span className="font-sans text-dark-charcoal/70">
                  {theme.updatedAt 
                    ? new Date(theme.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                    : 'Récent'
                  }
                </span>
              </motion.div>
            </div>
          </div>

          {/* Tags avec animation */}
          {theme.tags && theme.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 relative z-10">
              {theme.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                <motion.span 
                  key={tagIndex}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + tagIndex * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/70 text-dark-charcoal border border-white/50 backdrop-blur-sm"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </motion.span>
              ))}
              {theme.tags.length > 3 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/70 text-dark-charcoal/70">
                  +{theme.tags.length - 3}
                </span>
              )}
            </div>
          )}
          
          {/* Barre de progression créative */}
          <div className="relative z-10">
            <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((theme.cardCount / 50) * 100, 100)}%` }}
                transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                className={`h-full bg-gradient-to-r ${colors.accent === 'text-purple-700' ? 'from-purple-400 to-purple-600' : colors.accent === 'text-rose-700' ? 'from-rose-400 to-rose-600' : 'from-green-400 to-green-600'} rounded-full`}
              />
            </div>
            <p className="text-xs text-dark-charcoal/70 mt-1 font-sans">
              {theme.cardCount < 10 ? 'Débutant' : theme.cardCount < 30 ? 'En cours' : 'Avancé'}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
