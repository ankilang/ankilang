import { useState, useEffect, useCallback } from 'react';

interface PWAState {
  isInstalled: boolean;
  isOnline: boolean;
  hasUpdate: boolean;
  isInstalling: boolean;
  swRegistration: ServiceWorkerRegistration | null;
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isInstalled: false,
    isOnline: navigator.onLine,
    hasUpdate: false,
    isInstalling: false,
    swRegistration: null
  });

  const [beforeInstallPrompt, setBeforeInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // Vérifier si l'app est installée
  useEffect(() => {
    const checkInstallation = () => {
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone === true;
      
      setState(prev => ({ ...prev, isInstalled }));
    };

    checkInstallation();
    window.addEventListener('appinstalled', checkInstallation);
    
    return () => {
      window.removeEventListener('appinstalled', checkInstallation);
    };
  }, []);

  // Gérer l'état en ligne/hors ligne
  useEffect(() => {
    const handleOnline = () => { setState(prev => ({ ...prev, isOnline: true })); };
    const handleOffline = () => { setState(prev => ({ ...prev, isOnline: false })); };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Capturer l'événement beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setBeforeInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Gérer les mises à jour du service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        setState(prev => ({ ...prev, swRegistration: registration }));

        // Écouter les mises à jour
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setState(prev => ({ ...prev, hasUpdate: true }));
              }
            });
          }
        });

        // Écouter les messages du service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          const { type } = event.data;
          
          switch (type) {
            case 'UPDATE_AVAILABLE':
              setState(prev => ({ ...prev, hasUpdate: true }));
              break;
            case 'UPDATE_READY':
              setState(prev => ({ ...prev, hasUpdate: true }));
              break;
          }
        });
      });
    }
  }, []);

  // Fonction pour installer l'app
  const installApp = useCallback(async () => {
    if (!beforeInstallPrompt) {
      console.log('beforeInstallPrompt non disponible');
      return false;
    }

    setState(prev => ({ ...prev, isInstalling: true }));

    try {
      await beforeInstallPrompt.prompt();
      const { outcome } = await beforeInstallPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('Utilisateur a accepté l\'installation');
        setBeforeInstallPrompt(null);
        setState(prev => ({ ...prev, isInstalling: false, isInstalled: true }));
        return true;
      } else {
        console.log('Utilisateur a refusé l\'installation');
        setState(prev => ({ ...prev, isInstalling: false }));
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de l\'installation:', error);
      setState(prev => ({ ...prev, isInstalling: false }));
      return false;
    }
  }, [beforeInstallPrompt]);

  // Fonction pour mettre à jour le service worker
  const updateSW = useCallback(async () => {
    if (state.swRegistration) {
      try {
        await state.swRegistration.update();
        setState(prev => ({ ...prev, hasUpdate: false }));
        return true;
      } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
        return false;
      }
    }
    return false;
  }, [state.swRegistration]);

  // Fonction pour forcer la mise à jour
  const forceUpdate = useCallback(async () => {
    if (state.swRegistration && state.swRegistration.waiting) {
      state.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Recharger la page après la mise à jour
      window.location.reload();
      return true;
    }
    return false;
  }, [state.swRegistration]);

  // Fonction pour effacer le cache
  const clearCache = useCallback(async () => {
    if (state.swRegistration) {
      try {
        await state.swRegistration.active?.postMessage({ type: 'CLEAR_CACHE' });
        return true;
      } catch (error) {
        console.error('Erreur lors de l\'effacement du cache:', error);
        return false;
      }
    }
    return false;
  }, [state.swRegistration]);

  // Fonction pour obtenir la version du service worker
  const getSWVersion = useCallback(async () => {
    if (state.swRegistration) {
      try {
        const channel = new MessageChannel();
        const versionPromise = new Promise<string>((resolve) => {
          channel.port1.onmessage = (event) => {
            resolve(event.data.version);
          };
        });

        state.swRegistration.active?.postMessage(
          { type: 'GET_VERSION' },
          [channel.port2]
        );

        return await versionPromise;
      } catch (error) {
        console.error('Erreur lors de la récupération de la version:', error);
        return null;
      }
    }
    return null;
  }, [state.swRegistration]);

  return {
    ...state,
    beforeInstallPrompt: !!beforeInstallPrompt,
    installApp,
    updateSW,
    forceUpdate,
    clearCache,
    getSWVersion
  };
}
