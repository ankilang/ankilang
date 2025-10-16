# Glossaire Technique - Ankilang

## Acronymes et termes techniques

### A - C

#### **Anki (.apkg)**
Format de paquet de cartes mémoire créé par le logiciel Anki. Un fichier `.apkg` contient une base SQLite avec les cartes, modèles et médias embarqués.

#### **Appwrite**
Backend-as-a-Service utilisé pour l'authentification, la base de données et le stockage de fichiers. Remplace la gestion serveur traditionnelle.

#### **Basic Cards**
Type de carte Anki standard avec un recto (question) et un verso (réponse). Format le plus simple pour l'apprentissage.

#### **Bundle Splitting**
Technique d'optimisation qui divise le code JavaScript en plusieurs fichiers (chunks) pour améliorer les temps de chargement. **Appliqué** : 8 chunks créés (react-vendor: 141kB, export: 142kB, etc.) réduisant le bundle initial de 12%.

#### **Cloze Cards**
Cartes à trous où certaines parties du texte sont masquées avec la syntaxe `{{c1::texte}}`. Anki génère automatiquement plusieurs cartes à partir d'une seule note cloze.

#### **Code-splitting dynamique**
Technique d'optimisation qui charge les composants React de manière asynchrone avec `React.lazy()` et `Suspense`. **Appliqué** : Réduction du bundle initial de 70% avec 8 routes lazy-loaded.

#### **Chunking manuel**
Technique de division manuelle du code JavaScript en chunks spécifiques pour optimiser les performances de chargement. **Appliqué** : Configuration Vite avec 8 chunks (react-vendor: 141kB, export: 142kB, etc.).

### D - F

#### **DeepL**
Service de traduction automatique neuronale utilisé pour traduire les cartes vers différentes langues.

#### **External Functions**
Fonctions Netlify déployées séparément du code principal pour des raisons de sécurité. Chaque fonction (DeepL, Pexels, TTS, etc.) est dans son propre dépôt.

#### **Freemium**
Modèle économique où l'application propose une version gratuite avec limitations et une version Pro payante avec fonctionnalités avancées.

#### **Framer Motion**
Bibliothèque d'animation pour React qui permet de créer des animations fluides et performantes avec une API déclarative.

### G - L

#### **Genanki.js**
Bibliothèque JavaScript permettant de créer des paquets Anki (.apkg) côté client. Version navigateur de la bibliothèque Python genanki.

#### **HMR (Hot Module Replacement)**
Fonctionnalité de Vite qui permet de recharger uniquement les modules modifiés pendant le développement, accélérant considérablement le workflow.

#### **IndexedDB**
Base de données NoSQL côté navigateur utilisée pour le cache local des médias et des données utilisateur.

#### **LRU Cache**
Algorithme de cache "Least Recently Used" qui évince les éléments les moins utilisés en premier pour optimiser l'utilisation mémoire.

### M - P

#### **Monorepo**
Structure de projet où plusieurs packages/applications sont gérés dans un seul dépôt Git avec un système de workspaces (PNPM workspaces).

#### **Netlify Functions**
Fonctions serverless déployées sur Netlify, utilisées pour les appels API sécurisés nécessitant des clés secrètes.

#### **Pexels**
API de recherche d'images libres de droits utilisée pour illustrer automatiquement les cartes.

#### **PNPM**
Gestionnaire de paquets rapide et efficace, alternative à NPM, avec déduplication intelligente des dépendances.

#### **PWA (Progressive Web App)**
Application web qui peut être installée comme une application native avec support offline, notifications push et accès aux APIs système.

### Q - S

#### **React Query (TanStack Query)**
Bibliothèque de gestion d'état serveur pour React avec cache intelligent, synchronisation et gestion d'erreurs.

#### **Revirada**
Service de traduction français-occitan utilisé spécifiquement pour le support de la langue occitane.

#### **Service Worker**
Script qui s'exécute en arrière-plan dans le navigateur, permettant le cache offline et les fonctionnalités PWA avancées.

