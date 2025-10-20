import { motion } from 'framer-motion'
import { useState } from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'white'
  text?: string
  className?: string
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'primary', 
  text,
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const colorClasses = {
    primary: 'text-violet-600',
    secondary: 'text-slate-600',
    white: 'text-white'
  }

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} ${colorClasses[color]}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
          />
        </svg>
      </motion.div>
      {text && (
        <span className={`text-sm ${colorClasses[color]}`}>
          {text}
        </span>
      )}
    </div>
  )
}

// Composant pour les boutons en loading
interface LoadingButtonProps {
  loading: boolean
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
}

export function LoadingButton({ 
  loading, 
  children, 
  className = '', 
  onClick,
  disabled = false 
}: LoadingButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`relative ${className} ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" color="white" />
        </div>
      )}
      <span className={loading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </button>
  )
}

// Composant pour les sections en loading
interface LoadingSectionProps {
  loading: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
}

export function LoadingSection({ 
  loading, 
  children, 
  fallback,
  className = '' 
}: LoadingSectionProps) {
  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        {fallback || (
          <div className="text-center">
            <LoadingSpinner size="lg" text="Chargement..." />
          </div>
        )}
      </div>
    )
  }

  return <>{children}</>
}

// Hook pour gérer les états de loading
export function useLoading(initialState = false) {
  const [loading, setLoading] = useState(initialState)
  const [error, setError] = useState<string | null>(null)

  const execute = async <T,>(asyncFn: () => Promise<T>): Promise<T | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await asyncFn()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    setLoading,
    setError,
    execute,
  }
}
