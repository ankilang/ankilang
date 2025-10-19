# 🏴 Solutions pour le Drapeau Occitan

**Date** : 2025-10-19
**Problème** : Twemoji ne propose pas de drapeaux régionaux (seulement pays ISO 3166-1)

---

## 🎯 Le Problème

**Twemoji ne contient que** :
- ✅ Drapeaux de pays (ISO 3166-1)
- ✅ Quelques drapeaux de subdivisions (Angleterre, Écosse, Pays de Galles)
- ❌ **Pas de drapeaux régionaux** comme l'Occitan

**Notre besoin** :
- Drapeau occitan pour `oc` (languedocien)
- Possiblement une variante pour `oc-gascon`

---

## 🌐 Sources Disponibles

### Option 1 : Wikimedia Commons (Public Domain) ⭐ **RECOMMANDÉ**

**Avantages** :
- ✅ Licence libre (CC-BY-SA 4.0 ou Public Domain)
- ✅ SVG optimisés disponibles
- ✅ Plusieurs variantes du drapeau occitan
- ✅ Tailles petites (2-4 KB)

**Drapeaux disponibles** :

#### 1a. Drapeau Occitan Classique (Croix Occitane)
- **URL** : https://commons.wikimedia.org/wiki/File:Flag_of_Occitania.svg
- **Taille** : ~4 KB
- **Dimensions** : 1064 × 708 pixels
- **Licence** : Public Domain ou CC-BY-SA 4.0
- **Description** : Croix occitane rouge/jaune traditionnelle
- **Usage** : Drapeau historique de l'Occitanie

#### 1b. Drapeau Région Occitanie (Symbole seul)
- **URL** : https://commons.wikimedia.org/wiki/File:Flag_of_R%C3%A9gion_Occitanie_(symbol_only).svg
- **Taille** : ~2 KB
- **Dimensions** : 900 × 600 pixels
- **Licence** : CC-BY-SA 4.0
- **Description** : Symbole moderne de la région administrative
- **Usage** : Logo officiel de la région Occitanie

#### 1c. Drapeau Occitan avec Étoile
- **URL** : https://commons.wikimedia.org/wiki/File:Flag_of_Occitania_(with_star).svg
- **Taille** : ~4 KB
- **Licence** : CC-BY-SA 4.0
- **Description** : Croix occitane avec étoile à 7 branches (Félibrige)
- **Usage** : Variante culturelle

---

### Option 2 : Créer un SVG Custom Style Twemoji

**Avantages** :
- ✅ Cohérence visuelle totale avec les autres drapeaux
- ✅ Contrôle total sur le design
- ✅ Optimisé pour votre use case

**Inconvénients** :
- ❌ Travail de design requis
- ⚠️ Temps de création (~1-2 heures)

**Approche** :
1. Partir du SVG Wikimedia Commons
2. Adapter au style Twemoji (viewBox="0 0 36 36", coins arrondis)
3. Optimiser avec SVGO

---

### Option 3 : Librairie flag-icons

**URL** : https://github.com/lipis/flag-icons
**Drapeaux** : 250+ drapeaux de pays et régions

**À vérifier** :
- ⚠️ Occitan peut ne pas être inclus (principalement pays)
- ⚠️ Nécessite une dépendance npm
- ⚠️ Bundle size augmenté

**Pas recommandé** : Casser la cohérence actuelle (pas de dépendances)

---

### Option 4 : Garder l'Approche Texte "ÒC"

**Avantages** :
- ✅ Déjà implémenté
- ✅ Unique et moderne
- ✅ Aucun fichier requis

**Inconvénients** :
- ❌ Inconsistance visuelle
- ❌ Pas de distinction dialectes
- ❌ Fichiers inutilisés (1,23 MB)

---

## 🏆 Recommandation Finale

### **Option 1a : Drapeau Wikimedia Commons adapté au style Twemoji**

**Plan d'action** :

#### Étape 1 : Télécharger le SVG Wikimedia
```bash
# Télécharger depuis :
# https://commons.wikimedia.org/wiki/File:Flag_of_Occitania.svg

# Ou utiliser l'API Wikimedia :
curl -o oc-original.svg "https://upload.wikimedia.org/wikipedia/commons/3/37/Flag_of_Occitania.svg"
```

#### Étape 2 : Adapter au Style Twemoji

**Modifications nécessaires** :
```svg
<!-- AVANT (Wikimedia) -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1064 708">
  <!-- Croix occitane -->
</svg>

<!-- APRÈS (Style Twemoji) -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
  <!-- Fond avec coins arrondis -->
  <rect width="36" height="36" fill="#FCDD09" rx="4"/>
  <!-- Croix occitane simplifiée -->
  <path fill="#C8102E" d="..."/>
</svg>
```

**Caractéristiques style Twemoji** :
- `viewBox="0 0 36 36"` (format carré 36×36)
- `rx="4"` sur le fond (coins arrondis)
- Simplification des détails pour petite taille
- Couleurs vibrantes

#### Étape 3 : Optimiser avec SVGO

```bash
# Installer SVGO si nécessaire
npm install -g svgo

# Optimiser
svgo oc-twemoji.svg -o oc.svg

# Taille cible : ~3-5 KB (comme les autres drapeaux Twemoji)
```

