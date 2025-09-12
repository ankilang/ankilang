# Script de démarrage rapide pour Ankilang
# Usage: .\start-dev.ps1

Write-Host "🚀 Démarrage d'Ankilang..." -ForegroundColor Cyan

# Vérifier les prérequis
Write-Host "📋 Vérification des prérequis..." -ForegroundColor Yellow

$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ Node.js n'est pas installé. Veuillez installer Node.js ≥ 18.0.0" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green

$pnpmVersion = pnpm --version 2>$null
if (-not $pnpmVersion) {
    Write-Host "❌ pnpm n'est pas installé. Installez-le avec: npm install -g pnpm" -ForegroundColor Red
    exit 1
}
Write-Host "✅ pnpm: $pnpmVersion" -ForegroundColor Green

# Installer les dépendances si nécessaire
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
    pnpm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors de l'installation des dépendances" -ForegroundColor Red
        exit 1
    }
}

# Compiler le package shared
Write-Host "🔨 Compilation du package shared..." -ForegroundColor Yellow
pnpm --filter=@ankilang/shared build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de la compilation du package shared" -ForegroundColor Red
    exit 1
}

# Vérification TypeScript
Write-Host "🔍 Vérification TypeScript..." -ForegroundColor Yellow
pnpm typecheck
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreurs TypeScript détectées" -ForegroundColor Red
    exit 1
}

# Lancer le serveur de développement
Write-Host "🌐 Lancement du serveur de développement..." -ForegroundColor Green
Write-Host "📍 L'application sera disponible sur: http://localhost:5173" -ForegroundColor Cyan
Write-Host "⏹️  Appuyez sur Ctrl+C pour arrêter le serveur" -ForegroundColor Gray
Write-Host ""

pnpm dev
