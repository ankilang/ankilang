#!/usr/bin/env node

/**
 * Script de déploiement PWA Ankilang
 * Exécute tous les tests avant le déploiement
 */

import { execSync } from 'child_process';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Couleurs pour les logs
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function deployPWA() {
  log('🚀 Déploiement PWA Ankilang', 'bold');
  log('==========================\n');

  const steps = [
    {
      name: 'Build de production',
      command: 'pnpm build',
      description: 'Compilation TypeScript et build Vite'
    },
    {
      name: 'Vérification TypeScript',
      command: 'pnpm typecheck',
      description: 'Contrôle des erreurs TypeScript'
    },
    {
      name: 'Tests PWA',
      command: 'pnpm test:pwa',
      description: 'Validation des fonctionnalités PWA'
    },
    {
      name: 'Checklist PWA',
      command: 'pnpm checklist:pwa',
      description: 'Checklist complète avant déploiement'
    }
  ];

  for (const step of steps) {
    log(`📋 ${step.name}`, 'blue');
    log(`   ${step.description}`, 'blue');
    
    try {
      execSync(step.command, { 
        cwd: join(__dirname, '..'), 
        stdio: 'inherit',
        timeout: 60000 
      });
      log(`✅ ${step.name} réussi`, 'green');
    } catch (error) {
      log(`❌ ${step.name} échoué`, 'red');
      log(`   Erreur: ${error.message}`, 'red');
      return false;
    }
    
    log('');
  }

  log('🎉 Déploiement PWA réussi !', 'green');
  log('==========================', 'green');
  log('', 'green');
  log('📱 L\'application PWA est prête :', 'bold');
  log('✅ Installable sur Android et iOS', 'green');
  log('✅ Fonctionne hors ligne', 'green');
  log('✅ Optimisée pour les performances', 'green');
  log('✅ Accessible et sécurisée', 'green');
  log('', 'green');
  log('🔗 Prochaines étapes :', 'bold');
  log('1. Déployer sur votre plateforme (Netlify, Vercel, etc.)', 'blue');
  log('2. Configurer HTTPS (obligatoire pour PWA)', 'blue');
  log('3. Tester l\'installation sur appareils réels', 'blue');
  log('4. Valider avec Lighthouse en production', 'blue');
  log('', 'green');
  log('📚 Documentation : apps/web/PWA_IMPROVEMENTS.md', 'blue');

  return true;
}

// Exécution si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  deployPWA().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { deployPWA };
