# Guide de déploiement de la sécurisation des fonctions externes

## 🎯 Vue d'ensemble

Ce guide détaille les étapes pour sécuriser les 6 repos externes de fonctions Netlify utilisés par Ankilang.

## 📋 Checklist de déploiement

### Phase 1 : Préparation (1 jour)

#### 1.1 Cloner et préparer les repos
```bash
# Pour chaque repo externe
git clone https://github.com/username/ankilangrevirada.git
cd ankilangrevirada
git checkout -b security-implementation
```

#### 1.2 Générer les fichiers de sécurité
```bash
# Dans le repo ankilang principal
node scripts/secure-external-functions.mjs

# Copier les fichiers générés dans chaque repo
cp -r external-functions/ankilangrevirada/* /path/to/ankilangrevirada/
```

#### 1.3 Installer les dépendances
```bash
# Dans chaque repo
npm install
npm install -D typescript @types/node
```

### Phase 2 : Implémentation (2-3 jours par repo)

#### 2.1 Structure de fichiers à créer
```
lib/
├── auth.ts              # Middleware JWT
├── problem.ts           # Helper RFC 7807
├── cors.ts              # CORS sécurisé
├── rate-limit.ts        # Rate limiting
└── logging.ts           # Logs structurés

netlify/functions/
├── revirada.ts          # Fonction principale sécurisée
└── _middleware.ts       # Middleware global (optionnel)
```

#### 2.2 Configuration TypeScript
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

#### 2.3 Configuration Netlify
```toml
# netlify.toml
[build]
  command = "npm run build"
  functions = "netlify/functions"

[functions]
  node_bundler = "esbuild"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
```

### Phase 3 : Tests (1 jour par repo)

#### 3.1 Tests locaux
```bash
# Démarrer le serveur local
npm run dev

# Tester l'authentification
curl -X POST http://localhost:8888/.netlify/functions/revirada \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-jwt" \
  -d '{"text":"bonjour","targetLang":"oci"}'
```

#### 3.2 Tests de sécurité
```bash
# Test sans authentification (doit échouer)
curl -X POST http://localhost:8888/.netlify/functions/revirada \
  -H "Content-Type: application/json" \
  -d '{"text":"bonjour","targetLang":"oci"}'
# Attendu: 401 Authentication required

# Test avec origine non autorisée (doit échouer)
curl -X POST http://localhost:8888/.netlify/functions/revirada \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-jwt" \
  -H "Origin: https://malicious-site.com" \
  -d '{"text":"bonjour","targetLang":"oci"}'
# Attendu: 403 Origin not allowed
```

### Phase 4 : Déploiement (1 jour par repo)

#### 4.1 Déploiement en staging
```bash
# Déployer sur une branche de test
git add .
git commit -m "security: implement JWT authentication"
git push origin security-implementation

# Déployer sur Netlify (branche de test)
netlify deploy --branch security-implementation
```

#### 4.2 Tests d'intégration
```bash
# Tester avec le frontend ankilang
# Modifier temporairement les URLs dans ankilang pour pointer vers staging
VITE_REVI_URL=https://ankilangrevirada-staging.netlify.app/.netlify/functions/revirada
```

#### 4.3 Déploiement en production
```bash
# Une fois les tests validés
git checkout main
git merge security-implementation
git push origin main

# Déploiement automatique sur Netlify
```

### Phase 5 : Validation (1 jour)

#### 5.1 Tests de production
```bash
# Tester avec les vraies URLs de production
curl -X POST https://ankilangrevirada.netlify.app/.netlify/functions/revirada \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer real-jwt" \
  -d '{"text":"bonjour","targetLang":"oci"}'
```

#### 5.2 Monitoring
- Vérifier les logs Netlify
- Surveiller les métriques de performance
- Vérifier les alertes de sécurité

## 🔧 Configuration spécifique par repo

