// Test simple pour vérifier le chargement de SQL.js
import { AnkiGenerator } from './core/anki-generator.js';

async function testSQLJs() {
  console.log('🧪 Test de chargement SQL.js...');
  
  try {
    const generator = new AnkiGenerator();
    await generator.initialize();
    console.log('✅ SQL.js chargé avec succès !');
    return true;
  } catch (error) {
    console.error('❌ Erreur de chargement SQL.js:', error);
    return false;
  }
}

// Exporter pour utilisation dans la console
window.testSQLJs = testSQLJs;
