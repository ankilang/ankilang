import { useState } from 'react';
import { usePWAContext } from '../../contexts/PWAContext';

interface PWATestPanelProps {
  className?: string;
}

export default function PWATestPanel({ className = '' }: PWATestPanelProps) {
  const { 
    isInstalled, 
    isOnline, 
    hasUpdate, 
    beforeInstallPrompt,
    installApp,
    updateSW,
    forceUpdate,
    clearCache,
    getSWVersion
  } = usePWAContext();
  
  const [swVersion, setSwVersion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetVersion = async () => {
    setIsLoading(true);
    try {
      const version = await getSWVersion();
      setSwVersion(version);
    } catch (error) {
      console.error('Erreur lors de la récupération de la version:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Ne s'afficher qu'en développement
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm ${className}`}>
      <h3 className="font-semibold text-sm mb-3 text-gray-800">🧪 Test PWA</h3>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span>Installée:</span>
          <span className={isInstalled ? 'text-green-600' : 'text-red-600'}>
            {isInstalled ? '✅' : '❌'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>En ligne:</span>
          <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
            {isOnline ? '✅' : '❌'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Mise à jour:</span>
          <span className={hasUpdate ? 'text-orange-600' : 'text-green-600'}>
            {hasUpdate ? '🔄' : '✅'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Install prompt:</span>
          <span className={beforeInstallPrompt ? 'text-green-600' : 'text-gray-500'}>
            {beforeInstallPrompt ? '✅' : '❌'}
          </span>
        </div>
        
        {swVersion && (
          <div className="flex justify-between">
            <span>SW Version:</span>
            <span className="text-blue-600 font-mono">{swVersion}</span>
          </div>
        )}
      </div>
      
      <div className="mt-3 space-y-1">
        {beforeInstallPrompt && (
          <button
            onClick={installApp}
            className="w-full bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
          >
            Tester Installation
          </button>
        )}
        
        <button
          onClick={handleGetVersion}
          disabled={isLoading}
          className="w-full bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Chargement...' : 'Version SW'}
        </button>
        
        <button
          onClick={updateSW}
          className="w-full bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors"
        >
          Vérifier Mise à jour
        </button>
        
        {hasUpdate && (
          <button
            onClick={forceUpdate}
            className="w-full bg-orange-600 text-white px-2 py-1 rounded text-xs hover:bg-orange-700 transition-colors"
          >
            Forcer Mise à jour
          </button>
        )}
        
        <button
          onClick={clearCache}
          className="w-full bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-colors"
        >
          Effacer Cache
        </button>
      </div>
    </div>
  );
}
