# 🌍 Analyse - Langues Disponibles & Mapping API

**Date** : 2025-10-19

---

## 📊 Langues Disponibles pour les Utilisateurs

### Total : **39 langues** dans l'interface

#### Langues avec Support Complet (6 langues)

| Code UI | Nom | API DeepL | API Revirada | Statut |
|---------|-----|-----------|--------------|--------|
| `oc` | Occitan | ❌ | ✅ | ✅ Gratuit (Revirada) |
| `fr` | Français | ✅ | ✅ | ✅ Support total |
| `es` | Espagnol | ✅ | ❌ | ✅ Via DeepL |
| `de` | Allemand | ✅ | ❌ | ✅ Via DeepL |
| `it` | Italien | ✅ | ❌ | ✅ Via DeepL |
| `pt-PT` | Portugais (PT) | ✅ | ❌ | ✅ Via DeepL |

#### Langues avec Variantes (10 langues)

| Code UI | Nom | API attendu | Statut Mapping |
|---------|-----|-------------|----------------|
| `en-GB` | Anglais (UK) | `en-gb` | ✅ Correct |
| `en-US` | Anglais (US) | `en-us` | ✅ Correct |
| `es-419` | Espagnol (LatAm) | `es` | ⚠️ **PROBLÈME** |
| `pt-BR` | Portugais (BR) | `pt` | ⚠️ **PROBLÈME** |
| `zh-HANS` | Chinois (simplifié) | `zh` ? | ⚠️ **PROBLÈME** |
| `zh-HANT` | Chinois (traditionnel) | `zh` ? | ⚠️ **PROBLÈME** |

#### Langues Non Supportées API (27 langues)

Ces langues sont **affichées dans l'UI** mais **ne fonctionneront PAS** avec l'API :

| Code UI | Nom | Problème |
|---------|-----|----------|
| `nl` | Néerlandais | ❌ Pas dans schéma API |
| `pl` | Polonais | ❌ Pas dans schéma API |
| `sv` | Suédois | ❌ Pas dans schéma API |
| `da` | Danois | ❌ Pas dans schéma API |
| `nb` | Norvégien | ❌ Pas dans schéma API |
| `fi` | Finnois | ❌ Pas dans schéma API |
| `ru` | Russe | ❌ Pas dans schéma API |
| `ja` | Japonais | ❌ Pas dans schéma API |
| `ko` | Coréen | ❌ Pas dans schéma API |
| `ar` | Arabe | ❌ Pas dans schéma API |
| `tr` | Turc | ❌ Pas dans schéma API |
| `bg` | Bulgare | ❌ Pas dans schéma API |
| `cs` | Tchèque | ❌ Pas dans schéma API |
| `el` | Grec | ❌ Pas dans schéma API |
| `et` | Estonien | ❌ Pas dans schéma API |
| `he` | Hébreu | ❌ Pas dans schéma API |
| `hu` | Hongrois | ❌ Pas dans schéma API |
| `id` | Indonésien | ❌ Pas dans schéma API |
| `lt` | Lituanien | ❌ Pas dans schéma API |
| `lv` | Letton | ❌ Pas dans schéma API |
| `ro` | Roumain | ❌ Pas dans schéma API |
| `sk` | Slovaque | ❌ Pas dans schéma API |
| `sl` | Slovène | ❌ Pas dans schéma API |
| `th` | Thaï | ❌ Pas dans schéma API |
| `uk` | Ukrainien | ❌ Pas dans schéma API |
| `vi` | Vietnamien | ❌ Pas dans schéma API |
| `ca` | Catalan | ⚠️ Dans API mais pas DeepL |

---

## 🔍 Problèmes de Mapping Identifiés

### ❌ Problème 1 : Variantes Non Mappées

**Codes UI** : `es-419`, `pt-BR`, `zh-HANS`, `zh-HANT`

**Impact** : Ces codes seront rejetés par l'API (validation failed)

