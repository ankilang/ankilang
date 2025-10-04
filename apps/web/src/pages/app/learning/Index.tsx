import { BookOpen, Construction } from 'lucide-react'
import PageMeta from '../../../components/seo/PageMeta'

export default function LearningIndex() {
  return (
    <>
      <PageMeta 
        title="Apprentissage — Ankilang" 
        description="Les decks d'apprentissage arrivent bientôt sur Ankilang."
      />

      {/* Hero pastel */}
      <section className="bg-pastel-mint relative overflow-hidden min-h-[50vh] flex items-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pastel-purple/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-pastel-rose/30 rounded-full blur-2xl" />
        <div className="relative w-full px-6 lg:px-12 py-12">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
              <BookOpen className="w-10 h-10 text-blue-600" />
            </div>
            
            <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl font-bold text-dark-charcoal mb-4">
              Apprentissage
            </h1>
            
            <p className="font-inter text-lg sm:text-xl text-dark-charcoal/70 mb-8 max-w-2xl mx-auto">
              Nous travaillons actuellement sur un catalogue de decks d'apprentissage 
              premium pour enrichir votre expérience. Cette fonctionnalité sera 
              disponible prochainement.
            </p>
            
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Construction className="w-4 h-4" />
              <span>Fonctionnalité en développement</span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}