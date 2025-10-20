import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useState, useEffect } from 'react'
import PageMeta from '../components/seo/PageMeta'
import FlagMarquee from '../components/landing/FlagMarquee'
import BenefitsMarquee from '../components/landing/BenefitsMarquee'

import SectionTitle from '../components/landing/SectionTitle'
import VibrantMissionSection from '../components/landing/VibrantMissionSection'
import FeaturesSection from '../components/landing/FeaturesSection'
import PricingSection from '../components/landing/PricingSection'
import FAQSection from '../components/landing/FAQSection'
import EasterEgg from '../components/landing/EasterEgg'
import ParallaxElements from '../components/landing/ParallaxElements'
import AnkilangLogo from '../components/ui/AnkilangLogo'
// import { useAccessibility } from '../hooks/useAccessibility'
// import { useDarkMode } from '../hooks/useDarkMode'

export default function NewLanding() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const { prefersReducedMotion } = useAccessibility();
  // const { darkMode, colorScheme } = useDarkMode();
  
  // Hook pour l'interaction avec la souris et la police variable
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const fontVariationSettings = useTransform(
    [mouseX, mouseY],
    (input: number[]) => {
      const [x, y] = input
      if (x === undefined || y === undefined) return "'wght' 900"
      
      // Calculer la distance depuis le centre de l'écran
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
      const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2)
      
      // Interpoler la graisse de 900 (centre) à 400 (bords)
      const weight = 900 - (distance / maxDistance) * 500
      const clampedWeight = Math.max(400, Math.min(900, weight))
      return `'wght' ${clampedWeight}`
    }
  )

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouseX.set(event.clientX)
      mouseY.set(event.clientY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => { window.removeEventListener('mousemove', handleMouseMove); }
  }, [mouseX, mouseY])

  return (
    <>
      <PageMeta 
        title="Ankilang - Créez des flashcards parfaites pour Anki en 2 minutes"
        description="Transformez vos listes de vocabulaire en flashcards Anki professionnelles. Import CSV, traduction automatique, audio. Occitan gratuit à vie."
        keywords="flashcards, Anki, apprentissage langues, occitan, export apkg, vocabulaire, révision, cartes mémoire"
        ogImage="/images/ankilang-og-image.jpg"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Ankilang",
          "applicationCategory": "EducationalApplication",
          "description": "Transformez vos listes de vocabulaire en flashcards Anki professionnelles",
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
          }
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-slate-100 dark:from-slate-900 dark:via-violet-900/20 dark:to-slate-800 hero-enhanced-contrast">
        <ParallaxElements />
        
        {/* Section 0: Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 dark:bg-slate-900/80 dark:border-slate-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              
                            {/* Logo Ankilang avec Easter Egg */}
              <EasterEgg>
                <motion.div 
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <AnkilangLogo size="default" animated={true} />
                  <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-violet-600 to-violet-800 bg-clip-text text-transparent">
                    Ankilang
                  </span>
                </motion.div>
              </EasterEgg>

              {/* Navigation Desktop */}
              <nav className="hidden lg:flex items-center gap-6 xl:gap-8 justify-center flex-1">
                {[
                  { name: 'Fonctionnalités', href: '#features', icon: '⚡' },
                  { name: 'Tarifs', href: '#pricing', icon: '💰' },
                  { name: 'Occitan', href: '#occitan', icon: '🏴' }
                ].map((item, index) => (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    className="group relative text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-200"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <span className="flex items-center gap-2">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm">
                        {item.icon}
                      </span>
                      {item.name}
                    </span>
                  </motion.a>
                ))}
              </nav>

              {/* Actions Desktop */}
              <div className="hidden lg:flex items-center gap-4">
                <motion.a
                  href="/auth/login"
                  className="text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-200"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  Se connecter
                </motion.a>
                <motion.a
                  href="/auth/register"
                  className="bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                >
                  S'inscrire gratuitement
                </motion.a>
              </div>

              {/* Actions Tablette (visible sur md et lg) */}
              <div className="hidden md:flex lg:hidden items-center gap-3">
                <motion.a
                  href="/auth/register"
                  className="bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                >
                  S'inscrire
                </motion.a>
              </div>

              {/* Menu mobile */}
              <div className="lg:hidden">
                <button
                  onClick={() => { setIsMenuOpen(!isMenuOpen); }}
                  className="text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Menu mobile dropdown */}
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden border-t border-slate-200 dark:border-slate-700 py-4"
              >
                <div className="flex flex-col gap-4">
                  {[
                    { name: 'Fonctionnalités', href: '#features' },
                    { name: 'Tarifs', href: '#pricing' },
                    { name: 'Occitan', href: '#occitan' }
                  ].map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-200"
                      onClick={() => { setIsMenuOpen(false); }}
                    >
                      {item.name}
                    </a>
                  ))}
                  <div className="flex flex-col gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <a
                      href="/auth/login"
                      className="text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-200"
                      onClick={() => { setIsMenuOpen(false); }}
                    >
                      Se connecter
                    </a>
                    <a
                      href="/auth/register"
                      className="bg-gradient-to-r from-violet-600 to-violet-700 text-white px-4 py-2 rounded-lg font-medium text-center"
                      onClick={() => { setIsMenuOpen(false); }}
                    >
                      S'inscrire gratuitement
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </header>

        {/* Section 1: Hero (Section d'Accroche) */}
        <section className="min-h-screen bg-pastel-green relative overflow-hidden">
          {/* Aurora effect */}
          <div className="aurora-hero absolute inset-0 pointer-events-none"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 flex flex-col items-center text-center min-h-screen">
            
            {/* Zone Centrale - Bloc de Texte Principal */}
            <motion.div 
              className="text-center mb-8 relative z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Titre "Ankilang" avec animation lettre par lettre */}
              <motion.h1 
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display-bold text-dark-charcoal leading-relaxed mb-4 overflow-visible pb-2"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      delay: 0.2,
                      staggerChildren: 0.05,
                    },
                  },
                }}
                initial="hidden"
                animate="visible"
              >
                {Array.from("Ankilang").map((letter, index) => (
                  <motion.span
                    key={index}
                    variants={{
                      hidden: { y: "100%" },
                      visible: { y: "0%" },
                    }}
                    className="inline-block"
                    style={{
                      fontVariationSettings: fontVariationSettings
                    }}
                  >
                    {letter === " " ? "\u00A0" : letter}
                  </motion.span>
                ))}
              </motion.h1>

              {/* Ligne de Contexte / Promesse */}
              <motion.p 
                className="text-lg sm:text-xl lg:text-2xl text-dark-charcoal/90 font-sans-normal mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                La nouvelle façon de créer vos{" "}
                <span className="font-sans-semibold text-pastel-purple">
                  flashcards de langues
                </span>
                .
                <FlagMarquee />
              </motion.p>
            </motion.div>

            {/* Checklist Animée */}
            <motion.div 
              className="text-center mb-8 relative z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-8">
                {/* Élément 1: Créez */}
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0, type: "spring", stiffness: 200 }}
                >
                  <motion.h2 
                    className="text-3xl sm:text-4xl lg:text-5xl font-cursive text-pastel-purple font-normal"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2, type: "spring", stiffness: 300 }}
                  >
                    Créez
                  </motion.h2>
                  <motion.div
                    className="text-2xl sm:text-3xl"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.4, type: "spring", stiffness: 400 }}
                  >
                    <span className="text-pastel-green">✔️</span>
                  </motion.div>
                </motion.div>

                {/* Élément 2: Exportez */}
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.6, type: "spring", stiffness: 200 }}
                >
                  <motion.h2 
                    className="text-3xl sm:text-4xl lg:text-5xl font-cursive text-pastel-purple font-normal"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.8, type: "spring", stiffness: 300 }}
                  >
                    Exportez
                  </motion.h2>
                  <motion.div
                    className="text-2xl sm:text-3xl"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2.0, type: "spring", stiffness: 400 }}
                  >
                    <span className="text-pastel-green">✔️</span>
                  </motion.div>
                </motion.div>

                {/* Élément 3: Apprenez */}
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 2.2, type: "spring", stiffness: 200 }}
                >
                  <motion.h2 
                    className="text-3xl sm:text-4xl lg:text-5xl font-cursive text-pastel-purple font-normal"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2.4, type: "spring", stiffness: 300 }}
                  >
                    Apprenez
                  </motion.h2>
                  <motion.div
                    className="text-2xl sm:text-3xl"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2.6, type: "spring", stiffness: 400 }}
                  >
                    <span className="text-pastel-green">✔️</span>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>

                            {/* Mention Spéciale Occitan */}
                <motion.p 
                  className="text-base sm:text-lg text-dark-charcoal/85 font-sans-normal mb-8 max-w-3xl mx-auto leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3.0, duration: 0.6 }}
                >
                  <span className="font-sans-normal">Et pour l'</span>
                  <span className="text-gradient-occitan">occitan</span>
                  <span className="font-sans-normal">, c'est </span>
                  <span className="font-sans-semibold text-pastel-purple">gratuit. Pour toujours.</span>
                  <span className="font-sans-normal italic"> Òc ben ! ❤️</span>
                </motion.p>

                {/* Sous-titre / Slogan */}
                <motion.p 
                  className="text-lg sm:text-xl lg:text-2xl text-dark-charcoal/80 font-sans-normal mb-10 max-w-4xl mx-auto leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3.5, duration: 0.6 }}
                >
                  Passez moins de temps à préparer, et plus de temps à mémoriser.
                </motion.p>

            {/* CTA Principal */}
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3.7, duration: 0.6 }}
            >
              <motion.a
                href="/auth/register"
                className="inline-flex items-center gap-3 bg-pastel-purple hover:bg-pastel-purple/90 text-dark-charcoal px-10 py-5 rounded-xl font-sans-semibold text-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Commencer gratuitement
                <motion.svg 
                  className="w-7 h-7" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  whileHover={{ x: 5 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
              </motion.a>
            </motion.div>

            {/* Texte de réassurance */}
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3.9, duration: 0.6 }}
            >
              <p className="text-slate-500 dark:text-slate-400 font-sans-normal">
                ✨ Inscription en 30 secondes.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Section 2: Bandeau de Bénéfices (Marquee) */}
                <section className="py-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 overflow-hidden">
          <BenefitsMarquee />
        </section>

        {/* Section 3: Fonctionnalités Clés */}
        <section id="features">
          <FeaturesSection />
        </section>

        {/* Section 4: La Mission Occitane */}
        <section id="occitan">
          <VibrantMissionSection />
        </section>

        {/* Section 5: Comment ça marche ? (Focus sur l'Action) */}




        {/* Section 6: Tarifs */}
        <section id="pricing">
          <PricingSection />
        </section>
        {/* Section 7: FAQ */}
        <section id="community">
          <FAQSection />
        </section>

        {/* Section 8: Dernier Appel à l'Action */}
        <section className="py-20 relative overflow-hidden">
          {/* Fond animé avec gradient */}
          <div className="absolute inset-0 bg-gradient-animated"></div>
          
          {/* Contenu principal */}
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            
            {/* Titre principal */}
            <motion.div 
              className="mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <SectionTitle className="final-cta">Prêt à créer ?</SectionTitle>
              <p className="text-xl sm:text-2xl text-white/90 font-sans-normal leading-relaxed max-w-3xl mx-auto">
                Rejoignez des milliers d'apprenants qui utilisent déjà Ankilang pour maîtriser leurs langues
              </p>
            </motion.div>

            {/* CTA Principal */}
            <motion.div 
              className="mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <a
                href="/auth/register"
                className="inline-flex items-center gap-4 bg-white text-slate-900 hover:bg-slate-50 px-10 py-5 rounded-2xl font-sans-bold text-xl transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Lancer l'application gratuitement
              </a>
            </motion.div>

            {/* Points de confiance */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="text-center">
                <div className="text-3xl font-display-bold text-white mb-2">14 jours</div>
                <div className="text-white/80 font-sans-normal">Essai gratuit</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-display-bold text-white mb-2">0€</div>
                <div className="text-white/80 font-sans-normal">Pour commencer</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-display-bold text-white mb-2">∞</div>
                <div className="text-white/80 font-sans-normal">Occitan gratuit</div>
              </div>
            </motion.div>

            {/* Note de réassurance */}
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <p className="text-white/70 font-sans-normal text-lg">
                Aucune carte de crédit requise • Inscription en 30 secondes • Annulation à tout moment
              </p>
            </motion.div>

          </div>

          {/* Éléments décoratifs flottants */}
          <motion.div 
            className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"
            animate={{ 
              y: [0, -20, 0],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-20 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"
            animate={{ 
              y: [0, 30, 0],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/8 rounded-full blur-lg"
            animate={{ 
              x: [0, 15, 0],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ 
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />

        </section>
      </div>
    </>
  )
}
