import React, { useState } from 'react';
import { useAnkiLang } from '../exporter/hooks/useAnkiLang.js';

/**
 * Composant d'export Anki pour créer des decks de flashcards
 * @returns {JSX.Element} Le composant d'export Anki
 */

export function AnkiExporter() {
  const { isReady, isLoading, error, generateBasicDeck } = useAnkiLang();
  const [cards, setCards] = useState([]);
  const [deckName, setDeckName] = useState('Mon Deck');

  const addCard = () => {
    setCards([...cards, {
      front: '',
      back: '',
      tags: [],
      notes: ''
    }]);
  };

  const updateCard = (index, field, value) => {
    const updated = [...cards];
    updated[index][field] = value;
    setCards(updated);
  };

  const removeCard = (index) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const exportDeck = async () => {
    const validCards = cards.filter(card => card.front && card.back);
    if (validCards.length === 0) {
      alert('Ajoutez au moins une carte valide');
      return;
    }

    try {
      await generateBasicDeck(deckName, validCards, `${deckName}.apkg`);
      alert('Deck exporté avec succès !');
    } catch (error) {
      console.error('Erreur d\'export:', error);
      alert('Erreur lors de l\'export: ' + error.message);
    }
  };

  if (isLoading) return <div>Chargement d'AnkiLang...</div>;
  if (error) return <div>Erreur: {error}</div>;
  if (!isReady) return <div>AnkiLang n'est pas prêt</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>Exportateur Anki</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label>
          Nom du deck:
          <input
            type="text"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </label>
      </div>
      
      <button 
        onClick={addCard}
        style={{ 
          background: '#4CAF50', 
          color: 'white', 
          padding: '10px 20px', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        + Ajouter une carte
      </button>
      
      {cards.map((card, index) => (
        <div key={index} style={{ 
          border: '1px solid #ddd', 
          padding: '15px', 
          marginBottom: '10px', 
          borderRadius: '4px' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <strong>Carte {index + 1}</strong>
            <button 
              onClick={() => removeCard(index)}
              style={{ 
                background: '#f44336', 
                color: 'white', 
                border: 'none', 
                padding: '5px 10px', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Supprimer
            </button>
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <input
              value={card.front}
              onChange={(e) => updateCard(index, 'front', e.target.value)}
              placeholder="Recto (question)"
              style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
            />
            <input
              value={card.back}
              onChange={(e) => updateCard(index, 'back', e.target.value)}
              placeholder="Verso (réponse)"
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
        </div>
      ))}
      
      <button 
        onClick={exportDeck} 
        disabled={cards.length === 0}
        style={{ 
          background: '#2196F3', 
          color: 'white', 
          padding: '15px 30px', 
          border: 'none', 
          borderRadius: '4px',
          cursor: cards.length === 0 ? 'not-allowed' : 'pointer',
          opacity: cards.length === 0 ? 0.6 : 1
        }}
      >
        Exporter vers Anki ({cards.length} cartes)
      </button>
    </div>
  );
}

