import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

type FAQItem = {
  id: string
  question: string
  answer: string
}

type FAQAccordionProps = {
  items: FAQItem[]
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

  return (
    <div className="space-y-4 sm:space-y-6">
      {title && (
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">
          {title}
        </h2>
      )}
      
      <div className="space-y-2">
        {items.map((item) => {
          const isOpen = openItems.has(item.id)
          
          return (
            <div key={item.id} className="da-card da-card--hover da-hover-lift p-4 sm:p-6">
              <button
                className="w-full text-left py-3 sm:py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg flex items-center justify-between"
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${item.id}`}
                id={`faq-button-${item.id}`}
                onClick={() => toggleItem(item.id)}
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
