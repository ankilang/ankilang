# Production Readiness Checklist - Ankilang

**Date**: 2025-10-20
**Objectif**: Lancer en production rapidement sans complexifier le code

---

## 🚀 URGENT - Bloquants Production (À faire AVANT déploiement)

### 1. Corriger les Erreurs TypeScript Critiques ⚠️

**Impact**: 🔴 **BLOQUANT** - Risque de bugs en production
**Effort**: 🟡 2-3h
**Priorité**: 🔥 **CRITIQUE**

**État actuel**: 52 erreurs TypeScript (4 critiques)

```bash
# Erreurs critiques identifiées:
src/components/cards/NewCardModal.tsx:241    # Type mismatch TranslateResponse
src/components/TranslateDemo.tsx:13          # Property 'result' does not exist
src/hooks/useThemeMutations.ts:211           # Unused variable 'variables'
src/components/cards/VirtualizedCardList.tsx # Hooks violations
```

**Action**:
```bash
# 1. Fixer les 4 erreurs critiques
pnpm typecheck

# 2. Corriger TranslateResponse type mismatch
# 3. Ajouter type guards pour TranslateDemo
# 4. Supprimer variable inutilisée
# 5. Corriger violations des règles des hooks
```

**Gain**: Stabilité production, pas de bugs runtime

---

### 2. Variables d'Environnement Production ⚙️

**Impact**: 🔴 **BLOQUANT** - App ne fonctionnera pas
**Effort**: 🟢 15min
**Priorité**: 🔥 **CRITIQUE**

**À vérifier sur Vercel**:
```bash
# Variables Appwrite
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=ankilang
VITE_APPWRITE_ELEVENLABS_FUNCTION_ID=68e3951700118da88425

# API Vercel
VITE_VERCEL_API_URL=https://ankilang-api-monorepo.vercel.app

# S'assurer que TOUTES commencent par VITE_ (exposées côté client)
```

**Action**:
1. Vérifier Vercel Dashboard > Settings > Environment Variables
2. Tester en production après déploiement
3. Vérifier dans DevTools > Network que les API calls fonctionnent

**Gain**: App fonctionnelle en production

---

### 3. Tester les 52 Erreurs ESLint 🔍

**Impact**: 🟡 **MOYEN** - Qualité code
**Effort**: 🟡 2-3h
**Priorité**: 🟠 **HAUTE**

**État actuel**: 52 erreurs + 955 warnings

**Erreurs critiques à fixer**:
- Hooks violations (useEffect dependencies)
- Unused variables
- Missing prop types

**Action**:
```bash
# Fixer les 52 erreurs (pas les 955 warnings)
pnpm lint --quiet  # Affiche seulement les erreurs

# Priorité:
# 1. Hooks violations (peuvent causer bugs)
# 2. Unused variables (code mort)
# 3. Rest: warnings (différer après prod)
```

**Gain**: Code stable, moins de bugs potentiels

---

## ⚡ QUICK WINS - Impact Immédiat (1-2h total)

### 4. Ajouter Error Boundaries React ⛑️

**Impact**: 🟢 **HAUTE UX** - Pas de crash complet
**Effort**: 🟢 30min
**Priorité**: 🟠 **HAUTE**

**Problème actuel**: Si un composant crash, toute l'app crash

**Solution**:
```typescript
// src/components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react'

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; error?: Error }

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
    // TODO: Envoyer à Sentry/LogRocket en prod
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Oups, quelque chose s'est mal passé</h1>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Recharger la page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
```

**Utilisation**:
```typescript
// App.tsx
<ErrorBoundary>
  <QueryClientProvider>
    <AuthProvider>
      <RootRoutes />
    </AuthProvider>
  </QueryClientProvider>
</ErrorBoundary>
```

**Gain**: UX dégradée gracieusement au lieu de crash complet

---

### 5. Ajouter Meta Tags SEO 🔍

**Impact**: 🟢 **HAUTE SEO** - Indexation Google
**Effort**: 🟢 15min
**Priorité**: 🟠 **HAUTE**

**Problème actuel**: Meta tags basiques seulement

