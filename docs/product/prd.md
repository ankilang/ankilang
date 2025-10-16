# Ankilang — PRD v0.1 (Spécification Produit)

> **Objet** : cadrer la vision, le périmètre MVP et les exigences fonctionnelles / techniques d'**Ankilang**, webapp de création de *flashcards* (Basic & **Cloze/texte à trous**) pour l'apprentissage des langues, avec **export Anki (.apkg)**.

---

## 1) Résumé exécutif
- **Proposition de valeur** : créer **rapidement** des flashcards (Basic & **Cloze/texte à trous**) propres et **exportables Anki (.apkg)**, avec traduction, image, et audio occitan en 1–2 minutes.
- **Mission** : promouvoir l'**occitan** et les langues régionales → **occitan gratuit et illimité**.
- **Positionnement Free vs Pro** :
  - **Gratuit** : outil complet mais **limité** (20 cartes/jour hors occitan), export par thème, navigation Communauté en lecture, PWA **lecture** offline.
  - **Pro (4,99 €/mois / 49,99 €/an)** : **illimité**, PWA **édition offline**, **Communauté** (téléchargement/partage), **modèles personnalisés** (genanki), **import en lots**, **ré-export global** depuis le cloud, file d'export prioritaire, contenus premium (starter decks, guides evergreen).
- **Architecture** : Front **React PWA**, **Appwrite** (Auth/DB/Storage/Realtime), **Netlify Functions** (orchestration & APIs tierces), microservice **Python + genanki** pour l'export .apkg.
- **North Star Metric** : nb de cartes exportées **et révisées ≥ 3 jours** la semaine suivante.

---

## 2) Objectifs & KPIs
- **Activation** (J+7) : ≥ 40 % des inscrits créent ≥ 1 thème et ≥ 10 cartes.
- **Rétention W4** : ≥ 25 % des actifs hebdo reviennent créer ou réviser.
- **Conversion** Free → **Pro** : ≥ 3 % à 90 jours.
- **Taux de complétion création** (modale) : ≥ 80 %.
- **Latence** : < 500 ms moyenne (hors appels d'API externes).

---

## 3) Personas rapides
1. **Léa** (22) — débutante en occitan (IEO/Calandreta). Besoin d'audio + simplicité.
2. **Julien** (33) — autodidacte ES/EN. Veut traductions + images automatiques.
3. **Claire** (45) — enseignante. Import en masse + partage de thèmes.

---

## 4) Portée MVP (scope)
**Inclus MVP** :
- Landing SEO + **auth Appwrite**.
- **Dashboard** + **Mes thèmes** (CRUD) avec **choix de la langue cible** à la création du thème (**langue héritée** par la modale de carte, non modifiable).
- **Gestion des flashcards** (Basic & **Cloze**) : création/édition/suppression, recherche/tri, **filtre par langue**.
- **Export .apkg** par **thème** (Basic & Cloze) via microservice Python.
- **Quota Freemium** : 20 cartes/jour hors occitan.
- **PWA** : offline **lecture** (Free) ; **édition** (Pro).
- **Communauté** (MVP light) : liste + aperçu ; **téléchargement réservé Pro**.

**Modale de création — Free vs Pro** :
- **Free** : langue **pré-remplie** (depuis le thème) **non modifiable** ; traduction (Revirada/DeepL), **image Pexels**, **audio Votz** (occitan). Champs standards : **Front**, **Back**, **Image**, **Audio**, **Cloze Text/Extra**.
- **Pro** (en plus) : **champs additionnels** activables (Example, ExampleTranslation, IPA, POS, Notes…), **modèles personnalisés** (genanki), **import en lots (CSV)** depuis « Mes thèmes », **édition offline**.

**Hors scope MVP (V1+)** : contenus premium étendus, modération avancée, analytics avancées, TTS multi-langues non-occitan enrichi.

---

## 5) Arborescence & écrans

### Routes & pages **publiques**
- **/** — Landing (sections pédagogiques, SEO, CTA)
- **/abonnement** — Offre Free vs Pro, upgrade
- **/auth/login** — Connexion
- **/auth/register** — Création de compte
- **/auth/forgot-password** — Mot de passe oublié
- **/auth/verify-email** — Vérification e-mail
- **/legal/terms** — CGU
- **/legal/privacy** — Politique de confidentialité
- **/offline** — Page PWA hors-ligne (fallback)
- **/404** — Page non trouvée

### Routes & pages **app (protégées)**
- **/app** — Dashboard (dernier thème, progression, CTA « Nouveau thème »)
- **/app/themes** — Mes thèmes (liste, recherche **par langue**, création, **import CSV (Pro)**)
- **/app/themes/new** — Création de thème (Nom + **Langue cible**)
- **/app/themes/:id** — Détail d'un thème (liste de cartes, tri, recherche locale, stats mini)
- **/app/themes/:id/export** — Export .apkg du thème
- **/app/community** — Bibliothèque communautaire (Featured, recherche/filtres, aperçu)
- **/app/community/:deckId** — Aperçu d'un deck communautaire (Télécharger **Pro**)
- **/app/lessons** — Contenus exclusifs (Pro) : starter decks, guides evergreen, ressources
- **/app/lessons/:slug** — Détail d'un guide/ressource (Pro)
- **/app/account** — Profil & préférences
- **/app/account/model** — **Modèle personnalisé** (Pro)
- **/app/account/billing** — Abonnement & facturation (Stripe Tax)
- **/app/account/security** — Sécurité (reset, 2FA si activé plus tard)

### Modales & composants clés
- **Modale "Nouvelle carte"** (depuis `/app/themes/:id`) — **hérite la langue du thème**, modes **Classique** / **Cloze** ; Free vs Pro (cf. §4).
- **Modale Import CSV (Pro)** — mapping colonnes + preview + progression
- **Toasts & banners** — quota Free, upgrade Pro, offline/online, succès export

---

## 6) Parcours utilisateurs (happy paths)
1) **Découverte → Inscription** : Landing → CTA « Créer un compte » → OAuth/email → Onboarding 60 s (choix langues, présenter l'offre).
2) **Création thème** : Dashboard → « Nouveau thème » → nom + **langue** → thème créé.
3) **Création carte** : Dans un thème → « + Carte » → saisir FR → **Traduire** → embellir (image, audio) → **Enregistrer**.
4) **Export Anki** : Thème → « Exporter (.apkg) » → import dans Anki.
5) **Freemium gating** : Si > 20 cartes/jour (hors occitan) → page abonnement → paiement → illimité immédiat.

