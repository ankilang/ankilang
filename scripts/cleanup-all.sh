#!/bin/bash
# Script de nettoyage complet - Netlify + fichiers inutilisés
# Usage: ./scripts/cleanup-all.sh [--dry-run]

set -e

DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
  DRY_RUN=true
  echo "🔍 MODE DRY-RUN (simulation, aucune modification)"
fi

echo "🧹 Nettoyage complet du projet Ankilang"
echo ""

# Vérifier qu'on est à la racine du projet
if [ ! -f "package.json" ]; then
  echo "❌ Erreur: Exécuter depuis la racine du projet"
  exit 1
fi

# Fonction pour supprimer
cleanup() {
  local path=$1
  local desc=$2

  if [ -e "$path" ]; then
    if [ "$DRY_RUN" = true ]; then
      echo "  [DRY-RUN] 🗑️  Supprimerait: $path ($desc)"
    else
      echo "  🗑️  Suppression: $path ($desc)"
      rm -rf "$path"
    fi
  else
    echo "  ✓  Déjà supprimé: $path"
  fi
}

# Fonction pour archiver
archive() {
  local src=$1
  local dest=$2

  if [ -f "$src" ]; then
    if [ "$DRY_RUN" = true ]; then
      echo "  [DRY-RUN] 📦 Archiverait: $src → $dest"
    else
      mkdir -p "$(dirname "$dest")"
      echo "  📦 Archivage: $src → $dest"
      mv "$src" "$dest"
    fi
  else
    echo "  ✓  Déjà archivé: $src"
  fi
}

echo "📁 ÉTAPE 1: Suppression des dossiers Netlify"
echo "─────────────────────────────────────────────"
cleanup "netlify/" "Fonction legacy media-proxy (8 KB)"
cleanup "apps/functions/" "Build artifacts Netlify (20 KB)"
cleanup "external-functions/" "Templates Netlify jamais déployés (132 KB)"
cleanup ".netlify/" "Cache CLI Netlify"

echo ""
echo "📚 ÉTAPE 2: Archivage de la documentation Netlify"
echo "─────────────────────────────────────────────────"
archive "MIGRATION-PEXELS.md" "docs/archive/netlify/MIGRATION-PEXELS.md"
archive "MIGRATION-PLAN.md" "docs/archive/netlify/MIGRATION-PLAN.md"
archive "MIGRATION-TTS.md" "docs/archive/netlify/MIGRATION-TTS.md"
archive "docs/security/deployment-guide.md" "docs/archive/netlify/deployment-guide.md"
archive "docs/security/external-netlify-functions.md" "docs/archive/netlify/external-netlify-functions.md"
archive "docs/security/netlify-functions-auth.md" "docs/archive/netlify/netlify-functions-auth.md"

echo ""
echo "✅ Nettoyage terminé!"
echo ""

if [ "$DRY_RUN" = true ]; then
  echo "ℹ️  Ceci était une simulation. Pour appliquer les changements:"
  echo "   ./scripts/cleanup-all.sh"
else
  echo "📊 Statistiques:"
  echo "   • Dossiers supprimés: ~160 KB"
  echo "   • Fichiers archivés: 6 documents"
  echo ""
  echo "⚠️  Actions manuelles restantes:"
  echo ""
  echo "1. Éditer apps/web/.env.local et supprimer:"
  echo "   VITE_MEDIA_PROXY_URL"
  echo "   VITE_REVI_URL"
  echo "   VITE_VOTZ_URL"
  echo "   VITE_TRANSLATE_URL"
  echo "   VITE_PEXELS_URL"
  echo ""
  echo "2. Commiter les changements:"
  echo "   git add -A"
  echo "   git commit -m \"chore: remove Netlify legacy files and archive docs\""
  echo ""
  echo "3. Vérifier qu'aucune référence Netlify ne reste dans le code:"
  echo "   grep -r \"netlify\" apps/web/src/"
  echo "   # Résultat attendu: 0 résultats"
fi
