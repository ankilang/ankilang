/**
 * @deprecated Ce composant n'est plus utilisé depuis la suppression du système Premium.
 * Conservé temporairement pour référence historique.
 */
import { motion } from 'framer-motion'
import { Crown, Sparkles } from 'lucide-react'

interface PremiumTeaserProps {
  feature: string
  onUpgrade: () => void
  children?: React.ReactNode
  className?: string
}

export default function PremiumTeaser({ 
  feature, 
  onUpgrade, 
  children, 
  className = '' 
}: PremiumTeaserProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-dashed border-yellow-200 rounded-xl ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
          >
            <Crown className="w-4 h-4 text-white" />
          </motion.div>
          <div>
            <p className="font-sans text-sm font-medium text-dark-charcoal">
              {feature}
            </p>
            <p className="font-sans text-xs text-dark-charcoal/60">
              Disponible avec Ankilang Premium
            </p>
          </div>
        </div>
        
        <motion.button
          onClick={onUpgrade}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-semibold rounded-lg shadow-md"
        >
          <Sparkles className="w-3 h-3" />
          Upgrade
        </motion.button>
      </div>
      
      {children && (
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
      )}
    </motion.div>
  )
}
