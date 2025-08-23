import { Link } from 'react-router-dom'
import { BookOpen, Download, Languages, CheckCircle, ArrowRight } from 'lucide-react'
import PageMeta from '../components/seo/PageMeta'
import Blob from '../components/da/Blob'
import MotionSafe from '../components/da/MotionSafe'
import FAQAccordion from '../components/landing/FAQAccordion'

const faqItems = [
  {
    id: 'occitan-gratuit',
    question: 'L\'occitan est-il vraiment gratuit ?',
    answer: 'Oui ! Toutes les flashcards en occitan sont entièrement gratuites. Nous croyons à l\'importance de préserver les langues régionales et nous offrons un accès illimité à notre contenu occitan.'
  },
  {
    id: 'export-anki',
    question: 'Comment exporter vers Anki ?',
    answer: 'Créez vos thèmes dans Ankilang, puis cliquez sur "Exporter" pour télécharger un fichier .apkg. Ouvrez Anki et importez ce fichier - vos cartes apparaîtront automatiquement !'
  },
  {
    id: 'langues-supportees',
    question: 'Quelles langues sont supportées ?',
    answer: 'Nous supportons toutes les langues principales (anglais, espagnol, allemand, italien, etc.) ainsi que l\'occitan. De nouvelles langues sont ajoutées régulièrement.'
  },
  {
    id: 'hors-ligne',
    question: 'Puis-je utiliser Ankilang hors ligne ?',
    answer: 'Oui ! Ankilang est une PWA (Progressive Web App) qui fonctionne hors ligne. Installez-la sur votre appareil pour un accès permanent à vos flashcards.'
  },
  {
    id: 'cartes-types',
    question: 'Quels types de cartes puis-je créer ?',
    answer: 'Deux types : Basic (question/réponse classique) et Cloze (texte à trous). Parfait pour l\'apprentissage des langues avec traduction automatique.'
  },
  {
    id: 'prix',
    question: 'Quels sont les tarifs ?',
    answer: 'L\'occitan est gratuit. Pour les autres langues, nous proposons un abonnement Pro avec fonctionnalités avancées. Consultez notre page tarifs pour plus de détails.'
  }
]