#### **SQL.js**
Bibliothèque JavaScript qui embarque un moteur SQLite complet dans le navigateur via WebAssembly.

#### **SSR (Server-Side Rendering)**
Technique de rendu côté serveur pour améliorer les performances SEO et le temps de chargement initial.

### T - Z

#### **TanStack Router**
Routeur pour React avec support du code-splitting, du typage TypeScript et de la gestion d'état URL.

#### **Tree Shaking**
Technique d'élimination du code mort pendant le build pour réduire la taille du bundle final.

#### **TTS (Text-to-Speech)**
Technologie de synthèse vocale utilisée pour générer des fichiers audio à partir de texte.

#### **TypeScript Strict**
Mode de compilation TypeScript avec vérifications de types renforcées pour une meilleure sécurité et maintenabilité.

#### **Vite**
Outil de build ultra-rapide pour les projets frontend avec support HMR, pré-bundle des dépendances et optimisations avancées.

#### **Votz**
Service d'audio en occitan permettant de générer des prononciations audio pour les cartes en langue occitane.

#### **WebAssembly (WASM)**
Format d'instruction binaire pour le web permettant d'exécuter du code natif haute performance dans le navigateur.

#### **Zod**
Bibliothèque de validation et de parsing de données TypeScript avec inférence de types automatique.

## Termes métier spécifiques

### Cartes et apprentissage

#### **Algorithme de répétition espacée**
Méthode scientifique d'optimisation des révisions basée sur la courbe de l'oubli. Anki utilise l'algorithme SM-2.

#### **Cloze Deletion**
Technique où des mots clés sont supprimés du texte pour créer des cartes à trous, favorisant l'apprentissage contextuel.

#### **Deck/Thème**
Collection organisée de cartes Anki autour d'un sujet spécifique (vocabulaire d'une langue, matière scolaire, etc.).

#### **Intervalle d'apprentissage**
Période de temps entre deux révisions d'une carte, calculée dynamiquement selon les performances de l'utilisateur.

### Sécurité et déploiement

#### **Environment Variables**
Variables d'environnement utilisées pour stocker les clés API et configurations sensibles, jamais commitées dans le code.

#### **JWT (JSON Web Token)**
Standard d'authentification utilisé par Appwrite pour sécuriser les sessions utilisateur.

#### **Rate Limiting**
Mécanisme de limitation des requêtes API pour prévenir les abus et respecter les quotas des services tiers.

#### **Reverse Proxy**
Serveur intermédiaire qui relaie les requêtes vers les services externes tout en masquant les détails d'implémentation.

## Codes d'erreur courants

### Erreurs de build
- **`TS2304`** : Module non trouvé - vérifier les imports et dépendances
- **`TS2339`** : Propriété inexistante - erreur de typage TypeScript
- **`VITE_ERROR`** : Erreur de configuration Vite

### Erreurs d'export Anki
- **`SQLITE_ERROR`** : Erreur lors de la génération de la base de données
- **`MEDIA_DOWNLOAD_FAILED`** : Échec du téléchargement d'un média
- **`WASM_LOAD_ERROR`** : Erreur de chargement de sql.js WebAssembly

### Erreurs API
- **`APPWRITE_ERROR`** : Erreur de communication avec Appwrite
- **`NETLIFY_FUNCTION_ERROR`** : Erreur d'exécution d'une fonction externe
- **`QUOTA_EXCEEDED`** : Limite atteinte (cartes gratuites, stockage, etc.)

## Métriques de performance

### Core Web Vitals (cibles)
- **LCP (Largest Contentful Paint)** : < 2.5s
- **INP (Interaction to Next Paint)** : < 200ms
- **CLS (Cumulative Layout Shift)** : < 0.1

### Métriques d'application
- **Temps de génération TTS** : < 500ms (avec cache)
- **Temps d'export Anki** : < 5s pour 100 cartes
- **Taux de cache hit** : >80% pour TTS, >90% pour Pexels

---

*Ce glossaire évolue avec le projet. Dernière mise à jour : Octobre 2025*
