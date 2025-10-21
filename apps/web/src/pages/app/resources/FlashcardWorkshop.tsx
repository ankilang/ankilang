/**
 * @deprecated Ce composant n'est plus utilisé - la page Workshop a été supprimée.
 * Conservé temporairement pour référence historique.
 */
import { motion } from 'framer-motion'
import PageMeta from '../../../components/seo/PageMeta'

const modules = [
  {
    title: 'Structurer un thème complet',
    content: [
      "Définir une intention : vocabulaire de base, conjugaison, phrase type.",
      "Préparer des tags cohérents pour filtrer facilement dans Anki.",
      "Utiliser les champs extra pour ajouter contexte, exemples ou remarques culturelles.",
    ],
  },
  {
    title: 'Optimiser recto / verso',
    content: [
      "Sur le recto : une question ou un mot isolé. Pas de liste.",
      "Sur le verso : réponse claire + variation (synonyme, exemple).",
      "Tester la carte dans l’interface Ankilang avant export pour vérifier la lisibilité.",
    ],
  },
  {
    title: 'Exploitations audio et image',
    content: [
      "Illustrer avec Pexels uniquement si l’image apporte de la valeur (éviter le décor inutile).",
      "Le TTS doit rester court : prononcer la réponse, pas relire une phrase entière.",
      "Penser à nettoyer les fichiers superflus dans le Storage Appwrite avant export.",
    ],
  },
  {
    title: 'Checklist avant export',
    content: [
      "Relire les champs obligatoires (recto / verso ou clozer).",
      "Vérifier les accents/orthographe pour éviter les corrections dans Anki.",
      "Exporter et tester l’import dans Anki Desktop (ou AnkiWeb) sur un petit deck témoin.",
    ],
  },
]

export default function FlashcardWorkshop() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-purple/60 via-white to-pastel-green/40">
      <PageMeta
        title="Atelier Flashcards — Ankilang"
        description="Guides avancés pour concevoir des paquets de cartes professionnels."
      />
      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-white/95 shadow-xl border border-white/60 px-6 sm:px-10 py-10 backdrop-blur"
        >
          <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-dark-charcoal">
            Atelier Flashcards
          </h1>
          <p className="mt-3 text-dark-charcoal/70">
            Méthodes avancées pour construire des paquets solides, prêts à l’import Anki.
          </p>

          <div className="mt-8 space-y-7">
            {modules.map((module) => (
              <div key={module.title} className="rounded-2xl border border-pastel-purple/40 bg-white px-5 py-4 shadow-sm">
                <h2 className="font-display text-xl text-dark-charcoal">{module.title}</h2>
                <ul className="mt-3 list-disc pl-5 space-y-2 text-sm text-dark-charcoal/70">
                  {module.content.map(point => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
