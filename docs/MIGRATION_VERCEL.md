# Migration Appwrite Sites → Vercel

## 📋 Vue d'ensemble

Cette migration consiste à **déplacer uniquement l'hébergement du frontend** d'Appwrite Sites vers Vercel. Tous les autres services restent inchangés.

### Ce qui change
- ✅ **Hébergement static** : Appwrite Sites → Vercel Edge Network
- ✅ **Déploiement** : Dashboard Appwrite → Git push auto (Vercel)

### Ce qui NE change PAS
- ✅ **Base de données** : Appwrite Database (inchangé)
- ✅ **Authentification** : Appwrite Auth (inchangé)
- ✅ **Stockage fichiers** : Appwrite Storage (inchangé)
- ✅ **Backend API** : Vercel (`ankilang-api-monorepo.vercel.app`) (déjà en place)
- ✅ **Analytics** : Plausible (inchangé)

## 🚀 Guide de migration (15 min)

### Étape 1 : Préparer le projet (déjà fait ✅)

Les fichiers suivants ont été configurés :
- ✅ `vercel.json` - Configuration Vercel (routing SPA + headers sécurité)
- ✅ `.env.vercel.example` - Variables d'environnement de référence
- ✅ `package.json` - Script `build:vercel` ajouté

### Étape 2 : Créer le projet Vercel

