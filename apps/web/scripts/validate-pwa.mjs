#!/usr/bin/env node

/**
 * Script de validation PWA avec Lighthouse
 * Teste les performances et l'installabilité
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DIST_DIR = join(__dirname, '../dist');

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

function logMetric(category, score, details = '') {
  const color = score >= 90 ? 'green' : score >= 50 ? 'yellow' : 'red';
  const emoji = score >= 90 ? '✅' : score >= 50 ? '⚠️' : '❌';
  log(`${emoji} ${category}: ${score}/100`, color);
  if (details) {
    log(`   ${details}`, 'blue');
  }
}

async function runLighthouse() {
  log('🔍 Validation PWA avec Lighthouse', 'bold');
  log('================================\n');

  // Vérifier que le build existe
  if (!existsSync(join(DIST_DIR, 'index.html'))) {
    log('❌ Build non trouvé. Exécutez "pnpm build" d\'abord.', 'red');
    return false;
  }

  try {
    // Démarrer le serveur de preview
    log('🚀 Démarrage du serveur de preview...', 'blue');
    const server = execSync('pnpm preview --port 4173', { 
      cwd: join(__dirname, '..'),
      stdio: 'pipe',
      timeout: 10000 
    });

    // Attendre que le serveur soit prêt
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Exécuter Lighthouse
    log('📊 Exécution de Lighthouse...', 'blue');
    const lighthouseOutput = execSync(
      'npx lighthouse http://localhost:4173 --output=json --only-categories=pwa,performance,accessibility,best-practices --chrome-flags="--headless --no-sandbox"',
      { stdio: 'pipe', timeout: 30000 }
    );

    const results = JSON.parse(lighthouseOutput.toString());
    
    // Analyser les résultats
    log('\n📈 Résultats Lighthouse', 'bold');
    log('=====================\n');

    // Scores principaux
    const categories = results.lhr.categories;
    
    logMetric('Performance', Math.round(categories.performance.score * 100));
    logMetric('Accessibilité', Math.round(categories.accessibility.score * 100));
    logMetric('Bonnes pratiques', Math.round(categories['best-practices'].score * 100));
    logMetric('PWA', Math.round(categories.pwa.score * 100));

    // Détails PWA
    log('\n📱 Détails PWA', 'bold');
    log('==============\n');

    const pwaAudits = results.lhr.audits;
    const pwaChecks = [
      { key: 'installable-manifest', name: 'Manifest installable' },
      { key: 'apple-touch-icon', name: 'Icône Apple Touch' },
      { key: 'maskable-icon', name: 'Icône maskable' },
      { key: 'service-worker', name: 'Service Worker' },
      { key: 'offline-start-url', name: 'URL de démarrage offline' },
      { key: 'viewport', name: 'Viewport configuré' },
      { key: 'theme-color', name: 'Couleur de thème' },
      { key: 'content-width', name: 'Largeur de contenu' }
    ];

    let pwaScore = 0;
    pwaChecks.forEach(check => {
      const audit = pwaAudits[check.key];
      if (audit && audit.score !== null) {
        const passed = audit.score === 1;
        pwaScore += passed ? 1 : 0;
        log(`${passed ? '✅' : '❌'} ${check.name}`, passed ? 'green' : 'red');
      }
    });

    // Core Web Vitals
    log('\n⚡ Core Web Vitals', 'bold');
    log('==================\n');

    const metrics = results.lhr.metrics;
    if (metrics) {
      const lcp = metrics.largest_contentful_paint?.value || 0;
      const fid = metrics.max_fid?.value || 0;
      const cls = metrics.cumulative_layout_shift?.value || 0;

      logMetric('LCP', lcp < 2500 ? 100 : lcp < 4000 ? 50 : 0, `${Math.round(lcp)}ms`);
      logMetric('FID', fid < 100 ? 100 : fid < 300 ? 50 : 0, `${Math.round(fid)}ms`);
      logMetric('CLS', cls < 0.1 ? 100 : cls < 0.25 ? 50 : 0, cls.toFixed(3));
    }

    // Recommandations
    log('\n💡 Recommandations', 'bold');
    log('==================\n');

    const failedAudits = Object.values(pwaAudits).filter(audit => 
      audit.score !== null && audit.score < 1 && audit.details
    );

    if (failedAudits.length > 0) {
      failedAudits.slice(0, 5).forEach(audit => {
        log(`⚠️  ${audit.title}`, 'yellow');
        if (audit.description) {
          log(`   ${audit.description}`, 'blue');
        }
      });
    } else {
      log('✅ Aucune recommandation critique', 'green');
    }

    // Résumé final
    const overallScore = Math.round(
      (categories.performance.score + 
       categories.accessibility.score + 
       categories['best-practices'].score + 
       categories.pwa.score) / 4 * 100
    );

    log('\n🎯 Score global', 'bold');
    log('==============');
    logMetric('Score global', overallScore);

    if (overallScore >= 90) {
      log('\n🎉 Excellent ! L\'application PWA est prête pour la production.', 'green');
      return true;
    } else if (overallScore >= 70) {
      log('\n⚠️  Bon score, mais des améliorations sont possibles.', 'yellow');
      return true;
    } else {
      log('\n❌ Score insuffisant, des améliorations sont nécessaires.', 'red');
      return false;
    }

  } catch (error) {
    log(`❌ Erreur lors de la validation: ${error.message}`, 'red');
    return false;
  }
}

// Exécution si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  runLighthouse().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { runLighthouse };
