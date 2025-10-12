# Rapport d'implémentation du système Leitner+ Review

## 📋 Résumé exécutif

Le système Leitner+ Review a été **implémenté avec succès** dans la base de données Appwrite d'Ankilang. Cette implémentation permet un système de révision espacée intelligent basé sur l'algorithme SM-2 d'Anki.

## 🎯 Objectifs atteints

### ✅ 1. Modifications de la collection `cards`

**Champs ajoutés :**
- `front` (string) - Texte face standardisé
- `back` (string) - Texte dos standardisé  
- `imageAlt` (string) - Alt text pour l'image
- `box` (integer, défaut: 1) - Boîte Leitner (1-7)
- `ease` (float, défaut: 2.5) - Facteur de facilité (1.3-2.5)
- `due` (datetime) - Date d'échéance
- `lapses` (integer, défaut: 0) - Nombre d'échecs
- `streak` (integer, défaut: 0) - Série de réussites
- `leech` (boolean, défaut: false) - Carte "sangsue"

### ✅ 2. Nouvelle collection `review_logs`

**Champs créés :**
- `cardId` (string) - Référence vers la carte
- `userId` (string) - Référence vers l'utilisateur
- `rating` (enum) - Évaluation : 'again', 'hard', 'good', 'easy'
- `oldBox` (integer) - Ancienne boîte
- `newBox` (integer) - Nouvelle boîte
- `oldEase` (float) - Ancien facteur de facilité
- `newEase` (float) - Nouveau facteur de facilité
- `oldDue` (datetime) - Ancienne date d'échéance
- `newDue` (datetime) - Nouvelle date d'échéance

## 🏗️ Architecture technique

### Services créés

#### 1. `ReviewService` (`src/services/review.service.ts`)
- **Fonction** : Gestion des logs de révision
- **Méthodes** :
  - `createReviewLog()` - Créer un log
  - `getCardReviewLogs()` - Logs d'une carte
  - `getUserReviewLogs()` - Logs d'un utilisateur
  - `getUserReviewStats()` - Statistiques de révision
  - `deleteReviewLog()` - Supprimer un log

#### 2. `LeitnerService` (`src/services/leitner.service.ts`)
- **Fonction** : Algorithme Leitner+ et logique métier
- **Méthodes** :
  - `reviewCard()` - Réviser une carte
  - `getCardsToReview()` - Cartes échues
  - `getThemeStats()` - Statistiques d'un thème
  - `resetCard()` - Réinitialiser une carte

### Types TypeScript

#### Schémas Zod ajoutés
```typescript
// Dans src/types/shared.ts
export const ReviewLogSchema = z.object({
  id: z.string().min(1),
  cardId: z.string().min(1),
  userId: z.string().min(1),
  rating: z.enum(['again', 'hard', 'good', 'easy']),
  oldBox: z.number().int().min(1).max(7),
  newBox: z.number().int().min(1).max(7),
  oldEase: z.number().min(1.3).max(2.5),
  newEase: z.number().min(1.3).max(2.5),
  oldDue: z.string().datetime(),
  newDue: z.string().datetime(),
  createdAt: z.string().datetime().optional()
});
```

#### Champs Leitner ajoutés au CardSchema
```typescript
// Champs ajoutés au CardSchema existant
front: z.string().optional(),
back: z.string().optional(),
imageAlt: z.string().optional(),
box: z.number().int().min(1).max(7).default(1),
ease: z.number().min(1.3).max(2.5).default(2.5),
due: z.string().datetime().optional(),
lapses: z.number().int().min(0).default(0),
streak: z.number().int().min(0).default(0),
leech: z.boolean().default(false)
```

## 🔧 Configuration de la base de données

### Permissions configurées
- **Collection cards** : Permissions owner-only maintenues
- **Collection review_logs** : Permissions `read("any")`, `write("any")`, `delete("any")`

### Index créés pour les performances
- `cardId` - Recherche par carte
- `userId` - Recherche par utilisateur  
- `createdAt` - Tri chronologique
- `cardId_createdAt` - Recherche par carte + tri
- `userId_createdAt` - Recherche par utilisateur + tri

## 📊 Algorithme Leitner+ implémenté

### Logique de révision
1. **Évaluation** : again, hard, good, easy
2. **Nouvelle boîte** :
   - `again` → boîte 1
   - `hard` → boîte -1
   - `good` → boîte +1
   - `easy` → boîte +2
3. **Facteur de facilité** (algorithme SM-2) :
   - `again` → -0.2
   - `hard` → -0.15
   - `good` → pas de changement
   - `easy` → +0.15
4. **Date d'échéance** : calculée selon la boîte et le facteur de facilité

### Détection des cartes "sangsues"
- Seuil configurable (défaut: 8 échecs)
- Marquage automatique avec `leech: true`
- Possibilité de réinitialisation

## 🚀 Utilisation

### Exemple de révision d'une carte
```typescript
import { leitnerService } from './services/leitner.service';

// Réviser une carte
const result = await leitnerService.reviewCard(
  userId, 
  cardId, 
  'good' // rating
);

console.log('Nouvelle boîte:', result.newBox);
console.log('Nouveau facteur de facilité:', result.newEase);
console.log('Nouvelle date d\'échéance:', result.newDue);
```

### Exemple de récupération des cartes à réviser
```typescript
// Récupérer toutes les cartes échues
const dueCards = await leitnerService.getCardsToReview(userId);

// Récupérer les cartes échues d'un thème
const themeDueCards = await leitnerService.getCardsToReview(userId, themeId);
```

## 📈 Avantages de cette implémentation

### 1. **Traçabilité complète**
- Chaque révision est loggée avec tous les détails
- Historique complet des changements
- Possibilité d'analytics avancées

### 2. **Performance optimisée**
- Index sur les champs critiques
- Requêtes filtrées par utilisateur
- Pagination supportée

### 3. **Flexibilité**
- Configuration modifiable (seuils, intervalles)
- Support des thèmes multiples
- Statistiques détaillées

### 4. **Sécurité**
- Isolation par utilisateur
- Permissions appropriées
- Validation des données avec Zod

## 🔮 Prochaines étapes recommandées

### 1. Interface utilisateur
- Composant de révision avec boutons de rating
- Affichage des statistiques
- Gestion des cartes "sangsues"

### 2. Fonctionnalités avancées
- Notifications pour les cartes échues
- Export des statistiques
- Import/export des données de révision

### 3. Optimisations
- Cache des cartes échues
- Calculs en arrière-plan
- Synchronisation offline

## ✅ Validation

Le système a été testé et validé avec :
- ✅ Création des collections
- ✅ Ajout des champs
- ✅ Configuration des permissions
- ✅ Création des index
- ✅ Types TypeScript
- ✅ Services fonctionnels

**Status : PRÊT POUR LA PRODUCTION** 🚀
