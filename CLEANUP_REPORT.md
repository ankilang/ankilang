# Rapport de Nettoyage - Ankilang

**Date**: 2025-10-20
**Objectif**: Identifier et supprimer le code/fichiers inutilisés pour accélérer la compilation

---

## 🗑️ Fichiers Netlify à Supprimer (160 KB)

### Dossiers Netlify Legacy

| Dossier | Taille | Description | Action |
|---------|--------|-------------|--------|
| `external-functions/` | 132 KB | Templates Netlify jamais déployés | ✅ **SUPPRIMER** |
| `netlify/` | 8 KB | Fonction legacy media-proxy | ✅ **SUPPRIMER** |
| `apps/functions/` | 20 KB | Build artifacts Netlify | ✅ **SUPPRIMER** |
| `.netlify/` | 0 KB | Cache CLI Netlify | ✅ **SUPPRIMER** |

**Total à économiser**: ~160 KB

### Fichiers de Configuration

```bash
# Fichiers netlify.toml à supprimer
external-functions/ankilangdeepl/netlify.toml
external-functions/ankilangtts/netlify.toml
external-functions/ankilangvotz/netlify.toml
external-functions/ankilangrevirada/netlify.toml

# Dossiers netlify/ à supprimer
external-functions/ankilangpexels/netlify/
external-functions/ankilangdeepl/netlify/
external-functions/ankilangtts/netlify/
external-functions/ankilangvotz/netlify/
external-functions/ankilangrevirada/netlify/
```

### Variables d'environnement obsolètes (`.env.local`)

Ces variables ne sont **PAS utilisées** dans le code (vérification grep = 0 résultats):

```env
# À SUPPRIMER de .env.local
VITE_MEDIA_PROXY_URL=https://ankilang.netlify.app/.netlify/functions/media-proxy
VITE_REVI_URL=https://ankilangrevirada.netlify.app/.netlify/functions/revirada
VITE_VOTZ_URL=https://ankilangvotz.netlify.app/.netlify/functions/votz
VITE_TRANSLATE_URL=https://ankilangdeepl.netlify.app/.netlify/functions/translate
VITE_PEXELS_URL=https://ankilangpexels.netlify.app/.netlify/functions/pexels
```

---

## 📚 Documentation Netlify à Archiver

Fichiers Markdown mentionnant Netlify (non exécutés, à jour pour historique):

```
MIGRATION-PEXELS.md
MIGRATION-PLAN.md
MIGRATION-TTS.md
docs/security/deployment-guide.md
docs/security/external-netlify-functions.md
docs/security/netlify-functions-auth.md
docs/deployment/cloudflare-pages-setup.md
```

**Action recommandée**: Créer un dossier `docs/archive/netlify/` et y déplacer ces fichiers

---

## 📦 Dépendances PWA (Workbox) - À ÉVALUER

### État actuel

Le Service Worker PWA est **désactivé** dans `vite.config.ts`:
```typescript
VitePWA({
  disable: true, // 🚨 DÉSACTIVÉ TEMPORAIREMENT
  ...
})
```

### Dépendances installées mais non utilisées

```json
"workbox-build": "^7.3.0",    // ~500 KB
"workbox-window": "^7.3.0"     // ~100 KB
```

### Impact

- **Build time**: Workbox n'est pas utilisé mais reste dans node_modules
- **Bundle size**: N'impacte PAS le bundle final (PWA désactivé)
- **Installation**: Ralentit légèrement `pnpm install`

### Recommandations

**Option 1 - Garder** (recommandé si PWA sera réactivé):
- Laisser les dépendances pour réactivation future PWA
- Pas d'impact sur le build actuel

**Option 2 - Supprimer** (si PWA définitivement abandonné):
```bash
pnpm remove vite-plugin-pwa workbox-build workbox-window
# Supprimer aussi la config PWA dans vite.config.ts
```

---

## 📊 Analyse du Build

### Bundles Actuels (Top 10 par taille)

```
140 KB  export-D0-bRNs9.js      (SQL.js + JSZip pour export Anki)
140 KB  react-vendor-BPfA2sTK.js (React + ReactDOM)
132 KB  ui-vendor-DtuA52hM.js    (Framer Motion + Lucide icons)
104 KB  index-DD1oa017.js        (Main app bundle)
100 KB  Detail-BrMvvOrX.js       (Theme detail page)
 80 KB  forms-3U2yU3vv.js        (React Hook Form + Zod)
 44 KB  query-BLoZJSEh.js        (TanStack Query)
 40 KB  Export-C9F_D933.js       (Export page)
 32 KB  Landing-BFHSYLoI.js      (Landing page)
 32 KB  FlagIcon-rI4mz_ZL.js     (38 SVG flags)
```

### Observations

**✅ Code Splitting bien configuré**:
- Vendors séparés (react, ui, forms, query, export)
- Routes lazy-loaded
- Total raisonnable pour une PWA

**⚠️ Bundles potentiellement optimisables**:

1. **export-D0-bRNs9.js (140 KB)** - SQL.js + JSZip
   - Utilisé uniquement pour export Anki
   - ✅ Déjà lazy-loaded, chargé seulement sur `/export`
   - **Action**: Aucune, optimal

