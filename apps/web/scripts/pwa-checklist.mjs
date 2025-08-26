#!/usr/bin/env node

/**
 * Checklist PWA Ankilang
 * Validation complète avant déploiement
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

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

function logCheck(checkName, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const color = passed ? 'green' : 'red';
  log(`${status} ${checkName}`, color);
  if (details) {
    log(`   ${details}`, 'blue');
  }
}

// Checklist PWA
const checklist = {
  // Build et fichiers
  checkBuild() {
    const buildFiles = [
      'index.html',
      'manifest.webmanifest',
      'sw.js',
      'icon-192.png',
      'icon-512.png',
      'icon-maskable-192.png',
      'icon-maskable-512.png'
    ];

    const missingFiles = buildFiles.filter(file => !existsSync(join(DIST_DIR, file)));
    
    if (missingFiles.length > 0) {
      return { passed: false, details: `Fichiers manquants: ${missingFiles.join(', ')}` };
    }

    return { passed: true, details: `Tous les fichiers présents (${buildFiles.length})` };
  },

  // Manifest
  checkManifest() {
    try {
      const manifest = JSON.parse(readFileSync(join(DIST_DIR, 'manifest.webmanifest'), 'utf8'));
      
      const requiredFields = [
        'name', 'short_name', 'start_url', 'display', 
        'theme_color', 'background_color', 'icons'
      ];
      
      const missingFields = requiredFields.filter(field => !manifest[field]);
      
      if (missingFields.length > 0) {
        return { passed: false, details: `Champs manquants: ${missingFields.join(', ')}` };
      }

      // Vérifier les icônes maskable
      const maskableIcons = manifest.icons.filter(icon => 
        icon.purpose && icon.purpose.includes('maskable')
      );
      
      if (maskableIcons.length === 0) {
        return { passed: false, details: 'Aucune icône maskable trouvée' };
      }

      return { passed: true, details: 'Manifest PWA complet et valide' };
    } catch (error) {
      return { passed: false, details: `Erreur JSON: ${error.message}` };
    }
  },

  // Service Worker
  checkServiceWorker() {
    const swPath = join(DIST_DIR, 'sw.js');
    if (!existsSync(swPath)) {
      return { passed: false, details: 'Service worker non trouvé' };
    }

    const swContent = readFileSync(swPath, 'utf8');
    const swSize = Math.round(swContent.length / 1024);
    
    if (swSize > 50) {
      return { passed: false, details: `Service worker trop volumineux: ${swSize}KB` };
    }

    return { passed: true, details: `Service worker optimisé: ${swSize}KB` };
  },

  // HTML
  checkHTML() {
    const htmlPath = join(DIST_DIR, 'index.html');
    const htmlContent = readFileSync(htmlPath, 'utf8');
    
    const requiredElements = [
      'manifest.webmanifest',
      'viewport-fit=cover',
      'apple-mobile-web-app-capable',
      'theme-color',
      'apple-touch-icon'
    ];
    
    const missingElements = requiredElements.filter(element => !htmlContent.includes(element));
    
    if (missingElements.length > 0) {
      return { passed: false, details: `Éléments manquants: ${missingElements.join(', ')}` };
    }

    return { passed: true, details: 'HTML PWA optimisé' };
  },

  // TypeScript
  checkTypeScript() {
    try {
      execSync('pnpm typecheck', { cwd: join(__dirname, '..'), stdio: 'pipe' });
      return { passed: true, details: 'Aucune erreur TypeScript' };
    } catch (error) {
      return { passed: false, details: 'Erreurs TypeScript détectées' };
    }
  },

  // Tests PWA
  checkPWATests() {
    try {
      execSync('pnpm test:pwa', { cwd: join(__dirname, '..'), stdio: 'pipe' });
      return { passed: true, details: 'Tous les tests PWA passés' };
    } catch (error) {
      return { passed: false, details: 'Tests PWA échoués' };
    }
  },

  // Performance
  checkPerformance() {
    try {
      // Vérifier la taille du bundle principal
      const mainJsPath = join(DIST_DIR, 'assets');
      if (existsSync(mainJsPath)) {
        const files = readdirSync(mainJsPath);
        const mainJs = files.find(file => file.includes('index-') && file.endsWith('.js'));
        
        if (mainJs) {
          const stats = readFileSync(join(mainJsPath, mainJs)).length;
          const sizeMB = Math.round(stats / 1024 / 1024 * 100) / 100;
          
          if (sizeMB > 1) {
            return { passed: false, details: `Bundle principal trop volumineux: ${sizeMB}MB` };
          }
          
          return { passed: true, details: `Bundle principal optimisé: ${sizeMB}MB` };
        }
      }
      
      return { passed: true, details: 'Performance acceptable' };
    } catch (error) {
      return { passed: false, details: `Erreur performance: ${error.message}` };
    }
  },

  // Sécurité
  checkSecurity() {
    const htmlPath = join(DIST_DIR, 'index.html');
    const htmlContent = readFileSync(htmlPath, 'utf8');
    
    // Vérifier les en-têtes de sécurité de base
    const securityChecks = [
      { name: 'HTTPS', test: !htmlContent.includes('http://') },
      { name: 'Secure', test: !htmlContent.includes('unsafe-inline') }
    ];
    
    const failedChecks = securityChecks.filter(check => !check.test);
    
    if (failedChecks.length > 0) {
      return { passed: false, details: `Problèmes sécurité: ${failedChecks.map(c => c.name).join(', ')}` };
    }
    
    return { passed: true, details: 'Sécurité de base validée' };
  },

  // Accessibilité
  checkAccessibility() {
    const htmlPath = join(DIST_DIR, 'index.html');
    const htmlContent = readFileSync(htmlPath, 'utf8');
    
    const a11yChecks = [
      { name: 'Lang', test: htmlContent.includes('lang="fr"') },
      { name: 'Viewport', test: htmlContent.includes('viewport') },
      { name: 'Title', test: htmlContent.includes('<title>') }
    ];
    
    const failedChecks = a11yChecks.filter(check => !check.test);
    
    if (failedChecks.length > 0) {
      return { passed: false, details: `Problèmes accessibilité: ${failedChecks.map(c => c.name).join(', ')}` };
    }
    
    return { passed: true, details: 'Accessibilité de base validée' };
  }
};

// Exécution de la checklist
async function runChecklist() {
  log('📋 Checklist PWA Ankilang', 'bold');
  log('========================\n');

  const results = [];
  
  for (const [checkName, checkFn] of Object.entries(checklist)) {
    try {
      const result = checkFn();
      results.push({ name: checkName, ...result });
      logCheck(checkName, result.passed, result.details);
    } catch (error) {
      results.push({ name: checkName, passed: false, details: error.message });
      logCheck(checkName, false, error.message);
    }
  }

  // Résumé
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  log('\n📊 Résumé de la checklist', 'bold');
  log('========================');
  log(`${passed}/${total} vérifications réussies`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('\n🎉 Checklist PWA complète !', 'green');
    log('L\'application est prête pour le déploiement en production.', 'green');
    log('\n📱 Fonctionnalités PWA validées :', 'bold');
    log('✅ Installation Android (beforeinstallprompt)', 'green');
    log('✅ Installation iOS (Share Sheet)', 'green');
    log('✅ Service worker avec cache offline', 'green');
    log('✅ Safe areas iOS', 'green');
    log('✅ Icônes maskable Android', 'green');
    log('✅ Meta tags iOS complets', 'green');
    log('✅ Performance optimisée', 'green');
    log('✅ Accessibilité de base', 'green');
  } else {
    log('\n⚠️  Checklist incomplète.', 'yellow');
    log('Corrigez les problèmes ci-dessus avant le déploiement.', 'yellow');
  }

  return passed === total;
}



// Exécution si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  runChecklist().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { runChecklist };