---

## 7) Détails fonctionnels & critères d'acceptation

### 7.1 Landing & SEO
- **Doit** présenter 5–7 sections : Hero, Comment ça marche, Occitan, Multi-langues, Export Anki, PWA hors ligne, Tarifs + FAQ.
- **Doit** inclure CTA visibles (header, hero, fin de page) → **Créer un compte**.
- **SEO** : title/desc uniques, schéma FAQ, temps LCP < 2,5 s.
**Acceptation** : page indexée, Lighthouse SEO ≥ 90, 3 CTAs visibles sans scroll excessif.

### 7.2 Authentification (Appwrite)
- **Connexion / Inscription** : email+mdp + OAuth (Google/Apple si possible). E-mail vérifié, reset password.
**Acceptation** : création compte < 30 s, e-mail de validation reçu, réauth après expiration session.

### 7.3 Mes thèmes (CRUD + import)
- **Créer** un thème : **Nom + Langue cible (obligatoire)** + tags optionnels. La **langue est la source** pour les cartes de ce thème.
- **Lister** (vignettes avec nb de cartes), **rechercher** (nom, **langue**), **renommer**, **supprimer** (confirmation).
- **Importer CSV (Pro)** : colonnes min : `front_fr;verso;image_url;audio_url;tags` ; **pas de traduction auto** pendant l'import.
**Acceptation** : création thème < 300 ms. Import CSV (Pro) ≤ 3 000 lignes en < 60 s (asynchrone).

### 7.4 Gestion des flashcards
- Liste avec **tri** (date, alpha) et **recherche** (texte), **filtre par langue**.
- Édition inline, duplication, suppression. **Compteur journalier** visible (quota Free).
**Acceptation** : création/édition/suppression < 300 ms (hors appels externes). Filtre par langue persistant (localStorage).

