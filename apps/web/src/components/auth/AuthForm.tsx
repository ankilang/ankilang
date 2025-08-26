import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface AuthFormProps {
  title: string
  children: ReactNode
  submitLabel: string
  onSubmit: (e: React.FormEvent) => void
  isLoading?: boolean
  error?: string
}

export default function AuthForm({ 
  title, 
  children, 
  submitLabel, 
  onSubmit, 
  isLoading = false,
  error 
}: AuthFormProps) {
  return (
    <section className="min-h-screen bg-pastel-green relative overflow-hidden flex items-center justify-center py-12">
      <div className="absolute top-0 right-0 w-96 h-96 bg-pastel-purple/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-pastel-rose/30 rounded-full blur-2xl" />
      
      <div className="relative w-full max-w-md mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-display text-3xl font-bold text-dark-charcoal text-center mb-8"
          >
            {title}
          </motion.h1>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl"
              aria-live="polite"
            >
              <p className="text-red-800 text-sm font-sans">{error}</p>
            </motion.div>
          )}

          <motion.form 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            onSubmit={onSubmit} 
            className="space-y-6"
          >
            {children}
            
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Chargement...
                </span>
              ) : (
                submitLabel
              )}
            </motion.button>
          </motion.form>
        </motion.div>
      </div>
    </section>
  )
}