#### Étape 4 : Placer dans le Dossier

```bash
cp oc.svg apps/web/src/assets/flags/oc.svg

# Supprimer les anciens fichiers
rm apps/web/src/assets/flags/oc.png   # -1,2 MB
rm apps/web/src/assets/flags/oc.webp  # -29 KB
```

---

## 🎨 Proposition de SVG Occitan Style Twemoji

Voici une version simplifiée adaptée au style Twemoji :

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
  <!-- Fond jaune avec coins arrondis (style Twemoji) -->
  <rect width="36" height="36" fill="#FCDD09" rx="4"/>

  <!-- Croix occitane rouge simplifiée -->
  <g fill="#C8102E">
    <!-- Branche verticale -->
    <rect x="15" y="4" width="6" height="28" rx="1"/>

    <!-- Branche horizontale -->
    <rect x="4" y="15" width="28" height="6" rx="1"/>

    <!-- Boules aux 4 extrémités -->
    <circle cx="18" cy="6" r="2.5"/>
    <circle cx="18" cy="30" r="2.5"/>
    <circle cx="6" cy="18" r="2.5"/>
    <circle cx="30" cy="18" r="2.5"/>

    <!-- 12 petites boules (3 par quadrant) - Simplifiées -->
    <!-- Quadrant haut-gauche -->
    <circle cx="11" cy="9" r="1.2"/>
    <circle cx="9" cy="11" r="1.2"/>
    <circle cx="13" cy="7" r="1.2"/>

    <!-- Quadrant haut-droit -->
    <circle cx="25" cy="9" r="1.2"/>
    <circle cx="27" cy="11" r="1.2"/>
    <circle cx="23" cy="7" r="1.2"/>

    <!-- Quadrant bas-gauche -->
    <circle cx="11" cy="27" r="1.2"/>
    <circle cx="9" cy="25" r="1.2"/>
    <circle cx="13" cy="29" r="1.2"/>

    <!-- Quadrant bas-droit -->
    <circle cx="25" cy="27" r="1.2"/>
    <circle cx="27" cy="25" r="1.2"/>
    <circle cx="23" cy="29" r="1.2"/>
  </g>
</svg>
```

**Taille estimée** : ~800 bytes non optimisé, ~500 bytes avec SVGO

---

## 🔄 Pour les 2 Dialectes

### Variante 1 : Même Drapeau + Badge "G"

**Implémentation** :
- `oc` → `oc.svg` (drapeau seul)
- `oc-gascon` → `oc.svg` + badge "G" (via code)

**Avantages** :
- ✅ Un seul fichier SVG requis
- ✅ Distinction claire via le badge

### Variante 2 : Deux Drapeaux Différents

**Options pour gascon** :
1. **Drapeau Gascogne** (armoiries historiques)
2. **Variante couleur** (inverser rouge/jaune)
3. **Étoile ajoutée** (pour différencier)

**Recommandation** : **Variante 1** (badge "G") pour simplicité

---

## 📋 Checklist d'Implémentation

### Tâches Immédiate

- [ ] Télécharger SVG Wikimedia Commons
- [ ] Adapter au style Twemoji (viewBox 36×36, rx="4")
- [ ] Optimiser avec SVGO
- [ ] Placer dans `apps/web/src/assets/flags/oc.svg`
- [ ] Supprimer `oc.png` et `oc.webp`
- [ ] Modifier `FlagIcon.tsx` (supprimer cas spécial)
- [ ] Ajouter mapping dans `COUNTRY_MAP`
- [ ] Tester affichage dans UI
- [ ] Vérifier accessibilité
- [ ] Documenter la source et licence

### Attribution Requise (CC-BY-SA 4.0)

Ajouter dans `apps/web/src/assets/flags/README.md` :

```markdown
## Occitan Flag (oc.svg)

- **Source**: Wikimedia Commons
- **Original**: https://commons.wikimedia.org/wiki/File:Flag_of_Occitania.svg
- **License**: CC-BY-SA 4.0 or Public Domain
- **Modifications**: Adapted to Twemoji style (36×36 viewBox, rounded corners)
- **Attribution**: Based on traditional Occitan cross flag (croix occitane)
```

---

## 🎯 Résultat Attendu

**Avant** :
- `oc` : Texte "ÒC" (gradient)
- `oc-gascon` : Texte "ÒC" (identique)
- Fichiers inutilisés : 1,23 MB

**Après** :
- `oc` : 🏴 Drapeau occitan SVG (~5 KB)
- `oc-gascon` : 🏴ᴳ Drapeau occitan + badge "G"
- Fichiers supprimés : -1,23 MB
- **Gain net** : -1,225 MB (ratio 250:1)

**Bonus** :
- ✅ Cohérence visuelle totale
- ✅ Distinction claire entre dialectes
- ✅ Licence libre respectée
- ✅ Performance optimisée

---

## 🚀 Prêt à Implémenter ?

**Veux-tu que je** :
1. Télécharge le SVG Wikimedia ?
2. L'adapte au style Twemoji ?
3. Mette à jour le code de `FlagIcon.tsx` ?
4. Supprime les fichiers inutilisés ?

**Temps estimé** : 30-45 minutes

---

**Créé le** : 2025-10-19
**Statut** : Solutions identifiées - Prêt pour implémentation