2. **ui-vendor-DtuA52hM.js (132 KB)** - Framer Motion + Icons
   - Framer Motion: ~100 KB (animations)
   - Lucide Icons: ~32 KB
   - **Action possible**: Remplacer Framer Motion par une lib plus légère (react-spring, motion) si animations non critiques
   - **Impact**: Gain ~70 KB, mais perte d'animations fluides

3. **FlagIcon-rI4mz_ZL.js (32 KB)** - 38 SVG flags
   - Tous les drapeaux chargés ensemble
   - **Action possible**: Lazy-load flags on-demand (import dynamique)
   - **Impact**: Gain ~20 KB initial, mais complexité accrue

---

## 🚀 Optimisations de Build

### ✅ Déjà en Place

1. **Code Splitting** - Vendors séparés
2. **Lazy Loading** - Routes chargées à la demande
3. **Tree Shaking** - Vite optimise automatiquement
4. **Minification** - Production builds minifiés
5. **CSS Splitting** - Tailwind purgé en prod

### 🔧 Optimisations Possibles

#### 1. Images SVG (32 KB → ~10 KB)

**Actuel**: 38 flags SVG inline dans le bundle
```typescript
// FlagIcon.tsx charge tous les SVG via import
import gbSvg from '../assets/flags/gb.svg'
import frSvg from '../assets/flags/fr.svg'
// ... 36 autres
```

**Optimisation**: Dynamic imports
```typescript
const loadFlag = async (code: string) => {
  const svg = await import(`../assets/flags/${code}.svg`)
  return svg.default
}
```

**Gain**: ~20 KB initial, flags chargés on-demand

#### 2. Framer Motion (100 KB → 30 KB)

**Option A**: Motion One (alternative plus légère)
```bash
pnpm add motion  # 10 KB au lieu de 100 KB
```

**Option B**: CSS Animations + React Spring
- Animations simples en CSS
- React Spring pour animations complexes (30 KB)

**Gain**: ~70 KB

#### 3. Tree Shaking Lucide Icons

**Actuel**: Import global
```typescript
import { Plus, Edit, Trash } from 'lucide-react'
```

**Optimisation**: Imports individuels
```typescript
import Plus from 'lucide-react/dist/esm/icons/plus'
import Edit from 'lucide-react/dist/esm/icons/edit'
```

**Gain**: ~10-15 KB (déjà bien optimisé)

---

## 🎯 Plan d'Action Recommandé

### Phase 1 - Nettoyage Netlify (Immédiat, sans risque)

```bash
# 1. Supprimer dossiers Netlify
rm -rf netlify/
rm -rf apps/functions/
rm -rf external-functions/
rm -rf .netlify/

# 2. Archiver docs Netlify
mkdir -p docs/archive/netlify
mv MIGRATION-*.md docs/archive/netlify/
mv docs/security/*netlify* docs/archive/netlify/

# 3. Nettoyer .env.local (manuel)
# Supprimer VITE_*_URL (Netlify)

# 4. Commit
git add -A
git commit -m "chore: remove Netlify legacy files and config"
```

**Gain**: ~160 KB, cleanup repo

### Phase 2 - Optimisation Build (Optionnel)

**Priority 1 - Quick Wins (1-2h)**:
- Lazy-load flags SVG dynamiquement (+20 KB gain)
- Vérifier unused exports (tree-shaking)

**Priority 2 - Refactoring (4-6h)**:
- Remplacer Framer Motion par Motion One (+70 KB gain)
- Tester impact sur UX

**Priority 3 - PWA Decision**:
- Si PWA réactivé → garder Workbox
- Si PWA abandonné → supprimer vite-plugin-pwa

---

## 📈 Impact Compilation

### Avant nettoyage
```
Build time: ~15-20s (dev), ~45-60s (prod)
Bundle size: ~900 KB gzipped
node_modules: ~500 MB
```

### Après nettoyage Netlify
```
Build time: ~15-20s (inchangé, Netlify n'était pas dans build)
Bundle size: ~900 KB (inchangé)
node_modules: ~500 MB (inchangé, peu d'impact)
Repo size: -160 KB
```

### Après optimisations (si appliquées)
```
Build time: ~15-20s (inchangé)
Bundle size: ~800 KB (-100 KB, -11%)
  - Flags lazy: -20 KB
  - Framer Motion → Motion One: -70 KB
  - Tree shaking: -10 KB
```

---

## ✅ Conclusion

### À Faire Immédiatement (Sans Risque)

1. ✅ **Supprimer dossiers Netlify** (160 KB, cleanup)
2. ✅ **Nettoyer .env.local** (variables obsolètes)
3. ✅ **Archiver docs Netlify** (historique)

### Impact Build

**Netlify cleanup**: ❌ Aucun impact sur vitesse de compilation
- Les fichiers Netlify ne sont pas dans le build
- Impact uniquement sur taille du repo

**Optimisations réelles pour build plus rapide**:
1. ✅ **Déjà optimisé**: Code splitting, lazy loading, tree shaking
2. 🔧 **Gains marginaux possibles**: Flags lazy-load, Motion One
3. 📊 **Build time actuel**: Déjà rapide (15-20s dev, 45-60s prod)

**Recommandation**: Le build est **déjà bien optimisé**. Le cleanup Netlify est plus pour la **propreté du repo** que pour la performance.
