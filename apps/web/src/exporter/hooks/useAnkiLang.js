import { useState, useEffect, useCallback } from 'react';
import { AnkiGenerator } from '../core/anki-generator.js';
import { Flashcard, ClozeFlashcard } from '../core/flashcard.js';

/**
 * Hook React pour utiliser AnkiLang dans une webapp
 * Gère l'initialisation, l'état et les opérations de génération
 */
export function useAnkiLang() {
  const [generator, setGenerator] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialisation du générateur
  useEffect(() => {
    const initGenerator = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const ankiGenerator = new AnkiGenerator();
        await ankiGenerator.initialize();
        
        setGenerator(ankiGenerator);
        setIsReady(true);
      } catch (err) {
        setError(err.message);
        console.error('Erreur d\'initialisation AnkiLang:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initGenerator();
  }, []);

  // Créer des flashcards simples
  const createBasicCards = useCallback((cardsData) => {
    if (!generator) {
      throw new Error('AnkiLang n\'est pas encore initialisé');
    }
    return cardsData.map(card => generator.createFlashcard(card));
  }, [generator]);

  // Créer des flashcards cloze
  const createClozeCards = useCallback((cardsData) => {
    if (!generator) {
      throw new Error('AnkiLang n\'est pas encore initialisé');
    }
    return cardsData.map(card => generator.createClozeFlashcard(card));
  }, [generator]);

  // Générer un deck basique
  const generateBasicDeck = useCallback(async (name, cards, filename) => {
    if (!generator) {
      throw new Error('AnkiLang n\'est pas encore initialisé');
    }
    
    try {
      const flashcards = createBasicCards(cards);
      const deckData = generator.createBasicDeck(name, flashcards);
      return await generator.exportToAnki(deckData, filename);
    } catch (err) {
      throw new Error(`Erreur lors de la génération du deck basique: ${err.message}`);
    }
  }, [generator, createBasicCards]);

  // Générer un deck cloze
  const generateClozeDeck = useCallback(async (name, cards, filename) => {
    if (!generator) {
      throw new Error('AnkiLang n\'est pas encore initialisé');
    }
    
    try {
      const flashcards = createClozeCards(cards);
      const deckData = generator.createClozeDeck(name, flashcards);
      return await generator.exportToAnki(deckData, filename);
    } catch (err) {
      throw new Error(`Erreur lors de la génération du deck cloze: ${err.message}`);
    }
  }, [generator, createClozeCards]);

  // Générer un deck mixte (basique + cloze)
  const generateMixedDeck = useCallback(async (name, basicCards, clozeCards, filename) => {
    if (!generator) {
      throw new Error('AnkiLang n\'est pas encore initialisé');
    }
    
    try {
      const results = {};
      
      if (basicCards && basicCards.length > 0) {
        const basicFlashcards = createBasicCards(basicCards);
        const basicDeckData = generator.createBasicDeck(`${name} - Basique`, basicFlashcards);
        results.basic = await generator.exportToAnki(basicDeckData, `${filename}-basique.apkg`);
      }
      
      if (clozeCards && clozeCards.length > 0) {
        const clozeFlashcards = createClozeCards(clozeCards);
        const clozeDeckData = generator.createClozeDeck(`${name} - Cloze`, clozeFlashcards);
        results.cloze = await generator.exportToAnki(clozeDeckData, `${filename}-cloze.apkg`);
      }
      
      return results;
    } catch (err) {
      throw new Error(`Erreur lors de la génération du deck mixte: ${err.message}`);
    }
  }, [generator, createBasicCards, createClozeCards]);

  // Générer un deck combiné (un seul fichier, 2 modèles)
  const generateCombinedDeck = useCallback(async (name, basicCards, clozeCards, filename) => {
    if (!generator) {
      throw new Error('AnkiLang n\'est pas encore initialisé');
    }
    try {
      const basic = basicCards || []
      const cloze = clozeCards || []
      const deckData = generator.createCombinedDeck(name, basic, cloze)
      return await generator.exportToAnki(deckData, `${filename}.apkg`)
    } catch (err) {
      throw new Error(`Erreur lors de la génération du deck combiné: ${err.message}`)
    }
  }, [generator])

  // Valider des données de flashcards
  const validateCards = useCallback((cards, type = 'basic') => {
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
  }, []);

  return {
    // État
    isReady,
    isLoading,
    error,
    
    // Méthodes
    createBasicCards,
    createClozeCards,
    generateBasicDeck,
    generateClozeDeck,
    generateMixedDeck,
    generateCombinedDeck,
    validateCards,
    
    // Instance directe (pour usage avancé)
    generator,
  };
}
