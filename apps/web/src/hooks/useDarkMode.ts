import { useState, useEffect } from 'react';

export const useDarkMode = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Détection initiale de la préférence système
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setDarkMode(mediaQuery.matches);

    // Écouter les changements de préférence
    const handleChange = (e: MediaQueryListEvent) => {
      setDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Palette de couleurs adaptative
  const colorScheme = darkMode ? {
    background: '#1A202C',
    text: '#F7FAFC',
    accent: '#D2B4DE',
    surface: '#2D3748',
    border: '#4A5568'
  } : {
    background: '#D4E2D4',
    text: '#333333',
    accent: '#D2B4DE',
    surface: '#FFFFFF',
    border: '#E2E8F0'
  };

  return { darkMode, setDarkMode, colorScheme };
};
