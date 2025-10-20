#!/bin/bash
# Nettoyage des fichiers Netlify legacy
# Usage: ./scripts/cleanup-netlify.sh

set -e

echo "🧹 Nettoyage des fichiers Netlify legacy..."
echo ""

# Vérifier qu'on est à la racine du projet
if [ ! -f "package.json" ]; then
  echo "❌ Erreur: Exécuter depuis la racine du projet"
  exit 1
fi

# Fonction pour supprimer un dossier/fichier
cleanup() {
  local path=$1
  if [ -e "$path" ]; then
    echo "  🗑️  Suppression: $path"
    rm -rf "$path"
  else
    echo "  ✓  Déjà supprimé: $path"
  fi
}

# Supprimer les dossiers Netlify
echo "📁 Suppression des dossiers Netlify..."
cleanup "netlify/"
cleanup "apps/functions/"
cleanup "external-functions/"
cleanup ".netlify/"

echo ""
echo "✅ Nettoyage terminé!"
echo ""
echo "⚠️  Action manuelle requise:"
echo "  Éditer apps/web/.env.local et supprimer:"
echo "    - VITE_MEDIA_PROXY_URL"
echo "    - VITE_REVI_URL"
echo "    - VITE_VOTZ_URL"
echo "    - VITE_TRANSLATE_URL"
echo "    - VITE_PEXELS_URL"
echo ""
echo "🔍 Vérification finale:"
echo "  pnpm run security:check"
