# Configuration Cloudflare Pages pour Ankilang

## 🎯 Vue d'ensemble

Ce guide détaille la configuration de Cloudflare Pages pour déployer le frontend Ankilang avec les fonctions Netlify sécurisées.

## 📋 Configuration Cloudflare Pages

### 1. **Créer le projet**

1. Aller sur [Cloudflare Pages](https://pages.cloudflare.com/)
2. Cliquer sur "Create a project"
3. Connecter le repository GitHub `ankilang`

### 2. **Configuration du build**

**Project root** : `apps/web` (ou laisser vide si racine)

**Build command** :
```bash
corepack enable && pnpm install --frozen-lockfile && pnpm --filter=@ankilang/web build
```

**Output directory** : `dist`

**Node.js version** : `18` ou `20`

### 3. **Variables d'environnement**

Dans **Pages → Settings → Environment variables** :

```bash
# Appwrite (obligatoire)
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=ankilang

# Media proxy (obligatoire pour l'export audio)
VITE_MEDIA_PROXY_URL=https://ankilang.netlify.app/.netlify/functions/media-proxy

# Services externes (optionnel - URLs par défaut)
VITE_REVI_URL=https://ankilangrevirada.netlify.app/.netlify/functions/revirada
VITE_VOTZ_URL=https://ankilangvotz.netlify.app/.netlify/functions/votz
VITE_TRANSLATE_URL=https://ankilangdeepl.netlify.app/.netlify/functions/translate
VITE_PEXELS_URL=https://ankilangpexels.netlify.app/.netlify/functions/pexels
```

### 4. **Configuration SPA (Single Page Application)**

Dans **Pages → Settings → Functions** :

- Activer "Single Page Application" 
- OU ajouter un fichier `apps/web/public/_redirects` avec :
```
/* /index.html 200
```

### 5. **Domaine personnalisé (optionnel)**

Dans **Pages → Custom domains** :

- Ajouter `ankilang.com` (si vous avez un domaine)
- Configurer les DNS selon les instructions Cloudflare

## 🔧 Configuration avancée

### Headers de sécurité

Dans **Pages → Settings → Headers** :

```bash
# Headers de sécurité
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### Cache et performance

```bash
# Cache statique (1 an)
/*.js: Cache-Control: public, max-age=31536000, immutable
/*.css: Cache-Control: public, max-age=31536000, immutable
/*.png: Cache-Control: public, max-age=31536000, immutable
/*.jpg: Cache-Control: public, max-age=31536000, immutable
/*.webp: Cache-Control: public, max-age=31536000, immutable

# HTML (pas de cache)
/*.html: Cache-Control: no-cache, no-store, must-revalidate
```

## 🚀 Déploiement

### Déploiement automatique

1. **Push sur main** → Déploiement automatique
2. **Pull Request** → Preview deployment
3. **Branches** → Déploiement par branche

### Déploiement manuel

```bash
# Installer Wrangler CLI
npm install -g wrangler

# Login
wrangler login

# Déployer
wrangler pages deploy apps/web/dist --project-name=ankilang
```

## 🧪 Tests post-déploiement

### 1. **Test d'authentification**

```bash
# Ouvrir https://ankilang.pages.dev
# Se connecter avec un compte Appwrite
# Vérifier que le dashboard s'affiche
```

### 2. **Test des services sécurisés**

```bash
# Créer un thème Occitan
# Ajouter une carte avec traduction
# Vérifier que la traduction fonctionne (401 sans JWT, 200 avec JWT)

# Tester l'audio Occitan
# Vérifier que le TTS fonctionne

# Tester l'export Anki
# Vérifier que l'export .apkg fonctionne avec audio
```

### 3. **Test CORS**

```bash
# Vérifier que les requêtes vers les fonctions Netlify fonctionnent
# Vérifier que le media-proxy fonctionne pour l'export audio
```

## 📊 Monitoring

### Métriques Cloudflare

- **Analytics** : Visiteurs, pages vues, performance
- **Security** : Attaques bloquées, bot score
- **Performance** : Core Web Vitals, cache hit ratio

### Logs des fonctions Netlify

- **ankilangrevirada** : Logs de traduction
- **ankilangvotz** : Logs de TTS
- **ankilangtts** : Logs de TTS multilingue
- **ankilangdeepl** : Logs de traduction DeepL
- **ankilangpexels** : Logs d'images
- **media-proxy** : Logs de proxy CORS

## 🔒 Sécurité

### Authentification

- ✅ **JWT Appwrite** sur toutes les fonctions
- ✅ **CORS strict** avec origines autorisées
- ✅ **Rate limiting** par utilisateur
- ✅ **Logs d'audit** avec traceId

### Headers de sécurité

- ✅ **X-Frame-Options: DENY**
- ✅ **X-Content-Type-Options: nosniff**
- ✅ **X-XSS-Protection: 1; mode=block**
- ✅ **Referrer-Policy: strict-origin-when-cross-origin**

## 🚨 Dépannage

### Erreurs courantes

**1. CORS errors**
```
Access to fetch at 'https://ankilangrevirada.netlify.app/.netlify/functions/revirada' 
from origin 'https://ankilang.pages.dev' has been blocked by CORS policy
```
→ Vérifier que le domaine Cloudflare est dans les origines autorisées

**2. 401 Authentication required**
```
User not authenticated. Please log in to use translation.
```
→ Vérifier que l'utilisateur est connecté et que le JWT est valide

**3. Media proxy errors**
```
Origin not allowed
```
→ Vérifier que `https://ankilang.pages.dev` est dans `isAllowedOrigin`

### Debug

```bash
# Vérifier les variables d'environnement
console.log(import.meta.env.VITE_APPWRITE_ENDPOINT)

# Vérifier les JWT
const jwt = await getSessionJWT()
console.log('JWT:', jwt ? 'Present' : 'Missing')

# Vérifier les URLs des services
console.log('Revirada URL:', import.meta.env.VITE_REVI_URL)
```

## ✅ Checklist de déploiement

- [ ] **Projet Cloudflare Pages** créé
- [ ] **Build command** configuré
- [ ] **Variables d'environnement** définies
- [ ] **SPA** activé
- [ ] **Headers de sécurité** configurés
- [ ] **Déploiement** réussi
- [ ] **Tests d'authentification** passés
- [ ] **Tests des services** passés
- [ ] **Tests CORS** passés
- [ ] **Monitoring** configuré

## 🎉 Déploiement réussi

Une fois tous les tests passés :

1. **Ankilang est déployé** sur Cloudflare Pages
2. **Toutes les fonctions** sont sécurisées avec JWT
3. **CORS** est configuré pour les domaines Cloudflare
4. **Export Anki** fonctionne avec audio
5. **Monitoring** est opérationnel

**URL de production** : `https://ankilang.pages.dev`
