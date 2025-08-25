import { useState, useEffect } from 'react';

interface AccessibilityPreferences {
  prefersReducedMotion: boolean;
  prefersDarkMode: boolean;
  prefersHighContrast: boolean;
}

export const useAccessibility = () => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    prefersReducedMotion: false,
    prefersDarkMode: false,
    prefersHighContrast: false,
  });

  useEffect(() => {
    const mediaQueries = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      darkMode: window.matchMedia('(prefers-color-scheme: dark)'),
      highContrast: window.matchMedia('(prefers-contrast: high)'),
    };

    const updatePreferences = () => {
      setPreferences({
        prefersReducedMotion: mediaQueries.reducedMotion.matches,
        prefersDarkMode: mediaQueries.darkMode.matches,
        prefersHighContrast: mediaQueries.highContrast.matches,
      });
    };

    // Initial check
    updatePreferences();

    // Listen for changes
    mediaQueries.reducedMotion.addEventListener('change', updatePreferences);
    mediaQueries.darkMode.addEventListener('change', updatePreferences);
    mediaQueries.highContrast.addEventListener('change', updatePreferences);

    return () => {
      mediaQueries.reducedMotion.removeEventListener('change', updatePreferences);
      mediaQueries.darkMode.removeEventListener('change', updatePreferences);
      mediaQueries.highContrast.removeEventListener('change', updatePreferences);
    };
  }, []);

  return preferences;
};
