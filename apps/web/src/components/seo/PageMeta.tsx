import { useEffect } from 'react'

interface PageMetaProps {
  title: string
  description?: string
  keywords?: string
  ogImage?: string
  structuredData?: Record<string, any>
}

export default function PageMeta({ 
  title, 
  description, 
  keywords, 
  ogImage, 
  structuredData 
}: PageMetaProps) {
  useEffect(() => {
    // Mettre à jour le titre de la page
    document.title = title

    // Ajouter les favicons et métadonnées
    const addFavicon = () => {
      const existingFavicon = document.querySelector('link[rel="icon"]');
      if (!existingFavicon) {
        const favicon = document.createElement('link');
        favicon.rel = 'icon';
        favicon.type = 'image/svg+xml';
        favicon.href = '/favicon.svg';
        document.head.appendChild(favicon);
      }

      const existingAppleTouch = document.querySelector('link[rel="apple-touch-icon"]');
      if (!existingAppleTouch) {
        const appleTouch = document.createElement('link');
        appleTouch.rel = 'apple-touch-icon';
        appleTouch.sizes = '180x180';
        appleTouch.href = '/apple-touch-icon.png';
        document.head.appendChild(appleTouch);
      }

      const existingFavicon32 = document.querySelector('link[rel="icon"][sizes="32x32"]');
      if (!existingFavicon32) {
        const favicon32 = document.createElement('link');
        favicon32.rel = 'icon';
        favicon32.type = 'image/png';
        favicon32.sizes = '32x32';
        favicon32.href = '/favicon-32x32.png';
        document.head.appendChild(favicon32);
      }

      const existingFavicon16 = document.querySelector('link[rel="icon"][sizes="16x16"]');
      if (!existingFavicon16) {
        const favicon16 = document.createElement('link');
        favicon16.rel = 'icon';
        favicon16.type = 'image/png';
        favicon16.sizes = '16x16';
        favicon16.href = '/favicon-16x16.png';
        document.head.appendChild(favicon16);
      }
    };

    addFavicon();

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

    // Ajouter les keywords
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]')
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta')
        metaKeywords.setAttribute('name', 'keywords')
        document.head.appendChild(metaKeywords)
      }
      metaKeywords.setAttribute('content', keywords)
    }

    // Ajouter l'image Open Graph
    if (ogImage) {
      let ogImageMeta = document.querySelector('meta[property="og:image"]')
      if (!ogImageMeta) {
        ogImageMeta = document.createElement('meta')
        ogImageMeta.setAttribute('property', 'og:image')
        document.head.appendChild(ogImageMeta)
      }
      ogImageMeta.setAttribute('content', ogImage)
    }

    // Ajouter les données structurées
    if (structuredData) {
      let structuredDataScript = document.querySelector('script[type="application/ld+json"]')
      if (!structuredDataScript) {
        structuredDataScript = document.createElement('script')
        structuredDataScript.setAttribute('type', 'application/ld+json')
        document.head.appendChild(structuredDataScript)
      }
      structuredDataScript.textContent = JSON.stringify(structuredData)
    }

    // Cleanup: restaurer le titre par défaut si nécessaire
    return () => {
      document.title = 'Ankilang'
    }
  }, [title, description, keywords, ogImage, structuredData])

  return null
}
