# 🔒 Instructions de sécurisation de la fonction Netlify Pexels

## ⚠️ Configuration CORS requise

**IMPORTANT** : La fonction Netlify Pexels doit autoriser le header `Authorization` dans les requêtes CORS pour permettre l'authentification JWT Appwrite.

Dans `netlify/functions/pexels.js`, le header CORS doit être configuré comme suit :

```javascript
function cors(extra = {}) {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization', // ← Authorization requis
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    ...extra,
  };
}
```

**Pourquoi ?** Le frontend Ankilang envoie le JWT Appwrite via le header `Authorization: Bearer <jwt>` pour :
- Authentifier l'utilisateur avant l'upload
- Lier les fichiers uploadés à l'utilisateur avec les bonnes permissions Appwrite

Sans ce header dans `Access-Control-Allow-Headers`, les requêtes preflight CORS échouent et l'optimisation d'images ne fonctionne pas.

---

## ✅ Ce qui a été fait sur Ankilang

1. ✅ **Bucket Appwrite sécurisé** : `fileSecurity` activé, plus de lecture publique
2. ✅ **Frontend modifié** : Envoi automatique du JWT Appwrite dans les headers
3. ✅ **Service appwrite.ts** : Fonction `getSessionJWT()` pour récupérer le JWT
4. ✅ **Service pexels.ts** : Inclusion du JWT dans les requêtes `/optimize`

---

## 🎯 Ce que vous devez faire dans votre repo de fonction Netlify Pexels

### 1️⃣ Installer les dépendances nécessaires

```bash
npm install node-appwrite
# OU
pnpm add node-appwrite
```

### 2️⃣ Ajouter les variables d'environnement dans Netlify

Dans le dashboard Netlify de `ankilangpexels.netlify.app` :
- Settings → Environment Variables

Ajoutez :
```
APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=ankilang
APPWRITE_API_KEY=standard_0ba5c26e05d08e71e9975e37e56450731fb1e7478e3e8d4e51d744baf33089e568977cc84f850b37c24fbba751f6871bb8e0445d0802872f52299fea64be5fcfb13b8e1806aaf3abbd2e0ee76e39ed83e9818eb870de2529691f0d1afa044537e447a66ca24915492d5270fcd3ca09ad3962426047a54f580c68125cffcb26b1
```

### 3️⃣ Modifier la fonction `/optimize`

Remplacez votre fonction actuelle par celle-ci :

```typescript
import { Handler } from '@netlify/functions';
import fetch from 'node-fetch';
import sharp from 'sharp';
import { Client, Storage, ID, Permission, Role, Users } from 'node-appwrite';

async function handleOptimize(event): Promise<any> {
  // ========================================
  // 1️⃣ VÉRIFICATION DE L'AUTHENTIFICATION
  // ========================================
  const authHeader = event.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        success: false,
        error: 'Missing authentication token. Please log in.' 
      })
    };
  }

  const jwt = authHeader.substring(7); // Enlever "Bearer "

  // ========================================
  // 2️⃣ VALIDATION DU JWT AVEC APPWRITE
  // ========================================
  let userId: string;
  
  try {
    // Créer un client Appwrite avec le JWT de l'utilisateur
    const userClient = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT!)
      .setProject(process.env.APPWRITE_PROJECT_ID!)
      .setJWT(jwt);

    // Vérifier que le JWT est valide en récupérant l'utilisateur
    const users = new Users(userClient);
    const account = await users.get('me'); // 'me' pour l'utilisateur actuel
    userId = account.$id;

    console.log(`✅ Utilisateur authentifié: ${userId} (${account.email})`);

  } catch (error) {
    console.error('❌ Erreur d\'authentification:', error);
    return {
      statusCode: 401,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        success: false,
        error: 'Invalid or expired authentication token. Please log in again.' 
      })
    };
  }

  // ========================================
  // 3️⃣ VALIDATION DE L'URL PEXELS
  // ========================================
  const pexelsUrl = event.queryStringParameters?.url;
  
  if (!pexelsUrl) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: false,
        error: 'Missing url parameter' 
      })
    };
  }

  // Vérifier que l'URL provient bien de Pexels
  if (!pexelsUrl.startsWith('https://images.pexels.com/')) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: false,
        error: 'Invalid Pexels URL' 
      })
    };
  }

  try {
    // ========================================
    // 4️⃣ TÉLÉCHARGEMENT DE L'IMAGE PEXELS
    // ========================================
    console.log(`📥 Téléchargement de l'image pour l'utilisateur ${userId}...`);
    const imageResponse = await fetch(pexelsUrl);
    
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image from Pexels: ${imageResponse.status}`);
    }
    
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    console.log(`✅ Image téléchargée: ${imageBuffer.length} bytes`);

    // ========================================
    // 5️⃣ OPTIMISATION DE L'IMAGE
    // ========================================
    console.log('🔧 Optimisation en cours...');
    const optimizedBuffer = await sharp(imageBuffer)
      .resize(800, 600, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .webp({ quality: 85 })
      .toBuffer();

    const savings = Math.round((1 - optimizedBuffer.length / imageBuffer.length) * 100);
    console.log(`✅ Optimisé: ${imageBuffer.length} → ${optimizedBuffer.length} bytes (${savings}% de réduction)`);

    // ========================================
    // 6️⃣ UPLOAD VERS APPWRITE STORAGE
    // ========================================
    console.log('📤 Upload vers Appwrite Storage...');
    
    // Créer un client avec la clé API (droits d'écriture)
    const adminClient = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT!)
      .setProject(process.env.APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);

    const storage = new Storage(adminClient);
    const fileId = ID.unique();
    
    // Upload avec permissions utilisateur uniquement
    const file = await storage.createFile(
      'flashcard-images',
      fileId,
      optimizedBuffer,
      [
        Permission.read(Role.user(userId)),     // Seul l'utilisateur peut lire
        Permission.update(Role.user(userId)),   // Seul l'utilisateur peut modifier
        Permission.delete(Role.user(userId))    // Seul l'utilisateur peut supprimer
      ]
    );

    console.log(`✅ Fichier uploadé: ${fileId}`);

    // ========================================
    // 7️⃣ GÉNÉRATION DE L'URL
    // ========================================
    const fileUrl = `${process.env.APPWRITE_ENDPOINT}/storage/buckets/flashcard-images/files/${fileId}/view?project=${process.env.APPWRITE_PROJECT_ID}`;
    
    // ========================================
    // 8️⃣ RÉPONSE RÉUSSIE
    // ========================================
    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        success: true, 
        fileId,
        fileUrl,
        userId,
        originalSize: imageBuffer.length,
        optimizedSize: optimizedBuffer.length,
        savings
      })
    };

  } catch (error: any) {
    console.error('❌ Erreur lors du traitement:', error);
    return {
      statusCode: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      })
    };
  }
}

