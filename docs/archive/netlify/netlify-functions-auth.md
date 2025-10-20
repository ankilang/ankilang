# Authentification et Autorisation - Fonctions Netlify

## Vue d'ensemble

Ce document décrit l'implémentation de l'authentification et de l'autorisation pour les fonctions Netlify d'Ankilang, utilisant les JWT Appwrite.

## Architecture de sécurité

### 1. Middleware d'authentification

Le middleware `withAuth` valide automatiquement les JWT Appwrite et ajoute les informations utilisateur à l'événement.

```typescript
import { withAuth, getUserId, type AuthenticatedEvent } from "./lib/auth";

const myHandler: Handler = async (event: AuthenticatedEvent) => {
  const userId = getUserId(event);
  // L'utilisateur est authentifié et son ID est disponible
};

export const handler = withAuth(myHandler);
```

### 2. Gestion des erreurs RFC 7807

Toutes les erreurs suivent le standard RFC 7807 avec traceId automatique :

```typescript
import { problem } from "./lib/problem";

// Erreur avec traceId automatique
return problem(401, "Authentication required", "Missing Authorization header");

// Erreur avec traceId personnalisé
return problem(500, "Internal error", "Database connection failed", "about:blank", customTraceId);
```

### 3. Validation JWT

```typescript
import { validateAppwriteJWT, extractAndValidateJWT } from "./lib/validate-jwt";

// Validation directe
const payload = await validateAppwriteJWT(token);

// Extraction depuis les headers
const payload = await extractAndValidateJWT(event.headers);
```

## Utilisation dans les fonctions

### Fonction basique avec authentification

```typescript
import type { Handler } from "@netlify/functions";
import { withAuth, getUserId, type AuthenticatedEvent } from "./lib/auth";
import { problem } from "./lib/problem";

const myHandler: Handler = async (event: AuthenticatedEvent) => {
  const userId = getUserId(event);
  
  // Logique métier sécurisée
  return {
    statusCode: 200,
    body: JSON.stringify({ userId, message: "Success" }),
  };
};

export const handler = withAuth(myHandler);
```

### Gestion des erreurs avec traceId

```typescript
import { problem } from "./lib/problem";

const myHandler: Handler = async (event: AuthenticatedEvent) => {
  try {
    // Logique métier
  } catch (error) {
    console.error('Handler error:', error);
    return problem(500, "Internal server error", "An error occurred");
  }
};
```

## Configuration CORS sécurisée

### Headers CORS autorisés

```typescript
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
      ? 'https://ankilang.netlify.app' 
      : '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Trace-Id',
    'Access-Control-Max-Age': '86400',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
  };
}
```

### Validation d'origine

```typescript
function isAllowedOrigin(origin: string): boolean {
  const allowedOrigins = [
    'http://localhost:5173',  // Dev local
    'https://ankilang.netlify.app',  // Production
  ];
  return allowedOrigins.includes(origin);
}
```

## Logging et tracing

### TraceId automatique

Chaque requête reçoit un traceId unique pour le tracing de bout en bout :

```typescript
const traceId = event.headers['x-trace-id'] || generateTraceId();
console.log(`[${traceId}] Processing request for user: ${userId}`);
```

### Logs structurés

```typescript
console.log(`[${traceId}] User ${userId} accessed resource ${resourceId}`);
console.error(`[${traceId}] Authentication failed for token: ${token.substring(0, 10)}...`);
```

## Sécurité des données

### Validation des entrées

```typescript
import { z } from 'zod';

const requestSchema = z.object({
  themeId: z.string().min(1),
  cardData: z.object({
    type: z.enum(['basic', 'cloze']),
    frontFR: z.string().min(1),
  }),
});

const result = requestSchema.safeParse(JSON.parse(event.body));
if (!result.success) {
  return problem(400, "Invalid request", "Request validation failed");
}
```

### Filtrage par utilisateur

```typescript
// Toujours filtrer par userId pour éviter l'accès croisé
const themes = await databases.listDocuments('themes', [
  Query.equal('userId', userId),
  Query.orderDesc('$createdAt')
]);
```

## Variables d'environnement

### Configuration requise

```bash
# Appwrite
APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=ankilang
APPWRITE_API_KEY=your-api-key

# Environnement
NODE_ENV=production
```

### Configuration Netlify

```toml
[build.environment]
  NODE_ENV = "production"
  APPWRITE_ENDPOINT = "https://fra.cloud.appwrite.io/v1"
  APPWRITE_PROJECT_ID = "ankilang"

[build.environment.secrets]
  APPWRITE_API_KEY = "your-secret-api-key"
```

## Tests de sécurité

### Test d'authentification

```typescript
// Test avec token valide
const response = await fetch('/api/secure-endpoint', {
  headers: {
    'Authorization': 'Bearer valid-jwt-token'
  }
});

// Test sans token (doit échouer)
const response = await fetch('/api/secure-endpoint');
// Attendu: 401 Authentication required
```

### Test CORS

```typescript
// Test avec origine autorisée
const response = await fetch('/api/secure-endpoint', {
  headers: {
    'Origin': 'https://ankilang.netlify.app'
  }
});

// Test avec origine non autorisée (doit échouer)
const response = await fetch('/api/secure-endpoint', {
  headers: {
    'Origin': 'https://malicious-site.com'
  }
});
// Attendu: 403 Origin not allowed
```

## Monitoring et alertes

### Métriques à surveiller

- Nombre de tentatives d'authentification échouées
- Origines bloquées par CORS
- Erreurs 401/403 par utilisateur
- Temps de réponse des fonctions

### Alertes recommandées

- > 10 échecs d'authentification/minute
- Origines inconnues tentant d'accéder aux APIs
- Erreurs 500 répétées
- Temps de réponse > 5 secondes

## Bonnes pratiques

### 1. Toujours utiliser withAuth

```typescript
// ✅ Correct
export const handler = withAuth(myHandler);

// ❌ Incorrect
export const handler = myHandler;
```

### 2. Valider toutes les entrées

```typescript
// ✅ Correct
const schema = z.object({ themeId: z.string() });
const result = schema.safeParse(data);

// ❌ Incorrect
const themeId = data.themeId; // Pas de validation
```

### 3. Filtrer par utilisateur

```typescript
// ✅ Correct
const themes = await databases.listDocuments('themes', [
  Query.equal('userId', userId)
]);

// ❌ Incorrect
const themes = await databases.listDocuments('themes'); // Pas de filtre
```

### 4. Logs avec traceId

```typescript
// ✅ Correct
console.log(`[${traceId}] User ${userId} created theme ${themeId}`);

// ❌ Incorrect
console.log('User created theme'); // Pas de contexte
```

## Dépannage

### Erreurs courantes

1. **401 Authentication required**
   - Vérifier que le header Authorization est présent
   - Vérifier que le token JWT est valide
   - Vérifier l'expiration du token

2. **403 Origin not allowed**
   - Vérifier la configuration CORS
   - Ajouter l'origine à la liste autorisée si nécessaire

3. **500 Internal server error**
   - Vérifier les logs avec le traceId
   - Vérifier la configuration des variables d'environnement

### Debug

```typescript
// Activer les logs détaillés
console.log(`[${traceId}] Headers:`, JSON.stringify(event.headers, null, 2));
console.log(`[${traceId}] User payload:`, JSON.stringify(event.user, null, 2));
```
