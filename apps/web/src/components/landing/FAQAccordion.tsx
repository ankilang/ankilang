import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FAQItem {
  id: string
  question: string
  answer: string
}

interface FAQAccordionProps {
  items?: FAQItem[]
  title?: string
}

export default function FAQAccordion({ items, title }: FAQAccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id)
    } else {
      newOpenItems.add(id)
    }
    setOpenItems(newOpenItems)
  }

  // FAQ longue par défaut si aucun items fourni
  const defaultItems = [
    {
      id: 'gratuit',
      question: 'Ankilang est-il vraiment gratuit ?',
      answer: 'Oui ! L\'apprentissage en occitan est entièrement gratuit. D\'autres langues peuvent avoir des fonctionnalités premium pour des contenus avancés.'
    },
    {
      id: 'algorithme',
      question: 'Comment fonctionne l\'algorithme de révision ?',
      answer: 'Notre algorithme s\'adapte à votre rythme d\'apprentissage et vous présente les cartes au moment optimal pour la mémorisation, basé sur la courbe de l\'oubli.'
    },
    {
      id: 'partage',
      question: 'Puis-je partager mes decks avec d\'autres ?',
      answer: 'Absolument ! Vous pouvez partager vos decks avec la communauté et découvrir ceux créés par d\'autres utilisateurs. La collaboration enrichit l\'apprentissage.'
    },
    {
      id: 'export',
      question: 'Puis-je exporter mes cartes vers Anki ?',
      answer: 'Oui, vous pouvez exporter vos decks au format .apkg compatible avec Anki. Vos progrès et statistiques sont préservés lors de l\'export.'
    },
    {
      id: 'offline',
      question: 'Puis-je utiliser Ankilang hors ligne ?',
      answer: 'Ankilang fonctionne comme une PWA (Progressive Web App). Une fois installée, vous pouvez réviser vos cartes même sans connexion internet.'
    },
    {
      id: 'langues',
      question: 'Quelles langues sont supportées ?',
      answer: 'Nous supportons de nombreuses langues : anglais, espagnol, allemand, italien, portugais, japonais, coréen, mandarin, suédois, et bien sûr l\'occitan gratuitement.'
    },
    {
      id: 'confidentialite',
      question: 'Mes données sont-elles protégées ?',
      answer: 'Vos données personnelles sont protégées selon le RGPD. Nous ne partageons jamais vos informations personnelles et vous gardez le contrôle total de vos contenus.'
    },
    {
      id: 'communaute',
      question: 'Comment contribuer à la communauté ?',
      answer: 'Vous pouvez créer et partager vos decks, proposer des améliorations, signaler des erreurs, ou simplement encourager d\'autres apprenants dans leur parcours.'
    }
  ]

  const faqItems = items || defaultItems

  return (
    <div className="space-y-4 sm:space-y-6">
      {title && (
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">
          {title}
        </h2>
      )}
      
      <div className="space-y-2">
        {faqItems.map((item) => {
          const isOpen = openItems.has(item.id)
          
          return (
            <div key={item.id} className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
              <button
                className="w-full text-left py-3 sm:py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg flex items-center justify-between"
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${item.id}`}
                id={`faq-button-${item.id}`}
                onClick={() => { toggleItem(item.id); }}
              >
                <span className="font-medium text-gray-900 pr-4">
                  {item.question}
                </span>
                <ChevronDown 
                  className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>
              
              <div
                id={`faq-panel-${item.id}`}
                role="region"
                aria-labelledby={`faq-button-${item.id}`}
                hidden={!isOpen}
                className={`mt-2 text-gray-600 overflow-hidden transition-all duration-200 ${
                  isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="pb-2">
                  {item.answer}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
