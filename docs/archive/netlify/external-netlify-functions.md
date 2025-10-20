# Plan de sécurisation des fonctions Netlify externes

## 🎯 Vue d'ensemble

Ankilang utilise **6 repos externes** de fonctions Netlify qui nécessitent une sécurisation immédiate. Tous sont actuellement **non authentifiés** et exposés publiquement.

## 📋 Inventaire des repos externes

### 1. **ankilangrevirada** - Traduction Occitan
- **URL** : `https://ankilangrevirada.netlify.app/.netlify/functions/revirada`
- **Usage** : Traduction français → occitan (languedocien/gascon)
- **Sécurité actuelle** : ❌ **Aucune authentification**
- **Priorité** : 🔴 **CRITIQUE** (service principal)

### 2. **ankilangvotz** - TTS Occitan
- **URL** : `https://ankilangvotz.netlify.app/.netlify/functions/votz`
- **Usage** : Synthèse vocale en occitan
- **Sécurité actuelle** : ❌ **Aucune authentification**
- **Priorité** : 🔴 **CRITIQUE** (service principal)

### 3. **ankilangtts** - TTS multilingue
- **URL** : `https://ankilangtts.netlify.app/.netlify/functions/tts`
- **Usage** : Synthèse vocale AWS Polly/Azure
- **Sécurité actuelle** : ❌ **Aucune authentification**
- **Priorité** : 🟡 **ÉLEVÉE** (service premium)

### 4. **ankilangdeepl** - Traduction DeepL
- **URL** : `https://ankilangdeepl.netlify.app/.netlify/functions/translate`
- **Usage** : Traduction multilingue DeepL
- **Sécurité actuelle** : ❌ **Aucune authentification**
- **Priorité** : 🟡 **ÉLEVÉE** (service premium)

### 5. **ankilangpexels** - Optimisation d'images
- **URL** : `https://ankilangpexels.netlify.app/.netlify/functions/pexels`
- **Usage** : Recherche et optimisation d'images Pexels
- **Sécurité actuelle** : ❌ **Aucune authentification**
- **Priorité** : 🟡 **ÉLEVÉE** (service premium)

