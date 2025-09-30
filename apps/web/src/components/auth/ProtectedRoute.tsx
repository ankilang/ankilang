import { useEffect, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Shield, AlertCircle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  // Debug en développement uniquement
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[ProtectedRoute] État:', { 
        user: user?.email, 
        isLoading, 
        pathname: location.pathname 
      })
    }
  }, [user, isLoading, location.pathname])

  // Phase 1: Chargement de l'état d'authentification
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-3xl shadow-lg border-2 border-pastel-purple p-8 text-center">
          <div className="flex items-center justify-center mb-4 text-blue-600">
            <Shield className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="font-playfair text-xl font-bold text-dark-charcoal mb-3">
            Vérification de votre session
          </h2>
          <p className="font-inter text-dark-charcoal/70 text-sm">
            Patientez pendant que nous chargeons votre profil...
          </p>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse"
                style={{ width: '60%' }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Phase 2: Utilisateur non connecté - Redirection avec préservation de l'URL
  if (!user) {
    // Construire l'URL de redirection pour revenir ici après connexion
    const redirectTo = encodeURIComponent(
      `${location.pathname}${location.search}${location.hash}`
    )
    
    // Debug en développement
    if (process.env.NODE_ENV === 'development') {
      console.log('[ProtectedRoute] Redirection vers login avec:', {
        from: location.pathname,
        redirectTo
      })
    }

    return (
      <Navigate 
        to={`/auth/login?redirectTo=${redirectTo}`} 
        replace={true}
        state={{ from: location }}
      />
    )
  }

  // Phase 3: Utilisateur connecté - Afficher le contenu protégé
  return <>{children}</>
}

/**
 * Composant d'erreur pour les cas où l'authentification échoue
 * @internal Utilisé uniquement en cas d'erreur critique
 */
export function AuthError({ 
  message = "Une erreur s'est produite lors de la vérification de votre session.",
  onRetry
}: { 
  message?: string
  onRetry?: () => void 
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-lg border-2 border-red-200 p-8 text-center">
        <div className="flex items-center justify-center mb-4 text-red-600">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="font-playfair text-xl font-bold text-dark-charcoal mb-3">
          Erreur d'authentification
        </h2>
        <p className="font-inter text-dark-charcoal/70 text-sm mb-6">
          {message}
        </p>
        <div className="flex items-center justify-center gap-3">
          {onRetry && (
            <button 
              onClick={onRetry}
              className="btn-primary"
            >
              Réessayer
            </button>
          )}
          <a 
            href="/auth/login" 
            className="btn-secondary"
          >
            Se reconnecter
          </a>
        </div>
      </div>
    </div>
  )
}
