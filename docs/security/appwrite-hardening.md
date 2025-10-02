# Sécurisation Appwrite - Ankilang

## Vue d'ensemble

Ce document décrit les mesures de sécurité mises en place pour Appwrite (Database + Storage) dans Ankilang.

## Principes de sécurité

### 1. Isolation par utilisateur
- **Tous les documents** (thèmes, cartes) sont créés avec des permissions `owner-only`
- **Tous les fichiers** (images, audio) sont uploadés avec des permissions `owner-only`
- **Toutes les requêtes** sont filtrées par `userId` pour éviter l'accès croisé

### 2. Permissions Appwrite

#### Collections Database
```javascript
// Permissions appliquées à la création
const permissions = [
  Permission.read(Role.user(userId)),    // Seul le propriétaire peut lire
  Permission.write(Role.user(userId)),  // Seul le propriétaire peut modifier
  Permission.delete(Role.user(userId))  // Seul le propriétaire peut supprimer
];
```

#### Storage Bucket
```javascript
// Permissions appliquées à l'upload
const permissions = [
  Permission.read(Role.user(userId)),    // Seul le propriétaire peut lire
  Permission.write(Role.user(userId)),  // Seul le propriétaire peut modifier
  Permission.delete(Role.user(userId))  // Seul le propriétaire peut supprimer
];
```

### 3. Filtrage des requêtes

#### Thèmes
```javascript
// Toujours filtré par userId
const themes = await databaseService.list('themes', [
  Query.equal('userId', userId),
  Query.orderDesc('$createdAt')
]);
```

#### Cartes
```javascript
// Toujours filtré par userId ET themeId
const cards = await databaseService.list('cards', [
  Query.equal('themeId', themeId),
  Query.equal('userId', userId),
  Query.orderDesc('$createdAt')
]);
```

## Configuration du bucket

### Extensions autorisées
```
webp, jpg, jpeg, png, gif, mp3, wav, ogg, m4a
```

### Limites de sécurité
- **Taille max** : 10 MB
- **Sécurité fichiers** : Activée (`fileSecurity: true`)
- **Chiffrement** : Activé (`encryption: true`)
- **Antivirus** : Activé (`antivirus: true`)

## Vérification de la configuration

### Script de vérification
```bash
node scripts/verify-appwrite-setup.mjs
```

Ce script vérifie :
- ✅ Existence des collections `themes` et `cards`
- ✅ Attributs requis (`imageUrl`, `audioUrl`, `tags`)
- ✅ Index sur `userId` pour les performances
- ✅ Configuration sécurisée du bucket
- ✅ Extensions de fichiers autorisées
- ✅ Limites de taille respectées

### Problèmes de sécurité détectés
Le script détecte automatiquement :
- ❌ Sécurité fichiers désactivée
- ❌ Taille max trop élevée (>10MB)
- ❌ Extensions inattendues
- ❌ Chiffrement désactivé

## Gestion des erreurs

### Erreurs de permissions
```javascript
// Dans les services
try {
  const document = await databaseService.create(collectionId, data, userId);
} catch (error) {
  if (error.code === 401) {
    throw new Error('Permissions insuffisantes');
  }
  throw error;
}
```

### Logs de sécurité
```javascript
console.log(`✅ Document créé avec permissions owner-only pour user: ${userId}`);
console.log(`✅ Fichier uploadé avec permissions owner-only pour user: ${userId}`);
```

## Bonnes pratiques

### 1. Toujours passer userId
```javascript
// ✅ Correct
await databaseService.create('themes', data, userId);
await storageService.uploadFile('bucket', filename, file, userId);

// ❌ Incorrect
await databaseService.create('themes', data);
await storageService.uploadFile('bucket', filename, file);
```

### 2. Vérifier l'accès avant modification
```javascript
// Vérifier que l'utilisateur est propriétaire
const document = await this.getById(id, userId);
// Puis modifier
await databaseService.update(collectionId, id, updates);
```

### 3. Filtrer toutes les requêtes
```javascript
// ✅ Toujours filtrer par userId
const documents = await databaseService.list(collectionId, [
  Query.equal('userId', userId)
]);
```

## Monitoring et alertes

### Métriques à surveiller
- Nombre de documents créés par utilisateur
- Taille des fichiers uploadés
- Tentatives d'accès non autorisées
- Erreurs de permissions

### Alertes recommandées
- Upload de fichiers > 5MB
- Création de > 100 documents/heure par utilisateur
- Erreurs 401/403 répétées
- Extensions de fichiers inattendues

## Maintenance

### Nettoyage des fichiers orphelins
```bash
# Script à créer pour détecter les fichiers sans document associé
node scripts/cleanup-orphaned-files.mjs
```

### Rotation des logs
- Logs de sécurité : 30 jours
- Logs d'audit : 90 jours
- Logs d'erreur : 7 jours

## Incident response

### En cas de compromission
1. **Immédiat** : Révoquer les permissions suspectes
2. **Court terme** : Analyser les logs d'accès
3. **Moyen terme** : Nettoyer les données compromises
4. **Long terme** : Renforcer les contrôles

### Contacts
- **Sécurité** : security@ankilang.com
- **DevOps** : devops@ankilang.com
- **Support** : support@ankilang.com
