# ✅ Checklist Finale pour Mise en Production

**Dernière mise à jour** : 2025-01-20
**Objectif** : Lancer Ankilang en production de manière stable et sécurisée

---

## 🔴 Critiques (À faire AVANT production)

### 1. **Fixer le TTS Votz** ⏳ EN COURS
**Statut** : Logs de débogage ajoutés, en attente de test

**Problème identifié** :
```
[Votz] Error: Expected file mode response from Votz API
```

**Actions** :
- [x] Ajouter logs de débogage dans `votz.ts`
- [ ] Tester la génération TTS Votz avec un thème Occitan
- [ ] Vérifier la réponse API réelle (structure JSON)
- [ ] Fixer le type guard si nécessaire
- [ ] Vérifier que l'API Vercel `/api/votz` retourne bien `{ audio: string, mode: 'file', ... }`

**Fichiers impliqués** :
- `apps/web/src/services/votz.ts:75-105`
- `apps/web/src/types/ankilang-vercel-api.ts:169-182`
- API Vercel : `ankilang-api-monorepo.vercel.app/api/votz`

---

### 2. **Fixer le test storage-paths** ⚠️ 1 test en échec
**Statut** : 31 tests OK, 1 échec

**Erreur** :
```
Expected: "cache/pexels/a3f2e1d9c8b7a6f5e4d3c2b1a0f9.webp"
Received: "cache/pexels/a3f2e1d9c8b7a6f5e4d3c2b1a0f9e8d7.webp"
```

**Cause** : Le hash est tronqué à 32 chars mais le test attend le hash complet tronqué différemment

**Actions** :
- [ ] Fixer le test dans `apps/web/src/utils/__tests__/storage-paths.test.ts:29`
- [ ] Vérifier que la logique de troncature dans `buildStoragePath()` est correcte

**Impact** : Faible (test unitaire), mais doit être corrigé pour CI/CD

---

### 3. **Fixer les warnings React Router Future Flags** ⚠️ 2 warnings
**Problème** :
```
⚠️ React Router Future Flag Warning: v7_startTransition
⚠️ React Router Future Flag Warning: v7_relativeSplatPath
```

**Actions** :
- [ ] Ajouter les flags dans `BrowserRouter` de `main.tsx` ou `App.tsx`
```typescript
<BrowserRouter future={{
  v7_startTransition: true,
  v7_relativeSplatPath: true
}}>
```

**Impact** : Moyen (préparation pour React Router v7)

---

### 4. **Fixer l'erreur Suspense synchrone** 🔴 CRITIQUE
**Problème** :
```
Error: A component suspended while responding to synchronous input.
This will cause the UI to be replaced with a loading indicator.
To fix, updates that suspend should be wrapped with startTransition.
```

**Cause probable** : Lazy loading de drapeaux (`FlagIcon.tsx`) bloque le rendu synchrone

**Actions** :
- [ ] Identifier le composant qui suspend (probablement `FlagIcon`)
- [ ] Wrapper les mises à jour avec `React.startTransition()` ou ajouter `<Suspense fallback>`
- [ ] Ou revenir au chargement eager des flags si trop complexe

**Fichiers impliqués** :
- `apps/web/src/components/ui/FlagIcon.tsx:27` (flag not found: general)
- `apps/web/src/routes/RootRoutes.tsx`

