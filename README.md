# Ankilang

> Webapp de création de flashcards (Basic & Cloze) pour l'apprentissage des langues, avec export Anki (.apkg)

## 🎯 Mission

Promouvoir l'**occitan** et les langues régionales avec un outil gratuit et illimité pour créer des flashcards exportables vers Anki.

## 🚀 Fonctionnalités

- **Flashcards Basic & Cloze** (texte à trous)
- **Export Anki (.apkg)** par thème
- **Traduction automatique** (Revirada/DeepL)
- **Images Pexels** et **audio Votz** (occitan)
- **PWA** avec mode hors-ligne
- **Occitan gratuit et illimité**

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
│  ├─ web/           # React PWA (Vite + TS + Tailwind)
│  └─ functions/     # Netlify Functions (à venir)
├─ services/
│  └─ exporter/      # FastAPI + genanki (à venir)
├─ packages/
│  └─ shared/        # Types/schemas partagés
└─ docs/
   └─ prd/           # Documentation produit
```

## 🎮 Commandes

```bash
# Développement
pnpm dev              # Lance l'app web en mode dev
pnpm build            # Build tous les packages
pnpm typecheck        # Vérification TypeScript
pnpm test             # Lance les tests
pnpm lint             # Linting (à configurer)

# Installation
pnpm install          # Installe toutes les dépendances
pnpm install:all      # Alias pour install
```

## 🌐 Accès

- **Développement** : http://localhost:5173
- **PWA** : Installable depuis le navigateur

## 📚 Documentation

- [PRD v0.1](./docs/prd/ankilang-prd-v0.1.md) - Spécification produit complète

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Ouvrir une [issue](https://github.com/ankilang/ankilang/issues)
- Consulter la [documentation](./docs/)

---

**Ankilang** - Apprendre les langues, une carte à la fois 🗺️
