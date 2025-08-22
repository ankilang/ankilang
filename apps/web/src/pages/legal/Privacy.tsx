import { Link } from 'react-router-dom'
import LegalContent from '../../components/legal/LegalContent'
import PageMeta from '../../components/seo/PageMeta'

const toc = [
  { id: 'donnees', label: 'Données collectées' },
  { id: 'finalites', label: 'Finalités' },
  { id: 'bases', label: 'Bases légales' },
  { id: 'partage', label: 'Partage & sous-traitants' },
  { id: 'duree', label: 'Durées de conservation' },
  { id: 'droits', label: 'Droits RGPD' },
  { id: 'contact', label: 'Contact DPO' }
]

export default function Privacy() {
  return (
    <>
      <PageMeta 
        title="Confidentialité — Ankilang" 
        description="Politique de confidentialité et RGPD." 
      />
      
      <LegalContent
        title="Politique de confidentialité"
        description="Dernière mise à jour : décembre 2024"
        toc={toc}
      >
        <section id="donnees" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Données collectées
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Données d'identification :</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Adresse e-mail (obligatoire pour l'inscription)</li>
              <li>Nom d'utilisateur (optionnel)</li>
              <li>Mot de passe (haché et sécurisé)</li>
            </ul>
            <p>
              <strong>Données d'usage :</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Flashcards et thèmes créés</li>
              <li>Préférences de langue et de traduction</li>
              <li>Historique des exports Anki</li>
              <li>Données de navigation (cookies techniques)</li>
            </ul>
            <p>
              <strong>Données techniques :</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Adresse IP (pour la sécurité)</li>
              <li>User-Agent (navigateur et système)</li>
              <li>Logs d'accès (durée limitée)</li>
            </ul>
          </div>
        </section>

        <section id="finalites" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Finalités
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Finalités principales :</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Fournir le service de création de flashcards</li>
              <li>Gérer votre compte et authentification</li>
              <li>Traduire automatiquement vos contenus</li>
              <li>Générer les exports Anki (.apkg)</li>
              <li>Assurer la sécurité du service</li>
            </ul>
            <p>
              <strong>Finalités secondaires :</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Améliorer le service (analytics anonymisés)</li>
              <li>Support client et assistance</li>
              <li>Facturation (pour les utilisateurs Pro)</li>
            </ul>
          </div>
        </section>

        <section id="bases" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Bases légales
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Exécution du contrat :</strong> Vos données sont nécessaires pour fournir le service Ankilang.
            </p>
            <p>
              <strong>Intérêt légitime :</strong> Pour la sécurité, la prévention des fraudes et l'amélioration du service.
            </p>
            <p>
              <strong>Consentement :</strong> Pour les communications marketing (optionnel).
            </p>
            <p>
              <strong>Obligation légale :</strong> Conservation des données de facturation (7 ans).
            </p>
          </div>
        </section>

        <section id="partage" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Partage & sous-traitants
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Nous ne vendons jamais vos données.</strong>
            </p>
            <p>
              <strong>Sous-traitants autorisés :</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Appwrite :</strong> Authentification et base de données</li>
              <li><strong>DeepL/Revirada :</strong> Services de traduction</li>
              <li><strong>Stripe :</strong> Paiements (utilisateurs Pro)</li>
              <li><strong>Netlify :</strong> Hébergement et CDN</li>
            </ul>
            <p>
              Tous nos sous-traitants sont conformes au RGPD et signent des clauses contractuelles appropriées.
            </p>
          </div>
        </section>

        <section id="duree" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Durées de conservation
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Données de compte :</strong> Jusqu'à suppression du compte ou 3 ans d'inactivité
            </p>
            <p>
              <strong>Contenu créé :</strong> Jusqu'à suppression du compte
            </p>
            <p>
              <strong>Logs d'accès :</strong> 12 mois maximum
            </p>
            <p>
              <strong>Données de facturation :</strong> 7 ans (obligation légale)
            </p>
            <p>
              <strong>Cookies :</strong> 13 mois maximum
            </p>
          </div>
        </section>

        <section id="droits" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Droits RGPD
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Droit d'accès :</strong> Consulter vos données personnelles</li>
              <li><strong>Droit de rectification :</strong> Corriger vos informations</li>
              <li><strong>Droit à l'effacement :</strong> Supprimer votre compte et données</li>
              <li><strong>Droit à la portabilité :</strong> Exporter vos données</li>
              <li><strong>Droit d'opposition :</strong> Refuser le traitement</li>
              <li><strong>Droit de limitation :</strong> Restreindre le traitement</li>
            </ul>
            <p>
              Pour exercer ces droits, contactez notre DPO (voir section Contact).
            </p>
          </div>
        </section>

        <section id="contact" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Contact DPO
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Pour toute question concernant vos données personnelles :
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Email :</strong> <a href="mailto:dpo@ankilang.com" className="text-blue-600 hover:text-blue-800">dpo@ankilang.com</a></p>
              <p><strong>Adresse :</strong> [Adresse du responsable de traitement]</p>
              <p><strong>Délai de réponse :</strong> 30 jours maximum</p>
            </div>
            <p>
              Vous pouvez également déposer une plainte auprès de la CNIL si vous estimez que vos droits ne sont pas respectés.
            </p>
          </div>
        </section>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Liens utiles
          </h3>
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/legal/terms" 
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Conditions d'utilisation
            </Link>
            <a 
              href="mailto:dpo@ankilang.com" 
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Contact DPO
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
