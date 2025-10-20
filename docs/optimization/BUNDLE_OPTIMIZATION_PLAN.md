# Plan d'Optimisation Bundle - Ankilang

**Date**: 2025-10-20
**Objectif**: Réduire la taille du bundle de ~100 KB (-11%) et évaluer Capacitor pour PWA

---

## 📊 État Actuel

### Bundle Size Analysis

```
Total bundle: ~900 KB gzipped

Top bundles:
- export-D0-bRNs9.js        140 KB  (SQL.js + JSZip - export Anki)
- react-vendor-BPfA2sTK.js  140 KB  (React + ReactDOM)
- ui-vendor-DtuA52hM.js     132 KB  (Framer Motion + Lucide icons)
- index-DD1oa017.js         104 KB  (Main app bundle)
- Detail-BrMvvOrX.js        100 KB  (Theme detail page)
- forms-3U2yU3vv.js          80 KB  (React Hook Form + Zod)
- query-BLoZJSEh.js          44 KB  (TanStack Query)
- FlagIcon-rI4mz_ZL.js       32 KB  (38 SVG flags)
```

### Optimisations Identifiées

| Optimisation | Gain Estimé | Difficulté | Priorité |
|--------------|-------------|------------|----------|
| Flags SVG lazy-load | -20 KB (2%) | Faible | Haute |
| Framer Motion → Motion One | -70 KB (8%) | Moyenne | Moyenne |
| Workbox cleanup (si PWA off) | -100 KB (deps) | Faible | Basse |

---

## 🎯 Optimisation 1: Flags SVG Lazy-Load

### Objectif
Passer de 38 flags chargés en bundle à un chargement dynamique on-demand.

**Gain**: -20 KB initial, flags chargés uniquement quand affichés

### État Actuel

```typescript
// apps/web/src/components/ui/FlagIcon.tsx
import gbSvg from '../assets/flags/gb.svg?raw'
import frSvg from '../assets/flags/fr.svg?raw'
import usSvg from '../assets/flags/us.svg?raw'
// ... 35 autres imports statiques

const FLAGS: Record<string, string> = {
  gb: gbSvg,
  fr: frSvg,
  us: usSvg,
  // ... 35 autres
}
```

**Problème**: Tous les SVG sont dans le bundle, même si l'utilisateur n'affiche que 2-3 drapeaux.

### Solution Proposée

#### Approche 1: Dynamic Import (Recommandée)

```typescript
// apps/web/src/components/ui/FlagIcon.tsx
import { useState, useEffect } from 'react'

const flagCache = new Map<string, string>()

async function loadFlag(code: string): Promise<string> {
  // Cache check
  if (flagCache.has(code)) {
    return flagCache.get(code)!
  }

  try {
    // Dynamic import avec Vite
    const module = await import(`../../assets/flags/${code}.svg?raw`)
    const svg = module.default
    flagCache.set(code, svg)
    return svg
  } catch (error) {
    console.warn(`Flag not found: ${code}`)
    // Fallback: drapeau générique ou placeholder
    return ''
  }
}

export function FlagIcon({ languageCode, size = 24 }: FlagIconProps) {
  const [svgContent, setSvgContent] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const countryCode = getCountryCode(languageCode)

    loadFlag(countryCode)
      .then(svg => {
        setSvgContent(svg)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [languageCode])

  if (loading) {
    // Skeleton placeholder
    return (
      <div
        className="rounded bg-gray-200 animate-pulse"
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      className="rounded overflow-hidden"
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  )
}
```

**Avantages**:
- ✅ -20 KB bundle initial
- ✅ Flags chargés on-demand
- ✅ Cache en mémoire (pas de re-fetch)
- ✅ Skeleton pendant chargement

**Inconvénients**:
- ⚠️ Légère latence au premier affichage (< 50ms)
- ⚠️ Skeleton visible brièvement

#### Approche 2: Route-based Splitting

```typescript
// Charger seulement les flags utilisés par route
// Landing: FR, EN, OC
// NewCard: Selon langue sélectionnée
// ThemeDetail: Selon cartes affichées

const landingFlags = ['fr', 'gb', 'us', 'oc']
const allFlags = ['ar', 'bg', 'cs', ...] // lazy load

// Preload common flags
landingFlags.forEach(code => loadFlag(code))
```