### 7.5 Modale de création : traduction, image, audio
- **Langue** : **pré-remplie depuis le thème** et **non modifiable**.
- **Modes** : **Classique** (Front/Back) · **Cloze** (texte à trous avec `{{cN::…}}`, indices `::hint`).
- **Traduction** : Revirada (occitan) / DeepL (autres).
- **Image** : Pexels. **Audio** : Votz (occitan).
**Free** : champs standards (Front, Back, Image, Audio, Cloze Text/Extra).
**Pro** : **modèle personnalisable** (Example, ExampleTranslation, IPA, POS, Notes…), presets par langue, édition offline.
**Acceptation** : héritage de langue OK ; Cloze preview OK ; erreurs API claires ; traduction p50 < 2 s.

### 7.6 Export Anki (.apkg)
- Export par **thème** (Basic & Cloze).
- Mapping : Basic → Front/Back/Image/Audio/Extra ; Cloze → Text/Extra. Médias embarqués.
- Service d'export dédié **Python + genanki** ; file d'attente si lot important.
**Acceptation** : fichier .apkg importable dans Anki 24.x sans erreurs.

### 7.7 Freemium & Abonnement
- **Quota** : 20 **créations/jour** (hors occitan, illimité). Paywall en dépassement.
**Acceptation** : Comptage robuste côté serveur (anti contournement), reset à minuit (Europe/Paris).

### 7.8 PWA & hors-ligne
- Service Worker : cache app shell + assets + stratégie réseau.
- File d'actions offline → sync quand réseau ; indicateur Offline/Online ; gestion conflits simple.
**Acceptation** : création/édition utilisables sans réseau, synchronisation fiable.

---

## 8) Contraintes, risques, conformité
- **RGPD** : consentement cookies/analytics, droit à l'effacement, portabilité (export JSON/CSV), DPA fournisseurs.
- **APIs tierces** : DeepL (coûts/quotas), Revirada (dispo), Pexels (attribution), Votz (occitan), **TTS non-Google** (voir ci-dessous).
- **Anti-abus** : rate-limit IP+user, captcha, modération Communauté.

### Choix **TTS non-Google** (coût/fiabilité)
- **AWS Polly** : Standard ≈ **$4 / 1M chars**, Neural ≈ **$16 / 1M** ; fiable et économique.
- **Azure AI Speech** : Neural ≈ **$16 / 1M** (≈ **$12 / 1M** avec engagement).
- **ElevenLabs** : qualité premium, plus coûteux (crédits).
- **ResponsiveVoice** : plus simple mais peu adapté à forte charge/production.
**Recommandation** : **AWS Polly** par défaut, **Azure** en fallback ; **Votz** pour occitan.

---

## 9) Modèle de données (schéma logique simplifié)
- **User** { id, email, plan('free'|'pro'), locale, createdAt, **stripeCustomerId?** }
- **Theme** { id, userId, name, **targetLang**, tags[], cardCount, shareStatus('private'|'community'), createdAt, updatedAt }
- **Card** { id, userId, themeId, **type('basic'|'cloze')**, frontFR?, backText?, **clozeTextTarget?**, extra?, imageUrl?, audioUrl?, tags[], createdAt, updatedAt }
- **Quota** { userId, date(YYYY-MM-DD), lang, createdCount }
- **ExportJob** { id, userId, themeId?, scope('theme'|'all'), status('pending'|'done'|'error'), fileUrl?, createdAt }
- **SharedDeck** { id, ownerId, themeId, title, desc, languages[], downloads, rating }
- **UserSettings** { userId, **modelConfigByLang**: { [lang]: fieldFlags }, prefersOfflineEdit? }
- **Subscription** { userId, stripeSubscriptionId, status, currentPeriodEnd, cancelAt?, taxCountry?, taxIds? }
- **Payment** { userId, stripeInvoiceId, amount, currency, taxAmount, status, createdAt }

ACL : User CRUD sur ses thèmes/cartes; SharedDeck lecture publique; Community upload Pro.

---