**Solution**:
```html
<!-- apps/web/index.html -->
<head>
  <!-- Existant -->
  <title>Ankilang - Créez des cartes Anki pour l'apprentissage de l'occitan</title>

  <!-- À AJOUTER -->
  <meta name="description" content="Créez facilement des flashcards Anki pour apprendre l'occitan et d'autres langues. Export direct, traduction intégrée, audio TTS.">
  <meta name="keywords" content="anki, flashcards, occitan, apprentissage, langue, occitanie, cartes mémoire">

  <!-- Open Graph (partage social) -->
  <meta property="og:title" content="Ankilang - Flashcards Anki pour l'occitan">
  <meta property="og:description" content="Créez facilement des flashcards Anki pour apprendre l'occitan">
  <meta property="og:image" content="https://ankilang.com/icon-512.png">
  <meta property="og:url" content="https://ankilang.com">
  <meta property="og:type" content="website">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Ankilang - Flashcards Anki pour l'occitan">
  <meta name="twitter:description" content="Créez facilement des flashcards Anki">
  <meta name="twitter:image" content="https://ankilang.com/icon-512.png">

  <!-- Robots -->
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://ankilang.com">
</head>
```

**Gain**: Meilleur référencement, partage social amélioré

---

### 6. Ajouter robots.txt et sitemap.xml 🤖

**Impact**: 🟢 **MOYENNE SEO**
**Effort**: 🟢 10min
**Priorité**: 🟢 **MOYENNE**

**Créer**:
```
# apps/web/public/robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /app/account

Sitemap: https://ankilang.com/sitemap.xml
```

```xml
<!-- apps/web/public/sitemap.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://ankilang.com/</loc>
    <priority>1.0</priority>
    <changefreq>weekly</changefreq>
  </url>
  <url>
    <loc>https://ankilang.com/abonnement</loc>
    <priority>0.8</priority>
    <changefreq>monthly</changefreq>
  </url>
  <url>
    <loc>https://ankilang.com/legal/terms</loc>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://ankilang.com/legal/privacy</loc>
    <priority>0.3</priority>
  </url>
</urlset>
```

**Gain**: Meilleure indexation Google

---

### 7. Configurer Headers de Sécurité (Vercel) 🔒

**Impact**: 🟢 **HAUTE SÉCURITÉ**
**Effort**: 🟢 10min
**Priorité**: 🟠 **HAUTE**

**Créer `vercel.json`**:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    },
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        },
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        }
      ]
    }
  ]
}
```

**Gain**: Protection contre XSS, clickjacking, etc.

---

## 📊 MONITORING - Savoir ce qui se passe en prod (2-3h)

### 8. Ajouter Analytics (Plausible ou Google Analytics) 📈

**Impact**: 🟢 **HAUTE BUSINESS** - Comprendre les utilisateurs
**Effort**: 🟢 30min
**Priorité**: 🟠 **HAUTE**

**Recommandation**: **Plausible** (RGPD-friendly, pas de cookies)

**Installation**:
```bash
pnpm add plausible-tracker
```

```typescript
// src/main.tsx
import Plausible from 'plausible-tracker'

const plausible = Plausible({
  domain: 'ankilang.com',
  trackLocalhost: false
})

plausible.enableAutoPageviews()

// Events custom
export function trackEvent(eventName: string, props?: Record<string, string>) {
  plausible.trackEvent(eventName, { props })
}

// Exemples d'usage
trackEvent('Card Created', { type: 'basic', lang: 'oc' })
trackEvent('Export Anki', { cardCount: '10' })
```

**Gain**: Comprendre l'usage, identifier les features populaires

---

### 9. Ajouter Error Tracking (Sentry) 🐛

**Impact**: 🟢 **HAUTE OPS** - Détecter bugs prod
**Effort**: 🟡 1h
**Priorité**: 🟢 **MOYENNE**

**Installation**:
```bash
pnpm add @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react'

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: 'YOUR_SENTRY_DSN',
    environment: 'production',
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay()
    ],
    tracesSampleRate: 0.1, // 10% des transactions
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0 // 100% si erreur
  })
}
```

**Gain**: Alertes automatiques sur les bugs, stack traces complètes

---

### 10. Ajouter Performance Monitoring (Web Vitals) ⚡

**Impact**: 🟡 **MOYENNE SEO** - Google utilise Core Web Vitals
**Effort**: 🟢 15min
**Priorité**: 🟢 **MOYENNE**

**Installation**:
```bash
pnpm add web-vitals
```

```typescript
// src/main.tsx
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals'