**Avantages**:
- ✅ Flags communs préchargés (no skeleton)
- ✅ Flags rares lazy-loaded

### Plan d'Implémentation

**Étape 1: Créer le nouveau FlagIcon**
```bash
# 1. Créer nouvelle version avec dynamic import
apps/web/src/components/ui/FlagIconLazy.tsx

# 2. Tester sur une route isolée
# Utiliser FlagIconLazy dans Landing.tsx

# 3. Mesurer impact bundle
pnpm build && du -sh dist/assets/*.js | sort -h

# 4. Vérifier performance
# Lighthouse, Core Web Vitals
```

**Étape 2: Migration progressive**
```typescript
// Alias pour migration
export { FlagIconLazy as FlagIcon } from './FlagIconLazy'

// Ou feature flag
const FlagComponent = import.meta.env.VITE_USE_LAZY_FLAGS
  ? FlagIconLazy
  : FlagIcon
```

**Étape 3: Cleanup**
```bash
# Supprimer ancienne version
rm apps/web/src/components/ui/FlagIcon.tsx

# Renommer
mv FlagIconLazy.tsx FlagIcon.tsx
```

**Durée estimée**: 2-3 heures

---

## 🎨 Optimisation 2: Framer Motion → Motion One

### Objectif
Remplacer Framer Motion (100 KB) par Motion One (10 KB).

**Gain**: -70 KB (8% du bundle)

### État Actuel

**Utilisation Framer Motion**:
```bash
# Recherche dans le code
grep -r "framer-motion" apps/web/src/ --include="*.tsx" | wc -l
# ~50 composants utilisent Framer Motion
```

**Animations utilisées**:
- `motion.div` - Conteneurs animés
- `whileHover`, `whileTap` - Interactions
- `initial`, `animate` - Entrées/sorties
- `transition` - Configurations timing
- `AnimatePresence` - Montage/démontage

### Analyse d'Impact

**Complexité de migration**: ⚠️ MOYENNE-ÉLEVÉE

**Composants critiques** (animations complexes):
1. `Landing.tsx` - Hero animations, scroll effects
2. `Bento.tsx` - Grid animations
3. `FAQAccordion.tsx` - Accordéon animé
4. `OccitanParticles.tsx` - Particules SVG
5. `RotatingLanguage.tsx` - Rotation texte
6. `CardList.tsx` - Stagger animations
7. `NewCardModal.tsx` - Modal animations

### Solution: Motion One

#### Installation
```bash
pnpm add motion
pnpm remove framer-motion
```

#### Migration Pattern

**Avant (Framer Motion)**:
```typescript
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: "easeOut" }}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Content
</motion.div>
```

**Après (Motion One)**:
```typescript
import { animate, spring } from 'motion'
import { useEffect, useRef } from 'react'

function AnimatedDiv({ children }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    // Entrance animation
    animate(
      ref.current,
      { opacity: [0, 1], y: [20, 0] },
      { duration: 0.5, easing: 'ease-out' }
    )

    // Hover effect (via CSS ou JS)
    const element = ref.current
    element.addEventListener('mouseenter', () => {
      animate(element, { scale: 1.05 }, { duration: 0.2 })
    })
    element.addEventListener('mouseleave', () => {
      animate(element, { scale: 1 }, { duration: 0.2 })
    })
  }, [])

  return <div ref={ref}>{children}</div>
}
```

**Alternative: CSS + Motion One (Recommandé)**:
```typescript
// Utiliser CSS pour hover/tap (plus performant)
<div
  ref={ref}
  className="transition-transform hover:scale-105 active:scale-95"
>
  {children}
</div>

// Motion One uniquement pour entrées complexes
useEffect(() => {
  animate(ref.current, { opacity: [0, 1], y: [20, 0] })
}, [])
```

### Approches de Migration

#### Approche 1: Migration Complète (Recommandée si temps disponible)

**Avantages**: -70 KB, meilleure performance
**Inconvénients**: 20-30h de travail, risque de régression

**Plan**:
1. Créer wrapper `<Animated>` pour API similaire à Framer
2. Migrer composant par composant (commencer par les simples)
3. Tester chaque migration (visual regression)
4. Finaliser les animations complexes

