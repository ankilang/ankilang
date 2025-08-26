import { useState, useEffect } from 'react';
import { X, Download, Smartphone, Share } from 'lucide-react';
import { usePWAContext } from '../../contexts/PWAContext';

interface InstallPromptProps {
  className?: string;
}

export default function InstallPrompt({ className = '' }: InstallPromptProps) {
  const { 
    isInstalled, 
    beforeInstallPrompt, 
    installApp, 
    isInstalling 
  } = usePWAContext();
  
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Détection de la plateforme et du mobile
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);
    const isMobile = /mobile|android|iphone|ipad|ipod|blackberry|windows phone/.test(userAgent);
    
    // Ne s'afficher que sur mobile
    if (!isMobile) {
      setIsVisible(false);
      return;
    }
    
    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);
  }, []);

  // Gestion de la visibilité
  useEffect(() => {
    // Ne pas afficher si déjà installée
    if (isInstalled) {
      setIsVisible(false);
      return;
    }

    // Ne pas afficher si déjà fermée
    if (isDismissed) {
      return;
    }

    // Afficher pour Android si beforeinstallprompt disponible
    if (isAndroid && beforeInstallPrompt) {
      setIsVisible(true);
      return;
    }

    // Afficher pour iOS après un délai
    if (isIOS && !isInstalled) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000); // Délai de 3 secondes

      return () => clearTimeout(timer);
    }

    // Pas de cleanup nécessaire pour les autres cas
    return undefined;
  }, [isInstalled, beforeInstallPrompt, isAndroid, isIOS, isDismissed]);

  // Gestion de l'installation Android
  const handleAndroidInstall = async () => {
    try {
      const success = await installApp();
      if (success) {
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Erreur lors de l\'installation:', error);
    }
  };

  // Gestion de la fermeture
  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    
    // Sauvegarder dans localStorage pour éviter de réafficher
    localStorage.setItem('ankilang-install-dismissed', 'true');
  };

  // Vérifier si déjà fermée
  useEffect(() => {
    const dismissed = localStorage.getItem('ankilang-install-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  // Réinitialiser si l'app est installée
  useEffect(() => {
    if (isInstalled) {
      localStorage.removeItem('ankilang-install-dismissed');
    }
  }, [isInstalled]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 ${className}`}>
      {/* Barre d'installation Android */}
      {isAndroid && beforeInstallPrompt && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Installer Ankilang</h3>
                <p className="text-xs opacity-90">Accès rapide depuis votre écran d'accueil</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAndroidInstall}
                disabled={isInstalling}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {isInstalling ? 'Installation...' : 'Installer'}
              </button>
              <button
                onClick={handleDismiss}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guide d'installation iOS */}
      {isIOS && !isInstalled && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 shadow-lg">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Installer Ankilang</h3>
                <p className="text-xs opacity-90">Appuyez sur Partager puis "Sur l'écran d'accueil"</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-lg">
                <Share className="w-4 h-4" />
                <span className="text-xs font-medium">Partager</span>
              </div>
              <button
                onClick={handleDismiss}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safe area pour iOS */}
      <div className="h-safe-area-inset-bottom bg-transparent" />
    </div>
  );
}
