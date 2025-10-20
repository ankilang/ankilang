# Configuration ESLint

## Vue d'ensemble

ESLint est configuré pour ce projet avec TypeScript strict mode et React.

## Configuration

- **Format**: ESLint 9 Flat Config (`eslint.config.js`)
- **Parser**: `@typescript-eslint/parser`
- **Plugins**:
  - `typescript-eslint` - Support TypeScript
  - `eslint-plugin-react` - Règles React
  - `eslint-plugin-react-hooks` - Règles React Hooks
  - `eslint-plugin-react-refresh` - Fast Refresh / HMR

## Commandes

```bash
# Vérifier le code (warnings permis)
pnpm lint

# Corriger automatiquement les problèmes
pnpm lint:fix

# Au niveau root
pnpm lint        # Lint uniquement apps/web
pnpm lint:fix    # Fix uniquement apps/web
```

## Règles principales

### TypeScript
- **Erreurs**: variables non utilisées, types any redondants
- **Warnings**: `no-explicit-any`, `no-floating-promises`, `prefer-nullish-coalescing`
- **Désactivé**: `no-unsafe-*` (trop strict pour code existant)

### React
- **Erreurs**: violations rules of hooks
- **Warnings**: entités non échappées (`'`, `"`)
- **Désactivé**: `prop-types` (TypeScript les remplace)

### Général
- **Warnings**: `console.log` (autorisé en dev, à nettoyer avant prod)
- **Erreurs**: `no-var`, utilisation de `const` quand possible

## Fichiers ignorés

- `dist/`, `node_modules/`, `.vite/`
- `scripts/` (Node.js scripts)
- `src/exporter/` (JavaScript legacy, non TypeScript-compliant)
- `**/*.d.ts` (fichiers de déclaration)
- `*.config.{js,ts,cjs,mjs}` (fichiers de configuration)

## État actuel

**1007 problèmes** détectés au total:
- **52 erreurs** (critiques, à corriger)
- **955 warnings** (non bloquants, à nettoyer progressivement)

### Erreurs principales à corriger

1. **React Hooks (6 erreurs)** - hooks appelés conditionnellement
   - Fichier: `src/pages/app/themes/Detail.tsx`
   - Solution: déplacer les early returns après tous les hooks

2. **Variables non utilisées (19 erreurs)**
   - Préfixer avec `_` pour indiquer intentionnellement inutilisé
   - Ou supprimer si vraiment inutile

3. **Clés dupliquées (3 erreurs)**
   - Fichier: Exporter JavaScript
   - À vérifier et corriger

4. **no-undef (11 erreurs)**
   - Vérifier les variables globales manquantes
   - Ajouter au `globals` dans `eslint.config.js` si nécessaire

## Intégration CI/CD

Pour ajouter à la CI (future):
```yaml
- run: pnpm lint
- run: pnpm typecheck
```

## Migration vers strict mode

Pour activer le mode strict à l'avenir (0 warnings):
1. Corriger tous les warnings progressivement
2. Changer `lint` script: `eslint . --max-warnings 0`
3. Activer `...typescript.configs.strictTypeChecked` dans config

## Ressources

- [ESLint Docs](https://eslint.org/docs/latest/)
- [typescript-eslint](https://typescript-eslint.io/)
- [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react)
