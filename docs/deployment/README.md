# 🚀 Guide de déploiement Ankilang

## ✅ État actuel

**Sécurisation terminée** : Toutes les fonctions Netlify externes sont sécurisées avec JWT.

**Frontend prêt** : Services mis à jour pour envoyer JWT vers les fonctions sécurisées.

**CORS configuré** : Media-proxy accepte les domaines Cloudflare Pages.

## 📋 Actions réalisées

### 1. **Sécurisation des fonctions externes** ✅
- ✅ `ankilangrevirada` - Traduction Occitan (JWT + CORS)
- ✅ `ankilangvotz` - TTS Occitan (JWT + CORS)  
- ✅ `ankilangtts` - TTS multilingue (JWT + CORS)
- ✅ `ankilangdeepl` - Traduction DeepL (JWT + CORS)
- ✅ `ankilangpexels` - Images Pexels (JWT + CORS)

### 2. **Mise à jour du frontend** ✅
- ✅ `revirada.ts` - JWT ajouté
- ✅ `votz.ts` - JWT ajouté
- ✅ `tts.ts` - JWT ajouté
- ✅ `deepl.ts` - JWT ajouté
- ✅ `pexels.ts` - JWT déjà présent

### 3. **Configuration CORS** ✅
- ✅ `media-proxy.ts` - Domaines Cloudflare Pages ajoutés
- ✅ Origines autorisées : `ankilang.pages.dev`, `ankilang.com`

## 🎯 Prochaines étapes

### 1. **Déployer sur Cloudflare Pages**

```bash
# 1. Aller sur https://pages.cloudflare.com/
# 2. Créer un projet depuis le repo GitHub
# 3. Configurer :
#    - Project root: apps/web
#    - Build command: corepack enable && pnpm install --frozen-lockfile && pnpm --filter=@ankilang/web build
#    - Output directory: dist
#    - Node.js version: 18
```

### 2. **Variables d'environnement**

```bash
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=ankilang
VITE_MEDIA_PROXY_URL=https://ankilang.netlify.app/.netlify/functions/media-proxy
```

### 3. **Tests de validation**

```bash
# Tester la sécurité
node scripts/test-security.mjs

# Tester l'intégration
# 1. Se connecter sur https://ankilang.pages.dev
# 2. Créer un thème Occitan
# 3. Ajouter une carte avec traduction
# 4. Tester l'audio Occitan
# 5. Exporter en .apkg
```

## 📊 Monitoring

### Logs à surveiller
- **Authentification** : Taux d'échec JWT par service
- **Rate limiting** : Nombre de requêtes bloquées
- **CORS** : Erreurs d'origine non autorisée
- **Performance** : Temps de réponse des fonctions

### Alertes recommandées
- **> 10% d'échecs d'authentification** par heure
- **> 50% de requêtes bloquées** par rate limiting
- **Temps de réponse > 5s** sur 10% des requêtes

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

## 🎉 Déploiement réussi

Une fois tous les tests passés :

1. **Ankilang est déployé** sur Cloudflare Pages
2. **Toutes les fonctions** sont sécurisées avec JWT
3. **CORS** est configuré pour les domaines Cloudflare
4. **Export Anki** fonctionne avec audio
5. **Monitoring** est opérationnel

**URL de production** : `https://ankilang.pages.dev`

## 📚 Documentation

- [Configuration Cloudflare Pages](cloudflare-pages-setup.md)
- [Sécurisation des fonctions externes](../security/external-netlify-functions.md)
- [Guide de déploiement](../security/deployment-guide.md)
- [Authentification Netlify Functions](../security/netlify-functions-auth.md)
