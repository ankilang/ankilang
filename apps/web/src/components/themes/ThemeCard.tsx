import { Link } from 'react-router-dom'
import { Calendar, FileText, Lock, Users, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { LANGUAGES } from '../../constants/languages'
import { getPastelForTheme } from '../../constants/themes'
import type { Theme } from '@ankilang/shared'

interface ThemeCardProps {
  theme: Theme
  index: number
  onEdit?: (theme: Theme) => void
  onDelete?: (theme: Theme) => void
}

export default function ThemeCard({ theme, index, onEdit, onDelete }: ThemeCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  const language = LANGUAGES.find(lang => lang.code === theme.targetLang)
  const pastel = getPastelForTheme(theme.id || theme.name) // mapping stable
  const accent = pastel?.accent || '#6b7280' // fallback si pastel undefined
  
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
        <div className={`${pastel?.bg || 'bg-gray-100'} ${pastel?.border || 'border-gray-300'} border-2 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden`}>
          {/* Bouton Options (modifier/supprimer) */}
          <div className="absolute top-3 right-3 z-20">
            <div className="relative">
              <button
                aria-label={`Options pour ${theme.name}`}
                className="p-2 rounded-xl bg-white/80 backdrop-blur border border-white/60 hover:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsMenuOpen(!isMenuOpen)
                }}
                onBlur={() => {
                  // Fermer le menu après un délai pour permettre la navigation
                  setTimeout(() => setIsMenuOpen(false), 150)
                }}
              >
                <MoreVertical className="w-4 h-4 text-dark-charcoal" />
              </button>

              {/* Menu flottant accessible */}
              {isMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-30"
                  role="menu"
                >
                  <button
                    role="menuitem"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    onClick={(e) => { 
                      e.preventDefault()
                      e.stopPropagation()
                      onEdit?.(theme)
                      setIsMenuOpen(false)
                    }}
                  >
                    <Pencil className="w-4 h-4" /> Modifier
                  </button>
                  <button
                    role="menuitem"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 transition-colors"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onDelete?.(theme)
                      setIsMenuOpen(false)
                    }}
                  >
                    <Trash2 className="w-4 h-4" /> Supprimer
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Effet de brillance */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent"
            animate={isHovered ? { x: ["-100%", "100%"] } : {}}
            transition={{ duration: 0.8 }}
          />
          
          {/* Header avec drapeau et statut */}
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="flex items-center gap-3">
              {/* Drapeau de la langue */}
              <div className="w-12 h-12 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md border border-white/40">
                {language?.code === 'oc' ? (
                  <span className="text-lg font-bold text-transparent bg-gradient-to-r from-yellow-600 to-red-600 bg-clip-text">
                    ÒC
                  </span>
                ) : (
                  <span className="text-2xl">{language?.flag || '🌍'}</span>
                )}
              </div>
              
              {/* Informations de base */}
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-lg font-bold text-dark-charcoal mb-1 line-clamp-1">
                  {theme.name}
                </h3>
                <p className="font-sans text-sm text-dark-charcoal/70">
                  {language?.label || 'Langue inconnue'}
                  {theme.targetLang === 'oc' && (
                    <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                      GRATUIT
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            {/* Badge de partage */}
            <div className="flex items-center gap-1">
              {theme.shareStatus === 'private' ? (
                <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg">
                  <Lock className="w-3 h-3 text-gray-600" />
                  <span className="text-xs font-medium text-gray-600">Privé</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-lg">
                  <Users className="w-3 h-3 text-green-600" />
                  <span className="text-xs font-medium text-green-600">Partagé</span>
                </div>
              )}
            </div>
          </div>

                           {/* Statistiques */}
                 <div className="flex items-center gap-4 mb-4 relative z-10">
                   <div className="flex items-center gap-2">
                     <FileText className="w-4 h-4" style={{ color: accent }} />
                     <span className="font-sans text-sm font-medium text-dark-charcoal">
                       {theme.cardCount || 0} cartes
                     </span>
                   </div>
                   <div className="flex items-center gap-2">
                     <Calendar className="w-4 h-4" style={{ color: accent }} />
                     <span className="font-sans text-sm text-dark-charcoal/70">
                       {theme.updatedAt ? new Date(theme.updatedAt).toLocaleDateString('fr-FR', { 
                         day: 'numeric', 
                         month: 'short' 
                       }) : 'Nouveau'}
                     </span>
                   </div>
                 </div>

                           {/* Tags */}
                 {theme.tags && theme.tags.length > 0 && (
                   <div className="flex flex-wrap gap-2 mb-4 relative z-10">
                     {theme.tags.slice(0, 3).map((tag, index) => (
                       <span 
                         key={index}
                         className="px-2 py-1 rounded-lg text-xs font-medium"
                         style={{ 
                           backgroundColor: `${accent}20`,
                           color: accent 
                         }}
                       >
                         {tag}
                       </span>
                     ))}
                     {theme.tags.length > 3 && (
                       <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                         +{theme.tags.length - 3}
                       </span>
                     )}
                   </div>
                 )}

                 {/* Indicateur de couleur en bas */}
                 <div 
                   className="absolute bottom-0 left-0 right-0 h-1 rounded-b-3xl"
                   style={{ backgroundColor: accent }}
                 />
        </div>
      </Link>
    </motion.div>
  )
}
