import { motion } from 'framer-motion'
import PageMeta from '../components/seo/PageMeta'
import SectionTitle from '../components/landing/SectionTitle'
import FAQAccordion from '../components/landing/FAQAccordion'
import AnkilangLogo from '../components/ui/AnkilangLogo'
import { useToast } from '../components/Toast'
import LoadingSpinner from '../components/LoadingSpinner'
import { useLoading } from '../components/LoadingSpinner'

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
              <a
                href="#pricing"
                className="text-slate-700 hover:text-violet-600 transition-colors duration-200"
              >
                Tarifs
              </a>
              <a
                href="#mission"
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

        {/* SECTION 3: TRUST & MISSION */}
        <section id="mission" className="py-20 sm:py-32 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <SectionTitle>Clair, simple et juste.</SectionTitle>
            </div>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
              {/* Colonne 1: Mission Occitan */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-2xl font-bold text-slate-900">Notre engagement pour l'Occitan</h3>
                <p className="mt-4 text-lg text-slate-600">
                  Ankilang est né en Occitanie. Nous croyons que la technologie doit aussi servir à la préservation et à la diffusion des langues régionales. C'est pourquoi toutes les fonctionnalités pour l'occitan sont, et resteront, **gratuites pour toujours**.
                </p>
              </motion.div>

              {/* Colonne 2: FAQ Réduite */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Questions fréquentes</h3>
                {/* Tu dois réutiliser ton composant FAQAccordion ici mais en lui passant seulement ces 3 questions */}
                <FAQAccordion items={[
                  { id: 'anki', question: "Ankilang remplace l'application Anki ?", answer: "Non, Ankilang est un outil de préparation. Il génère des paquets de cartes (.apkg) parfaitement formatés que vous importez ensuite dans l'application Anki (Desktop ou Mobile) pour les étudier." },
                  { id: 'essai', question: "Comment fonctionne l'essai gratuit de 14 jours ?", answer: "Vous avez accès à toutes les fonctionnalités Pro pendant 14 jours, sans entrer de carte de crédit. À la fin de l'essai, vous pouvez choisir un abonnement ou continuer avec le plan gratuit pour l'occitan." },
                  { id: 'langues', question: "Quelles sont les langues supportées ?", answer: "Le plan Pro supporte plus de 30 langues pour la traduction et la synthèse vocale, dont l'anglais, l'espagnol, l'allemand, le japonais, et bien d'autres. La liste complète est disponible sur notre page tarifs." }
                ]} />
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
