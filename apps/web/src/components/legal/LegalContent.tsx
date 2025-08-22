import type { ReactNode } from 'react'

interface TocItem {
  id: string
  label: string
}

interface LegalContentProps {
  title: string
  description?: string
  toc?: TocItem[]
  children: ReactNode
}

export default function LegalContent({ 
  title, 
  description, 
  toc, 
  children 
}: LegalContentProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* En-tête */}
          <div className="mb-8">
            <h1 id="content" className="text-3xl font-bold text-gray-900 mb-4">
              {title}
            </h1>
            {description && (
              <p className="text-lg text-gray-600">
                {description}
              </p>
            )}
          </div>

          {/* Sommaire */}
          {toc && toc.length > 0 && (
            <nav 
              aria-label="Sommaire" 
              className="mb-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Sommaire
              </h2>
              <ul className="space-y-2">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="text-blue-600 hover:text-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1 py-0.5"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Contenu principal */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
