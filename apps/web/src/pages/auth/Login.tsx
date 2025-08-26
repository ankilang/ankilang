import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import AuthForm from '../../components/auth/AuthForm'
import PageMeta from '../../components/seo/PageMeta'

const loginSchema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères')
})

type LoginFormData = z.infer<typeof loginSchema>

export default function Login() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(undefined)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Login data:', data)
      navigate('/app')
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <PageMeta 
        title="Connexion — Ankilang" 
        description="Connectez-vous à votre espace Ankilang pour créer et gérer vos flashcards." 
      />
      
      <AuthForm
        title="Connexion"
        submitLabel="Se connecter"
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
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <label htmlFor="password" className="label-field">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className="input-field"
            placeholder="Votre mot de passe"
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          {errors.password && (
            <p id="password-error" className="error-message">
              {errors.password.message}
            </p>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex items-center justify-between"
        >
          <Link 
            to="/auth/forgot-password" 
            className="text-sm auth-link"
          >
            Mot de passe oublié ?
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="text-center pt-4 border-t border-gray-100"
        >
          <p className="text-sm text-dark-charcoal/70 font-sans">
            Pas encore de compte ?{' '}
            <Link 
              to="/auth/register" 
              className="auth-link"
            >
              S'inscrire gratuitement
            </Link>
          </p>
        </motion.div>
      </AuthForm>
    </>
  )
}
