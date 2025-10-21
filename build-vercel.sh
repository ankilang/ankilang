#!/bin/bash
set -e  # Exit on error

echo "🚀 Vercel Build Script - Ankilang Monorepo"
echo "=========================================="

# Étape 1 : Build des packages partagés
echo "📦 Step 1/3: Building @ankilang/shared..."
cd packages/shared
pnpm build
cd ../..

echo "📦 Step 2/3: Building @ankilang/shared-cache..."
cd packages/shared-cache
pnpm build
cd ../..

# Étape 3 : Build de l'application web
echo "🌐 Step 3/3: Building @ankilang/web..."
cd apps/web
pnpm build
cd ../..

echo "✅ Build completed successfully!"
