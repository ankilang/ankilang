import React, { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { motion } from 'framer-motion'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

/**
 * ErrorBoundary pour capturer les erreurs React et afficher un fallback élégant
 * Utilisé sur les pages lourdes (Detail, Export) pour éviter l'écran blanc
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Error caught:', error, errorInfo)
    
    // Log l'erreur pour le monitoring
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    this.setState({ error, errorInfo })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  handleGoHome = () => {
    window.location.href = '/app'
  }

  override render() {
    if (this.state.hasError) {
      // Fallback personnalisé si fourni
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Fallback par défaut
      return (
        <div className="min-h-screen bg-gradient-to-br from-pastel-purple/20 via-pastel-green/10 to-pastel-rose/20 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/20 text-center"
          >
            {/* Icône d'erreur */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <AlertTriangle className="w-8 h-8 text-white" />
            </motion.div>

            {/* Titre */}
            <h1 className="font-display text-2xl font-bold text-dark-charcoal mb-4">
              Oups ! Une erreur est survenue
            </h1>

            {/* Description */}
            <p className="font-sans text-dark-charcoal/70 mb-6 leading-relaxed">
              Nous avons rencontré un problème inattendu. Pas de panique, vous pouvez réessayer ou retourner à l'accueil.
            </p>

            {/* Détails de l'erreur en mode dev */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm font-semibold text-red-600 mb-2">
                  Détails techniques (dev)
                </summary>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs font-mono text-red-800 overflow-auto max-h-32">
                  <div className="font-semibold mb-1">Error:</div>
                  <div className="mb-2">{this.state.error.message}</div>
                  {this.state.error.stack && (
                    <>
                      <div className="font-semibold mb-1">Stack:</div>
                      <div className="whitespace-pre-wrap">{this.state.error.stack}</div>
                    </>
                  )}
                </div>
              </details>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                onClick={this.handleRetry}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg"
              >
                <RefreshCw className="w-4 h-4" />
                Réessayer
              </motion.button>
              
              <motion.button
                onClick={this.handleGoHome}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-white border-2 border-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 hover:border-gray-300 transition-colors"
              >
                <Home className="w-4 h-4" />
                Accueil
              </motion.button>
            </div>

            {/* Message de support */}
            <p className="text-xs text-dark-charcoal/50 mt-6">
              Si le problème persiste, contactez le support technique.
            </p>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook pour utiliser l'ErrorBoundary dans les composants fonctionnels
 */
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('[useErrorHandler] Error:', error, errorInfo)
    // Ici on pourrait envoyer l'erreur à un service de monitoring
  }
}

/**
 * Wrapper HOC pour les pages qui ont besoin d'ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}
