# Ankilang

> Application web moderne pour créer des flashcards intelligentes et apprendre les langues efficacement

## 🎯 Mission

Promouvoir l'**occitan** et les langues régionales avec un outil gratuit et illimité pour créer des flashcards exportables vers Anki. Ankilang facilite l'apprentissage des langues grâce à des algorithmes optimisés et une interface intuitive.

## 🚀 Fonctionnalités

### ✨ Fonctionnalités principales
- **Flashcards Basic & Cloze** (texte à trous)
- **Export Anki (.apkg)** par thème
- **Traduction automatique** (Revirada/DeepL)
- **Images Pexels** et **audio Votz** (occitan)
- **PWA** avec mode hors-ligne
- **Occitan gratuit et illimité**

### 🎨 Interface moderne
- **Design Architecture "Learning Shapes"** (tons violets, glassmorphism)
- **Landing Page bento** avec animations fluides
- **Responsive design** (320px → 1536px+)
- **Dark mode** complet
- **Accessibilité AA** (contrastes, navigation clavier)

### 🔧 Technologies
- **React 18** + TypeScript strict
- **Vite** pour le build ultra-rapide
- **Tailwind CSS** + Design System
- **React Router v6** avec lazy loading
- **TanStack Query** pour la gestion d'état
- **Zod** pour la validation des données

## 📋 Prérequis

- **Node.js** ≥ 18.0.0
- **pnpm** ≥ 8.0.0

### Installation des prérequis

```bash
# Vérifier Node.js
node --version

# Installer pnpm (si nécessaire)
npm install -g pnpm@8.15.0

# Vérifier pnpm
pnpm --version
```

## 🛠️ Installation

```bash
# Cloner le repository
git clone <repository-url>
cd ankilang

# Installer les dépendances
pnpm install

# Lancer le développement
pnpm dev
```

## 📦 Structure du monorepo

```
ankilang/
├─ apps/
│  ├─ web/                    # React PWA (Vite + TS + Tailwind)
│  │  ├─ src/
│  │  │  ├─ pages/           # Pages de l'application
│  │  │  ├─ components/      # Composants réutilisables
│  │  │  ├─ hooks/           # Hooks personnalisés
│  │  │  └─ styles/          # Styles globaux
│  │  └─ public/             # Assets statiques
│  └─ functions/             # Netlify Functions (à venir)
├─ services/
│  └─ exporter/              # FastAPI + genanki (à venir)
├─ packages/
│  └─ shared/                # Types/schemas partagés
├─ docs/
│  └─ prd/                   # Documentation produit
└─ infra/                    # CI/CD, docker, workflows (à venir)
```

## 🎮 Commandes

```bash
# Développement
pnpm dev              # Lance l'app web en mode dev (localhost:5173)
pnpm build            # Build tous les packages
pnpm typecheck        # Vérification TypeScript
pnpm test             # Lance les tests
pnpm lint             # Linting (à configurer)

# Installation
pnpm install          # Installe toutes les dépendances
pnpm install:all      # Alias pour install

# PWA
pnpm preview          # Prévisualiser le build de production
```

## 🌐 Accès

- **Développement** : http://localhost:5173
- **PWA** : Installable depuis le navigateur
- **Build preview** : `pnpm preview` puis http://localhost:4173

## 🎨 Design System

Ankilang utilise une **Design Architecture "Learning Shapes"** moderne :

- **Palette** : Tons violets et fuchsia avec accents bleus
- **Surfaces** : Glassmorphism avec `backdrop-blur` et transparences
- **Animations** : Micro-animations fluides (respectant `prefers-reduced-motion`)
- **Typographie** : Hiérarchie claire avec titres dégradés
- **Composants** : Système de cartes bento avec ombres douces

## 📚 Documentation

- [PRD v0.1](./docs/prd/ankilang-prd-v0.1.md) - Spécification produit complète
- [Architecture technique](./docs/architecture.md) - Documentation technique (à venir)
- [Guide de contribution](./docs/contributing.md) - Comment contribuer (à venir)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### 🎯 Standards de développement

- **TypeScript strict** : Tous les fichiers en `.tsx`/`.ts`
- **Zod** : Validation des données aux frontières I/O
- **Tailwind CSS** : Classes utilitaires uniquement
- **Accessibilité AA** : Contrastes ≥ 4.5:1, navigation clavier
- **Performance** : LCP < 2.5s, CLS < 0.1
- **Evergreen** : Pas de dates/prix/temps relatifs dans le contenu

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Ouvrir une [issue](https://github.com/ankilang/ankilang/issues)
- Consulter la [documentation](./docs/)

## 🚀 Roadmap

- [ ] **Netlify Functions** : API pour traduction et export
- [ ] **Service Exporter** : FastAPI + genanki pour .apkg
- [ ] **Authentification** : Appwrite JWT
- [ ] **Tests automatisés** : Vitest + Testing Library
- [ ] **CI/CD** : GitHub Actions
- [ ] **Monitoring** : Analytics et métriques

---

**Ankilang** - Apprendre les langues, une carte à la fois 🗺️