## 10) Architecture technique (mise à jour)
### Vue d'ensemble
- **Front** : React + TS (Vite) · PWA · Tailwind + shadcn/ui · **Framer Motion** (React Spring optionnel).
- **BaaS** : **Appwrite** (Auth, DB, Storage, Realtime). SDK web côté client; SDK Node côté fonctions.
- **Fonctions serverless** : **Netlify Functions** pour logique sensible et intégrations (DeepL, Revirada, Pexels, TTS, Stripe, webhooks).
- **Export .apkg** : microservice **Python (genanki)** ; appelé depuis une fonction Netlify (job + polling/webhook).
- **CDN/Storage** : Appwrite Storage ou S3; headers de cache.
- **Observabilité** : Sentry (front & fonctions), logs JSON (pino), métriques (latence API, taux d'erreur, durée export).

### Rôles (architecture « composable »)
- **Appwrite** : Auth/DB/Storage/Realtime, source de vérité des données, ACL/RBAC.
- **Netlify Functions** : code sensible (clés, appels privilégiés Appwrite), intégrations tierces, webhooks, idempotence.
- **Flux type** : Front (auth) → `POST /api/translate` (fonction) → API tierce → BD Appwrite → réponse.

### Sécurité & conformité
- Validation tokens Appwrite côté fonctions; moindre privilège; clés API en variables d'env.
- Quotas, rate-limiting IP+user, captcha; RGPD complet.

### Stratégie d'appels API
- **TanStack Query** pour cache/invalidations/retries.
- **Axios** client unique + intercepteurs (trace id, auth, mapping erreurs **RFC 7807**).
- **Zod** pour typage/validation I/O.

---

## 11) Règles métier clés
- **Occitan** = illimité, ne consomme jamais le quota.
- **Quota 20/jour** par utilisateur et par **langue non-occitane** (créations **validées**).
- Import CSV (Pro) **ne déclenche pas** les traductions auto.
- Export .apkg **par thème** en MVP (sélection multi-thèmes Pro via « ré-export global »).

---

## 12) SEO — bases & mots-clés (étendu)
**Cibles FR** : apprentissage des langues, fiches de révision, flashcards, répétition espacée, méthode Leitner, Anki, application web, PWA, **occitan**, langues régionales, **texte à trous**, **Cloze**, **export Anki**.

**Long-tail** :
- « créer des **flashcards Anki** en ligne », « **export .apkg** », « **flashcards cloze** texte à trous »,
- « apprendre l'**occitan** en ligne », « **cartes vocabulaire** [langue] PDF/Anki »,
- « **import CSV** flashcards », « PWA **hors ligne** Anki ».

**Internationalisation** : pages /en, /es, /it… ; pages dédiées par langue (Anglais, Espagnol, Japonais…).
**Techniques** : sitemap.xml, robots.txt, **schema.org** (FAQ, Product, HowTo), Core Web Vitals (LCP < 2,5 s, INP < 200 ms), images **WebP/AVIF**, meta og/twitter.
**Content hub** : pages piliers « Cloze », « Exporter vers Anki », « PWA hors ligne pour réviser ».

---

## 13) Analytics & instrumentation
- Événements : signup, create_theme, import_csv (Pro), create_card, translate_click, add_image, add_audio, export_apkg, quota_block, upgrade_click, purchase_success, community_download (Pro).
- Funnels : Landing → Signup → Create Theme → Create ≥ 10 cards → Export.
- Rétention : DAU/WAU/MAU, cohortes par semaine d'inscription.

---

## 14) Roadmap (synthèse)
- **M0** : Design système, maquettes, contrats API, choix TTS (**AWS Polly**).
- **M1** : Auth + Thèmes (langue cible) + Cartes Basic/Cloze + Modale Free/Pro + Quotas + Export par thème.
- **M2** : PWA (lecture Free / édition Pro) + Import CSV (Pro) + Communauté (liste/aperçu) + SEO étendu.
- **M3** : Modèles personnalisés (Pro) + Ré-export global (Pro) + Téléchargements Communauté (Pro).
- **M4 (V1)** : Contenus exclusifs + modération Communauté + analytics avancées.

---

## 15) Texte & microcopy (exemples)
- **Hero** : « Crée tes flashcards. **Exporte vers Anki**. Apprends plus vite. »
- **CTA principal** : « Créer un compte gratuit »
- **Occitan** : « L'occitan est **illimité** sur Ankilang — Òc ben ! »
- **Cloze** : « Transforme tes phrases en **texte à trous** en un clic. »
- **Gating quota (Free)** : « Limite atteinte (**20/jour** pour cette langue). Passe en **illimité** avec Ankilang Pro. »
- **Modale Pro** : « Active des **champs avancés** (exemples, IPA, notes…) et gagne du temps. »
- **Communauté (Free)** : « Explore les decks de la communauté. **Télécharge avec Pro**. »
- **Upgrade nudge** : « **Importe en lots** (CSV) et ré-exporte tout en 1 clic — essaie **Pro**. »
- **Export succès** : « Ton paquet Anki est prêt. **Bonne révision !** »
- **Erreur API** : « Oups, la traduction a pris trop de temps. Réessaye ou modifie le texte. »

---

## 16) Annexes

### 16.1 Import CSV — modèle minimal
```csv
front_fr;verso;image_url;audio_url;tags
"La tomate";"El tomate";"https://...";"https://...";"légumes,jardin"

16.2 Critères de qualité d'une carte
- Un seul concept par carte, formulation simple.
- Image illustrative pertinente (pas décorative).
- Audio net (≥ 22 kHz), volume normalisé.

16.3 Alternatives TTS (post-MVP)
- Google Cloud TTS (non retenu par défaut), AWS Polly, Azure AI Speech, ElevenLabs.

---

## 17) Dépendances & requirements (packages)

**Front (runtime)** : react react-dom react-router-dom typescript vite @vitejs/plugin-react tailwindcss postcss autoprefixer lucide-react clsx class-variance-authority tailwind-merge @radix-ui/react-* @tanstack/react-query axios zod react-hook-form @hookform/resolvers framer-motion @react-spring/web (optionnel) i18next react-i18next vite-plugin-pwa workbox-window localforage date-fns sonner appwrite.

**Functions (Node)** : node-appwrite undici (ou axios) zod stripe @aws-sdk/client-polly (fallback microsoft-cognitiveservices-speech-sdk) pino uuid.

**Exporter (Python)** : fastapi uvicorn[standard] genanki pydantic python-dotenv requests sentry-sdk (optionnel redis, boto3).

---

## 18) Animations UI/UX (spécification)

**Principes** : sobres, utiles, 60 fps, transform/opacity only, prefers-reduced-motion respecté.

**Carte des animations** :
- **Transitions de pages** : entrée fade + slide-up (y:8px→0, opacity 0→1, 220 ms, easeOut) ; sortie fade (150 ms).
- **Hero (Landing)** : titre + CTA en stagger ; parallax subtil au scroll.
- **Cards du Dashboard & « Mes thèmes »** : apparition en grille (stagger) ; ré-ordonnancement fluide via layout ; hover scale 1.00→1.02 (120 ms).
- **Modales** : backdrop fade (150 ms) + pop-in scale 0.96→1 (200 ms). Focus trap + échap.
- **Listes (cartes)** : ajout/suppression avec layout animations ; skeleton shimmer pendant chargement (400–800 ms).
- **Progress quota** : largeur animée à ressort (React Spring) sur mise à jour.
- **Succès export** : toast slide-in + mini confetti (≤ 400 ms).
- **Erreurs** : secousse horizontale légère du champ invalidé (2–3px, 120 ms) + message.

---

## 19) Structure projet & gestion des APIs (monorepo)

**Arborescence globale recommandée** :

```
ankilang/
├─ .cursorrules
├─ README.md
├─ LICENSE
├─ .gitignore
├─ .editorconfig
├─ .prettierrc
├─ .eslintrc.cjs
├─ .env.example
├─ .env.functions.example
├─ .env.exporter.example
├─ pnpm-workspace.yaml
├─ package.json
├─ docs/
│  └─ prd/
│     ├─ ankilang-prd-v0.1.md
│     └─ ankilang-prd-v0.1.pdf
├─ apps/
│  ├─ web/                      # React PWA (Vite + TS + Tailwind + shadcn)
│  │  ├─ public/
│  │  │  ├─ manifest.json       # PWA manifest
│  │  │  ├─ sw.js              # Service Worker
│  │  │  └─ icons/             # PWA icons
│  │  ├─ index.html
│  │  ├─ vite.config.ts
│  │  ├─ tsconfig.json
│  │  ├─ tailwind.config.ts
│  │  ├─ postcss.config.js
│  │  ├─ package.json
│  │  └─ src/
│  │     ├─ main.tsx
│  │     ├─ index.css
│  │     ├─ App.tsx
│  │     ├─ api/
│  │     │  ├─ client.ts
│  │     │  ├─ appwrite.ts
│  │     │  ├─ schemas/
│  │     │  │  ├─ card.ts
│  │     │  │  ├─ theme.ts
│  │     │  │  ├─ export.ts
│  │     │  │  ├─ user.ts
│  │     │  │  ├─ subscription.ts
│  │     │  │  └─ community.ts
│  │     │  └─ queries/
│  │     │     ├─ themes.ts
│  │     │     ├─ cards.ts
│  │     │     ├─ export.ts
│  │     │     ├─ tts.ts
│  │     │     └─ community.ts
│  │     ├─ features/
│  │     │  ├─ auth/
│  │     │  │  ├─ components/
│  │     │  │  ├─ hooks/
│  │     │  │  └─ types.ts
│  │     │  ├─ themes/
│  │     │  │  ├─ components/
│  │     │  │  ├─ hooks/
│  │     │  │  └─ types.ts
│  │     │  ├─ cards/
│  │     │  │  ├─ components/
│  │     │  │  ├─ hooks/
│  │     │  │  └─ types.ts
│  │     │  ├─ community/
│  │     │  │  ├─ components/
│  │     │  │  ├─ hooks/
│  │     │  │  └─ types.ts
│  │     │  └─ lessons/
│  │     │     ├─ components/
│  │     │     ├─ hooks/
│  │     │     └─ types.ts
│  │     ├─ components/
│  │     │  ├─ ui/              # shadcn/ui components
│  │     │  │  ├─ button.tsx
│  │     │  │  ├─ input.tsx
│  │     │  │  ├─ modal.tsx
│  │     │  │  └─ ...
│  │     │  ├─ layout/
│  │     │  │  ├─ Header.tsx
│  │     │  │  ├─ Sidebar.tsx
│  │     │  │  └─ Footer.tsx
│  │     │  └─ modals/
│  │     │     ├─ NewCardModal.tsx
│  │     │     └─ ImportCsvModal.tsx
│  │     ├─ pages/
│  │     │  ├─ Landing.tsx
│  │     │  ├─ Abonnement.tsx
│  │     │  ├─ Offline.tsx
│  │     │  ├─ NotFound.tsx
│  │     │  ├─ auth/
│  │     │  │  ├─ Login.tsx
│  │     │  │  ├─ Register.tsx
│  │     │  │  ├─ ForgotPassword.tsx
│  │     │  │  └─ VerifyEmail.tsx
│  │     │  ├─ legal/
│  │     │  │  ├─ Terms.tsx
│  │     │  │  └─ Privacy.tsx
│  │     │  └─ app/
│  │     │     ├─ Dashboard.tsx
│  │     │     ├─ themes/
│  │     │     │  ├─ Index.tsx
│  │     │     │  ├─ New.tsx
│  │     │     │  ├─ Detail.tsx
│  │     │     │  └─ Export.tsx
│  │     │     ├─ community/
│  │     │     │  ├─ Index.tsx
│  │     │     │  └─ Deck.tsx
│  │     │     ├─ lessons/
│  │     │     │  ├─ Index.tsx
│  │     │     │  └─ Lesson.tsx
│  │     │     └─ account/
│  │     │        ├─ Index.tsx
│  │     │        ├─ Model.tsx
│  │     │        ├─ Billing.tsx
│  │     │        └─ Security.tsx
│  │     ├─ hooks/              # Custom hooks
│  │     │  ├─ useAuth.ts
│  │     │  ├─ useOffline.ts
│  │     │  └─ usePWA.ts
│  │     ├─ utils/              # Utilitaires
│  │     │  ├─ constants.ts
│  │     │  ├─ helpers.ts
│  │     │  └─ validation.ts
│  │     └─ types/              # Types globaux
│  │        └─ global.ts
│  └─ functions/                # Netlify Functions (TypeScript)
│     ├─ netlify.toml
│     ├─ package.json
│     ├─ tsconfig.json
│     └─ src/
│        ├─ translate-deepl.ts
│        ├─ translate-revirada.ts
│        ├─ pexels-search.ts
│        ├─ votz-tts.ts
│        ├─ tts.ts
│        ├─ export-apkg.ts
│        ├─ billing/
│        │  ├─ checkout-session.ts
│        │  ├─ portal.ts
│        │  └─ webhook.ts
│        └─ community/
│           ├─ list-decks.ts
│           └─ download-deck.ts
├─ services/
│  └─ exporter/                 # Microservice Python (FastAPI + genanki)
│     ├─ app.py
│     ├─ requirements.txt
│     ├─ Dockerfile
│     ├─ docker-compose.yml     # Pour développement local
│     ├─ README.md
│     ├─ .env.example
│     └─ tests/
│        ├─ test_exporter.py
│        └─ conftest.py
├─ packages/
│  └─ shared/                   # Types/schemas/utilitaires partagés
│     ├─ package.json
│     ├─ tsconfig.json
│     └─ src/
│        ├─ schemas/
│        │  ├─ card.ts
│        │  ├─ theme.ts
│        │  ├─ export.ts
│        │  ├─ user.ts
│        │  ├─ subscription.ts
│        │  └─ community.ts
│        ├─ utils/
│        │  ├─ validation.ts
│        │  └─ helpers.ts
│        └─ env.ts
└─ infra/
   ├─ .github/
   │  └─ workflows/
   │     ├─ ci.yml
   │     ├─ deploy_web.yml
   │     ├─ deploy_functions.yml
   │     └─ deploy_exporter.yml
   ├─ docker-compose.yml
   ├─ Makefile
   └─ scripts/                  # Scripts utilitaires
      ├─ setup.sh
      ├─ deploy.sh
      └─ backup.sh
```

**Conventions** :
- **React Query** : clés ['themes'], ['cards', themeId], ['export', jobId], ['tts'], ['community', filters].
- **Axios** : Authorization (JWT Appwrite), X-Trace-Id, erreurs RFC 7807.
- **Zod** partout aux frontières ; retries expo (200→1600 ms) sur 5xx/réseau.
- **Env** : front (VITE_*) ; functions (DEEPL, REVI, PEXELS, VOTZ, AWS_POLLY/AZURE, APPWRITE_API_KEY).

---

## 20) Cartes « texte à trous » (Cloze) — spécification

**Objectif** : créer des cartes Anki Cloze avec indices, 100 % compatibles Anki.

**UX / UI** :
- **Mode** : toggle Classique ↔ Cloze dans la modale.
- **Saisie** : FR → Traduire → texte cible. Sélection → Ajouter un trou → {{cN::…}}.
- **Indice** : {{cN::réponse::indice}}. Regroupement : réutiliser le même N pour une seule carte avec plusieurs trous.
- **Aperçu** : question/réponse en live. Validation : balises bien fermées.

**Règles métier** :
- Le champ cloze est stocké tel quel ({{c1::Paris::capitale}}).
- Médias optionnels affichés côté réponse par défaut.
- Une note cloze peut générer N cartes selon les cN.

---

## 21) Export .apkg & microservice Python (genanki) — design & exemples

**Free vs Pro** :
- **Free** : export par thème (Basic & Cloze), modèle standard, taille max paquet raisonnable (ex. 30–50 Mo), priorité normale.
- **Pro** : export par thème et ré-export global ; modèle personnalisé (champs activés), priorité haute ; taille max plus élevée (ex. 200 Mo).

**Orchestration** :
- **Netlify Function (TS)** protège l'API, vérifie quota/plan, lance FastAPI/genanki avec payload (thème ou scope=all), renvoie jobId puis fileUrl.
- **Microservice** : construit Deck/Model (Basic ou Cloze ou custom), télécharge médias (basenames), écrit .apkg, upload Storage (URL signée).

**Payload (extrait)** :

```json
{
  "deckTitle": "Les légumes du jardin (ES)",
  "notes": [
    { "type": "basic", "front": "La tomate", "back": "El tomate", "imageUrl": "https://...", "audioUrl": null, "extra": "note", "tags": ["légumes"] },
    { "type": "cloze", "text": "{{c1::Barcelona::ville}} est en {{c2::Espagne}}.", "extra": "géographie", "audioUrl": "https://...", "tags": ["cloze"] }
  ],
  "modelConfig": null
}
```

**Points d'attention** :
- Basenames média uniquement (pas de chemin). Noms uniques.
- Cloze & champs : Text contient {{cN::…}} ; Extra peut contenir HTML/audio.
- Encodage : HTML-escape des champs texte.
- Stockage : uploader le .apkg final vers Appwrite Storage/S3 ; retourner une URL signée.
- Jobs : pour gros thèmes → ExportJob + polling GET /api/export-apkg/:jobId.

---

## 22) Modèle de données — ajouts pour Cloze
- **Card** : type: 'basic' | 'cloze', clozeTextTarget, extra (HTML/audio/images pour Extra).

---

## 23) Offres & tarification — Free vs Pro

| Capacité | Gratuit | Pro (4,99 €/mois · 49,99 €/an) |
|----------|---------|--------------------------------|
| Création cartes Occitan | Illimité | Illimité |
| Création autres langues | 20/jour par utilisateur | Illimité |
| Export .apkg | Par thème | Par thème + ré-export global |
| PWA hors-ligne | Lecture | Édition + file d'actions |
| Communauté | Aperçu | Téléchargement & Partage |
| Modèles personnalisés | Non | Oui |
| Import en lots (CSV) | Non | Oui |
| Priorité export | Normale | Haute |

---

## 24) Modèles de cartes personnalisés (Pro) — genanki
- **Champs activables** : Front, Back, Image, Audio, Example, ExampleTranslation, Notes, IPA, POS, Tags.
- **UI** : Paramètres → Modèle perso (checkboxes), aperçu live, presets par langue.
- **Export** : la fonction d'export construit dynamiquement un genanki.Model selon la config utilisateur.

---

## 25) Sauvegarde & synchronisation cloud (Appwrite)
- **Persistence** à chaque création/édition dans cards/themes ; médias en Appwrite Storage (stockage des fileIds).
- **Ré-export global (Pro)** : la fonction Netlify lit toutes les cartes de l'utilisateur et fabrique l'.apkg.

---

## 26) Page « Communauté » — structure
- **Featured Decks** ; Recherche & filtres ; Explorer (grille infinie, aperçu, Télécharger Pro).
- **Mes partages** : gérer mes decks partagés (modifier/retirer).

---

## 27) Contenus exclusifs (Pro) — sans maintenance
- **Starter decks** (100 mots fréquents, vocab voyage, faux-amis…).
- **Guides evergreen** (SRS, carte parfaite, motivation, méthodes).
- **Ressources triées** (dicos, chaînes pédagogiques, podcasts).

---

## 28) API & endpoints — regroupés

```
POST /api/translate
GET  /api/pexels
POST /api/votz
POST /api/tts                         # AWS Polly par défaut (fallback Azure)
POST /api/export-apkg                 # scope: theme|all
GET  /api/export-apkg/:jobId
GET  /api/community/decks
POST /api/community/decks/:id/download (Pro)
GET  /api/user/model-config
PUT  /api/user/model-config           (Pro)
POST /api/billing/checkout-session    # Stripe Checkout + Stripe Tax
POST /api/billing/portal              # Billing Portal
POST /api/billing/webhook             # MàJ plan/abonnements/factures
```

**Sécurité** : JWT Appwrite ; rate-limit ; audit logs ; clés secrètes côté fonctions.

---

## 29) Roadmap — regroupée
- **M0** : Design système, maquettes, contrats API, choix TTS (**AWS Polly**).
- **M1** : Auth + Thèmes (langue cible) + Cartes Basic/Cloze + Modale Free/Pro + Quotas + Export par thème.
- **M2** : PWA (lecture Free / édition Pro) + Import CSV (Pro) + Communauté (aperçu) + SEO étendu.
- **M3** : Modèles personnalisés (Pro) + Ré-export global (Pro) + Téléchargements Communauté (Pro).
- **M4 (V1)** : Contenus exclusifs + modération Communauté + analytics avancées.

---

## 30) Abonnement & facturation — Stripe Billing + Stripe Tax
- **Checkout subscription** avec automatic_tax.enabled=true, tax_id_collection.enabled=true; B2C UE prix TTC, B2B collecte TVA intracom et reverse charge si valide.
- **Billing Portal** pour gestion paiement/annulation ; webhooks (checkout.session.completed, customer.subscription.*, invoice.payment_*) pour MAJ User.plan, Subscription et Payment.
- **Modèle Stripe** : Product ankilang_pro (service numérique), Price mensuel (price_pro_monthly), Price annuel (price_pro_yearly).

---

## 31) Stratégie tarifaire
- **Lancement à 4,99 €/mois** : tarif d'appel accessible mais soutenable.
- **Annuel : 49,99 €/an** (~-17 %) pour cash up-front et fidélisation.
- **Pas de baisse** : focus preuve de valeur.
- **Hausse future (5,99/6,99)** pour nouveaux clients ; grandfathering pour early adopters (tarif à vie tant que l'abonnement reste actif).
- **UX** : toggle Mensuel ↔ Annuel (badge « -17 % »), bénéfices par persona ; CTA « Essayer Pro 1 mois », « Passer à l'annuel ».
- **Analytics** : plan_view, checkout_click_monthly, checkout_click_yearly, purchase_success, downgrade, churn_reason.

---

**Date de génération : 2025-08-21 00:00:00**