function sendToAnalytics(metric: any) {
  // Envoyer à Plausible, Sentry, ou autre
  console.log(metric.name, metric.value)
}

if (import.meta.env.PROD) {
  onCLS(sendToAnalytics)
  onFID(sendToAnalytics)
  onLCP(sendToAnalytics)
  onFCP(sendToAnalytics)
  onTTFB(sendToAnalytics)
}
```

**Gain**: Mesurer les vraies performances utilisateurs

---

## 🎨 UX/UI - Petites améliorations (2-3h)

### 11. Ajouter Loading States Partout 🔄

**Impact**: 🟡 **MOYENNE UX**
**Effort**: 🟡 1-2h
**Priorité**: 🟢 **MOYENNE**

**Vérifier**:
- [ ] Loading sur création carte
- [ ] Loading sur export Anki
- [ ] Loading sur traduction
- [ ] Loading sur génération audio
- [ ] Skeleton screens pour listes

**Gain**: UX plus professionnelle, pas de "freeze" apparent

---

### 12. Toast Notifications pour Feedback Utilisateur 🍞

**Impact**: 🟡 **MOYENNE UX**
**Effort**: 🟢 30min
**Priorité**: 🟢 **MOYENNE**

**Installation**:
```bash
pnpm add sonner
```

```typescript
// src/main.tsx
import { Toaster } from 'sonner'

<Toaster position="top-right" />

// Usage
import { toast } from 'sonner'

