import type { ReactNode } from 'react'

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
    <section 
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12"
      aria-labelledby="auth-title"
    >
      <div className="w-full max-w-md mx-auto px-4">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 
            id="auth-title" 
            className="text-2xl font-bold text-gray-900 text-center mb-6"
          >
            {title}
          </h1>

          {error && (
            <div 
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
              aria-live="polite"
            >
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            {children}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Chargement...' : submitLabel}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