### ankilangrevirada (Traduction Occitan)
```typescript
// Fonction spécifique à implémenter
const reviradaHandler = async (event: AuthenticatedEvent) => {
  const { text, targetLang } = JSON.parse(event.body || '{}');
  
  // Appel à l'API Revirada
  const result = await callReviradaAPI(text, targetLang);
  
  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify(result)
  };
};
```

### ankilangvotz (TTS Occitan)
```typescript
// Fonction spécifique à implémenter
const votzHandler = async (event: AuthenticatedEvent) => {
  const { text, language } = JSON.parse(event.body || '{}');
  
  // Appel à l'API Votz
  const audioUrl = await callVotzAPI(text, language);
  
  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify({ audioUrl })
  };
};
```

### ankilangtts (TTS multilingue)
```typescript
// Fonction spécifique à implémenter
const ttsHandler = async (event: AuthenticatedEvent) => {
  const { text, language, voice } = JSON.parse(event.body || '{}');
  
  // Appel à AWS Polly ou Azure
  const audioUrl = await callTTSService(text, language, voice);
  
  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify({ audioUrl })
  };
};
```

### ankilangdeepl (Traduction DeepL)
```typescript
// Fonction spécifique à implémenter
const translateHandler = async (event: AuthenticatedEvent) => {
  const { text, targetLang, sourceLang } = JSON.parse(event.body || '{}');
  
  // Appel à l'API DeepL
  const translation = await callDeepLAPI(text, targetLang, sourceLang);
  
  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify({ translation })
  };
};
```

### ankilangpexels (Images Pexels)
```typescript
// Fonction spécifique à implémenter
const pexelsHandler = async (event: AuthenticatedEvent) => {
  const { query, page } = JSON.parse(event.body || '{}');
  
  // Appel à l'API Pexels
  const images = await callPexelsAPI(query, page);
  
  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify({ images })
  };
};
```

## 🚨 Points d'attention

### Variables d'environnement
Chaque repo doit avoir :
```bash
# .env (à configurer dans Netlify)
APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=ankilang
APPWRITE_API_KEY=your-secret-key

# APIs externes
DEEPL_API_KEY=your-deepl-key
PEXELS_API_KEY=your-pexels-key
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
```

### Rate limiting
```typescript
// Configuration par service
const RATE_LIMITS = {
  revirada: { limit: 100, window: 3600000 }, // 100 req/heure
  votz: { limit: 50, window: 3600000 },     // 50 req/heure
  tts: { limit: 200, window: 3600000 },     // 200 req/heure
  translate: { limit: 1000, window: 3600000 }, // 1000 req/heure
  pexels: { limit: 100, window: 3600000 }   // 100 req/heure
};
```

### Monitoring
```typescript
// Logs structurés
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  traceId,
  userId,
  service: 'revirada',
  action: 'translate',
  cost: 0.001, // Coût estimé
  duration: 150 // ms
}));
```

## 📊 Validation finale

### Checklist de validation
- [ ] **Authentification JWT** fonctionne
- [ ] **CORS** bloque les origines non autorisées
- [ ] **Rate limiting** fonctionne
- [ ] **Logs** sont structurés avec traceId
- [ ] **Tests de sécurité** passent
- [ ] **Intégration** avec ankilang fonctionne
- [ ] **Monitoring** est opérationnel

### Tests de charge
```bash
# Test de rate limiting
for i in {1..150}; do
  curl -X POST https://ankilangrevirada.netlify.app/.netlify/functions/revirada \
    -H "Authorization: Bearer test-jwt" \
    -d '{"text":"test","targetLang":"oci"}' &
done
# Attendu: 50 requêtes réussies, 100 bloquées
```

## 🎉 Déploiement réussi

Une fois tous les repos sécurisés :
1. **Mettre à jour ankilang** avec les JWT dans les requêtes
2. **Tester l'intégration complète**
3. **Configurer le monitoring**
4. **Documenter les changements**

**Estimation totale : 2-3 semaines pour sécuriser tous les repos**