**Cause** : Le schéma API accepte uniquement :
```typescript
['fr', 'en', 'en-us', 'en-gb', 'es', 'de', 'it', 'pt', 'oc', 'ca']
```

Mais l'UI propose des variantes non supportées.

**Solution** : Ajouter mapping dans `normalizeDeepLLang()` :
```typescript
if (normalized === 'es-419') return 'es'
if (normalized === 'pt-br' || normalized === 'pt-pt') return 'pt'
if (normalized === 'zh-hans' || normalized === 'zh-hant') return 'zh'
```

---

### ❌ Problème 2 : Langues Affichées Mais Non Supportées

**Nombre** : 27 langues sur 39

**Impact** : Les utilisateurs peuvent créer des thèmes dans ces langues, mais **la traduction échouera**.

**Cause** : Décalage entre `LANGUAGES` (39 langues) et schéma API (8 langues)

**Solutions possibles** :

#### Option A : Réduire l'UI (Recommandé)
Afficher uniquement les langues supportées par l'API :
- `oc` (Occitan - Revirada)
- `fr`, `en-GB`, `en-US`, `es`, `de`, `it`, `pt` (DeepL)
- `ca` (Catalan - si supporté)

**Avantages** :
- ✅ Pas de confusion utilisateur
- ✅ Toutes les langues affichées fonctionnent
- ✅ Simplicité

**Inconvénients** :
- ❌ Réduction de 39 → 9 langues
- ❌ Peut décevoir certains utilisateurs

#### Option B : Étendre l'API
Ajouter toutes les langues DeepL au schéma API.

**Avantages** :
- ✅ Support complet DeepL (30+ langues)
- ✅ Pas de changement UI

**Inconvénients** :
- ❌ Coût API augmenté
- ❌ Modification backend requise

#### Option C : Avertissement UI
Afficher toutes les langues mais indiquer lesquelles nécessitent un abonnement Pro ou ne sont pas encore supportées.

**Avantages** :
- ✅ Transparence utilisateur
- ✅ Pas de changement technique

**Inconvénients** :
- ❌ Expérience utilisateur dégradée
- ❌ Maintenance complexe

---

### ❌ Problème 3 : Catalan (ca) dans le Schéma

**Code** : `ca` (Catalan)

**Présent dans** :
- ✅ Schéma API validation
- ❌ Liste `LANGUAGES` de l'UI

**Impact** : L'API accepte le Catalan mais l'UI ne le propose pas.

**Solution** : Ajouter Catalan à `LANGUAGES` :
```typescript
{
  code: 'ca',
  label: 'Catalan',
  nativeName: 'Català',
  flag: 'ca',
  color: 'from-red-400 to-yellow-500'
}
```

---

## 🔧 Mapping Actuel vs Requis

### Fonction `normalizeDeepLLang()` Actuelle

```typescript
function normalizeDeepLLang(lang: string): string {
  const normalized = lang.toLowerCase()
  // DeepL deprecated 'en', use 'en-US' instead
  if (normalized === 'en') {
    return 'en-us'
  }
  return normalized
}
```

### ❌ Cas Non Gérés

| Code UI | Actuel | API attend | Résultat |
|---------|--------|------------|----------|
| `es-419` | `'es-419'` | `'es'` | ❌ 400 Validation failed |
| `pt-BR` | `'pt-br'` | `'pt'` | ❌ 400 Validation failed |
| `pt-PT` | `'pt-pt'` | `'pt'` | ❌ 400 Validation failed |
| `zh-HANS` | `'zh-hans'` | `'zh'` ? | ❌ 400 Validation failed |
| `zh-HANT` | `'zh-hant'` | `'zh'` ? | ❌ 400 Validation failed |
| `nb` | `'nb'` | ❌ Non supporté | ❌ 400 Validation failed |

---

## ✅ Recommandations

### Priorité 1 : Corriger le Mapping des Variantes

**Action** : Étendre `normalizeDeepLLang()` pour mapper les variantes

