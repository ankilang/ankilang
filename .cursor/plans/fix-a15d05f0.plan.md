<!-- a15d05f0-f9ed-4c8c-8c78-bd29241c5872 3742a45a-2160-416d-bc31-dc1202038542 -->
# Plan minimal de déploiement et sécurisation critique

## Réponses directes

- **Déployable maintenant**: Oui (apps/web + Appwrite + media-proxy sécurisé).
- **Sécurité actuelle**: Correcte côté Appwrite (owner-only, fileSecurity, filtres userId). Risque côté fonctions Netlify externes (non authentifiées).
- **À sécuriser**: Oui, au minimum `revirada` (traduction Occitan) et `votz` (TTS Occitan).

## Étapes (≤8)

1) Déployer le front (apps/web) sur Netlify

- Build: `pnpm --filter=@ankilang/web build`
- Publier: `apps/web/dist`
- SPA fallback (200.html) via Netlify
- Env front: `VITE_APPWRITE_ENDPOINT`, `VITE_APPWRITE_PROJECT_ID`, `VITE_MEDIA_PROXY_URL`

2) Vérifier Appwrite (zéro action risquée)

- Exécuter: `node scripts/verify-appwrite-setup.mjs`
- Confirmer: collections, attributs, bucket `flashcard-images`, fileSecurity, extensions

3) Sécuriser uniquement les fonctions critiques (repos externes)

- Repos: `ankilangrevirada`, `ankilangvotz`
- Ajouter middleware JWT et CORS strict (origin: `https://ankilang.netlify.app`)
- Fichiers à créer (dans chaque repo):
- `lib/auth.ts` (withAuth)
- `lib/problem.ts` (RFC 7807 + traceId)
- `lib/cors.ts` (CORS sécurisé)
- `netlify/functions/{revirada|votz}.ts` (wrap avec `withAuth`)
- Risque si omis: abus et coûts API

4) Mettre à jour le front pour envoyer le JWT à ces 2 fonctions

- Fichiers: `apps/web/src/services/revirada.ts`, `apps/web/src/services/votz.ts`
- Ajouter header: `Authorization: Bearer <JWT>` via `getSessionJWT()`

5) Smoke tests E2E

- Création thème + carte (basic/cloze)
- Traduction Occitan OK (401 si sans JWT)
- TTS Occitan OK (401 si sans JWT)
- Export .apkg: audio via `media-proxy` (déjà sécurisé)

6) Déployer (prod) et monitorer

- Activer logs Netlify
- Suivre erreurs 401/403 et latence

7) Option ultérieure: sécuriser le reste des fonctions

- `ankilangtts`, `ankilangdeepl`, `ankilangpexels` (mêmes patterns)

8) Option ultérieure: rate limiting simple

- In-memory par userId pour `revirada`/`votz` (100 req/h)

### To-dos

- [ ] Durcir permissions Appwrite (DB/Storage), indexes, scripts de vérif
- [ ] Ajouter middleware JWT + helper RFC7807 + traceId aux functions
- [ ] Unifier validation I/O avec Zod côté web et functions
- [ ] Sécuriser media-proxy, URLs signées Storage, pipeline audio/images
- [ ] Idempotence création carte, anti-dup export, suppressions atomiques
- [ ] Intégrer Sentry, logs structurés, corrélation traceId de bout en bout
- [ ] Mettre ESLint + tests unitaires/intégration/E2E, couverture minimale
- [ ] Mettre en place CI/CD, secrets, .env.example complet, audits perf/a11y