**Durée**: 3-4 jours

#### Approche 2: Hybride (Quick Win)

Garder Framer Motion pour animations complexes, utiliser CSS pour le reste.

```typescript
// Supprimer Framer des composants simples
// Avant
<motion.button whileHover={{ scale: 1.05 }}>Click</motion.button>

// Après
<button className="transition-transform hover:scale-105">Click</button>
```

**Gain partiel**: -30 KB (tree-shaking des fonctions non utilisées)
**Durée**: 1 jour

#### Approche 3: Différer (Recommandé pour l'instant)

**Raison**: Framer Motion apporte une excellente UX
- Animations fluides et professionnelles
- API déclarative simple
- Maintenance facile

**Recommandation**: Garder Framer Motion jusqu'à ce que:
1. La performance soit vraiment un problème
2. Le projet ait du temps dédié à cette refonte
3. Les animations soient moins critiques pour l'UX

---

## 🚀 Optimisation 3: PWA Cleanup

### État Actuel

**vite.config.ts**:
```typescript
VitePWA({
  disable: true, // 🚨 DÉSACTIVÉ TEMPORAIREMENT
  ...
})
```

**Dépendances installées**:
```json
"vite-plugin-pwa": "^0.17.4",
"workbox-build": "^7.3.0",
"workbox-window": "^7.3.0"
```

### Options

#### Option 1: Réactiver PWA (Recommandé)

**Pourquoi**: PWA apporte beaucoup de valeur
- ✅ Offline mode
- ✅ Install prompt (A2HS)
- ✅ Faster loads (cache)
- ✅ Better mobile UX

**Action**: Corriger la régression PWA mentionnée
```typescript
VitePWA({
  disable: false, // ✅ Réactiver
  // Corriger la config...
})
```

**Pas de gain bundle** - Les dépendances restent

#### Option 2: Supprimer PWA complètement

**Seulement si PWA définitivement abandonné**

```bash
# Supprimer dépendances
pnpm remove vite-plugin-pwa workbox-build workbox-window

# Nettoyer config
# Supprimer VitePWA() de vite.config.ts
# Supprimer manifest.webmanifest
# Supprimer service worker cleanup dans main.tsx
```

**Gain**: ~100 KB node_modules (pas de bundle impact, PWA désactivé)

**Recommandation**: ❌ Ne pas supprimer - Réactiver PWA à la place

---

## 📱 Analyse Capacitor pour PWA Native

### Capacitor vs PWA Classique

| Aspect | PWA (Workbox) | Capacitor | Recommandation |
|--------|---------------|-----------|----------------|
| **Distribution** | Web (navigateur) | App Stores (iOS/Android) | Capacitor si stores requis |
| **Installation** | Add to Home Screen | Store download | PWA plus simple |
| **Offline** | Service Worker | ✅ + natif | Capacitor meilleur |
| **APIs Natives** | Limitées (Web APIs) | ✅ Toutes (plugins) | Capacitor si needed |
| **Maintenance** | 1 codebase web | 1 codebase + builds natifs | PWA plus simple |
| **Taille** | 900 KB (web) | ~15 MB (app) | PWA plus léger |
| **Updates** | Instantanés (cache update) | Store review (2-7 jours) | PWA plus rapide |
| **Performance** | Excellent | ✅ Natif supérieur | Capacitor si perf critique |

### Cas d'Usage Capacitor

**Quand utiliser Capacitor**:
1. ✅ **APIs natives requises** non disponibles en Web:
   - Notifications push réelles (iOS)
   - Accès fichiers système
   - Intégration calendrier/contacts
   - Background sync avancé
   - Biométrie (Face ID, Touch ID)

2. ✅ **Distribution App Store requise**:
   - Découvrabilité (search dans stores)
   - Monétisation (IAP - In-App Purchases)
   - Entreprise (MDM - Mobile Device Management)

3. ✅ **Performance critique**:
   - Rendu natif plus rapide
   - Pas de limitations navigateur

**Quand rester en PWA**:
1. ✅ **Application web suffit**:
   - Ankilang fonctionne très bien en web
   - Pas d'APIs natives critiques manquantes
   - Distribution web acceptable

