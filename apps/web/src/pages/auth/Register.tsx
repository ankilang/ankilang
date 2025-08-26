import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import AuthForm from '../../components/auth/AuthForm'
import PageMeta from '../../components/seo/PageMeta'

const registerSchema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function Register() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError(undefined)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Register data:', data)
      navigate('/auth/verify-email')
    } catch (err) {
      setError('Erreur lors de l\'inscription. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <PageMeta 
        title="Inscription — Ankilang" 
        description="Créez votre compte Ankilang pour commencer à créer et gérer vos flashcards." 
      />
      
      <AuthForm
        title="Inscription"
        submitLabel="Créer mon compte"
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
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <label htmlFor="confirmPassword" className="label-field">
            Confirmer le mot de passe
          </label>
          <input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword')}
            className="input-field"
            placeholder="Confirmez votre mot de passe"
            aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
          />
          {errors.confirmPassword && (
            <p id="confirm-password-error" className="error-message">
              {errors.confirmPassword.message}
            </p>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="text-center pt-4 border-t border-gray-100"
        >
          <p className="text-sm text-dark-charcoal/70 font-sans">
            Déjà un compte ?{' '}
            <Link 
              to="/auth/login" 
              className="auth-link"
            >
              Se connecter
            </Link>
          </p>
        </motion.div>
      </AuthForm>
    </>
  )
}
