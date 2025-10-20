import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import AuthForm from '../../components/auth/AuthForm'
import PageMeta from '../../components/seo/PageMeta'

const forgotPasswordSchema = z.object({
  email: z.string().email('Adresse e-mail invalide')
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema)
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    setError(undefined)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Forgot password data:', data)
      setSuccess(true)
    } catch (_err) {
      setError('Erreur lors de l\'envoi. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <>
        <PageMeta 
          title="Email envoyé — Ankilang" 
          description="Un email de réinitialisation a été envoyé à votre adresse." 
        />
        
        <AuthForm
          title="Email envoyé"
          submitLabel="Envoyer le lien"
          onSubmit={() => {}}
          isLoading={false}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-dark-charcoal font-sans">
              Un email de réinitialisation a été envoyé à votre adresse email.
            </p>
            <p className="text-sm text-dark-charcoal/70 font-sans">
              Vérifiez votre boîte de réception et suivez les instructions pour réinitialiser votre mot de passe.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
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

  return (
    <>
      <PageMeta 
        title="Mot de passe oublié — Ankilang" 
        description="Réinitialisez votre mot de passe Ankilang." 
      />
      
      <AuthForm
        title="Mot de passe oublié"
        submitLabel="Envoyer le lien"
        onSubmit={handleSubmit(onSubmit)}
        isLoading={isLoading}
        error={error}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <label htmlFor="email" className="label-field">
            Adresse e-mail
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="input-field"
            placeholder="votre@email.com"
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="error-message">
              {errors.email.message}
            </p>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
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
