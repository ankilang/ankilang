# Guide de Navigation - Ankilang

## Vue d'ensemble de l'architecture

### Frontend (React + TypeScript)
- **Framework** : React 18 avec TypeScript strict
- **Build** : Vite 5.4 avec HMR ultra-rapide (4.92s build optimisé)
- **UI** : Tailwind CSS + composants personnalisés + Framer Motion
- **État** : TanStack Query pour la gestion serveur + Context API local
- **Routing** : React Router v6 avec code-splitting automatique et modules organisés
- **Bundle** : 442 kB optimisé (réduction de 12% après refactorisation)

### Export côté client (JavaScript justifié)
- **Technologie** : sql.js + genanki.js pour génération Anki dans le navigateur
- **Sécurité** : Aucun upload serveur des données sensibles
- **Performance** : Génération locale, pas de latence réseau
- **PWA** : Fonctionne hors ligne avec Service Worker

### Backend distribué
- **Base de données** : Appwrite (DB/Auth/Storage)
- **API tierces** : Netlify Functions (DeepL, Pexels, TTS, etc.)
- **External Functions** : Déployées séparément pour la sécurité

## Structure des dossiers clés

```
ankilang/
├── apps/
│   ├── web/                          # Application React principale
│   │   ├── src/
│   │   │   ├── routes/               # ✅ Modules de routes organisés (Étape 3)
│   │   │   │   ├── AppRoutes.tsx    # Routes publiques, auth, légales
│   │   │   │   ├── ProtectedRoutes.tsx # Routes application protégée
│   │   │   │   └── index.ts         # Index centralisé
│   │   │   ├── components/           # Composants UI réutilisables
│   │   │   │   ├── auth/            # Authentification (Login/Register)
│   │   │   │   ├── cards/           # Gestion des flashcards
│   │   │   │   ├── landing/         # Page d'accueil
│   │   │   │   ├── layout/          # Layouts (Header/Footer)
│   │   │   │   ├── ui/              # Composants de base (shadcn/ui)
│   │   │   │   └── ...
│   │   │   ├── pages/               # Pages/routes de l'application
│   │   │   │   ├── auth/            # Pages d'authentification
│   │   │   │   ├── app/             # Pages de l'application (protégées)
│   │   │   │   └── ...
│   │   │   ├── services/            # Services (API calls, logique métier)
│   │   │   ├── hooks/               # Hooks personnalisés React
│   │   │   │   ├── useRoutePrefetch.ts # ✅ Hook de prefetch optimisé
│   │   │   │   └── ...
│   │   │   ├── contexts/            # Contextes React globaux
│   │   │   ├── utils/               # Utilitaires et helpers
│   │   │   ├── constants/           # Constantes de l'application
│   │   │   ├── assets/              # Images, icônes, polices
│   │   │   └── exporter/            # Module d'export Anki côté client
│   │   │       ├── core/            # Logique principale (anki-generator.js)
│   │   │       ├── utils/           # Utilitaires d'export
│   │   │       └── hooks/           # Hooks d'export
│   │   ├── public/                  # Assets statiques
│   │   └── scripts/                 # Scripts de build/déploiement
│   └── functions/                   # Fonctions Netlify (cache-janitor)
├── packages/
│   ├── shared/                      # Types et schémas Zod partagés
│   └── shared-cache/               # Module de cache distribué
├── external-functions/              # Fonctions externes sécurisées
│   ├── ankilangdeepl/              # Traduction DeepL
│   ├── ankilangpexels/             # Recherche d'images Pexels
│   ├── ankilangrevirada/           # Traduction occitan
│   ├── ankilangtts/                # Synthèse vocale
│   └── ankilangvotz/               # Audio occitan
├── docs/                           # Documentation
│   ├── prd/                        # Spécifications produit
│   ├── security/                   # Guides de sécurité
│   ├── deployment/                 # Guides de déploiement
│   └── dev/                        # Documentation développeur
└── scripts/                        # Scripts utilitaires et de migration
```

## Conventions de nommage

### Composants React
```typescript
// ✅ Bon : Composant avec nom descriptif
function CardActions() { }

// ❌ Éviter : Abréviations non claires
function CA() { }
```