export default function Landing() {
  return (
    <>
      <PageMeta 
        title="Ankilang — Flashcards & export Anki (.apkg)" 
        description="Crée des flashcards Basic & Cloze. Occitan illimité, PWA hors ligne, export direct Anki." 
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
        {/* décor d'arrière-plan */}
        <MotionSafe>
          <Blob className="w-[380px] h-[380px] left-[-80px] top-[-60px] animate-slowfloat" />
          <Blob className="da-blob--blue w-[420px] h-[420px] right-[-120px] top-[80px] animate-slowspin" />
        </MotionSafe>

        <div className="container mx-auto px-4 py-16 relative z-10">
          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Contenu texte */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Crée tes flashcards<br />
                <span className="text-blue-600">Exporte vers Anki</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-600 mb-6 max-w-2xl lg:max-w-none">
                Créez et étudiez des cartes en occitan sans frais, à votre rythme.
              </p>

              {/* Badge gratuit */}
              <div className="mb-8">
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 text-sm bg-green-100 text-green-800"
                  aria-label="Les flashcards en occitan sont gratuites"
                >
                  Les flashcards en occitan sont gratuites.
                </span>
              </div>

              {/* CTA */}
              <a
                href="/app/community?lang=oc"
                data-analytics="lp_oc_free_cta_click"
                onClick={() => console.log('[analytics] lp_oc_free_cta_click')}
                className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Explorer l'occitan — Gratuit
              </a>
            </div>

            {/* Visuel hero */}
            <div className="relative">
              <img
                src="/img/hero-ankilang.webp"
                alt="Interface Ankilang avec flashcards"
                width={800}
                height={600}
                loading="eager"
                decoding="async"
                className="w-full h-auto rounded-2xl da-card"
                onError={(e) => {
                  // Fallback si l'image manque
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const fallback = target.nextElementSibling as HTMLElement
                  if (fallback) fallback.style.display = 'block'
                }}
              />
              {/* fallback si l'image manque */}
              <div 
                className="w-full aspect-[4/3] rounded-2xl da-card bg-gradient-to-tr from-indigo-400 to-violet-600 hidden"
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* SECTION — Communauté naissante */}
          <section aria-labelledby="lp-community-title" className="relative py-16 sm:py-20">
            <div className="container mx-auto px-4">
              <header className="mx-auto max-w-2xl text-center mb-10 sm:mb-12">
                <h2 id="lp-community-title" className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
                  Construisons Ankilang ensemble
                </h2>
                <p className="mt-3 text-gray-600">
                  Une communauté d'apprenants qui explore, adapte et publie ses decks au fil du temps.
                </p>
              </header>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Carte 1 — Créer */}
                <article className="group relative rounded-2xl p-6 overflow-hidden hover:shadow-md transition-shadow border shadow-sm bg-white/60 supports-[backdrop-filter]:bg-white/40 backdrop-blur border-white/30 dark:bg-slate-900/40 dark:border-slate-700" aria-label="Créer ses decks">
                  {/* Dégradé subtil en haut */}
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-indigo-400/40 to-fuchsia-400/40"></div>
                  
                  <div className="inline-flex size-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 mb-4 group-hover:scale-105 transition-transform">
                    {/* Icone stylo */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Créer ses decks</h3>
                  <p className="mt-2 text-gray-600">
                    Concevez des cartes à votre image et structurez vos thèmes.
                  </p>
                </article>

                {/* Carte 2 — S'inspirer (sans interactions) */}
                <article className="group relative rounded-2xl p-6 overflow-hidden hover:shadow-md transition-shadow border shadow-sm bg-white/60 supports-[backdrop-filter]:bg-white/40 backdrop-blur border-white/30 dark:bg-slate-900/40 dark:border-slate-700" aria-label="S'inspirer de la communauté">
                  {/* Dégradé subtil en haut */}
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-indigo-400/40 to-fuchsia-400/40"></div>
                  
                  <div className="inline-flex size-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 mb-4 group-hover:scale-105 transition-transform">
                    {/* Icone boussole */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                      <circle cx="12" cy="12" r="9"/><path d="M14.5 9.5l-2 5-5 2 2-5 5-2z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">S'inspirer de la communauté</h3>
                  <p className="mt-2 text-gray-600">
                    Explorez les decks publiés par d'autres et adaptez-les à vos besoins.
                  </p>
                </article>

                {/* Carte 3 — Grandir */}
                <article className="group relative rounded-2xl p-6 overflow-hidden hover:shadow-md transition-shadow border shadow-sm bg-white/60 supports-[backdrop-filter]:bg-white/40 backdrop-blur border-white/30 dark:bg-slate-900/40 dark:border-slate-700" aria-label="Grandir pas à pas">
                  {/* Dégradé subtil en haut */}
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-indigo-400/40 to-fuchsia-400/40"></div>
                  
                  <div className="inline-flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-4 group-hover:scale-105 transition-transform">
                    {/* Icone feuille */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                      <path d="M12 22s8-4 8-10a8 8 0 1 0-16 0c0 6 8 10 8 10z"/><path d="M12 12v10"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Grandir pas à pas</h3>
                  <p className="mt-2 text-gray-600">
                    Avancez à votre rythme avec une méthode simple et durable.
                  </p>
                </article>
              </div>
            </div>
          </section>

          {/* Product Tour Section avec illustration */}
          <div className="mt-24">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Fonctionnalités principales
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Tout ce dont vous avez besoin pour créer des flashcards efficaces
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Illustration */}
              <div className="order-2 lg:order-1">
                <img
                  src="/illustrations/features-overview.webp"
                  alt="Vue d'ensemble des fonctionnalités Ankilang"
                  width={800}
                  height={600}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto rounded-2xl da-card"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const fallback = target.nextElementSibling as HTMLElement
                    if (fallback) fallback.style.display = 'block'
                  }}
                />
                {/* fallback si l'image manque */}
                <div 
                  className="w-full aspect-[4/3] rounded-2xl da-card bg-gradient-to-tr from-blue-400 to-purple-600 hidden"
                  style={{ display: 'none' }}
                />
              </div>
              
              {/* Features list */}
              <div className="order-1 lg:order-2 space-y-6">
                <div className="da-card da-card--hover da-hover-lift p-6">
                  <div className="flex items-start">
                    <BookOpen className="w-8 h-8 text-blue-600 mr-4 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Flashcards intelligentes
                      </h3>
                      <p className="text-gray-600">
                        Crée des cartes Basic et Cloze avec traduction automatique et prononciation.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="da-card da-card--hover da-hover-lift p-6">
                  <div className="flex items-start">
                    <Download className="w-8 h-8 text-green-600 mr-4 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Export Anki direct
                      </h3>
                      <p className="text-gray-600">
                        Exporte tes thèmes en .apkg pour les importer directement dans Anki.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="da-card da-card--hover da-hover-lift p-6">
                  <div className="flex items-start">
                    <Languages className="w-8 h-8 text-purple-600 mr-4 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Multi-langues
                      </h3>
                      <p className="text-gray-600">
                        Support de nombreuses langues avec DeepL et Revirada pour la traduction.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works Section avec illustration */}
          <div className="mt-24">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Comment ça marche ?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                En 3 étapes simples, créez vos flashcards et exportez-les vers Anki
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Étapes */}
              <div className="space-y-6">
                <div className="da-card da-card--hover da-hover-lift p-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <span className="text-xl font-bold text-blue-600">1</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Créez votre thème
                      </h3>
                      <p className="text-gray-600">
                        Choisissez une langue et créez un thème pour organiser vos cartes.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="da-card da-card--hover da-hover-lift p-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <span className="text-xl font-bold text-green-600">2</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Ajoutez vos cartes
                      </h3>
                      <p className="text-gray-600">
                        Créez des cartes Basic ou Cloze avec traduction automatique.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="da-card da-card--hover da-hover-lift p-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <span className="text-xl font-bold text-purple-600">3</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Exportez vers Anki
                      </h3>
                      <p className="text-gray-600">
                        Téléchargez le fichier .apkg et importez-le dans Anki.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Illustration */}
              <div>
                <img
                  src="/illustrations/learning-path.webp"
                  alt="Parcours d'apprentissage personnalisable"
                  width={800}
                  height={600}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto rounded-2xl da-card"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const fallback = target.nextElementSibling as HTMLElement
                    if (fallback) fallback.style.display = 'block'
                  }}
                />
                {/* fallback si l'image manque */}
                <div 
                  className="w-full aspect-[4/3] rounded-2xl da-card bg-gradient-to-tr from-green-400 to-blue-600 hidden"
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Use Cases Section avec illustration */}
          <div className="mt-24">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Pour qui est Ankilang ?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Adapté à tous les types d'apprenants et de projets
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Illustration */}
              <div className="order-2 lg:order-1">
                <img
                  src="/illustrations/user-personas.webp"
                  alt="Différents types d'utilisateurs d'Ankilang"
                  width={800}
                  height={600}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto rounded-2xl da-card"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const fallback = target.nextElementSibling as HTMLElement
                    if (fallback) fallback.style.display = 'block'
                  }}
                />
                {/* fallback si l'image manque */}
                <div 
                  className="w-full aspect-[4/3] rounded-2xl da-card bg-gradient-to-tr from-orange-400 to-red-600 hidden"
                  style={{ display: 'none' }}
                />
              </div>
              
              {/* Personas */}
              <div className="order-1 lg:order-2 space-y-6">
                <div className="da-card da-card--hover da-hover-lift p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Étudiants en langues
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Vocabulaire et grammaire
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Préparation aux examens
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Révision quotidienne
                    </li>
                  </ul>
                </div>
                
                <div className="da-card da-card--hover da-hover-lift p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Enseignants
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Création de supports
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Partage avec les élèves
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Suivi des progrès
                    </li>
                  </ul>
                </div>
                
                <div className="da-card da-card--hover da-hover-lift p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Passionnés de langues
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Langues régionales
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Apprentissage autonome
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Communauté partage
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-24">
            <FAQAccordion items={faqItems} title="Questions fréquentes" />
          </div>

          {/* CTA Final Section */}
          <div className="mt-24 text-center">
            <div className="da-card da-card--hover da-card--accent da-hover-lift p-8 sm:p-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Prêt à commencer ?
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Rejoignez des milliers d'apprenants qui utilisent Ankilang pour maîtriser les langues
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                <a
                  href="/app/community?lang=oc"
                  data-analytics="lp_final_oc_cta_click"
                  onClick={() => console.log('[analytics] lp_final_oc_cta_click')}
                  className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  Essayer l'occitan gratuit
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
                
                <Link 
                  to="/register"
                  data-analytics="lp_final_register_cta_click"
                  onClick={() => console.log('[analytics] lp_final_register_cta_click')}
                  className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  Créer un compte
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 text-center">
            <Link 
              to="/abonnement" 
              className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
            >
              Voir les tarifs →
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
