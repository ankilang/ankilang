# Vérification Migration Netlify → Vercel

**Date**: 2025-10-20
**Objectif**: Vérifier que l'application n'utilise plus Netlify mais uniquement Vercel

---

## ✅ Code Runtime (apps/web/src/) - CLEAN

### Services Migrés vers Vercel API

Tous les services utilisent maintenant `createVercelApiClient` et l'API Vercel (`ankilang-api-monorepo.vercel.app`):

1. **Traductions** ✅
   - `services/deepl.ts` → Vercel API `/api/deepl`
   - `services/revirada.ts` → Vercel API `/api/revirada`
   - `services/translate.ts` → Unified service (auto-routing Revirada/DeepL)

2. **TTS (Text-to-Speech)** ✅
   - `services/votz.ts` → Vercel API `/api/votz` (Occitan)
   - `services/elevenlabs.ts` → Vercel API `/api/elevenlabs` (multilingue)
   - `services/tts.ts` → Unified service

3. **Images** ✅
   - `services/pexels.ts` → Vercel API `/api/pexels` et `/api/pexels-optimize`

### Configuration
- `lib/vercel-api-client.ts` → Client API Vercel avec JWT auth
- `.env` → `VITE_VERCEL_API_URL=https://ankilang-api-monorepo.vercel.app` ✅

### Recherche Code Source
```bash
# Aucune référence à "netlify" dans le code source
grep -r "netlify" apps/web/src/ --include="*.ts" --include="*.tsx"
# → 0 résultats

# Aucune référence à "netlify.app"
grep -r "netlify\.app" apps/web/src/
# → 0 résultats

# Aucune variable NETLIFY
grep -r "NETLIFY" apps/web/src/
# → 0 résultats
```

**Résultat**: ✅ **Code runtime 100% propre, aucune référence Netlify**

---

## ⚠️ Fichiers de Configuration Legacy - À NETTOYER

### 1. Variables d'environnement obsolètes (`.env.local`)

**Fichier**: `/apps/web/.env.local`

Variables Netlify **non utilisées** (à supprimer):
```env
VITE_MEDIA_PROXY_URL=https://ankilang.netlify.app/.netlify/functions/media-proxy
VITE_REVI_URL=https://ankilangrevirada.netlify.app/.netlify/functions/revirada
VITE_VOTZ_URL=https://ankilangvotz.netlify.app/.netlify/functions/votz
VITE_TRANSLATE_URL=https://ankilangdeepl.netlify.app/.netlify/functions/translate
VITE_PEXELS_URL=https://ankilangpexels.netlify.app/.netlify/functions/pexels
```

**Impact**: ⚠️ Ces variables ne sont **pas utilisées** par le code (grep confirme 0 usage)
**Action**: Supprimer du `.env.local` (fichier local, non commité)

---

### 2. Dossiers Netlify Functions (non utilisés)

#### a) `netlify/` (racine)
```
netlify/functions/media-proxy.ts
```
**Impact**: Fonction legacy non appelée
**Action**: `rm -rf netlify/`

#### b) `apps/functions/`
```
apps/functions/
├── cache-janitor/package.json (vide)
├── dist/lib/auth.js (build legacy)
├── node_modules/@netlify (dépendances)
└── src/ (vide)
```
**Impact**: Dossier legacy Netlify Functions
**Action**: `rm -rf apps/functions/`

#### c) `external-functions/`
```
external-functions/
├── ankilangdeepl/ (templates Netlify)
├── ankilangtts/
├── ankilangvotz/
└── ankilangrevirada/
```
**Impact**: Templates de fonctions Netlify jamais déployés
**Action**: `rm -rf external-functions/`

#### d) `.netlify/` (cache build)
```
.netlify/ (dossiers vides de cache Netlify CLI)
```
**Impact**: Cache build local
**Action**: `rm -rf .netlify/`

---

## 📋 Actions Recommandées

### Nettoyage Immédiat (sans risque)

```bash
# 1. Supprimer les dossiers Netlify legacy
rm -rf netlify/
rm -rf apps/functions/
rm -rf external-functions/
rm -rf .netlify/

# 2. Nettoyer .env.local (manuel)
# Ouvrir apps/web/.env.local et supprimer les lignes:
#   VITE_MEDIA_PROXY_URL
#   VITE_REVI_URL
#   VITE_VOTZ_URL
#   VITE_TRANSLATE_URL
#   VITE_PEXELS_URL

# 3. Vérifier qu'aucune référence Netlify ne reste
grep -r "netlify" --include="*.ts" --include="*.tsx" --include="*.js" apps/web/src/
# Résultat attendu: 0 résultats
```

### Mise à jour Documentation (optionnel)

Fichiers de documentation mentionnant Netlify (non exécutés par l'app):
```
MIGRATION-PLAN.md
MIGRATION-TTS.md
docs/security/*
```

**Action optionnelle**: Mettre à jour ou archiver ces docs si migration terminée

---

## ✅ Vérifications Post-Migration

### 1. Tests Runtime
- [ ] Traduction FR → OC (Revirada) fonctionne
- [ ] Traduction FR → EN (DeepL) fonctionne
- [ ] TTS Occitan (Votz) fonctionne
- [ ] TTS Multilingue (ElevenLabs) fonctionne
- [ ] Images Pexels (search + optimize) fonctionnent

### 2. Configuration Vercel API
- [x] `.env` contient `VITE_VERCEL_API_URL`
- [x] Client API utilise JWT Appwrite (`Authorization: Bearer`)
- [ ] CORS configuré pour `http://localhost:5173` (dev)
- [ ] CORS configuré pour `https://ankilang.com` (prod)

### 3. Monitoring
- [ ] Vérifier logs Vercel API (pas d'erreurs 401/403)
- [ ] Vérifier métriques d'utilisation API

---

## 🎯 Résumé

| Composant | État | Action |
|-----------|------|--------|
| Code source (`apps/web/src/`) | ✅ Clean | Aucune |
| Services API | ✅ Vercel | Aucune |
| Configuration `.env` | ✅ Vercel | Aucune |
| `.env.local` | ⚠️ Variables obsolètes | Supprimer manuellement |
| `netlify/` | ⚠️ Dossier legacy | `rm -rf netlify/` |
| `apps/functions/` | ⚠️ Dossier legacy | `rm -rf apps/functions/` |
| `external-functions/` | ⚠️ Templates | `rm -rf external-functions/` |
| `.netlify/` | ⚠️ Cache | `rm -rf .netlify/` |

**Conclusion**: ✅ L'application **n'utilise plus Netlify** côté runtime.
Seuls des fichiers de config/templates legacy restent à supprimer (sans impact fonctionnel).