1. **Aller sur** [vercel.com](https://vercel.com)
2. **Cliquer** sur "Add New Project"
3. **Importer** le repository GitHub `ankilang`
4. **Configuration** :
   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: cd apps/web && pnpm build
   Output Directory: apps/web/dist
   Install Command: pnpm install --frozen-lockfile
   ```

### Étape 3 : Configurer les variables d'environnement

Dans **Vercel Dashboard** → **Settings** → **Environment Variables**, ajouter :

#### Production
```bash
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=<votre-project-id>
VITE_APPWRITE_BUCKET_ID=flashcard-images

VITE_VERCEL_API_URL=https://ankilang-api-monorepo.vercel.app
VITE_VERCEL_API_ORIGIN=https://ankilang.com

VITE_CACHE_ENABLE=true
VITE_CACHE_SERVER_SYNC=false
VITE_CACHE_METRICS=true
VITE_SW_CACHE_VERSION=v4
VITE_CACHE_TTS_TTL_DAYS=7
VITE_CACHE_PEXELS_TTL_DAYS=180

VITE_PLAUSIBLE_DOMAIN=ankilang.com

NODE_ENV=production
```

#### Preview (branches de feature)
Mêmes variables avec :
```bash
VITE_VERCEL_API_ORIGIN=https://preview.ankilang.com
VITE_CACHE_METRICS=false
NODE_ENV=preview
```

#### Development (local)
Utiliser `.env.local` avec les valeurs de développement

### Étape 4 : Configurer le domaine

1. **Vercel Dashboard** → **Settings** → **Domains**
2. **Ajouter** `ankilang.com` et `www.ankilang.com`
3. **Configurer DNS** chez votre registrar :
   ```
   Type: A
   Name: @
   Value: 76.76.21.21 (Vercel IP)

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. **Attendre** propagation DNS (max 48h, souvent < 1h)

### Étape 5 : Mettre à jour Appwrite CORS

Dans **Appwrite Console** → **Settings** → **Platforms** :
- ✅ Ajouter `https://ankilang.com`
- ✅ Ajouter `https://www.ankilang.com`
- ✅ Ajouter `https://*.vercel.app` (pour les preview deployments)
- ⚠️ Garder temporairement l'ancien domaine Appwrite Sites

### Étape 6 : Premier déploiement

1. **Commit** les changements :
   ```bash
   git add vercel.json .env.vercel.example package.json docs/MIGRATION_VERCEL.md
   git commit -m "chore: configure Vercel deployment"
   git push origin main
   ```

2. **Vercel** détecte le push et build automatiquement

3. **Vérifier** le déploiement :
   - ✅ Build réussi
   - ✅ Application accessible sur `https://ankilang.vercel.app`
   - ✅ Routes fonctionnelles (`/app/themes`, `/auth/login`, etc.)
   - ✅ PWA installable
   - ✅ Appwrite connexion OK

### Étape 7 : Tests de validation

#### Tests fonctionnels
- [ ] **Auth** : Login / Signup / Logout
- [ ] **Themes** : Créer / Modifier / Supprimer
- [ ] **Cards** : Créer Basic / Cloze avec images et audio
- [ ] **Export** : Export Anki (.apkg)
- [ ] **Translation** : DeepL + Revirada
- [ ] **TTS** : Votz (Occitan) + ElevenLabs (autres langues)
- [ ] **Images** : Recherche Pexels + sélection
- [ ] **PWA** : Installation + mode offline

#### Tests techniques
- [ ] **Routing** : Navigation profonde (`/app/themes/123`)
- [ ] **Refresh** : F5 sur route profonde ne donne pas 404
- [ ] **Headers** : CSP, HSTS, etc. (DevTools → Network)
- [ ] **Performance** : Lighthouse score > 90
- [ ] **Cache** : Service Worker actif

### Étape 8 : Basculement DNS production

Une fois les tests validés :

1. **Configurer domaine principal** sur Vercel
2. **Supprimer ancien site** Appwrite (ou désactiver)
3. **Monitorer** les métriques Plausible
4. **Vérifier** les logs Vercel pour erreurs

## 🔧 Configuration avancée

### Vercel Analytics (optionnel)
```bash
pnpm add @vercel/analytics
```
```typescript
// apps/web/src/main.tsx
import { Analytics } from '@vercel/analytics/react'

<App />
<Analytics />
```

### Preview Deployments
Chaque branche → URL unique :
```
https://ankilang-git-feature-xyz.vercel.app
```

### Environment Variables par branche
```bash
# Production uniquement
VITE_FEATURE_FLAG_NEW_EXPORT=true

# Preview uniquement
VITE_DEBUG_MODE=true
```

## 🐛 Troubleshooting

### Build échoue
```bash
# Vérifier localement
pnpm build:vercel

# Vérifier les logs Vercel
vercel logs <deployment-url>
```

### 404 sur routes profondes
→ Vérifier `vercel.json` rewrites

### CORS errors
→ Vérifier Appwrite Platform settings

### Service Worker ne s'active pas
→ Vérifier HTTPS + vérifier console

### Images/Audio ne chargent pas
→ Vérifier CSP header + Appwrite bucket permissions

## 📊 Monitoring post-migration

### Vercel Dashboard
- **Deployments** : Historique + logs
- **Analytics** : Visiteurs, performances
- **Logs** : Runtime errors

### Plausible Analytics
- Comparer trafic avant/après
- Vérifier taux de rebond
- Monitorer conversions

### Appwrite Console
- **Database** : Requêtes/s
- **Storage** : Bande passante
- **Auth** : Sessions actives

## 🎯 Rollback (si nécessaire)

Si problème majeur :
1. **Réactiver** ancien site Appwrite
2. **Changer DNS** pour pointer vers Appwrite
3. **Analyser logs** Vercel pour comprendre le problème
4. **Corriger** puis re-déployer

## ✅ Checklist finale

- [ ] `vercel.json` configuré avec rewrites + headers
- [ ] Variables d'environnement Vercel configurées
- [ ] Premier déploiement réussi sur `*.vercel.app`
- [ ] Tests fonctionnels validés
- [ ] Tests techniques validés
- [ ] Domaine personnalisé configuré
- [ ] DNS propagé et vérifié
- [ ] CORS Appwrite mis à jour
- [ ] Monitoring actif (Plausible + Vercel)
- [ ] Ancien site Appwrite désactivé
- [ ] Équipe informée de la migration

## 📚 Ressources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)
- [Appwrite CORS Configuration](https://appwrite.io/docs/security-cors)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
