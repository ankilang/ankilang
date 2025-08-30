// Exemple d'utilisation d'AnkiLang dans React
import { ankiLang } from '../src/index.js';
import { useState, useEffect } from 'react';

// Exemple de composant React pour créer des flashcards
export function FlashcardCreator() {
  const [cards, setCards] = useState([]);
  const [deckName, setDeckName] = useState('Mon Deck');

  // Ajouter une flashcard simple
  const addBasicCard = () => {
    const newCard = {
      front: 'Question ?',
      back: 'Réponse',
      media: {
        audio: 'audio.mp3', // Optionnel
        image: 'image.jpg', // Optionnel
      },
      tags: ['tag1', 'tag2'],
      notes: 'Notes optionnelles',
    };
    setCards([...cards, newCard]);
  };

  // Ajouter une flashcard cloze
  const addClozeCard = () => {
    const newCard = {
      text: 'Le chat mange la souris',
      clozeText: 'Le ((c1::chat)) mange la ((c2::souris))',
      media: {
        audio: 'audio.mp3', // Optionnel
        image: 'image.jpg', // Optionnel
      },
      tags: ['cloze', 'français'],
      notes: 'Phrase avec deux mots à compléter',
    };
    setCards([...cards, newCard]);
  };

  // Générer et télécharger le deck
  const generateDeck = async () => {
    try {
      // Séparer les cartes basiques et cloze
      const basicCards = cards.filter(card => card.front && card.back);
      const clozeCards = cards.filter(card => card.text && card.clozeText);

      let result;

      if (basicCards.length > 0 && clozeCards.length === 0) {
        // Deck basique uniquement
        result = await ankiLang.generateBasicDeck(
          deckName,
          basicCards,
          `${deckName}.apkg`
        );
      } else if (clozeCards.length > 0 && basicCards.length === 0) {
        // Deck cloze uniquement
        result = await ankiLang.generateClozeDeck(
          deckName,
          clozeCards,
          `${deckName}.apkg`
        );
      } else {
        // Deck mixte - créer deux decks séparés
        const basicResult = await ankiLang.generateBasicDeck(
          `${deckName} - Basique`,
          basicCards,
          `${deckName}-basique.apkg`
        );
        const clozeResult = await ankiLang.generateClozeDeck(
          `${deckName} - Cloze`,
          clozeCards,
          `${deckName}-cloze.apkg`
        );
        result = { basicResult, clozeResult };
      }

      console.log('Deck généré avec succès:', result);
      // Ici vous pouvez déclencher le téléchargement
      
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
    }
  };

  return (
    <div>
      <h1>Créateur de Flashcards Anki</h1>
      
      <div>
        <input
          type="text"
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
          placeholder="Nom du deck"
        />
      </div>

      <div>
        <button onClick={addBasicCard}>Ajouter carte basique</button>
        <button onClick={addClozeCard}>Ajouter carte cloze</button>
        <button onClick={generateDeck} disabled={cards.length === 0}>
          Générer deck ({cards.length} cartes)
        </button>
      </div>

      <div>
        {cards.map((card, index) => (
          <div key={index} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            {card.front ? (
              // Carte basique
              <div>
                <strong>Recto:</strong> {card.front}<br/>
                <strong>Verso:</strong> {card.back}<br/>
                {card.media.audio && <span>🎵 Audio: {card.media.audio}</span>}<br/>
                {card.media.image && <span>🖼️ Image: {card.media.image}</span>}<br/>
                {card.tags && <span>🏷️ Tags: {card.tags.join(', ')}</span>}
              </div>
            ) : (
              // Carte cloze
              <div>
                <strong>Texte:</strong> {card.text}<br/>
                <strong>Cloze:</strong> {card.clozeText}<br/>
                {card.media.audio && <span>🎵 Audio: {card.media.audio}</span>}<br/>
                {card.media.image && <span>🖼️ Image: {card.media.image}</span>}<br/>
                {card.tags && <span>🏷️ Tags: {card.tags.join(', ')}</span>}
              </div>
            )}
            <button onClick={() => setCards(cards.filter((_, i) => i !== index))}>
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Hook personnalisé pour utiliser AnkiLang
export function useAnkiLang() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAnkiLang = async () => {
      try {
        await ankiLang.init();
        setIsReady(true);
      } catch (err) {
        setError(err.message);
      }
    };

    initAnkiLang();
  }, []);

  return { isReady, error, ankiLang };
}

// Exemple d'utilisation avec upload de fichiers
export function FileUploadExample() {
  const { isReady, error } = useAnkiLang();
  const [uploadedCards, setUploadedCards] = useState([]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const cards = JSON.parse(text);
      
      // Valider et convertir les cartes
      const validCards = cards.map(card => {
        if (card.front && card.back) {
          return ankiLang.createBasicCards([card])[0];
        } else if (card.text && card.clozeText) {
          return ankiLang.createClozeCards([card])[0];
        }
        return null;
      }).filter(Boolean);

      setUploadedCards(validCards);
    } catch (err) {
      console.error('Erreur lors de l\'upload:', err);
    }
  };

  if (!isReady) {
    return <div>Chargement d'AnkiLang...</div>;
  }

  if (error) {
    return <div>Erreur: {error}</div>;
  }

  return (
    <div>
      <h2>Upload de fichiers</h2>
      <input type="file" accept=".json" onChange={handleFileUpload} />
      
      {uploadedCards.length > 0 && (
        <div>
          <h3>Cartes uploadées ({uploadedCards.length})</h3>
          <button onClick={() => {
            ankiLang.generateBasicDeck('Uploaded Deck', uploadedCards, 'uploaded.apkg');
          }}>
            Générer deck
          </button>
        </div>
      )}
    </div>
  );
}
