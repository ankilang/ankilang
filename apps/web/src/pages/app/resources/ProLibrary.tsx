import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import PageMeta from '../../../components/seo/PageMeta'

const packs = [
  {
    title: 'Occitan quotidien',
    description: '100 cartes de vocabulaire courant avec audio Votz intégré.',
    size: '100 cartes',
    to: '/app/themes',
  },
  {
    title: 'Voyage express',
    description: 'Phrases clés pour les transports, restaurants et hébergements.',
    size: '80 cartes',
    to: '/app/themes',
  },
  {
    title: 'Conjugaisons essentielles',
    description: 'Focus sur 6 temps verbaux avec exemples audio et images.',
    size: '120 cartes',
    to: '/app/themes',
  }
]

export default function ProLibrary() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-purple/40 to-pastel-green/40">
      <PageMeta
        title="Bibliothèque Pro — Ankilang"
        description="Packs de cartes prêts à l'emploi pour démarrer vos decks."
      />
      <div className="max-w-5xl mx-auto px-6 lg:px-10 py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-white/92 shadow-xl border border-white/60 px-6 sm:px-10 py-10 backdrop-blur"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-dark-charcoal">
                Bibliothèque Pro
              </h1>
              <p className="mt-2 text-dark-charcoal/70">
                Téléchargez des paquets thématiques prêts à importer dans Anki. Chaque pack est optimisé pour Ankilang (images, audio, tags).
              </p>
            </div>
            <Link to="/app/themes/new" className="btn-primary sm:self-start">
              Créer un nouveau thème
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {packs.map(pack => (
              <div key={pack.title} className="rounded-2xl border border-pastel-purple/40 bg-white px-5 py-4 shadow-sm flex flex-col justify-between">
                <div>
                  <h2 className="font-display text-xl text-dark-charcoal">{pack.title}</h2>
                  <p className="mt-2 text-sm text-dark-charcoal/70">{pack.description}</p>
                  <p className="mt-2 text-xs uppercase tracking-wide text-purple-600 font-semibold">
                    {pack.size}
                  </p>
                </div>
                <Link
                  to={pack.to}
                  className="mt-4 inline-block text-sm text-purple-600 hover:text-purple-800"
                >
                  Télécharger le pack (coming soon)
                </Link>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
