// Point d'entrée pour ankilang-exporter
export { AnkiGenerator } from './core/anki-generator.js';
export { Flashcard, ClozeFlashcard } from './core/flashcard.js';
export { useAnkiLang } from './hooks/useAnkiLang.js';

// API simplifiée pour utilisation directe
export class AnkiLangExporter {
  constructor() {
    this.generator = null;
  }

  async init() {
    if (!this.generator) {
      this.generator = new AnkiGenerator();
      await this.generator.initialize();
    }
  }

  createBasicCards(cards) {
    if (!this.generator) {
      throw new Error('AnkiLang n\'est pas encore initialisé. Appelez init() d\'abord.');
    }
    return cards.map(card => this.generator.createFlashcard(card));
  }

  createClozeCards(cards) {
    if (!this.generator) {
      throw new Error('AnkiLang n\'est pas encore initialisé. Appelez init() d\'abord.');
    }
    return cards.map(card => this.generator.createClozeFlashcard(card));
  }

  async generateBasicDeck(name, cards, filename) {
    await this.init();
    const flashcards = this.createBasicCards(cards);
    const deckData = this.generator.createBasicDeck(name, flashcards);
    return await this.generator.exportToAnki(deckData, filename);
  }

  async generateClozeDeck(name, cards, filename) {
    await this.init();
    const flashcards = this.createClozeCards(cards);
    const deckData = this.generator.createClozeDeck(name, flashcards);
    return await this.generator.exportToAnki(deckData, filename);
  }

  validateCards(cards, type = 'basic') {
    try {
      if (type === 'basic') {
        return cards.map(card => {
          const flashcard = new Flashcard(card);
          return { valid: true, card: flashcard };
        });
      } else if (type === 'cloze') {
        return cards.map(card => {
          const flashcard = new ClozeFlashcard(card);
          const validation = flashcard.validateClozes();
          return { valid: validation.valid, card: flashcard, validation };
        });
      }
    } catch (err) {
      return [{ valid: false, error: err.message }];
    }
  }
}

// Instance globale pour utilisation facile
export const ankiLangExporter = new AnkiLangExporter();

// Export par défaut
export default ankiLangExporter;
