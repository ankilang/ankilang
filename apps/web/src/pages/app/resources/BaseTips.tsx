import { motion } from 'framer-motion'
import PageMeta from '../../../components/seo/PageMeta'

const tips = [
  {
    title: 'Rester concis',
    description: "Une carte = une information. Évite les phrases trop longues ou les notions multiples sur le même verso.",
  },
  {
    title: 'Préserver le contexte',
    description: "Utilise des exemples concrets, juste assez de contexte pour que la réponse soit évidente sans relire tout un paragraphe.",
  },
  {
    title: 'Favoriser la reconnaissance active',
    description: "Préfère les formulations qui obligent à produire la réponse (traduction, définition) plutôt que les questions oui/non.",
  },
  {
    title: 'Uniformiser les tags',
    description: "Classe tes cartes par thèmes, niveaux ou temps verbaux. Les tags facilitent les exports ciblés vers Anki.",
  },
]

export default function BaseTips() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-green/60 to-pastel-purple/40">
      <PageMeta
        title="Conseils de base — Ankilang"
        description="Bonnes pratiques pour créer des flashcards efficaces."
      />
      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-white/90 shadow-xl border border-white/60 px-6 sm:px-10 py-10 backdrop-blur"
        >
          <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-dark-charcoal">
            Conseils de base
          </h1>
          <p className="mt-3 text-dark-charcoal/70">
            Quelques réflexes simples pour construire des cartes claires et utiles avant de les exporter vers Anki.
          </p>

          <div className="mt-8 space-y-6">
            {tips.map((tip, index) => (
              <div key={tip.title} className="rounded-2xl border border-pastel-purple/40 bg-white px-5 py-4 shadow-sm">
                <h2 className="font-display text-xl text-dark-charcoal">{index + 1}. {tip.title}</h2>
                <p className="mt-2 text-sm text-dark-charcoal/70">{tip.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
