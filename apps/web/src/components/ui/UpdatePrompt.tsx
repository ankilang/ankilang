import { useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { usePWAContext } from '../../contexts/PWAContext';

interface UpdatePromptProps {
  className?: string;
}

export default function UpdatePrompt({ className = '' }: UpdatePromptProps) {
  const { hasUpdate, forceUpdate } = usePWAContext();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (!hasUpdate || isDismissed) {
    return null;
  }

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await forceUpdate();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <div className={`fixed top-4 left-4 right-4 z-50 ${className}`}>
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-lg shadow-lg max-w-md mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Mise à jour disponible</h3>
              <p className="text-xs opacity-90">Une nouvelle version d'Ankilang est prête</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="bg-white text-green-600 px-3 py-1.5 rounded-lg font-medium text-xs hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {isUpdating ? 'Mise à jour...' : 'Mettre à jour'}
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Fermer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
