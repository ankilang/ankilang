import { useEffect } from 'react'
import PageMeta from '../components/seo/PageMeta'
import TextRotatorFade from '../components/typography/TextRotatorFade'
import FAQAccordion from '../components/landing/FAQAccordion'
import { BentoGrid, BentoTile, StatementTile, DataTile, FeatureTile } from '../components/landing/Bento'
import OccitanCallout from '../components/landing/OccitanCallout'
import CommunityOrbit from '../components/illustrations/CommunityOrbit'



export default function Landing() {
  // Hook pour reveal au scroll - Version améliorée
  useEffect(() => {
    const els = document.querySelectorAll('.reveal-up, .reveal-fade, .reveal-scale');
    
    // Un seul observer partagé avec seuil 0.2
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-inview');
          // Optionnel : arrêter d'observer une fois visible
          // io.unobserve(entry.target);
        }
      });
    }, { 
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px' // Déclenche un peu avant
    });
    
    els.forEach(el => io.observe(el));
    
    return () => io.disconnect();
  }, []);

  return (
    <>
      <PageMeta
        title="Ankilang — Maîtrisez les langues avec des flashcards intelligentes"
        description="Transformez votre apprentissage des langues avec des flashcards personnalisées. Créez, partagez et maîtrisez les langues efficacement."
      />

      {/* Schema.org FAQPage pour SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Comment fonctionne Ankilang ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Ankilang vous permet de créer des flashcards personnalisées pour apprendre les langues. Créez vos cartes, révisez régulièrement et maîtrisez progressivement la langue de votre choix."
                }
              },
              {
                "@type": "Question",
                "name": "Puis-je exporter mes flashcards vers Anki ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Oui, Ankilang permet d'exporter vos flashcards au format .apkg compatible avec Anki, pour une utilisation hors ligne et une révision optimisée."
                }
              },
              {
                "@type": "Question",
                "name": "Les flashcards en occitan sont-elles gratuites ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Oui, toutes les flashcards en occitan sont entièrement gratuites et illimitées, pour promouvoir l'apprentissage de cette langue régionale."
                }
              },
              {
                "@type": "Question",
                "name": "Quels types de flashcards puis-je créer ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Ankilang supporte les flashcards Basic (question-réponse) et Cloze (texte à trous), avec possibilité d'ajouter des images et de l'audio."
                }
              },
              {
                "@type": "Question",
                "name": "Puis-je partager mes decks avec la communauté ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Oui, vous pouvez partager vos decks avec la communauté Ankilang et découvrir ceux créés par d'autres apprenants."
                }
              }
            ]
          })
        }}
      />

      {/* Wrapper principal - Background simple pour laisser place aux auroras */}
      <main className="relative min-h-screen overflow-hidden bg-white dark:bg-slate-950 pwa-container">
        
        {/* Aurora global */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
          <div className="aurora-layer aurora-slow" />
        </div>
        
        {/* Container principal */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* HERO - 2 tuiles pleine largeur */}
          <section className="relative py-12 sm:py-16">
            {/* Aurora hero ciblée */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
              <div className="aurora-hero" />
            </div>
            
            <BentoGrid className="mb-16 gap-4 sm:gap-6 lg:gap-8 relative z-10">
            {/* Tuile texte */}
            <BentoTile colSpan={4} smColSpan={6} lgColSpan={6} className="flex flex-col justify-center reveal-up hero-container">
              <h1 className="hero-title gradient-title max-w-[26ch] mb-6">
                Maîtrisez les langues avec des flashcards intelligentes
              </h1>
              
              {/* Animation de langues conservée intégralement */}
              <p className="hero-subtitle text-gray-700 mb-4">
                <span>Créez vos flashcards pour apprendre&nbsp;</span>
                <span className="language-rotator">
                  <TextRotatorFade
                    items={[
                      <strong>l'anglais 🇬🇧</strong>,
                      <strong>l'espagnol 🇪🇸</strong>,
                      <strong>le portugais 🇵🇹</strong>,
                      <strong>le suédois 🇸🇪</strong>,
                      <strong>l'italien 🇮🇹</strong>,
                      <strong>l'allemand 🇩🇪</strong>,
                      <strong>le japonais 🇯🇵</strong>,
                      <strong>le mandarin 🇨🇳</strong>,
                      <strong>le coréen 🇰🇷</strong>
                    ]}
                    reserveLabel="le mandarin 🇨🇳"
                    displayMs={3000}
                    fadeMs={350}
                    pauseOnHover={false}
                  />
                </span>
                <span className="sr-only">Créez vos flashcards pour apprendre des langues.</span>
                <span className="sr-only">Langues prises en charge : rotation visuelle</span>
              </p>

              {/* Badge occitan */}
              <div className="mb-6">
                <span className="chip" aria-label="Occitan gratuit">
                  Les flashcards en occitan sont gratuites
                  <img 
                    src="/flags/oc.webp" 
                    alt="Drapeau occitan" 
                    className="ml-2 hero-image-sm" 
                    width="20"
                    height="16"
                    loading="lazy"
                    decoding="async"
                  />
                </span>
              </div>

              {/* CTAs avec badge animé sur le principal */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="/app/community?lang=oc"
                  className="btn-primary cta-shimmer cta-badge hero-cta min-h-[44px] inline-flex items-center justify-center"
                >
                  <span>Commencer gratuitement</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
                <a
                  href="#how-it-works"
                  className="btn-secondary hero-cta min-h-[44px] inline-flex items-center justify-center"
                >
                  <span>Voir comment ça marche</span>
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="sr-only">Ouvrir la page "Comment ça marche"</span>
                </a>
              </div>
            </BentoTile>

            {/* Tuile visuelle */}
            <BentoTile colSpan={4} smColSpan={6} lgColSpan={6} className="flex items-center justify-center reveal-up hero-container">
              <div className="tile-bento bento-accent w-full h-full flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="hero-image rounded-2xl bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-blue-500/20 mb-4 flex items-center justify-center">
                    <svg className="w-12 h-12 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <span className="chip">Illustration à venir</span>
                </div>
              </div>
            </BentoTile>
            </BentoGrid>
          </section>

          {/* Construisons Ankilang ensemble - Grille bento variée */}
          <section className="py-12 sm:py-16">
            <BentoGrid className="mb-16">
              {/* Tuile statement - Créer vos decks */}
              <StatementTile 
                title="Créer vos decks"
                subtitle="Concevez des cartes à votre image"
                colSpan={4} smColSpan={6} lgColSpan={6}
                className="reveal-up"
              >
                <p className="mb-4">
                  Personnalisez vos flashcards avec vos propres exemples, images et audio. 
                  Structurez vos thèmes selon vos besoins d'apprentissage.
                </p>
                <div className="flex items-center gap-2 text-sm text-violet-600 dark:text-violet-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Flashcards Basic et Cloze</span>
                </div>
              </StatementTile>

              {/* Tuile visuelle - Créer vos decks (illustration SVG) */}
              <BentoTile colSpan={4} smColSpan={6} lgColSpan={6} className="reveal-up reveal-up-delay-1">
                <img
                  src="/illustrations/illu-create-decks.svg"
                  alt=""
                  aria-hidden="true"
                  width={560}
                  height={420}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  draggable="false"
                  className="w-full h-auto rounded-2xl shadow-soft-lg a11y-focus select-none"
                />
              </BentoTile>

              {/* Tuile data - Zéro pub */}
              <DataTile 
                metric="Zéro"
                label="Publicité"
                colSpan={2} smColSpan={3} lgColSpan={3}
                className="reveal-up reveal-up-delay-2"
                icon={
                  <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                }
              />

              {/* Tuile data - Hors-ligne */}
              <DataTile 
                metric="100%"
                label="Hors-ligne"
                colSpan={2} smColSpan={3} lgColSpan={3}
                className="reveal-up reveal-up-delay-3"
                icon={
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
              />

              {/* Tuile statement - S'inspirer de la communauté */}
              <StatementTile 
                title="S'inspirer de la communauté"
                subtitle="Explorez et adaptez"
                colSpan={4} smColSpan={6} lgColSpan={6}
                className="reveal-up reveal-up-delay-4"
              >
                <p className="mb-4">
                  Découvrez les decks créés par d'autres apprenants. 
                  Adaptez-les à vos besoins et partagez vos propres créations.
                </p>
                <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Partage et collaboration</span>
                </div>
              </StatementTile>

              {/* Tuile visuelle — Communauté orbitale (SVG animé, zéro CLS) */}
              <BentoTile colSpan={4} smColSpan={6} lgColSpan={6} className="reveal-up reveal-up-delay-4">
                <div className="rounded-2xl shadow-soft-lg overflow-hidden">
                  <CommunityOrbit width={560} height={420} />
                </div>
              </BentoTile>

              {/* Tuile data - Langues supportées */}
              <DataTile 
                metric="9+"
                label="Langues"
                colSpan={2} smColSpan={3} lgColSpan={3}
                className="reveal-up reveal-up-delay-4"
                icon={
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                }
              />

              {/* Tuile data - Occitan gratuit */}
              <DataTile 
                metric="100%"
                label="Occitan gratuit"
                colSpan={2} smColSpan={3} lgColSpan={3}
                className="reveal-up reveal-up-delay-4"
                icon={
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                }
              />
            </BentoGrid>
          </section>

          {/* Comment ça marche - Grille bento avec statement */}
          <section className="py-12 sm:py-16">
            <BentoGrid className="mb-16">
              {/* Tuile statement - Méthode éprouvée */}
              <StatementTile 
                title="Méthode éprouvée"
                subtitle="Basée sur la science cognitive"
                colSpan={4} smColSpan={6} lgColSpan={6}
                className="reveal-scale"
              >
                <p className="mb-4">
                  Notre approche s'appuie sur l'algorithme de répétition espacée, 
                  scientifiquement prouvé pour optimiser la rétention à long terme.
                </p>
                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Répétition espacée intelligente</span>
                </div>
              </StatementTile>

              {/* FeatureTile - Étape 1 */}
              <FeatureTile 
                icon={
                  <svg className="w-8 h-8 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
                title="Créez vos cartes"
                description="Concevez des flashcards personnalisées avec vos propres exemples."
                colSpan={4} smColSpan={6} lgColSpan={3}
                className="reveal-up reveal-up-delay-1"
              />

              {/* FeatureTile - Étape 2 */}
              <FeatureTile 
                icon={
                  <svg className="w-8 h-8 text-fuchsia-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
                title="Révisez régulièrement"
                description="Révisez vos cartes selon un algorithme intelligent qui s'adapte à votre progression."
                colSpan={4} smColSpan={6} lgColSpan={3}
                className="reveal-up reveal-up-delay-2"
              />

              {/* Tuile visuelle - Étudiez régulièrement (illustration SVG) */}
              <BentoTile colSpan={4} smColSpan={6} lgColSpan={3} className="reveal-up reveal-up-delay-2">
                <img
                  src="/illustrations/illu-study-rhythm.svg"
                  alt=""
                  aria-hidden="true"
                  width={560}
                  height={420}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  draggable="false"
                  className="w-full h-auto rounded-2xl shadow-soft-lg a11y-focus select-none"
                />
              </BentoTile>

              {/* FeatureTile - Étape 3 */}
              <FeatureTile 
                icon={
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                title="Maîtrisez la langue"
                description="Progressez de manière durable et atteignez un niveau de maîtrise solide."
                colSpan={4} smColSpan={6} lgColSpan={3}
                className="reveal-up reveal-up-delay-3"
              />

              {/* Tuile visuelle - Maîtrisez la langue (illustration SVG) */}
              <BentoTile colSpan={4} smColSpan={6} lgColSpan={6} className="reveal-up reveal-up-delay-3">
                <img
                  src="/illustrations/illu-mastery-journey.svg"
                  alt=""
                  aria-hidden="true"
                  width={560}
                  height={420}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  draggable="false"
                  className="w-full h-auto rounded-2xl shadow-soft-lg a11y-focus select-none"
                />
              </BentoTile>
            </BentoGrid>
          </section>

          {/* Pourquoi utiliser Ankilang - Grille bento avec statement */}
          <section className="py-12 sm:py-16">
            <BentoGrid className="mb-16">
              {/* Tuile statement - Avantages clés */}
              <StatementTile 
                title="Pourquoi choisir Ankilang ?"
                subtitle="Une approche différente de l'apprentissage"
                colSpan={4} smColSpan={6} lgColSpan={6}
                className="reveal-fade"
              >
                <p className="mb-4">
                  Nous combinons la simplicité d'utilisation avec des fonctionnalités avancées 
                  pour vous offrir une expérience d'apprentissage optimale.
                </p>
                <div className="flex items-center gap-2 text-sm text-violet-600 dark:text-violet-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Performance et simplicité</span>
                </div>
              </StatementTile>

              {/* DataTile - Personnalisé */}
              <DataTile 
                metric="100%"
                label="Personnalisé"
                colSpan={2} smColSpan={3} lgColSpan={3}
                className="reveal-up reveal-up-delay-1"
                icon={
                  <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                }
              />

              {/* DataTile - Efficace */}
              <DataTile 
                metric="×3"
                label="Plus efficace"
                colSpan={2} smColSpan={3} lgColSpan={3}
                className="reveal-up reveal-up-delay-2"
                icon={
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
              />

              {/* DataTile - Communautaire */}
              <DataTile 
                metric="∞"
                label="Communautaire"
                colSpan={2} smColSpan={3} lgColSpan={3}
                className="reveal-up reveal-up-delay-3"
                icon={
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
              />

              {/* DataTile - Fiable */}
              <DataTile 
                metric="100%"
                label="Fiable"
                colSpan={2} smColSpan={3} lgColSpan={3}
                className="reveal-up reveal-up-delay-4"
                icon={
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
            </BentoGrid>
          </section>

          {/* =========================================================
              SECTION — Ankilang soutient l'apprentissage de l'occitan
              - Tuiles éditoriales avec aurora violet/rose intensifiée
              - CTA secondaire avec anneau focus visible
            ========================================================= */}
          <section
            aria-labelledby="occitan-support-title"
            className="relative py-12 sm:py-16"
          >
            {/* Aurora occitan intensifiée */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
              <div className="aurora-occitan" />
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <header className="mb-8 sm:mb-12 reveal-up">
                <h2 id="occitan-support-title" className="hero-title gradient-title mb-4">
                  Ankilang soutient l'apprentissage de l'occitan
                </h2>
                <p className="hero-subtitle text-gray-600 dark:text-gray-400 max-w-3xl">
                  Préserver une langue, c'est préserver une culture. Nous facilitons l'accès à l'occitan
                  pour encourager son apprentissage et sa transmission au quotidien.
                </p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Tuile éditoriale - Transmission */}
                <article className="lg:col-span-2 tile-editorial p-6 sm:p-8 reveal-up">
                  <div className="flex items-start gap-4 sm:gap-6">
                    <img
                      src="/flags/oc.webp"
                      width="48"
                      height="48"
                      alt="Drapeau occitan"
                      className="shrink-0 rounded-lg hero-image-sm"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        Favoriser la transmission
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                        Nous mettons en avant des ressources et des decks pour faciliter la découverte
                        et l'étude de l'occitan, afin que chacun puisse contribuer à sa vitalité.
                        Notre plateforme offre un espace dédié pour partager et découvrir du contenu
                        authentique en occitan.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <a
                          href="/app/community?lang=oc"
                          className="cta-secondary inline-flex items-center justify-center focus-visible:ring-2 focus-visible:ring-violet-500"
                          data-analytics="lp_occitan_support_cta"
                          onClick={() => console.log('[analytics] lp_occitan_support_cta')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <span>Explorer les decks en occitan</span>
                        </a>
                        <a
                          href="/app/themes/new?lang=oc"
                          className="cta-secondary inline-flex items-center justify-center focus-visible:ring-2 focus-visible:ring-violet-500"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span>Créer un deck occitan</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </article>

                {/* Tuile illustration stylisée */}
                <aside className="tile-editorial p-6 sm:p-8 reveal-up reveal-up-delay-1">
                  <div className="text-center h-full flex flex-col justify-center">
                    <div className="occitan-illustration mb-6">
                      <svg className="w-16 h-16 text-violet-600 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      Patrimoine culturel
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                      L'occitan est une langue romane parlée dans le sud de la France. 
                      Nous contribuons à sa préservation en facilitant l'apprentissage.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-violet-600 dark:text-violet-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>100% gratuit</span>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </section>

          {/* Section Occitan - Tuile large */}
          <section className="py-12 sm:py-16">
            <BentoGrid className="mb-16">
              <BentoTile colSpan={4} smColSpan={6} lgColSpan={12}>
                <OccitanCallout />
              </BentoTile>
            </BentoGrid>
          </section>

          {/* FAQ longue */}
          <section className="py-12 sm:py-16">
            <BentoGrid className="mb-16">
              <BentoTile colSpan={4} smColSpan={6} lgColSpan={12} className="reveal-up">
                <div className="tile-bento bento-accent p-6">
                  <FAQAccordion title="Questions fréquentes" />
                </div>
              </BentoTile>
            </BentoGrid>
          </section>

          {/* CTA final */}
          <section className="relative py-12 sm:py-16 safe-area-bottom">
            {/* Aurora footer intensifiée */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
              <div className="aurora-footer" />
            </div>
            <BentoGrid className="relative z-10">
              <BentoTile colSpan={4} smColSpan={6} lgColSpan={12} className="reveal-up">
                <div className="footer-cta p-8 sm:p-12 text-center perf-optimized">
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    Prêt à commencer votre apprentissage ?
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                    Rejoignez la communauté Ankilang et transformez votre façon d'apprendre les langues.
                    Commencez gratuitement dès aujourd'hui.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="/app/community?lang=oc"
                      className="btn-primary cta-shimmer cta-badge cta-final a11y-focus min-h-[48px] inline-flex items-center justify-center focus-visible:ring-2 focus-visible:ring-violet-500"
                    >
                      <span>Commencer gratuitement</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </a>
                    <a
                      href="/app/themes/new"
                      className="btn-secondary cta-final a11y-focus min-h-[48px] inline-flex items-center justify-center focus-visible:ring-2 focus-visible:ring-violet-500"
                    >
                      <span>Créer mon premier deck</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </a>
                  </div>
                  <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Aucune carte de crédit requise</span>
                  </div>
                </div>
              </BentoTile>
            </BentoGrid>
          </section>
        </div>
      </main>
    </>
  )
}
