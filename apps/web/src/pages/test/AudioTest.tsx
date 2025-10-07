import { AudioPreviewTest } from '../../components/test/AudioPreviewTest'

export default function AudioTest() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Test de pré-écoute audio
          </h1>
          <p className="text-gray-600 mb-6">
            Cette page permet de tester la pré-écoute audio avec les deux providers :
            Votz pour l'occitan et ElevenLabs pour les autres langues.
          </p>
          
          <AudioPreviewTest />
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Instructions :</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Cliquez sur les boutons pour générer et jouer l'audio</li>
              <li>• Votz est utilisé automatiquement pour l'occitan (oc, oc-gascon)</li>
              <li>• ElevenLabs est utilisé pour les autres langues</li>
              <li>• Les boutons changent d'état : play → loading → playing → play</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
