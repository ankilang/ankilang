import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import AuthForm from '../../components/auth/AuthForm'
import PageMeta from '../../components/seo/PageMeta'

const forgotPasswordSchema = z.object({
  email: z.string().email('Adresse e-mail invalide')
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string>()

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
      // Mock: simuler un délai d'envoi
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Forgot password data:', data)
      
      // Mock: afficher le message de confirmation
      setIsSubmitted(true)
    } catch (err) {
      setError('Erreur lors de l\'envoi. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <>
        <PageMeta 
          title="Mot de passe oublié — Ankilang" 
          description="Réinitialisez votre mot de passe." 
        />
        
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12">
          <div className="w-full max-w-md mx-auto px-4">
            <div className="bg-white rounded-lg shadow-xl p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                E-mail envoyé
              </h1>
              
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">
                  Si un compte existe avec cette adresse e-mail, un message de réinitialisation a été envoyé.
                </p>
              </div>
              
              <p className="text-gray-600 mb-6">
                Vérifiez votre boîte de réception et suivez les instructions pour réinitialiser votre mot de passe.
              </p>
              
              <Link 
                to="/auth/login" 
                className="btn-primary w-full"
              >
                Retour à la connexion
              </Link>
            </div>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <PageMeta 
        title="Mot de passe oublié — Ankilang" 
        description="Réinitialisez votre mot de passe." 
      />
      
      <AuthForm
        title="Mot de passe oublié"
        submitLabel="Envoyer le lien de réinitialisation"
        onSubmit={handleSubmit(onSubmit)}
        isLoading={isLoading}
        error={error}
      >
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Adresse e-mail
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="votre@email.com"
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            <Link 
              to="/auth/login" 
              className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
            >
              ← Retour à la connexion
            </Link>
          </p>
        </div>
      </AuthForm>
    </>
  )
}
