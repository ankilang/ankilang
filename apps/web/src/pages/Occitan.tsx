import { motion } from 'framer-motion'
import { Languages, Volume2, Download, Check } from 'lucide-react'
import PageMeta from '../components/seo/PageMeta'
import AnkilangLogo from '../components/ui/AnkilangLogo'
import { FEATURES } from '../config/features'

export default function Occitan() {
  return (
    <>
      <PageMeta
        title="Notre Mission pour l'Occitan — Ankilang"
        description="Découvrez pourquoi Ankilang offre un accès 100% gratuit et illimité pour l'apprentissage de la langue occitane. Un outil né de la passion, pour la communauté."
        keywords="occitan, langue occitane, apprendre occitan, flashcards occitan, gratuit occitan, ankilang occitan, cévennes, languedoc, gascon"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "Notre Mission pour l'Occitan",
          "description": "L'engagement d'Ankilang pour la langue occitane",
          "inLanguage": "fr"
        }}
      />

      {/* Header Cohérent avec Landing/Abonnement */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo Ankilang */}
            <a href="/" className="flex items-center gap-3">
              <AnkilangLogo size="default" animated={false} />
              <span className="text-xl font-bold text-slate-900">
                Ankilang
              </span>
            </a>

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
                className="text-violet-600 font-semibold transition-colors duration-200"
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
        {/* SECTION 1 : Le Constat (Hero avec Image) */}
        <section className="relative h-[400px] overflow-hidden">
          {/* Image de fond avec overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 to-slate-900/50">
            {/* Gradient temporaire évocateur des Cévennes */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200"></div>
          </div>
          
          {/* Contenu superposé */}
          <div className="relative z-10 max-w-4xl mx-auto px-4 h-full flex flex-col justify-center">
            <motion.h1
              className="text-white font-extrabold text-4xl sm:text-5xl mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Apprendre l'occitan méritait de meilleurs outils.
            </motion.h1>
            <motion.p
              className="text-white/90 text-lg max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Ankilang est né à Alès, dans les Cévennes, au cœur de l'Occitanie. 
              Ce projet est avant tout une réponse à un besoin personnel : celui de 
              disposer d'un outil moderne et efficace pour apprendre notre langue, 
              sans avoir à bricoler avec des solutions inadaptées.
            </motion.p>
          </div>
        </section>

        {/* SECTION 2 : La Solution (Fonctionnalités) */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                La technologie au service de notre langue.
              </h2>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Carte 1 : Traduction */}
              <motion.div
                className="bg-white rounded-lg p-6 shadow-sm"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Languages className="w-12 h-12 text-violet-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Un traducteur intégré
                </h3>
                <p className="text-slate-600">
                  Fini de jongler entre les onglets. Nous avons intégré le dictionnaire 
                  de référence Revirada directement dans l'application pour des traductions 
                  fiables et contextuelles.
                </p>
              </motion.div>
              
              {/* Carte 2 : Audio */}
              <motion.div
                className="bg-white rounded-lg p-6 shadow-sm"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Volume2 className="w-12 h-12 text-violet-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  La prononciation juste
                </h3>
                <p className="text-slate-600">
                  Entendez la différence. Ankilang génère un audio authentique pour les 
                  dialectes Gascon et Languedocien grâce à la technologie de nos 
                  partenaires de Votz.
                </p>
              </motion.div>
              
              {/* Carte 3 : Export */}
              <motion.div
                className="bg-white rounded-lg p-6 shadow-sm"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Download className="w-12 h-12 text-violet-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  L'export en un clic
                </h3>
                <p className="text-slate-600">
                  Concentrez-vous sur l'apprentissage, pas sur la technique. Exportez vos 
                  paquets de cartes au format .apkg en un seul clic, prêts à être étudiés 
                  dans Anki.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION 3 : L'Engagement (Point Focal) */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-8">
                Notre engagement : gratuit, pour toujours.
              </h2>
              
              {/* Élément central imposant */}
              <div className="bg-violet-50 rounded-2xl p-12 mb-12">
                <div className="text-6xl sm:text-7xl font-extrabold text-violet-600 mb-6">
                  100% GRATUIT
                </div>
                <p className="text-xl text-slate-700">
                  Pour l'occitan, aujourd'hui et pour toujours.
                </p>
              </div>
              
              {/* Liste des bénéfices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-slate-700 font-medium">Paquets de cartes illimités</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-slate-700 font-medium">Flashcards illimitées</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-slate-700 font-medium">Toutes les fonctionnalités avancées</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-slate-700 font-medium">Mises à jour futures incluses</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-slate-700 font-medium">Sans aucune publicité, jamais</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-slate-700 font-medium">Audio et images illimités</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SECTION 4 : Appel à la Communauté (CTA Final) */}
        <section className="py-20 bg-violet-600 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" lang="oc">
                Adiu, e ara a vos de jogar !
              </h2>
              <p className="text-violet-100 text-sm mb-6">
                (Bonjour, et maintenant à vous de jouer !)
              </p>
              
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Ankilang est un projet vivant. Vos retours sont précieux pour l'améliorer. 
                N'hésitez pas à nous faire part de vos suggestions, que ce soit pour ajouter 
                de nouveaux dialectes ou d'autres langues régionales.
              </p>
              
              <a
                href="/auth/register"
                className="inline-block bg-white text-violet-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-slate-50 transition-colors duration-200"
              >
                Créer mes premières cartes en occitan
              </a>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer Identique à Landing/Abonnement */}
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