**Code** :
```typescript
function normalizeDeepLLang(lang: string): string {
  const normalized = lang.toLowerCase()

  // English variants
  if (normalized === 'en') return 'en-us'
  if (normalized === 'en-gb' || normalized === 'en-us') return normalized

  // Spanish variants
  if (normalized === 'es-419') return 'es'

  // Portuguese variants
  if (normalized === 'pt-br' || normalized === 'pt-pt') return 'pt'

  // Chinese variants (à vérifier si DeepL supporte 'zh')
  if (normalized === 'zh-hans' || normalized === 'zh-hant') return 'zh'

  return normalized
}
```

### Priorité 2 : Ajouter Catalan à l'UI

**Action** : Ajouter `ca` à `LANGUAGES`

### Priorité 3 : Nettoyer l'UI ou Étendre l'API

**Options** :

**Option A - Nettoyer l'UI (Rapide)** :
- Filtrer `LANGUAGES` pour ne garder que les langues supportées
- Ajouter un badge "Bientôt disponible" pour les autres

**Option B - Étendre l'API (Complet)** :
- Mettre à jour le schéma API pour accepter toutes les langues DeepL
- Ajouter mapping côté backend si nécessaire

---

## 📋 Checklist de Validation

### Mapping Codes Langue

- [ ] `en` → `en-us` ✅ (déjà fait)
- [ ] `en-GB` → `en-gb` ✅ (déjà fait via lowercase)
- [ ] `en-US` → `en-us` ✅ (déjà fait via lowercase)
- [ ] `es-419` → `es` ❌ **À CORRIGER**
- [ ] `pt-BR` → `pt` ❌ **À CORRIGER**
- [ ] `pt-PT` → `pt` ❌ **À CORRIGER**
- [ ] `zh-HANS` → `zh` ❌ **À CORRIGER** (vérifier DeepL)
- [ ] `zh-HANT` → `zh` ❌ **À CORRIGER** (vérifier DeepL)

### Cohérence UI/API

- [ ] Toutes les langues UI sont dans l'API ❌ (27/39 manquantes)
- [ ] Toutes les langues API sont dans l'UI ❌ (`ca` manque)
- [ ] Les variantes sont documentées ⚠️ (partiellement)

---

## 🎯 Impact Utilisateur

### Scénarios Problématiques

1. **Utilisateur crée un thème "Espagnol (Am. latine)"** (`es-419`)
   - ❌ Traduction échouera avec "Validation failed"
   - 😞 Mauvaise expérience utilisateur

2. **Utilisateur crée un thème "Portugais (BR)"** (`pt-BR`)
   - ❌ Traduction échouera avec "Validation failed"
   - 😞 Confusion (langue affichée mais non fonctionnelle)

3. **Utilisateur veut créer un thème "Catalan"**
   - ❌ Langue non visible dans l'UI
   - 😞 Impossible malgré support API

4. **Utilisateur crée un thème "Japonais"** (`ja`)
   - ❌ Traduction échouera (langue pas dans API)
   - 😞 Expérience dégradée

---

## 📊 Résumé

| Métrique | Valeur |
|----------|--------|
| Langues affichées UI | 39 |
| Langues supportées API | 10 (`fr`, `en-us`, `en-gb`, `es`, `de`, `it`, `pt`, `oc`, `ca`) |
| Langues fonctionnelles | 6-8 (selon mapping) |
| Taux de compatibilité | **15-20%** ❌ |

**Conclusion** : Il y a un **décalage majeur** entre ce que l'UI promet (39 langues) et ce que l'API supporte (10 langues). Cela créera de la confusion et des erreurs pour les utilisateurs.

**Action recommandée** : **Priorité 1** - Corriger le mapping des variantes, puis décider entre nettoyer l'UI ou étendre l'API.

---

**Créé le** : 2025-10-19
**Nécessite action** : ✅ Oui - Corrections mapping + Décision UI/API
