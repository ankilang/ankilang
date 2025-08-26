#!/usr/bin/env node

/**
 * Script de test PWA pour Ankilang
 * Valide les fonctionnalités PWA essentielles
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DIST_DIR = join(__dirname, '../dist');
const PUBLIC_DIR = join(__dirname, '../public');

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

function logTest(testName, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const color = passed ? 'green' : 'red';
  log(`${status} ${testName}`, color);
  if (details) {
    log(`   ${details}`, 'blue');
  }
}

// Tests PWA
const tests = {
  // Test du manifest
  testManifest() {
    const manifestPath = join(DIST_DIR, 'manifest.webmanifest');
    if (!existsSync(manifestPath)) {
      return { passed: false, details: 'Manifest non trouvé' };
    }

    try {
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
      
      // Vérifications essentielles
      const requiredFields = ['name', 'short_name', 'start_url', 'display', 'theme_color'];
      const missingFields = requiredFields.filter(field => !manifest[field]);
      
      if (missingFields.length > 0) {
        return { passed: false, details: `Champs manquants: ${missingFields.join(', ')}` };
      }

      // Vérifier les icônes
      if (!manifest.icons || manifest.icons.length === 0) {
        return { passed: false, details: 'Aucune icône trouvée' };
      }

      // Vérifier les icônes maskable
      const maskableIcons = manifest.icons.filter(icon => 
        icon.purpose && icon.purpose.includes('maskable')
      );
      
      if (maskableIcons.length === 0) {
        return { passed: false, details: 'Aucune icône maskable trouvée' };
      }

      return { passed: true, details: `Manifest valide avec ${manifest.icons.length} icônes` };
    } catch (error) {
      return { passed: false, details: `Erreur JSON: ${error.message}` };
    }
  },

  // Test du service worker
  testServiceWorker() {
    const swPath = join(DIST_DIR, 'sw.js');
    if (!existsSync(swPath)) {
      return { passed: false, details: 'Service worker non trouvé' };
    }

    const swContent = readFileSync(swPath, 'utf8');
    
    // Vérifications basiques
    const checks = [
      { name: 'Workbox', test: swContent.includes('workbox') },
      { name: 'Cache', test: swContent.includes('cache') },
      { name: 'Navigation', test: swContent.includes('NavigationRoute') }
    ];

    const failedChecks = checks.filter(check => !check.test);
    if (failedChecks.length > 0) {
      return { passed: false, details: `Éléments manquants: ${failedChecks.map(c => c.name).join(', ')}` };
    }

    return { passed: true, details: 'Service worker Workbox généré' };
  },

  // Test des icônes
  testIcons() {
    const requiredIcons = [
      'icon-192.png',
      'icon-512.png',
      'icon-maskable-192.png',
      'icon-maskable-512.png'
    ];

    const missingIcons = requiredIcons.filter(icon => 
      !existsSync(join(DIST_DIR, icon))
    );

    if (missingIcons.length > 0) {
      return { passed: false, details: `Icônes manquantes: ${missingIcons.join(', ')}` };
    }

    return { passed: true, details: `Toutes les icônes présentes (${requiredIcons.length})` };
  },

  // Test du HTML
  testHTML() {
    const htmlPath = join(DIST_DIR, 'index.html');
    if (!existsSync(htmlPath)) {
      return { passed: false, details: 'index.html non trouvé' };
    }

    const htmlContent = readFileSync(htmlPath, 'utf8');
    
    const checks = [
      { name: 'Manifest link', test: htmlContent.includes('manifest.webmanifest') },
      { name: 'Viewport fit', test: htmlContent.includes('viewport-fit=cover') },
      { name: 'Apple meta', test: htmlContent.includes('apple-mobile-web-app-capable') },
      { name: 'Theme color', test: htmlContent.includes('theme-color') }
    ];

    const failedChecks = checks.filter(check => !check.test);
    if (failedChecks.length > 0) {
      return { passed: false, details: `Éléments manquants: ${failedChecks.map(c => c.name).join(', ')}` };
    }

    return { passed: true, details: 'HTML PWA optimisé' };
  },

  // Test des assets
  testAssets() {
    const requiredAssets = [
      'ankilang-logo.svg',
      'favicon.ico'
    ];

    const missingAssets = requiredAssets.filter(asset => 
      !existsSync(join(DIST_DIR, asset))
    );

    if (missingAssets.length > 0) {
      return { passed: false, details: `Assets manquants: ${missingAssets.join(', ')}` };
    }

    return { passed: true, details: 'Assets essentiels présents' };
  },

  // Test de la taille du build
  testBuildSize() {
    const swPath = join(DIST_DIR, 'sw.js');
    if (!existsSync(swPath)) {
      return { passed: false, details: 'Service worker non trouvé' };
    }

    const stats = readFileSync(swPath).length;
    const sizeKB = Math.round(stats / 1024);
    
    if (sizeKB > 50) {
      return { passed: false, details: `Service worker trop volumineux: ${sizeKB}KB` };
    }

    return { passed: true, details: `Service worker optimisé: ${sizeKB}KB` };
  }
};

// Exécution des tests
async function runTests() {
  log('🧪 Tests PWA Ankilang', 'bold');
  log('=====================\n');

  const results = [];
  
  for (const [testName, testFn] of Object.entries(tests)) {
    try {
      const result = testFn();
      results.push({ name: testName, ...result });
      logTest(testName, result.passed, result.details);
    } catch (error) {
      results.push({ name: testName, passed: false, details: error.message });
      logTest(testName, false, error.message);
    }
  }

  // Résumé
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  log('\n📊 Résumé', 'bold');
  log('==========');
  log(`${passed}/${total} tests réussis`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('\n🎉 Tous les tests PWA sont passés !', 'green');
    log('L\'application est prête pour le déploiement.', 'green');
  } else {
    log('\n⚠️  Certains tests ont échoué.', 'yellow');
    log('Vérifiez les erreurs ci-dessus avant le déploiement.', 'yellow');
  }

  return passed === total;
}

// Exécution si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { runTests };
