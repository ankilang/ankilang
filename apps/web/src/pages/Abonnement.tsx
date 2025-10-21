import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import PageMeta from '../components/seo/PageMeta'
import SectionTitle from '../components/landing/SectionTitle'
import FAQAccordion from '../components/landing/FAQAccordion'
import AnkilangLogo from '../components/ui/AnkilangLogo'

export default function Abonnement() {
  const [isAnnual, setIsAnnual] = useState(true)

  // FAQ spécifique aux tarifs
  const pricingFAQ = [
    {
      id: 'cancel',
      question: 'Puis-je annuler mon abonnement à tout moment ?',
      answer: 'Oui, vous pouvez annuler votre abonnement à tout moment depuis votre compte. Vous conserverez l\'accès aux fonctionnalités Pro jusqu\'à la fin de votre période payée.'
    },
    {
      id: 'trial',
      question: 'Que se passe-t-il à la fin de mon essai de 14 jours ?',
      answer: 'À la fin de l\'essai gratuit, vous pouvez choisir de souscrire au plan Pro ou de continuer avec le plan Gratuit. Aucune carte bancaire n\'est requise pendant l\'essai.'
    },
    {
      id: 'occitan',
      question: 'L\'accès pour l\'Occitan est-il vraiment gratuit pour toujours ?',
      answer: 'Absolument ! Ankilang est né en Occitanie et nous nous engageons à offrir toutes les fonctionnalités Pro pour l\'Occitan de manière permanente et gratuite. C\'est notre contribution à la préservation de cette langue.'
    },
    {
      id: 'payment',
      question: 'Quels sont les moyens de paiement acceptés ?',
      answer: 'Nous acceptons toutes les cartes bancaires (Visa, Mastercard, American Express) via notre partenaire de paiement sécurisé Stripe.'
    }
  ]

  // Données du tableau comparatif
  const comparisonFeatures = [
    { feature: "Export ANKI", free: true, pro: true },
    { feature: "Paquets (hors Occitan)", free: "Jusqu'à 3", pro: "Illimités" },
    { feature: "Cartes / paquet", free: "Jusqu'à 50", pro: "Illimités" },
    { feature: "Traductions automatiques", free: "50 offertes", pro: "Illimitées*" },
    { feature: "Génération Audio", free: false, pro: true },
    { feature: "Ajout d'Images", free: false, pro: true },
    { feature: "Support prioritaire", free: false, pro: true },
    { feature: "Nouvelles fonctionnalités en avant-première", free: false, pro: true }
  ]

  // Fonctions pour rendre les cellules du tableau
  const renderCell = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-green-500 mx-auto" />
      ) : (
        <X className="w-5 h-5 text-slate-400 mx-auto" />
      )
    }
    return <span className="text-slate-700">{value}</span>
  }

  return (
    <>
      <PageMeta
        title="Tarifs — Ankilang"
        description="Choisissez le plan qui vous convient. Occitan gratuit à vie, plan Pro pour toutes les autres langues avec essai gratuit de 14 jours."
        keywords="tarifs ankilang, abonnement flashcards, prix anki, occitan gratuit, plan pro"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Ankilang Pro",
          "description": "Créez vos flashcards Anki en 2 minutes",
          "offers": [
            {
              "@type": "Offer",
              "name": "Plan Gratuit",
              "price": "0",
              "priceCurrency": "EUR"
            },
            {
              "@type": "Offer",
              "name": "Plan Pro Mensuel",
              "price": "4.99",
              "priceCurrency": "EUR"
            },
            {
              "@type": "Offer",
              "name": "Plan Pro Annuel",
              "price": "49.99",
              "priceCurrency": "EUR"
            }
          ]
        }}
      />

      {/* Header Cohérent avec la Landing Page */}
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
              <a
                href="/abonnement"
                className="text-violet-600 font-semibold transition-colors duration-200"
              >
                Tarifs
              </a>
              <a
                href="/#mission"
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
        {/* SECTION 1: TITRE */}
        <section className="text-center px-4 pt-24 pb-16 sm:pt-32 sm:pb-20 bg-white">
          <div className="max-w-4xl mx-auto">
            <motion.h1
              className="text-slate-900 font-extrabold text-4xl sm:text-5xl tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Un plan pour chaque besoin.
            </motion.h1>
            <motion.p
              className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Que vous soyez passionné par l'Occitan ou polyglotte, Ankilang s'adapte à votre apprentissage.
            </motion.p>
          </div>
        </section>

        {/* SECTION 2: TOGGLE ANNUEL/MENSUEL */}
        <section className="pb-12 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              className="flex items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className={`text-sm font-medium ${!isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
                Mensuel
              </span>
              
              {/* Toggle Switch */}
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 ${
                  isAnnual ? 'bg-violet-600' : 'bg-slate-300'
                }`}
                role="switch"
                aria-checked={isAnnual}
                aria-label="Basculer entre mensuel et annuel"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAnnual ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>

              <span className={`text-sm font-medium ${isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
                Annuel
              </span>

              {/* Badge Économie */}
              {isAnnual && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full"
                >
                  Économisez 16%
                </motion.span>
              )}
            </motion.div>
          </div>
        </section>

        {/* SECTION 3: CARTES DE TARIFS */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Carte Gratuit */}
              <motion.div
                className="bg-white rounded-lg border border-slate-200 p-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
              >
                <h2 className="text-2xl font-bold text-slate-900">Gratuit</h2>
                <p className="mt-2 text-slate-600">
                  Pour découvrir Ankilang et pour les amoureux de l'Occitan.
                </p>
                
                <div className="mt-6 mb-8">
                  <span className="text-5xl font-extrabold text-slate-900">0€</span>
                  <span className="text-slate-600 ml-2">/ à vie</span>
                </div>

                <a
                  href="/auth/register"
                  className="block w-full text-center bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                >
                  Commencer
                </a>

                <ul className="mt-8 space-y-4">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600">Export ANKI illimité</span>
                  </li>
                  <li className="text-sm font-semibold text-slate-900 mt-6">Pour l'Occitan :</li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600">Paquets & Cartes illimités</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600">Toutes les fonctionnalités Pro</span>
                  </li>
                  <li className="text-sm font-semibold text-slate-900 mt-6">Pour les autres langues :</li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600">Jusqu'à 3 paquets</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600">Jusqu'à 50 cartes par paquet</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600">50 traductions automatiques offertes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-400">Génération Audio</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-400">Ajout d'Images</span>
                  </li>
                </ul>
              </motion.div>

              {/* Carte Pro */}
              <motion.div
                className="bg-white rounded-lg ring-2 ring-violet-600 p-8 relative"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
              >
                {/* Badge Recommandé */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-violet-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Recommandé
                </div>

                <h2 className="text-2xl font-bold text-slate-900">Pro</h2>
                <p className="mt-2 text-slate-600">
                  Pour les apprenants sérieux qui veulent décupler leur efficacité.
                </p>
                
                <div className="mt-6 mb-8">
                  <span className="text-5xl font-extrabold text-slate-900">
                    {isAnnual ? '49,99€' : '4,99€'}
                  </span>
                  <span className="text-slate-600 ml-2">
                    / {isAnnual ? 'an' : 'mois'}
                  </span>
                </div>

                <a
                  href="/auth/register"
                  className="block w-full text-center bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                >
                  Passer Pro
                </a>

                <ul className="mt-8 space-y-4">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600">Export ANKI illimité</span>
                  </li>
                  <li className="text-sm font-semibold text-slate-900 mt-6">Pour toutes les langues :</li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600">Paquets & Cartes illimités</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600">Toutes les fonctionnalités avancées</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600">Traductions & Audio illimités*</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600">Accès en avant-première aux nouveautés</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600">Support prioritaire</span>
                  </li>
                </ul>

                <p className="mt-6 text-xs text-slate-500">
                  * Soumis à une politique d'usage raisonnable.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION 4: TABLEAU COMPARATIF */}
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <SectionTitle>Comparaison détaillée</SectionTitle>
              <p className="mt-4 text-lg text-slate-600">
                Toutes les fonctionnalités en un coup d'œil.
              </p>
            </div>

            <motion.div
              className="overflow-x-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left py-4 px-6 font-semibold text-slate-900">Fonctionnalité</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-900">Gratuit</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-900 bg-violet-50">Pro</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((item, index) => (
                    <tr key={index} className="border-t border-slate-100">
                      <td className="py-4 px-6 text-slate-700 font-medium">{item.feature}</td>
                      <td className="py-4 px-6 text-center">{renderCell(item.free)}</td>
                      <td className="py-4 px-6 text-center bg-violet-50/30">{renderCell(item.pro)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

            <p className="mt-6 text-sm text-slate-500 text-center">
              * Soumis à une politique d'usage raisonnable pour éviter les abus.
            </p>
          </div>
        </section>

        {/* SECTION 5: FAQ */}
        <section className="py-20 bg-slate-50">
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
              <FAQAccordion items={pricingFAQ} />
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer Identique à la Landing Page */}
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