### 6. **ankilang** (principal) - Media Proxy
- **URL** : `/.netlify/functions/media-proxy`
- **Usage** : Proxy CORS pour médias externes
- **Sécurité actuelle** : ✅ **Déjà sécurisé** (CORS, validation d'origine)
- **Priorité** : ✅ **TERMINÉ**

## 🚨 Risques de sécurité actuels

### Impact business
- **Coûts** : Utilisation illimitée des APIs externes (DeepL, AWS Polly, Pexels)
- **Performance** : Dégradation des services par abus
- **Conformité** : Violation des ToS des fournisseurs

### Impact technique
- **DDoS** : Attaques par déni de service
- **Data leakage** : Accès non autorisé aux traductions/audio
- **Rate limiting** : Dépassement des quotas API

## 🔧 Plan de sécurisation par repo

### Phase 1 : Services critiques (ankilangrevirada, ankilangvotz)

#### Actions immédiates
1. **Authentification JWT** :
   ```typescript
   // Dans chaque repo
   import { withAuth } from './lib/auth';
   
   const handler = withAuth(async (event: AuthenticatedEvent) => {
     // Logique métier sécurisée
   });
   ```

2. **CORS sécurisé** :
   ```typescript
   function corsHeaders() {
     return {
       'Access-Control-Allow-Origin': 'https://ankilang.netlify.app',
       'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Trace-Id',
       'Access-Control-Allow-Methods': 'POST, OPTIONS',
       'Access-Control-Max-Age': '86400',
     };
   }
   ```

3. **Rate limiting** :
   ```typescript
   // Limite par utilisateur : 100 req/heure
   const rateLimit = new Map();
   const userLimit = rateLimit.get(userId) || 0;
   if (userLimit > 100) {
     return problem(429, "Rate limit exceeded");
   }
   ```

4. **Logs d'audit** :
   ```typescript
   console.log(`[${traceId}] User ${userId} requested translation: ${text.substring(0, 50)}...`);
   ```

### Phase 2 : Services premium (ankilangtts, ankilangdeepl, ankilangpexels)

#### Actions identiques + contrôles premium
1. **Vérification d'abonnement** :
   ```typescript
   const user = await validateUser(userId);
   if (!user.subscription?.active) {
     return problem(403, "Premium subscription required");
   }
   ```

2. **Quotas par plan** :
   ```typescript
   const limits = {
     free: { translations: 10, tts: 5, images: 3 },
     premium: { translations: 1000, tts: 500, images: 100 }
   };
   ```

3. **Monitoring des coûts** :
   ```typescript
   // Tracking des coûts par utilisateur
   await logUsage(userId, service, cost);
   ```

## 📁 Structure de fichiers à créer dans chaque repo

### Fichiers communs
```
lib/
├── auth.ts              # Middleware JWT (copier depuis ankilang)
├── problem.ts           # Helper RFC 7807 (copier depuis ankilang)
├── rate-limit.ts        # Rate limiting par utilisateur
├── cors.ts              # CORS sécurisé
└── logging.ts           # Logs structurés
```

### Fichiers spécifiques
```
netlify/functions/
├── revirada.ts          # Traduction Occitan
├── votz.ts              # TTS Occitan
├── tts.ts               # TTS multilingue
├── translate.ts         # DeepL
└── pexels.ts           # Images Pexels
```

## 🔄 Migration progressive

### Étape 1 : Préparation
1. **Cloner les repos** et créer branches `security`
2. **Copier les libs** d'authentification depuis ankilang
3. **Tester localement** avec `netlify dev`

### Étape 2 : Déploiement
1. **Déployer en staging** avec authentification
2. **Tester l'intégration** avec ankilang
3. **Déployer en production** avec monitoring

### Étape 3 : Validation
1. **Vérifier les logs** d'audit
2. **Tester les quotas** et rate limiting
3. **Monitorer les coûts** API

## 📊 Monitoring et alertes

### Métriques à surveiller
- **Authentification** : Taux d'échec JWT par service
- **Rate limiting** : Nombre de requêtes bloquées
- **Coûts** : Usage par utilisateur/service
- **Performance** : Temps de réponse par endpoint

### Alertes recommandées
- **> 10% d'échecs d'authentification** par heure
- **> 50% de requêtes bloquées** par rate limiting
- **Coût API > 100€/jour** sur un service
- **Temps de réponse > 5s** sur 10% des requêtes

## 🧪 Tests de sécurité

### Tests d'authentification
```bash
# Test sans token (doit échouer)
curl -X POST https://ankilangrevirada.netlify.app/.netlify/functions/revirada \
  -H "Content-Type: application/json" \
  -d '{"text":"bonjour","targetLang":"oci"}'
# Attendu: 401 Authentication required

# Test avec token valide (doit réussir)
curl -X POST https://ankilangrevirada.netlify.app/.netlify/functions/revirada \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer valid-jwt" \
  -d '{"text":"bonjour","targetLang":"oci"}'
# Attendu: 200 avec traduction
```

### Tests CORS
```bash
# Test avec origine autorisée
curl -X POST https://ankilangrevirada.netlify.app/.netlify/functions/revirada \
  -H "Origin: https://ankilang.netlify.app" \
  -H "Authorization: Bearer valid-jwt"

# Test avec origine non autorisée (doit échouer)
curl -X POST https://ankilangrevirada.netlify.app/.netlify/functions/revirada \
  -H "Origin: https://malicious-site.com" \
  -H "Authorization: Bearer valid-jwt"
# Attendu: 403 Origin not allowed
```

## 📋 Checklist de déploiement

### Pour chaque repo externe
- [ ] **Authentification JWT** implémentée
- [ ] **CORS sécurisé** avec origines autorisées
- [ ] **Rate limiting** par utilisateur
- [ ] **Logs d'audit** avec traceId
- [ ] **Tests de sécurité** passés
- [ ] **Monitoring** configuré
- [ ] **Documentation** mise à jour

### Validation finale
- [ ] **Tous les services** authentifiés
- [ ] **Frontend ankilang** mis à jour avec JWT
- [ ] **Tests d'intégration** passés
- [ ] **Monitoring** opérationnel
- [ ] **Documentation** complète

## 🚀 Prochaines étapes

1. **Priorité 1** : Sécuriser `ankilangrevirada` et `ankilangvotz` (services critiques)
2. **Priorité 2** : Sécuriser `ankilangtts`, `ankilangdeepl`, `ankilangpexels` (services premium)
3. **Priorité 3** : Mettre en place monitoring et alertes
4. **Priorité 4** : Tests de sécurité automatisés

**Estimation** : 2-3 jours par repo (6 repos = 12-18 jours total)
