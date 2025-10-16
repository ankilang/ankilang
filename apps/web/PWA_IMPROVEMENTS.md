# Améliorations PWA Ankilang

## Vue d'ensemble

Ce document décrit les améliorations PWA implémentées pour Ankilang, rendant l'application installable, offline-first et optimisée pour iOS et Android.

## 🎯 Objectifs atteints

### ✅ Installabilité
- **Android** : Support complet de `beforeinstallprompt`
- **iOS** : Guide d'installation avec instructions visuelles
- **Manifest** : Configuration complète avec icônes maskable
- **Barre d'installation** : Interface utilisateur intuitive
- **Correction bug** : Syntaxe JSON du manifest corrigée (erreur "Line: 1, column: 1, Syntax error")

### ✅ Offline-first
- **Service Worker** : Cache intelligent avec Workbox
- **Navigation preload** : Performance optimisée
- **Fallback offline** : Page d'erreur personnalisée
- **Cache runtime** : Polices et assets optimisés

### ✅ iOS Optimisations
- **Safe areas** : Support complet des notches et home indicators
- **Meta tags** : Configuration iOS complète
- **Splash screens** : Écrans de démarrage optimisés
- **Status bar** : Style translucent configuré

### ✅ Android Optimisations
- **Icônes maskable** : Support des formes d'icônes adaptatives
- **Installation native** : Intégration avec le système Android
- **Cache intelligent** : Stratégies de cache optimisées

## 📁 Fichiers modifiés/créés

### Manifest et Configuration
- `apps/web/public/manifest.webmanifest` - Manifest PWA complet (corrigé)
- `apps/web/vite.config.ts` - Configuration VitePWA
- `apps/web/index.html` - Meta tags iOS et icônes
- `.gitignore` - Mise à jour pour inclure le manifest

### Service Worker
- Service worker Workbox généré automatiquement
- Cache intelligent pour les polices et assets
- Navigation preload activée
- Fallback offline personnalisé

### Composants UI
- `apps/web/src/components/ui/InstallPrompt.tsx` - Barre d'installation
- `apps/web/src/components/ui/UpdatePrompt.tsx` - Notification de mise à jour
- `apps/web/src/components/ui/SafeArea.tsx` - Gestion des safe areas
- `apps/web/src/components/ui/PWATestPanel.tsx` - Panneau de test (dev)

### Hooks et Context
- `apps/web/src/hooks/usePWA.ts` - Hook PWA complet
- `apps/web/src/contexts/PWAContext.tsx` - Contexte PWA

### Styles
- `apps/web/src/index.css` - Styles PWA et safe areas

## 🚀 Fonctionnalités

### Installation PWA
```typescript
// Détection automatique de la plateforme
const { isInstalled, beforeInstallPrompt, installApp } = usePWAContext();

// Installation Android
if (beforeInstallPrompt) {
  await installApp();
}

// Guide iOS automatique
// Affiche les instructions "Partager → Sur l'écran d'accueil"
```

### Safe Areas iOS
```typescript
// Composant SafeArea automatique
<SafeArea top={true} bottom={true}>
  <Header />
</SafeArea>

// Classes CSS utilitaires
.safe-area-all { /* Toutes les safe areas */ }
.pt-safe-area-inset-top { /* Top seulement */ }
.pb-safe-area-inset-bottom { /* Bottom seulement */ }
```

### Mises à jour PWA
```typescript
// Détection automatique des mises à jour
const { hasUpdate, forceUpdate } = usePWAContext();

// Mise à jour forcée
if (hasUpdate) {
  await forceUpdate();
}
```

## 🎨 Design System PWA

### Couleurs
- **Theme Color** : `#8b5cf6` (Violet Ankilang)
- **Background Color** : `#ffffff` (Blanc)
- **Status Bar** : `black-translucent` (iOS)

### Icônes
- **Standard** : 192x192, 512x512
- **Maskable** : 192x192, 512x512 (Android)
- **Apple Touch** : 180x180 (iOS)
- **Safari Pinned** : SVG avec couleur

### Animations
- **Install Prompt** : Slide-up avec easing
- **Update Notification** : Fade-in avec backdrop
- **Safe Areas** : Transitions fluides

## 📱 Support des plateformes

### iOS
- ✅ Safari PWA
- ✅ Installation via Share Sheet
- ✅ Safe areas (notch, home indicator)
- ✅ Status bar translucent
- ✅ Splash screens
- ✅ Touch optimizations

### Android
- ✅ Chrome PWA
- ✅ Installation native
- ✅ Icônes maskable
- ✅ Beforeinstallprompt
- ✅ Cache intelligent

### Desktop
- ✅ Chrome/Edge PWA
- ✅ Installation via menu
- ✅ Shortcuts clavier
- ✅ Window management

## 🧪 Tests et Développement

### Panneau de Test
Le composant `PWATestPanel` permet de tester toutes les fonctionnalités PWA en développement :

- État d'installation
- État en ligne/hors ligne
- Mises à jour disponibles
- Installation manuelle
- Gestion du cache

### Commandes de Test
```bash
# Build de production
pnpm build

# Vérification TypeScript
pnpm typecheck

# Preview (pour tester PWA)
pnpm preview
```

## 📊 Métriques PWA

### Lighthouse Scores cibles
- **Installability** : 100/100
- **PWA Best Practices** : 100/100
- **Performance** : 90+/100
- **Accessibility** : 95+/100

### Core Web Vitals
- **LCP** : < 2.5s
- **FID** : < 100ms
- **CLS** : < 0.1

## 🔧 Configuration

### VitePWA
```typescript
VitePWA({
  registerType: 'autoUpdate',
  manifest: false, // Manifest externe
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    navigateFallback: '/index.html',
    navigationPreload: true,
    runtimeCaching: [
      // Cache Google Fonts
      // Cache assets statiques
    ]
  }
})
```

### Manifest
```json
{
  "name": "Ankilang",
  "short_name": "Ankilang",
  "description": "Créez des cartes Anki à partir de vos contenus",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#8b5cf6",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

## 🚀 Déploiement

### Prérequis
- HTTPS obligatoire pour PWA
- Service worker enregistré
- Manifest accessible

### Checklist de déploiement
- [ ] Build de production réussi
- [ ] Service worker généré
- [ ] Manifest accessible
- [ ] Icônes présentes
- [ ] Tests PWA passés
- [ ] Lighthouse scores validés

## 📚 Ressources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [iOS PWA Guide](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)
- [Android PWA Guide](https://developer.chrome.com/docs/android/trusted-web-activity/)

---

**Ankilang PWA v1.0.0** - Optimisé pour iOS et Android
