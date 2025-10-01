#!/bin/bash

echo "🧹 Nettoyage des ports 5173-5175..."
lsof -ti:5173 -ti:5174 -ti:5175 | xargs -r kill -9

echo "🚀 Démarrage du serveur de développement sur le port 5173..."
cd "$(dirname "$0")/.."
pnpm -w dev

