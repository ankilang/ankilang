import { Link } from 'react-router-dom'
import LegalContent from '../../components/legal/LegalContent'
import PageMeta from '../../components/seo/PageMeta'

const toc = [
  { id: 'licence', label: 'Licence d\'utilisation' },
  { id: 'responsabilites', label: 'Responsabilités' },
  { id: 'utilisation', label: 'Conditions d\'utilisation' },
  { id: 'limitations', label: 'Limitations' }
]

export default function Terms() {
  return (
    <>
      <PageMeta 
        title="Conditions d'utilisation — Ankilang" 
        description="Conditions d'utilisation, responsabilités et licences." 
      />
      
      <LegalContent
        title="Conditions d'utilisation"
        description="Dernière mise à jour : décembre 2024"
        toc={toc}
      >
        <section id="licence" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Licence d'utilisation
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Ankilang est un service de création de flashcards avec export vers Anki. 
              En utilisant notre plateforme, vous acceptez ces conditions d'utilisation.
            </p>
            <p>
              Nous accordons une licence limitée, non exclusive, non transférable et révocable 
              pour utiliser Ankilang conformément à ces conditions.
            </p>
            <p>
              Vous conservez tous vos droits sur le contenu que vous créez (flashcards, thèmes, etc.). 
              Nous ne revendiquons aucune propriété sur vos créations.
            </p>
          </div>
        </section>

        <section id="responsabilites" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Responsabilités
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Vos responsabilités :</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Fournir des informations exactes lors de l'inscription</li>
              <li>Protéger vos identifiants de connexion</li>
              <li>Respecter les droits d'auteur et la propriété intellectuelle</li>
              <li>Ne pas utiliser le service à des fins illégales</li>
              <li>Ne pas perturber le fonctionnement du service</li>
            </ul>
            <p>
              <strong>Nos responsabilités :</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Maintenir la disponibilité du service dans la mesure du possible</li>
              <li>Protéger vos données personnelles conformément au RGPD</li>
              <li>Fournir un support technique pour les utilisateurs payants</li>
            </ul>
          </div>
        </section>

        <section id="utilisation" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Conditions d'utilisation
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Utilisation autorisée :</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Création de flashcards pour l'apprentissage personnel</li>
              <li>Partage de thèmes dans la communauté (selon les paramètres)</li>
              <li>Export vers Anki pour utilisation hors ligne</li>
              <li>Utilisation des fonctionnalités PWA</li>
            </ul>
            <p>
              <strong>Utilisation interdite :</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Création de contenu offensant, diffamatoire ou illégal</li>
              <li>Spam ou utilisation commerciale non autorisée</li>
              <li>Tentative de piratage ou d'accès non autorisé</li>
              <li>Violation des droits d'auteur</li>
            </ul>
          </div>
        </section>

        <section id="limitations" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Limitations
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Limitations techniques :</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Limite de 20 cartes/jour pour les langues autres que l'occitan (gratuit)</li>
              <li>Export par thème uniquement (gratuit)</li>
              <li>Stockage limité selon votre plan d'abonnement</li>
              <li>Pas de garantie de disponibilité 24/7</li>
            </ul>
            <p>
              <strong>Limitations de responsabilité :</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Nous ne garantissons pas l'exactitude des traductions automatiques</li>
              <li>Pas de responsabilité pour les pertes de données</li>
              <li>Limitation de responsabilité aux montants payés</li>
            </ul>
          </div>
        </section>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Besoin d'aide ?
          </h3>
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/legal/privacy" 
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Politique de confidentialité
            </Link>
            <a 
              href="mailto:support@ankilang.com" 
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Contact support
            </a>
            <Link 
              to="/" 
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </LegalContent>
    </>
  )
}
