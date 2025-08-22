import { Link } from 'react-router-dom'
import { Mail, ExternalLink } from 'lucide-react'
import PageMeta from '../../components/seo/PageMeta'

export default function VerifyEmail() {
  const openEmailClient = () => {
    // Ouvrir le client mail par défaut ou rediriger vers un webmail
    window.open('mailto:', '_blank')
  }

  const openGmail = () => {
    window.open('https://mail.google.com', '_blank')
  }

  const openOutlook = () => {
    window.open('https://outlook.live.com', '_blank')
  }

  return (
    <>
      <PageMeta 
        title="Vérifiez votre e-mail — Ankilang" 
        description="Confirmez votre adresse pour activer votre compte." 
      />
      
      <section className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12">
        <div className="w-full max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="mb-6">
              <Mail className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Vérifiez votre e-mail
              </h1>
            </div>
            
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                Nous avons envoyé un lien de confirmation à votre adresse e-mail.
              </p>
            </div>
            
            <p className="text-gray-600 mb-6">
              Cliquez sur le lien dans l'e-mail pour activer votre compte Ankilang.
            </p>

            <div className="space-y-3 mb-6">
              <button
                onClick={openEmailClient}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Mail className="w-5 h-5" />
                Ouvrir la boîte mail
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={openGmail}
                  className="flex-1 btn-secondary text-sm flex items-center justify-center gap-1"
                >
                  <ExternalLink className="w-4 h-4" />
                  Gmail
                </button>
                <button
                  onClick={openOutlook}
                  className="flex-1 btn-secondary text-sm flex items-center justify-center gap-1"
                >
                  <ExternalLink className="w-4 h-4" />
                  Outlook
                </button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Vous n'avez pas reçu l'e-mail ?
              </p>
              <Link 
                to="/auth/login" 
                className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
              >
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