// ========================================
// HANDLER PRINCIPAL
// ========================================
export const handler: Handler = async (event) => {
  // Gérer les requêtes OPTIONS (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: '',
    };
  }

  const path = event.path.replace('/.netlify/functions/pexels', '');
  
  // Routes existantes
  if (path.startsWith('/photos/search')) {
    return handleSearch(event); // Votre fonction existante
  }
  
  if (path.startsWith('/photos/curated')) {
    return handleCurated(event); // Votre fonction existante
  }
  
  // 🆕 Route sécurisée d'optimisation
  if (path === '/optimize') {
    return handleOptimize(event);
  }
  
  return {
    statusCode: 404,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'Not found' })
  };
};
```

### 4️⃣ Tester la fonction

Après le déploiement, testez avec :

```bash
# Récupérer un JWT depuis votre app
# (ouvrir la console dans votre app et exécuter)
const jwt = await (await import('./services/appwrite')).getSessionJWT()
console.log(jwt)

# Tester l'endpoint
curl -X GET "https://ankilangpexels.netlify.app/.netlify/functions/pexels/optimize?url=https://images.pexels.com/photos/1234567/pexels-photo-1234567.jpeg" \
  -H "Authorization: Bearer VOTRE_JWT"
```

---

## 📋 Résumé des changements

### ✅ Sécurité
- ✅ Vérification du JWT Appwrite sur chaque requête
- ✅ Fichiers accessibles uniquement par l'utilisateur propriétaire
- ✅ Validation des URLs Pexels (pas d'URLs arbitraires)
- ✅ Logs détaillés avec userId pour traçabilité

### ✅ Fonctionnel
- ✅ Optimisation d'images maintenue (resize + WebP)
- ✅ Upload vers Appwrite Storage avec permissions utilisateur
- ✅ Fallback automatique si optimisation échoue (côté frontend)
- ✅ Messages d'erreur clairs

### ✅ RGPD
- ✅ Chaque image est liée à un utilisateur
- ✅ L'utilisateur peut supprimer ses propres images
- ✅ Pas de partage de données entre utilisateurs

---

## 🚀 Déploiement

1. Commitez les changements dans votre repo de fonction Netlify
2. Pushez sur la branche principale
3. Netlify déploiera automatiquement
4. Vérifiez les logs dans le dashboard Netlify

---

## 🧪 Test end-to-end depuis Ankilang

1. Ouvrez http://localhost:5173
2. Connectez-vous avec un compte
3. Créez une nouvelle carte avec image
4. Recherchez une image Pexels
5. Cliquez sur une image
6. Vérifiez dans la console :
   - `✅ Image optimisée: XX% de réduction`
   - L'URL commence par `https://fra.cloud.appwrite.io/v1/storage/buckets/flashcard-images/files/`
7. Vérifiez dans Appwrite Storage → flashcard-images
   - Le fichier a les permissions `read(user:VOTRE_USER_ID)`

---

## ❓ En cas de problème

### Erreur 401 "Invalid or expired token"
- Vérifiez que les variables d'environnement sont bien définies dans Netlify
- Vérifiez que le JWT est bien envoyé depuis le frontend

### Erreur "File extension not allowed"
- ✅ Déjà corrigé : le bucket accepte maintenant `.webp`

### Image non accessible après upload
- Vérifiez que l'utilisateur est bien connecté
- Vérifiez les permissions du fichier dans Appwrite Storage
- L'URL doit inclure `?project=ankilang`

---

**Besoin d'aide ?** Contactez-moi si vous rencontrez des problèmes lors de l'implémentation.