### Fichiers
```typescript
// ✅ Services avec nom d'action
cards.service.ts      // Gestion des cartes
auth.service.ts       // Authentification

// ✅ Hooks avec préfixe use
useAuth.ts           // Hook d'authentification
useCards.ts          // Hook de gestion des cartes

// ✅ Types avec suffixe Type
CardType.ts          // Types des cartes
ThemeType.ts         // Types des thèmes
```

### Variables et fonctions
```typescript
// ✅ camelCase pour les variables
const cardCount = 10;
const isLoading = true;

// ✅ PascalCase pour les composants/types
interface CardProps { }
type Theme = { };

// ✅ UPPER_CASE pour les constantes
const MAX_CARDS_PER_THEME = 100;
const SUPPORTED_LANGUAGES = ['fr', 'en', 'oc'];
```

## Où trouver quoi ?

### Pour comprendre le métier
- **`docs/prd/ankilang-prd-v0.1.md`** : Spécifications fonctionnelles complètes
- **`README.md`** : Vue d'ensemble du projet

### Pour développer une fonctionnalité
- **`src/services/`** : Logique métier et appels API
- **`src/components/`** : Composants UI à réutiliser
- **`src/hooks/`** : Hooks personnalisés disponibles
- **`src/pages/`** : Structure des pages/routes

### Pour l'export Anki côté client
- **`src/exporter/`** : Module complet d'export (sql.js + genanki.js)
- **`src/services/tts.ts`** : Intégration TTS avec cache
- **`src/services/pexels-cache.ts`** : Gestion des images avec cache

### Pour la sécurité et le déploiement
- **`external-functions/`** : Fonctions déployées séparément
- **`docs/security/`** : Guides de sécurité et audit
- **`docs/deployment/`** : Procédures de déploiement

## Architecture technique détaillée

### Flux de données
```
Utilisateur → React Component → Service → API Call → Appwrite/Netlify → Réponse → Cache → UI
     ↓              ↓            ↓         ↓           ↓              ↓        ↓       ↓
   Interface     Validation   Business   External   Sécurité      Storage  State   Render
   Utilisateur    Zod         Logic      Services   JWT/Auth      IDB      React   Browser
```

### Gestion d'état
- **Serveur** : Appwrite (base de données, authentification, stockage)
- **Client** : TanStack Query (cache, synchronisation) + Context API (état local)
- **Offline** : Service Worker + Cache API + IndexedDB

### Sécurité
- **Authentification** : JWT Appwrite côté client
- **API externes** : Clés dans variables d'environnement uniquement
- **External Functions** : Déployées séparément pour éviter l'exposition
- **Audit** : Script de vérification automatique des clés exposées

## Outils et commandes

### Développement
```bash
pnpm dev              # Démarrage développement (port 5173)
pnpm build           # Build de production optimisé (442 kB bundle)
pnpm typecheck       # Vérification TypeScript
pnpm test            # Tests (quand disponibles)
```

### Performances et optimisation
```bash
pnpm build:all       # Build de tous les packages
pnpm preview         # Prévisualisation production
pnpm lighthouse     # Audit performances (LCP < 2.5s, target atteint)
```

### Sécurité et qualité
```bash
pnpm security:audit  # Vérification absence de clés exposées ✅
pnpm qa:lh          # Audit Lighthouse performance
pnpm qa:shots       # Captures d'écran responsives
```

### Métriques actuelles
- **Bundle initial** : 442 kB (réduction de 12% après optimisation)
- **Chunks créés** : 8 optimisés (react-vendor, ui-vendor, export, etc.)
- **Build time** : 4.92s (amélioration de 6%)
- **TypeScript** : 0 erreur ✅
- **Sécurité** : 0 clé API exposée ✅

## Ressources supplémentaires

- **Règles de développement** : `.cursorrules` (règles Cursor)
- **PRD complet** : `docs/prd/ankilang-prd-v0.1.md`
- **Guide de sécurité** : `docs/security/`
- **Guide de déploiement** : `docs/deployment/`

---

*Dernière mise à jour : Octobre 2025*
