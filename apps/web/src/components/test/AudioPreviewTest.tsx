import { AudioPreviewButton } from '../AudioPreviewButton'

/**
 * Composant de test pour vérifier que la pré-écoute fonctionne
 * avec les deux providers (Votz et ElevenLabs)
 */
export function AudioPreviewTest() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold">Test de pré-écoute audio</h2>
      
      {/* Test Votz (Occitan) */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Test Votz (Occitan)</h3>
        <p className="text-sm text-gray-600">Texte: "Bonjorn, coma vas ?"</p>
        <AudioPreviewButton 
          text="Bonjorn, coma vas ?" 
          language="oc" 
          size="md"
        />
      </div>
      
      {/* Test ElevenLabs (Anglais) */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Test ElevenLabs (Anglais)</h3>
        <p className="text-sm text-gray-600">Texte: "Hello, how are you ?"</p>
        <AudioPreviewButton 
          text="Hello, how are you ?" 
          language="en-US" 
          voice="voice1"
          size="md"
        />
      </div>
      
      {/* Test ElevenLabs (Français) */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Test ElevenLabs (Français)</h3>
        <p className="text-sm text-gray-600">Texte: "Bonjour, comment allez-vous ?"</p>
        <AudioPreviewButton 
          text="Bonjour, comment allez-vous ?" 
          language="fr-FR" 
          voice="voice2"
          size="md"
        />
      </div>
      
      {/* Test avec texte vide */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Test avec texte vide</h3>
        <p className="text-sm text-gray-600">Texte: ""</p>
        <AudioPreviewButton 
          text="" 
          language="en-US" 
          size="md"
        />
      </div>
    </div>
  )
}
