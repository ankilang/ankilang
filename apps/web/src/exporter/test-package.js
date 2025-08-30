// Test pour vérifier la structure du package .apkg
import { ankiLangExporter } from './index.js';

async function testPackageStructure() {
  console.log('🧪 Test de structure du package .apkg...');
  
  try {
    // Initialiser l'exportateur
    await ankiLangExporter.init();
    
    // Créer des cartes de test
    const testCards = [
      {
        front: 'Test Question',
        back: 'Test Answer',
        tags: ['test'],
        notes: 'Test note'
      }
    ];
    
    // Générer un deck de test
    const result = await ankiLangExporter.generateBasicDeck('Test Deck', testCards, 'test-deck.apkg');
    
    console.log('✅ Test réussi !', result);
    return true;
  } catch (error) {
    console.error('❌ Erreur de test:', error);
    return false;
  }
}

// Exporter pour utilisation dans la console
window.testPackageStructure = testPackageStructure;
