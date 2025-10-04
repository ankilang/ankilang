import { BookOpen, Construction } from 'lucide-react'
import PageMeta from '../../../components/seo/PageMeta'

export default function LessonsIndex() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageMeta 
        title="Leçons — Ankilang" 
        description="Les leçons interactives arrivent bientôt sur Ankilang."
      />
      
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
          <BookOpen className="w-10 h-10 text-blue-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Leçons en cours de développement
        </h1>
        
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Nous travaillons actuellement sur un système de leçons interactives 
          pour enrichir votre expérience d'apprentissage. Cette fonctionnalité 
          sera disponible prochainement.
        </p>
        
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Construction className="w-4 h-4" />
          <span>Fonctionnalité en développement</span>
        </div>
      </div>
    </div>
  )
}