2. ✅ **Maintenance simplifiée**:
   - 1 codebase
   - Déploiement instantané
   - Pas de review stores

3. ✅ **Budget/temps limité**:
   - Pas de builds iOS/Android à gérer
   - Pas de certificats/provisioning profiles

### Plugins Capacitor Pertinents pour Ankilang

Si migration vers Capacitor, plugins utiles:

```typescript
// Installation
pnpm add @capacitor/core @capacitor/cli
pnpm add @capacitor/filesystem  // Stockage fichiers
pnpm add @capacitor/share        // Partage cartes
pnpm add @capacitor/haptics      // Retour haptique
pnpm add @capacitor/splash-screen // Splash natif
pnpm add @capacitor/status-bar   // Barre de statut
pnpm add @capacitor/app          // App lifecycle
```

#### Plugins Utiles pour Ankilang

**1. Filesystem** - Export .apkg vers fichiers natifs
```typescript
import { Filesystem, Directory } from '@capacitor/filesystem'

async function saveAnkiDeck(blob: Blob, filename: string) {
  const base64 = await blobToBase64(blob)

  await Filesystem.writeFile({
    path: filename,
    data: base64,
    directory: Directory.Documents
  })

  // Partager ensuite
  Share.share({
    title: 'Deck Anki',
    text: 'Mon deck de flashcards',
    url: filename
  })
}
```

**2. Share API Native** - Partager decks
```typescript
import { Share } from '@capacitor/share'

await Share.share({
  title: 'Mon deck Occitan',
  text: 'Télécharge mes flashcards !',
  url: 'https://ankilang.com/deck/123',
  files: [deckUrl]
})
```

**3. Haptics** - Feedback tactile
```typescript
import { Haptics, ImpactStyle } from '@capacitor/haptics'

// Lors de la création d'une carte
await Haptics.impact({ style: ImpactStyle.Light })

// Lors de la suppression
await Haptics.notification({ type: NotificationType.Warning })
```

**4. App** - Gestion cycle de vie
```typescript
import { App } from '@capacitor/app'

App.addListener('appStateChange', ({ isActive }) => {
  if (isActive) {
    // Rafraîchir les données
    queryClient.invalidateQueries()
  }
})
```

### Plan de Migration Capacitor (si décidé)

#### Phase 1: Setup (1-2 jours)

```bash
# 1. Installation
pnpm add @capacitor/core @capacitor/cli

# 2. Initialisation
npx cap init ankilang com.ankilang.app

# 3. Ajouter plateformes
npx cap add ios
npx cap add android

# 4. Build web
pnpm build

# 5. Sync vers natif
npx cap sync

# 6. Ouvrir IDE natif
npx cap open ios
npx cap open android
```

**Structure créée**:
```
ankilang/
├── ios/           # Projet Xcode
├── android/       # Projet Android Studio
├── capacitor.config.ts
└── apps/web/dist/ # Build web → copié vers natif
```

#### Phase 2: Configuration (2-3 jours)

**capacitor.config.ts**:
```typescript
import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.ankilang.app',
  appName: 'Ankilang',
  webDir: 'apps/web/dist',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#7C3AED', // Purple Ankilang
      showSpinner: false
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#7C3AED'
    }
  }
}

export default config
```

**Adaptations code**:
```typescript
// Détecter environnement
import { Capacitor } from '@capacitor/core'

const isNative = Capacitor.isNativePlatform()
const platform = Capacitor.getPlatform() // 'ios', 'android', 'web'

// Utiliser APIs natives si disponibles
if (isNative) {
  // Filesystem, Share, Haptics
} else {
  // Web APIs classiques
}
```

#### Phase 3: Tests & Déploiement (3-5 jours)

**iOS**:
```bash
# 1. Ouvrir Xcode
npx cap open ios

# 2. Configurer signing & capabilities
# 3. Tester sur simulateur
# 4. Tester sur device physique
# 5. Build & upload vers App Store Connect
```

**Android**:
```bash
# 1. Ouvrir Android Studio
npx cap open android

# 2. Configurer signing
# 3. Tester sur émulateur
# 4. Tester sur device physique
# 5. Build AAB & upload vers Play Console
```

