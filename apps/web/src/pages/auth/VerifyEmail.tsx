import { Link } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import AuthForm from '../../components/auth/AuthForm'
import PageMeta from '../../components/seo/PageMeta'

export default function VerifyEmail() {
  const [isResending, setIsResending] = useState(false)

  const handleResendEmail = async () => {
    setIsResending(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Resending verification email...')
    } catch (err) {
      console.error('Error resending email:', err)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <>
      <PageMeta 
        title="Vérifiez votre email — Ankilang" 
        description="Vérifiez votre adresse email pour activer votre compte Ankilang." 
      />
      
      <AuthForm
        title="Vérifiez votre email"
        submitLabel="Renvoyer l'email"
        onSubmit={handleResendEmail}
        isLoading={isResending}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          <p className="text-dark-charcoal font-sans">
            Nous avons envoyé un email de vérification à votre adresse.
          </p>
          
          <p className="text-sm text-dark-charcoal/70 font-sans">
            Cliquez sur le lien dans l'email pour activer votre compte et commencer à créer vos flashcards.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-center pt-4 border-t border-gray-100"
        >
          <p className="text-sm text-dark-charcoal/70 font-sans mb-4">
            Vous n'avez pas reçu l'email ?
          </p>
          <button
            onClick={handleResendEmail}
            disabled={isResending}
            className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
                Envoi en cours...
              </span>
            ) : (
              'Renvoyer l\'email'
            )}
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center pt-4 border-t border-gray-100"
        >
          <Link 
            to="/auth/login" 
            className="auth-link"
          >
            Retour à la connexion
          </Link>
        </motion.div>
      </AuthForm>
    </>
  )
}
