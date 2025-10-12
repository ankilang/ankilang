/**
 * EXEMPLE D'INTÉGRATION - Cache Pexels
 * 
 * Ce fichier montre comment intégrer le cache Pexels dans vos composants
 * Il peut être supprimé après intégration
 */

import { getOrPutPexelsImage, getOrPutPexelsImageOptimized } from './pexels-cache'

/**
 * Exemple d'utilisation dans un composant de sélection d'image
 */
export async function selectPexelsImage(selectedPhoto: {
  id: string
  src: {
    large2x: string
    medium: string
    small: string
  }
}) {
  try {
    // Option 1: Cache simple (téléchargement direct)
    const result1 = await getOrPutPexelsImage({
      pexelsId: selectedPhoto.id,
      srcUrl: selectedPhoto.src.large2x,
      variant: 'large2x'
    })
    
    console.log('Image cached:', result1.fromCache ? 'HIT' : 'MISS')
    return result1.fileUrl

    // Option 2: Cache avec optimisation (recommandé)
    // const result2 = await getOrPutPexelsImageOptimized({
    //   pexelsId: selectedPhoto.id,
    //   srcUrl: selectedPhoto.src.large2x,
    //   variant: 'large2x'
    // })
    // 
    // console.log('Image optimized and cached:', result2.fromCache ? 'HIT' : 'MISS')
    // return result2.fileUrl

  } catch (error) {
    console.error('Erreur lors de la mise en cache Pexels:', error)
    throw error
  }
}

/**
 * Exemple d'utilisation dans un formulaire de carte
 */
export async function handlePexelsImageSelection(
  selectedPhoto: any,
  setValue: (field: string, value: string) => void
) {
  try {
    const { fileUrl } = await getOrPutPexelsImageOptimized({
      pexelsId: selectedPhoto.id,
      srcUrl: selectedPhoto.src.large2x,
      variant: 'large2x'
    })
    
    // Assigner l'URL à votre champ de formulaire
    setValue('imageUrl', fileUrl)
    
    console.log('✅ Image Pexels assignée à la carte')
  } catch (error) {
    console.error('❌ Erreur lors de l\'assignation de l\'image:', error)
    throw error
  }
}
