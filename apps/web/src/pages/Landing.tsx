import { motion } from 'framer-motion'
import PageMeta from '../components/seo/PageMeta'
import SectionTitle from '../components/landing/SectionTitle'
import FAQAccordion from '../components/landing/FAQAccordion'
import AnkilangLogo from '../components/ui/AnkilangLogo'
import { useToast } from '../components/Toast'
import LoadingSpinner from '../components/LoadingSpinner'
import { useLoading } from '../components/LoadingSpinner'
import { FEATURES } from '../config/features'

export default function NewLanding() {
  const { success } = useToast()
  const { loading, execute } = useLoading()

  const handleGetStarted = async () => {
    await execute(async () => {
      // Simuler un délai de redirection
      await new Promise(resolve => setTimeout(resolve, 500))
      success('Bienvenue sur Ankilang !', 'Vous allez être redirigé vers la page d\'inscription.')
    })
  }

  return (
    <>
      <PageMeta 
        title="Ankilang - Créez vos flashcards Anki en 2 minutes"
        description="Importez vos listes de vocabulaire, générez traductions et audio, et exportez des paquets .apkg parfaits pour Anki. Simple, rapide. Occitan gratuit à vie."
        keywords="flashcards, Anki, apprentissage langues, occitan, export apkg, vocabulaire, révision, cartes mémoire, traduction automatique, synthèse vocale"
        ogImage="/images/ankilang-og-image.jpg"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Ankilang",
          "applicationCategory": "EducationalApplication",
          "description": "Créez vos flashcards Anki en 2 minutes",
          "url": "https://ankilang.com",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "EUR",
            "description": "Occitan gratuit à vie"
          },
          "operatingSystem": "Web",
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "127"
          },
          "author": {
            "@type": "Organization",
            "name": "Ankilang"
          },
          "datePublished": "2024-01-01",
          "inLanguage": "fr"
        }}
      />
      
      {/* Header Simplifié */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo Ankilang */}
            <div className="flex items-center gap-3">
              <AnkilangLogo size="default" animated={false} />
              <span className="text-xl font-bold text-slate-900">
                Ankilang
              </span>
            </div>

            {/* Navigation Desktop */}
            <nav className="hidden lg:flex items-center gap-8">
              {FEATURES.PRICING_PAGE_ENABLED && (
                <a
                  href="/abonnement"
                  className="text-slate-700 hover:text-violet-600 transition-colors duration-200"
                >
                  Tarifs
                </a>
              )}
              <a
                href="/occitan"
                className="text-slate-700 hover:text-violet-600 transition-colors duration-200"
              >
                Occitan
              </a>
            </nav>

            {/* Actions Desktop */}
            <div className="hidden lg:flex items-center gap-4">
              <a
                href="/auth/login"
                className="text-slate-700 hover:text-violet-600 transition-colors duration-200"
              >
                Se connecter
              </a>
              <a
                href="/auth/register"
                className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
              >
                S'inscrire gratuitement
              </a>
            </div>

            {/* Menu mobile */}
            <div className="lg:hidden">
              <button className="text-slate-700 hover:text-violet-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* SECTION 1: HERO */}
        <section className="text-center px-4 pt-24 pb-32 sm:pt-32 sm:pb-40 bg-white">
          <div className="max-w-4xl mx-auto">
            <motion.h1 
              className="text-slate-900 font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Créez vos flashcards Anki en 2 minutes.
            </motion.h1>
            <motion.p 
              className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Importez vos listes de vocabulaire, générez traductions et audio en un clic. Passez moins de temps à préparer, plus de temps à mémoriser.
            </motion.p>
            <motion.div 
              className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <button
                onClick={handleGetStarted}
                disabled={loading}
                className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    Chargement...
                  </>
                ) : (
                  'Commencer gratuitement'
                )}
              </button>
              <p className="text-slate-500 text-sm">
                ✨ 14 jours d'essai. Occitan gratuit à vie.
              </p>
            </motion.div>
          </div>
        </section>

        {/* SECTION 2: VISUAL PROOF (GIF) */}
        <section className="py-20 sm:py-32 bg-slate-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <SectionTitle>Voyez-le en action.</SectionTitle>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              De l'import de votre liste à l'export de votre fichier `.apkg` en moins d'une minute.
            </p>
            <motion.div 
              className="mt-12 rounded-lg shadow-2xl overflow-hidden ring-1 ring-slate-200"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              {/* NOTE: Prévois un GIF sobre et court à placer ici */}
              <img
                src="/ankilang-demo.gif"
                alt="Démonstration animée de la création de flashcards sur Ankilang"
                width={1200}
                height={750} 
                loading="lazy"
                className="w-full"
              />
            </motion.div>
          </div>
        </section>

        {/* SECTION 3: CTA VERS MISSION OCCITAN */}
        <section className="py-20 sm:py-24 bg-violet-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                L'occitan, gratuit à vie
              </h2>
              <p className="text-lg text-violet-100 mb-8 max-w-2xl mx-auto">
                Ankilang est né en Occitanie. Toutes les fonctionnalités Pro pour 
                l'occitan sont gratuites, pour toujours. C'est notre engagement.
              </p>
              <a
                href="/occitan"
                className="inline-block bg-white text-violet-600 px-8 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors duration-200"
              >
                Découvrir notre mission →
              </a>
            </motion.div>
          </div>
        </section>

        {/* SECTION 4: FAQ */}
        <section className="py-20 sm:py-32 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <SectionTitle>Questions fréquentes</SectionTitle>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <FAQAccordion items={[
                { id: 'anki', question: "Ankilang remplace l'application Anki ?", answer: "Non, Ankilang est un outil de préparation. Il génère des paquets de cartes (.apkg) parfaitement formatés que vous importez ensuite dans l'application Anki (Desktop ou Mobile) pour les étudier." },
                { id: 'essai', question: "Comment fonctionne l'essai gratuit de 14 jours ?", answer: "Vous avez accès à toutes les fonctionnalités Pro pendant 14 jours, sans entrer de carte de crédit. À la fin de l'essai, vous pouvez choisir un abonnement ou continuer avec le plan gratuit pour l'occitan." },
                { id: 'langues', question: "Quelles sont les langues supportées ?", answer: "Le plan Pro supporte plus de 30 langues pour la traduction et la synthèse vocale, dont l'anglais, l'espagnol, l'allemand, le japonais, et bien d'autres. La liste complète est disponible sur notre page tarifs." }
              ]} />
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Logo et description */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <AnkilangLogo size="default" animated={false} />
                <span className="text-xl font-bold">Ankilang</span>
              </div>
              <p className="text-slate-300 mb-6 max-w-md">
                Créez vos flashcards Anki en 2 minutes. Importez vos listes de vocabulaire, 
                générez traductions et audio, et exportez des paquets .apkg parfaits.
              </p>
              <div className="flex gap-4">
                <a 
                  href="mailto:support@ankilang.com" 
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  📧 Support
                </a>
                <a 
                  href="https://twitter.com/ankilang" 
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  🐦 Twitter
                </a>
              </div>
            </div>

            {/* Liens rapides */}
            <div>
              <h3 className="font-semibold mb-4">Produit</h3>
              <ul className="space-y-2">
                <li><a href="/app" className="text-slate-400 hover:text-white transition-colors">Tableau de bord</a></li>
                <li><a href="/app/themes" className="text-slate-400 hover:text-white transition-colors">Mes thèmes</a></li>
                <li><a href="/auth/register" className="text-slate-400 hover:text-white transition-colors">S'inscrire</a></li>
                <li><a href="/auth/login" className="text-slate-400 hover:text-white transition-colors">Se connecter</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="/help" className="text-slate-400 hover:text-white transition-colors">Centre d'aide</a></li>
                <li><a href="/contact" className="text-slate-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="/privacy" className="text-slate-400 hover:text-white transition-colors">Confidentialité</a></li>
                <li><a href="/terms" className="text-slate-400 hover:text-white transition-colors">Conditions</a></li>
              </ul>
            </div>
          </div>

          {/* Séparateur */}
          <div className="border-t border-slate-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-slate-400 text-sm">
                © 2024 Ankilang. Tous droits réservés.
              </p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <a href="/privacy" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Confidentialité
                </a>
                <a href="/terms" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Conditions
                </a>
                <a href="/cookies" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Cookies
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
