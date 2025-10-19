# Guide de Test - Translation Vercel API

**Objectif** : Valider le bon fonctionnement de la traduction via l'API Vercel

---

## 🚀 Comment tester

### Méthode 1 : Via la console navigateur (Recommandé)

1. **Lancer l'application** :
   ```bash
   pnpm dev
   ```

2. **Se connecter** à l'application (nécessaire pour le JWT)

3. **Ouvrir la console navigateur** (F12 > Console)

4. **Exécuter les tests** :

   **Option A : Test complet (12 tests)** :
   ```javascript
   import('./src/scripts/test-translate-vercel').then(m => m.runTranslationTests())
   ```

   **Option B : Test rapide DeepL** :
   ```javascript
   import('./src/scripts/test-translate-vercel').then(m => m.quickTestDeepL())
   ```

   **Option C : Test rapide Revirada** :
   ```javascript
   import('./src/scripts/test-translate-vercel').then(m => m.quickTestRevirada())
   ```

---

## 📊 Tests inclus

### DeepL (Traduction multilingue)

| Test | Source | Cible | Texte |
|------|--------|-------|-------|
| 1 | EN | FR | "Hello world" |
| 2 | FR | EN | "Bonjour le monde" |
| 3 | ES | FR | "Hola mundo" |
| 4 | DE | FR | "Guten Tag" |
| 10 | EN | FR | "Thank you" (direct) |
| 11 | EN | FR | Texte long (multi-phrases) |
| 12 | EN | FR | Caractères spéciaux |

### Revirada (Traduction occitan)

| Test | Direction | Dialecte | Texte |
|------|-----------|----------|-------|
| 5 | FR → OC | Languedocien | "Bonjour" |
| 6 | FR → OC | Gascon | "Bonjour" |
| 7 | OC → FR | Auto | "Bonjorn" |
| 8 | FR → OC | Languedocien | "Au revoir" (direct) |
| 9 | FR → OC | Gascon | "Merci" (direct) |

---

## ✅ Résultat attendu

### Console output

```
🚀 Starting Translation Tests (Vercel API)
============================================================

🧪 Running: DeepL: Hello World (EN → FR)
✅ PASS (1234ms)
   Provider: deepl
   Result: "Bonjour le monde"

🧪 Running: Revirada: Bonjour (FR → OC Languedocien)
✅ PASS (567ms)
   Provider: revirada
   Result: "Bonjorn"

...

============================================================
📊 TEST RESULTS SUMMARY
============================================================

Total Tests: 12
✅ Passed: 12
❌ Failed: 0
Success Rate: 100.0%
Average Duration: 890ms

📈 By Provider:
  deepl: 7 tests, avg 950ms
  revirada: 5 tests, avg 780ms

============================================================
```

---

## ❌ Dépannage

### Erreur : "User not authenticated"

**Cause** : Pas connecté à l'application

**Solution** :
1. Se connecter à l'application
2. Relancer les tests

---

### Erreur : "Rate limit exceeded"

**Cause** : Trop de requêtes (limite API Vercel)

**Solution** :
1. Attendre 60 secondes
2. Relancer les tests

**Limites** :
- DeepL : 30 req/min
- Revirada : 20 req/min

---

### Erreur : "Network error" ou "502 Bad Gateway"

**Cause** : API Vercel indisponible ou problème réseau

**Solution** :
1. Vérifier la connexion internet
2. Vérifier `VITE_VERCEL_API_URL` dans `.env`
3. Tester manuellement l'API : `curl https://ankilang-api-monorepo.vercel.app`

---

### Erreur : "JWT invalid"

**Cause** : Token expiré ou invalide

**Solution** :
1. Se déconnecter
2. Se reconnecter
3. Relancer les tests

---

## 🧪 Tests manuels (via UI)

Si tu préfères tester via l'interface utilisateur :

### Dans un composant React

Ajoute temporairement ce code dans `StepEnhance.tsx` (ou autre composant) :

```typescript
import { translate } from '../../../services/translate'

// Dans une fonction async
const testTranslation = async () => {
  try {
    const result = await translate({
      text: 'Hello world',
      sourceLang: 'en',
      targetLang: 'fr'
    })
    console.log('Translation result:', result)
  } catch (error) {
    console.error('Translation error:', error)
  }
}

// Appeler dans un useEffect ou bouton
<button onClick={testTranslation}>Test Translation</button>
```

---

## 📝 Variables d'environnement requises

Vérifier dans `apps/web/.env` :

```env
# Vercel API Configuration
VITE_VERCEL_API_URL=https://ankilang-api-monorepo.vercel.app
VITE_VERCEL_API_ORIGIN=https://ankilang.com

# Appwrite (pour JWT)
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=ankilang
```

---

## 🎯 Critères de succès

La migration est validée si :

- ✅ Au moins 10/12 tests passent
- ✅ DeepL fonctionne (EN→FR minimum)
- ✅ Revirada fonctionne (FR→OC minimum)
- ✅ Temps de réponse < 2s en moyenne
- ✅ Aucune erreur 401 (authentification)
- ✅ Headers rate limit présents dans les logs

---

## 📊 Métriques attendues

| Métrique | Cible | Acceptable |
|----------|-------|------------|
| Taux de réussite | 100% | ≥ 90% |
| Durée moyenne | < 1s | < 2s |
| DeepL disponibilité | 100% | ≥ 95% |
| Revirada disponibilité | 100% | ≥ 95% |

---

## 🆘 Support

En cas de problème :

1. Vérifier les logs console (erreurs détaillées)
2. Vérifier le fichier `MIGRATION-PLAN.md` section "Gestion des erreurs"
3. Consulter `API-DOCUMENTATION.txt` pour les détails API

---

**Créé le** : 2025-10-18
**Dernière mise à jour** : 2025-10-18