toast.success('Carte créée avec succès !')
toast.error('Erreur lors de la création')
toast.loading('Création en cours...')
```

**Gain**: Feedback immédiat, meilleure UX

---

### 13. Page 404 Personnalisée 🚫

**Impact**: 🟢 **FAIBLE UX**
**Effort**: 🟢 15min
**Priorité**: 🟢 **FAIBLE**

**Améliorer**:
```typescript
// src/pages/NotFound.tsx - Ajouter:
- Lien vers accueil
- Lien vers dashboard
- Recherche de thème ?
- Image/illustration sympathique
```

**Gain**: Utilisateurs perdus reviennent sur l'app

---

## 🔧 TECHNIQUE - Optimisations Code (différer après prod)

### 14. Lazy Load Routes Restantes 📦

**Impact**: 🟢 **FAIBLE PERF** - Déjà bien fait
**Effort**: 🟡 1h
**Priorité**: 🔵 **BASSE** (déjà optimisé)

**État actuel**: Déjà bien lazy-loadé
**À faire**: Vérifier que TOUTES les routes le sont

---

### 15. Optimiser Images (WebP/AVIF) 🖼️

**Impact**: 🟢 **FAIBLE PERF** - Peu d'images
**Effort**: 🟡 1h
**Priorité**: 🔵 **BASSE**

**État actuel**: Flags en SVG (optimal), illustrations en SVG
**À faire**: Convertir PNG icons en WebP si besoin

---

### 16. Audit Lighthouse 🚦

**Impact**: 🟡 **MOYENNE SEO+PERF**
**Effort**: 🟢 30min audit + 2h corrections
**Priorité**: 🟢 **MOYENNE** (après prod)

**Action**:
```bash
# Après déploiement
npx lighthouse https://ankilang.com --view
```

**Cibler**: Score > 90 sur tous les axes

---

## 📋 RÉCAPITULATIF PAR PRIORITÉ

### 🔥 URGENT (Avant Production) - 4-6h

| # | Tâche | Impact | Effort | Gain |
|---|-------|--------|--------|------|
| 1 | Fixer erreurs TypeScript critiques | 🔴 Bloquant | 2-3h | Stabilité |
| 2 | Variables env production | 🔴 Bloquant | 15min | App fonctionne |
| 3 | Fixer 52 erreurs ESLint | 🟡 Haute | 2-3h | Qualité code |

**Total**: 4-6h **← À FAIRE MAINTENANT**

---

### ⚡ QUICK WINS (Jour 1 après prod) - 2-3h

| # | Tâche | Impact | Effort | Gain |
|---|-------|--------|--------|------|
| 4 | Error Boundary React | 🟢 Haute UX | 30min | Pas de crash |
| 5 | Meta tags SEO | 🟢 Haute SEO | 15min | Indexation |
| 6 | robots.txt + sitemap | 🟢 Moyenne SEO | 10min | Google |
| 7 | Headers sécurité Vercel | 🟢 Haute Sécu | 10min | Protection XSS |
| 8 | Analytics (Plausible) | 🟢 Haute Business | 30min | Mesures |
| 12 | Toast notifications | 🟡 Moyenne UX | 30min | Feedback |

**Total**: 2-3h **← SEMAINE 1**

---

### 📊 MONITORING (Semaine 2) - 2h

| # | Tâche | Impact | Effort | Gain |
|---|-------|--------|--------|------|
| 9 | Error tracking (Sentry) | 🟢 Haute Ops | 1h | Bugs détectés |
| 10 | Web Vitals monitoring | 🟡 Moyenne SEO | 15min | Perfs réelles |
| 11 | Loading states | 🟡 Moyenne UX | 1-2h | UX pro |

**Total**: 2h **← SEMAINE 2**

---

### 🎨 POLISH (Après feedback) - 2-3h

| # | Tâche | Impact | Effort | Gain |
|---|-------|--------|--------|------|
| 13 | Page 404 améliorée | 🟢 Faible UX | 15min | Rétention |
| 16 | Audit Lighthouse | 🟡 Moyenne | 2-3h | Score SEO |

**Total**: 2-3h **← Différer**

---

## 🎯 PLAN D'ACTION RECOMMANDÉ

### Cette Semaine (Avant Production)

**Jour 1 - URGENT** (4-6h):
```bash
1. ✅ Flags lazy-load (FAIT)
2. ✅ PWA reactivation (FAIT)
3. 🔜 Fixer TypeScript errors (2-3h)
4. 🔜 Vérifier env vars (15min)
5. 🔜 Fixer ESLint errors (2-3h)
```

**Jour 2 - QUICK WINS** (2-3h):
```bash
6. Error Boundary (30min)
7. Meta SEO (15min)
8. robots.txt + sitemap (10min)
9. Headers Vercel (10min)
10. Analytics Plausible (30min)
11. Toast notifications (30min)
```

**Jour 3 - DEPLOY** 🚀:
```bash
git push origin main
# Tester en production
# Vérifier Analytics
# Monitorer erreurs
```

### Semaine Prochaine (Après Production)

**Monitoring** (2h):
```bash
- Sentry (1h)
- Web Vitals (15min)
- Loading states (1-2h)
```

### Plus Tard (Selon Feedback)

**Polish** (différer):
- Page 404 améliorée
- Audit Lighthouse
- Optimisations images

---

## 💡 RECOMMANDATION FINALE

**Pour lancer RAPIDEMENT** :

1. **Cette semaine** : Fixer les 52 erreurs TypeScript/ESLint (4-6h)
2. **Quick wins** : Error Boundary + SEO + Analytics (2-3h)
3. **DEPLOY** 🚀
4. **Semaine suivante** : Monitoring + Polish selon feedback

**Total avant prod** : 6-9h de travail
**Total semaine 1 post-prod** : 2-3h

**Ne PAS faire maintenant** :
- ❌ Framer Motion migration (12-30h)
- ❌ Capacitor (40h+)
- ❌ Refactoring majeur
- ❌ Nouvelles features

**Focus** : Stabilité + Monitoring + Lancement rapide

---

## ✅ Checklist Finale Avant Production

- [ ] Fixer 52 erreurs TypeScript
- [ ] Fixer 52 erreurs ESLint
- [ ] Vérifier variables env sur Vercel
- [ ] Error Boundary ajouté
- [ ] Meta tags SEO
- [ ] robots.txt + sitemap.xml
- [ ] Headers sécurité (vercel.json)
- [ ] Analytics (Plausible)
- [ ] Toast notifications
- [ ] Tester app en local (pnpm preview)
- [ ] Tester PWA offline mode
- [ ] Tester création carte + export Anki
- [ ] 🚀 **DEPLOY**

Après déploiement:
- [ ] Vérifier Analytics tracking
- [ ] Tester install prompt mobile
- [ ] Vérifier Google Search Console
- [ ] Ajouter Sentry
- [ ] Monitorer Web Vitals

**Temps total estimé avant prod** : 6-9h
**Objectif** : Production dans 2-3 jours max ! 🚀
