import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AppwriteException } from 'appwrite'
import { signupSchema, type SignupData } from '@ankilang/shared'
import { useAuth } from '../../hooks/useAuth'
import AuthForm from '../../components/auth/AuthForm'
import PageMeta from '../../components/seo/PageMeta'

// Étendre le schéma partagé avec confirmation du mot de passe
const registerSchema = signupSchema.extend({
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function Register() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { signup, user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  })

  // Rediriger automatiquement si déjà connecté
  useEffect(() => {
    if (user) {
      const redirectTo = searchParams.get('redirectTo') || '/app'
      navigate(redirectTo, { replace: true })
    }
  }, [user, navigate, searchParams])

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError(undefined)
    
    try {
      // Extraire les données pour Appwrite (sans confirmPassword)
      const signupData: SignupData = {
        name: data.name,
        email: data.email,
        password: data.password
      }
      
      // Inscription via Appwrite (crée automatiquement une session)
      await signup(signupData)
      
      // Redirection vers la page demandée ou /app par défaut
      const redirectTo = searchParams.get('redirectTo') || '/app'
      navigate(redirectTo, { replace: true })
      
    } catch (err) {
      // Gestion des erreurs Appwrite avec messages français
      if (err instanceof AppwriteException) {
        switch (err.code) {
          case 409:
            setError('Cette adresse e-mail est déjà utilisée.')
            break
          case 400:
            setError('Données invalides. Veuillez vérifier vos informations.')
            break
          case 429:
            setError('Trop de tentatives. Veuillez patienter avant de réessayer.')
            break
          default:
            setError('Erreur lors de l\'inscription. Veuillez réessayer.')
        }
      } else {
        setError('Erreur lors de l\'inscription. Veuillez vérifier votre connexion internet.')
      }
      
      // Log en développement
      if (process.env.NODE_ENV === 'development') {
        console.error('[Register] Erreur:', err)
      }
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
          <label htmlFor="name" className="label-field">
            Nom complet
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className="input-field"
            placeholder="Votre nom complet"
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className="error-message">
              {errors.name.message}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
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
          transition={{ duration: 0.5, delay: 0.8 }}
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
          transition={{ duration: 0.5, delay: 0.9 }}
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
          transition={{ duration: 0.5, delay: 1.0 }}
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
