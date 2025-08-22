import { useEffect } from 'react'

interface PageMetaProps {
  title: string
  description?: string
}

export default function PageMeta({ title, description }: PageMetaProps) {
  useEffect(() => {
    // Mettre à jour le titre de la page
    document.title = title

    // Mettre à jour ou créer la meta description
    let metaDescription = document.querySelector('meta[name="description"]')
    
    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.setAttribute('name', 'description')
      document.head.appendChild(metaDescription)
    }
    
    if (description) {
      metaDescription.setAttribute('content', description)
    }

    // Cleanup: restaurer le titre par défaut si nécessaire
    return () => {
      document.title = 'Ankilang'
    }
  }, [title, description])

  return null
}
