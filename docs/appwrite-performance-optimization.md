# 🚀 Guide d'Optimisation Appwrite pour React Query

## **📋 Résumé des Optimisations**

Ce guide détaille les optimisations Appwrite nécessaires pour maximiser les performances de React Query dans Ankilang.

## **🔧 1. Index de Base de Données (CRITIQUE)**

### **Index Obligatoires**

```bash
# Exécuter le script d'optimisation
node scripts/optimize-appwrite-indexes.mjs
```

**Index critiques pour React Query :**

| Collection | Index | Attributs | Usage |
|------------|-------|-----------|-------|
| `themes` | `userId_createdAt` | `['userId', '$createdAt']` | `useThemes()` - Liste des thèmes |
| `cards` | `themeId_createdAt` | `['themeId', '$createdAt']` | `useCards()` - Cartes d'un thème |
| `cards` | `userId_themeId` | `['userId', 'themeId']` | Sécurité - Vérification des droits |

### **Index de Performance (Recommandés)**

| Collection | Index | Attributs | Usage |
|------------|-------|-----------|-------|
| `themes` | `userId_shareStatus` | `['userId', 'shareStatus']` | Filtrage par statut |
| `themes` | `userId_targetLang` | `['userId', 'targetLang']` | Filtrage par langue |
| `cards` | `userId_createdAt` | `['userId', '$createdAt']` | Toutes les cartes utilisateur |
| `cards` | `themeId_type` | `['themeId', 'type']` | Filtrage par type |

## **⚡ 2. Optimisations des Requêtes**

### **Query.select() - Réduction de la Bande Passante**

```typescript
// ❌ AVANT: Récupère tous les champs
const themes = await databases.listDocuments(DATABASE_ID, 'themes', [
  Query.equal('userId', userId),
  Query.orderDesc('$createdAt')
])

// ✅ APRÈS: Récupère seulement les champs nécessaires
const themes = await databases.listDocuments(DATABASE_ID, 'themes', [
  Query.equal('userId', userId),
  Query.orderDesc('$createdAt'),
  Query.select(['$id', 'userId', 'name', 'targetLang', 'cardCount', 'shareStatus', '$createdAt'])
])
```

### **Query.limit() - Éviter les Gros Datasets**

```typescript
// ✅ Toujours limiter les résultats
Query.limit(100)  // Pour les listes
Query.limit(1000) // Pour les cartes (max)
```

### **Requêtes Composées - Une Seule Requête**

```typescript
// ❌ AVANT: Deux requêtes séparées
const theme = await getThemeById(themeId)
const cards = await getCardsByThemeId(themeId)

// ✅ APRÈS: Une seule requête avec index composite
const cards = await databases.listDocuments(DATABASE_ID, 'cards', [
  Query.equal('userId', userId),
  Query.equal('themeId', themeId),
  Query.orderDesc('$createdAt')
])
```

## **📊 3. Tests de Performance**

### **Script de Test**

```bash
# Tester les performances actuelles
node scripts/optimize-appwrite-queries.mjs
```

### **Métriques Cibles**

| Requête | Temps Cible | Index Requis |
|---------|-------------|--------------|
| `useThemes()` | < 100ms | `userId_createdAt` |
| `useThemeData()` | < 150ms | `themeId_createdAt` |
| `useCards()` | < 200ms | `themeId_createdAt` |
| Filtres | < 50ms | Index spécifiques |

## **🔍 4. Monitoring et Debug**

### **Logs de Performance**

```typescript
// Dans les hooks React Query
const startTime = performance.now()
const { data } = useQuery({...})
useEffect(() => {
  if (data) {
    console.log(`[Perf] Query completed in ${performance.now() - startTime}ms`)
  }
}, [data])
```

### **Vérification des Index**

```bash
# Vérifier les index existants
node scripts/verify-appwrite-setup.mjs
```

## **🚨 5. Problèmes Courants**

### **Index Manquants**

**Symptôme :** Requêtes lentes (> 500ms)
**Solution :** Créer les index critiques

```bash
node scripts/optimize-appwrite-indexes.mjs
```

### **Requêtes Non Optimisées**

**Symptôme :** Bande passante élevée
**Solution :** Utiliser `Query.select()`

```typescript
Query.select(['$id', 'name', 'cardCount']) // Seulement les champs nécessaires
```

### **Limites Dépassées**

**Symptôme :** Erreurs de pagination
**Solution :** Utiliser `Query.limit()`

```typescript
Query.limit(100) // Limiter les résultats
```

## **📈 6. Gains de Performance Attendus**

### **Avant Optimisation**

- `useThemes()`: 500-1000ms
- `useThemeData()`: 800-1500ms
- `useCards()`: 1000-2000ms
- Bande passante: Élevée

### **Après Optimisation**

- `useThemes()`: 50-100ms (-80%)
- `useThemeData()`: 100-150ms (-85%)
- `useCards()`: 150-200ms (-90%)
- Bande passante: -70%

## **🔄 7. Maintenance**

### **Vérification Régulière**

```bash
# Tester les performances mensuellement
node scripts/optimize-appwrite-queries.mjs
```

### **Surveillance des Index**

- Vérifier que les index critiques existent
- Surveiller les temps de réponse
- Ajuster les limites selon l'usage

## **🎯 8. Checklist d'Optimisation**

- [ ] **Index critiques créés** (`userId_createdAt`, `themeId_createdAt`)
- [ ] **Query.select()** utilisé dans tous les services
- [ ] **Query.limit()** défini pour toutes les requêtes
- [ ] **Tests de performance** exécutés
- [ ] **Monitoring** en place
- [ ] **Documentation** mise à jour

## **🚀 9. Prochaines Étapes**

1. **Exécuter** `optimize-appwrite-indexes.mjs`
2. **Tester** avec `optimize-appwrite-queries.mjs`
3. **Vérifier** les performances en production
4. **Surveiller** les métriques React Query
5. **Ajuster** selon les besoins

---

**💡 Conseil :** Les optimisations Appwrite sont **critiques** pour les performances React Query. Sans les bons index, même le meilleur cache frontend ne peut pas compenser des requêtes lentes.