**Impact** : **CRITIQUE** (affiche l'ErrorBoundary en production)

---

### 5. **Fixer le flag "general" manquant** ⚠️ Fallback actif
**Problème** :
```
Flag not found: general, using fallback
```

**Cause** : Certains thèmes ont `targetLang: "general"` mais aucun flag correspondant

**Actions** :
- [ ] Option 1 (recommandée) : Ajouter un flag `general.svg` (icône monde/globe)
- [ ] Option 2 : Changer la valeur par défaut de `targetLang` dans `themes.service.ts:32`
- [ ] Option 3 : Améliorer le fallback pour ne pas logger d'erreur

**Fichiers impliqués** :
- `apps/web/src/components/ui/FlagIcon.tsx:27`
- `apps/web/src/services/themes.service.ts:32`

**Impact** : Moyen (UX dégradée, logs bruyants)

---

### 6. **Vérifier l'URL audio invalide** ⚠️ Erreur TTS
**Problème** :
```
❌ URL audio invalide: audio_1760972586309.mp3
```

**Cause** : URL relative au lieu de `data:` ou `blob:` ou `https:`

**Actions** :
- [ ] Vérifier que `ttsToTempURL()` retourne bien un blob URL ou base64 data URL
- [ ] Vérifier que `NewCardModal.tsx:389` valide correctement les URLs

**Fichiers impliqués** :
- `apps/web/src/services/votz.ts:109-112`
- `apps/web/src/components/cards/NewCardModal.tsx:406`

**Impact** : **CRITIQUE** (TTS ne fonctionne pas)

---

### 7. **Fixer la réponse Pexels undefined** ⚠️ Search échoue
**Problème** :
```
[Pexels] Found undefined results
```

**Cause** : L'API ne retourne pas `photos` dans la réponse attendue

**Actions** :
- [ ] Vérifier la structure de réponse de `/api/pexels` Vercel API
- [ ] Ajouter gestion d'erreur si `result.photos === undefined`
- [ ] Logger la réponse complète pour debugging

**Fichiers impliqués** :
- `apps/web/src/services/pexels.ts:59`

**Impact** : Moyen (recherche d'images échoue)

---

## 🟡 Haute Priorité (Semaine 1 production)

### 8. **Toast Notifications - Sonner** (30min)
**Pourquoi** : Feedback utilisateur critique pour erreurs TTS, création cartes, etc.

**Actions** :
- [ ] Installer `npm install sonner`
- [ ] Ajouter `<Toaster />` dans `App.tsx`
- [ ] Remplacer les `console.error()` par `toast.error()` dans :
  - `NewCardModal.tsx:358` (erreur TTS)
  - `Detail.tsx:88` (erreur suppression carte)
  - `New.tsx` (erreur création thème)

**Bénéfice** : UX +++ (utilisateur voit les erreurs au lieu de devoir ouvrir la console)

---

### 9. **Monitoring Errors - Sentry** (1h)
**Pourquoi** : Capter les erreurs en production (Suspense, TTS, API, etc.)

**Actions** :
- [ ] Créer compte Sentry (gratuit jusqu'à 5k events/mois)
- [ ] `npm install @sentry/react`
- [ ] Init dans `main.tsx` :
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```
- [ ] Ajouter `VITE_SENTRY_DSN` dans `.env`

**Bénéfice** : Visibilité totale sur les erreurs production

---

### 10. **Web Vitals Monitoring** (15min)
**Pourquoi** : Suivre les performances (LCP, FID, CLS)

**Actions** :
- [ ] `npm install web-vitals`
- [ ] Créer `apps/web/src/utils/reportWebVitals.ts`
- [ ] Envoyer metrics à Plausible ou Google Analytics
- [ ] Init dans `main.tsx`

**Bénéfice** : Identifier les pages lentes

---

### 11. **Variables d'environnement production** (10min)
**Pourquoi** : Vérifier que toutes les clés API sont configurées

**Actions** :
- [ ] Créer `.env.production` avec toutes les clés
- [ ] Vérifier Vercel dashboard : Variables d'environnement renseignées ?
- [ ] Liste des variables requises :
  ```
  VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
  VITE_APPWRITE_PROJECT_ID=...
  VITE_APPWRITE_BUCKET_ID=flashcard-images
  VITE_VERCEL_API_URL=https://ankilang-api-monorepo.vercel.app
  VITE_VERCEL_API_ORIGIN=https://ankilang.com
  VITE_SENTRY_DSN=...
  ```

**Impact** : **CRITIQUE** (app ne fonctionne pas sans)

---

## 🟢 Moyenne Priorité (Semaine 2)

### 12. **Loading States Review** (1-2h)
**Problème** : Certaines actions (TTS, translate) n'ont pas de feedback visuel

**Actions** :
- [ ] Audit de tous les `useMutation` sans état `isPending`
- [ ] Ajouter spinners/skeletons pour :
  - Génération TTS (`NewCardModal.tsx`)
  - Traduction (`NewCardModal.tsx`)
  - Upload image Pexels
  - Création/suppression carte

**Bénéfice** : UX ++

---

### 13. **ESLint Remaining Errors** (2-3h)
**Statut** : 34 erreurs restantes (non-critiques)

**Catégories** :
- `@typescript-eslint/no-unnecessary-condition` (11)
- `@typescript-eslint/no-misused-promises` (8)
- `@typescript-eslint/no-floating-promises` (7)
- `@typescript-eslint/prefer-nullish-coalescing` (4)
- `@typescript-eslint/require-await` (4)

**Actions** :
- [ ] Fixer les `no-floating-promises` (impact sécurité moyen)
- [ ] Ignorer ou fixer le reste selon priorité

**Impact** : Faible (qualité code, pas de bugs)

---

### 14. **CI/CD Pipeline** (2-3h)
**Pourquoi** : Automatiser build, tests, deploy

**Actions** :
- [ ] Créer `.github/workflows/ci.yml` :
  - Lint (`pnpm typecheck`)
  - Tests (`pnpm test`)
  - Build (`pnpm build`)
- [ ] Créer `.github/workflows/deploy.yml` :
  - Deploy auto sur `main` → Vercel production
  - Deploy auto sur `dev` → Vercel preview

**Bénéfice** : Qualité +++ (pas de régression)

---

### 15. **Offline Mode Improvements** (3-4h)
**Statut** : PWA activée, mais création cartes nécessite connexion

**Actions** :
- [ ] Permettre création carte offline (queue locale)
- [ ] Sync auto quand connexion revient
- [ ] Améliorer UX quand offline (banner, disabled buttons)

**Bénéfice** : Expérience offline complète

---

## 🔵 Basse Priorité (Post-launch)

### 16. **Tests E2E - Playwright** (4-6h)
**Pourquoi** : Tester les flows critiques

**Flows à tester** :
- Inscription → Connexion
- Création thème → Création carte → Export Anki
- Génération TTS → Traduction

---

### 17. **Framer Motion Migration** (12-30h)
**Problème** : 34 ESLint errors liés à Framer Motion

**Décision** : **DEFER** (trop risqué pour MVP)

---

### 18. **Capacitor (App Store)** (40h+)
**Pourquoi** : Distribution sur App Store/Google Play

**Décision** : **DEFER** jusqu'à besoin business avéré

---

## 📊 Récapitulatif Priorisation

| Catégorie | Tâches | Temps estimé | Impact |
|-----------|--------|--------------|--------|
| 🔴 Critiques | 7 | 4-6h | **BLOQUANT** |
| 🟡 Haute priorité | 4 | 2-3h | Production-ready |
| 🟢 Moyenne priorité | 4 | 6-10h | Qualité++ |
| 🔵 Basse priorité | 3 | 56-100h+ | Post-launch |

**Total MVP** : 6-9h (Critiques + Haute priorité)

---

## 🎯 Plan d'action recommandé

### Phase 1 : MVP Stable (6-9h)
1. ✅ Fixer TTS Votz (tester + corriger)
2. ✅ Fixer erreur Suspense (FlagIcon + lazy loading)
3. ✅ Fixer flag "general" manquant
4. ✅ Ajouter Toast notifications (Sonner)
5. ✅ Setup Sentry monitoring
6. ✅ Vérifier variables env production
7. ✅ Fixer test storage-paths
8. ✅ Ajouter Future Flags React Router

**Résultat** : App stable, déployable, erreurs captées

---

### Phase 2 : Production Polish (6-10h)
1. Loading states review
2. Web Vitals monitoring
3. ESLint critical errors (floating promises)
4. CI/CD pipeline

**Résultat** : UX professionnelle, qualité code

---

### Phase 3 : Post-Launch (flexible)
1. Offline improvements
2. Tests E2E
3. Framer Motion migration (si nécessaire)
4. Capacitor (si distribution stores)

---

## ✅ Déjà fait

- [x] **PWA réactivée** (Service Worker, précache 118 assets)
- [x] **Migration ElevenLabs** (Vercel API uniquement, cohérence++)
- [x] **SEO** : robots.txt, sitemap.xml
- [x] **Analytics** : Plausible installé + tracking SPA
- [x] **Security headers** : CSP, HSTS, X-Frame-Options dans Vercel
- [x] **Error Boundary** : Global dans `App.tsx`
- [x] **TypeScript** : 0 erreur (5 → 0 fixées)
- [x] **ESLint critiques** : 52 → 34 (18 fixées)
- [x] **Architecture TTS unifiée** : `tts.ts` orchestrateur unique

---

## 📝 Notes

- **Focus MVP** : Fixer les 7 items critiques avant toute chose
- **Ne pas sur-optimiser** : Les 34 ESLint warnings peuvent attendre
- **Tester en conditions réelles** : Créer un thème Occitan + TTS pour valider le fix Votz
- **Monitoring prioritaire** : Sentry va révéler les vrais problèmes production

**Objectif final** : Lancement production en **6-9h de travail** (critiques + haute priorité)