#### Phase 4: Maintenance Continue

**Workflow de développement**:
```bash
# 1. Développer en web (comme avant)
pnpm dev

# 2. Tester features natives en local
pnpm build && npx cap sync && npx cap run ios

# 3. Déployer
pnpm build               # Build web
npx cap sync            # Sync vers natif
npx cap open ios/android # Build & publish
```

**CI/CD nécessaire**:
- Fastlane (iOS)
- Gradle (Android)
- Certificats & provisioning
- Secrets management

### Impact Bundle avec Capacitor

**Bundle Web**: Inchangé (~900 KB)
- Le code web reste identique
- Capacitor = wrapper natif autour du web

**App Native**:
```
iOS: ~15-20 MB
  - WebView runtime
  - Plugins natifs
  - Assets & icons

Android: ~10-15 MB
  - WebView (Chrome)
  - Plugins natifs
  - Assets & icons
```

**Pas d'impact négatif sur bundle web** ✅

---

## 🎯 Recommandations Finales

### Priorités d'Optimisation

**Court Terme (Quick Wins)** - 1-2 jours:
1. ✅ **Flags SVG Lazy-Load** (-20 KB)
   - Impact: Moyen
   - Effort: Faible
   - Risque: Minimal
   - **Action**: Implémenter maintenant

2. ✅ **Réactiver PWA** (au lieu de supprimer)
   - Impact: Haute UX
   - Effort: Faible-Moyen (corriger régression)
   - Risque: Faible
   - **Action**: Prioritaire

**Moyen Terme** - 1-2 semaines:
3. 🔧 **Framer Motion Hybride** (-30 KB)
   - Remplacer animations simples par CSS
   - Garder Framer pour animations complexes
   - Impact: Moyen
   - Effort: Moyen
   - **Action**: Si temps disponible

**Long Terme** - 1+ mois:
4. 📱 **Évaluer Capacitor**
   - Seulement si besoin App Stores
   - Ou si APIs natives requises
   - Impact: Distribution
   - Effort: Élevé
   - **Action**: Différer jusqu'à besoin confirmé

### Plan d'Action Recommandé

**Semaine 1**:
- [x] Flags SVG lazy-load (2-3h) → ✅ **COMPLÉTÉ en 1h** (-27 KB, voir `FLAGS_LAZY_LOAD_RESULTS.md`)
- [ ] Réactiver PWA + corriger régression (4-6h)
- [ ] Tests & validation

**Semaine 2** (optionnel):
- [ ] Migration partielle Framer → CSS (8-12h)
- [ ] Mesures performance (Lighthouse)

**Capacitor**: ⏸️ Mettre en attente
- Pas de besoin App Store identifié pour l'instant
- PWA suffit pour l'usage actuel
- Réévaluer si:
  - Besoin de monétisation via stores
  - APIs natives manquantes critiques
  - Performance insuffisante

---

## 📊 Impact Estimé

| Optimisation | Gain Bundle | Effort | Timing | Priorité | Statut |
|--------------|-------------|--------|--------|----------|--------|
| Flags Lazy | -27 KB (3%)* | 1h* | Immédiat | ⭐⭐⭐ Haute | ✅ **FAIT** |
| PWA Réactivation | UX++ | 6h | Semaine 1 | ⭐⭐⭐ Haute | 🔜 Prochain |
| Framer → CSS | -30 KB (3%) | 12h | Semaine 2 | ⭐⭐ Moyenne | ⏸️ En attente |
| Framer → Motion One | -70 KB (8%) | 30h | Mois 1+ | ⭐ Basse | ⏸️ En attente |
| Capacitor | Distribution | 40h+ | Future | ⏸️ Différé | ⏸️ Différé |

*Résultats meilleurs que prévu: -27 KB vs -20 KB estimé, 1h vs 3h estimées*

**Résultats Réels**:
- ✅ **Flags Lazy-Load**: -27 KB + on-demand loading en 1h de travail
- **Total Quick Wins si PWA réactivée**: -27 KB + PWA en ~7h
- **Total si Framer CSS**: -57 KB en ~19h
- **Total si Framer Migration**: -97 KB en ~37h

**Recommandation**: PWA réactivation (prochaine priorité haute)
