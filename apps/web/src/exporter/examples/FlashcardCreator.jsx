import React, { useState } from 'react';
import { useAnkiLang } from '../src/hooks/useAnkiLang.js';

/**
 * Composant React pour créer des flashcards avec AnkiLang
 * Intégration client-side complète
 */
export function FlashcardCreator() {
  const {
    isReady,
    isLoading,
    error,
    createBasicCards,
    createClozeCards,
    generateBasicDeck,
    generateClozeDeck,
    validateCards
  } = useAnkiLang();

  const [deckName, setDeckName] = useState('Mon Deck');
  const [basicCards, setBasicCards] = useState([]);
  const [clozeCards, setClozeCards] = useState([]);
  const [generationStatus, setGenerationStatus] = useState('');

  // Ajouter une flashcard simple
  const addBasicCard = () => {
    const newCard = {
      front: '',
      back: '',
      media: {
        audio: '',
        image: ''
      },
      tags: [],
      notes: ''
    };
    setBasicCards([...basicCards, newCard]);
  };

  // Ajouter une flashcard cloze
  const addClozeCard = () => {
    const newCard = {
      text: '',
      clozeText: '',
      media: {
        audio: '',
        image: ''
      },
      tags: [],
      notes: ''
    };
    setClozeCards([...clozeCards, newCard]);
  };

  // Mettre à jour une flashcard basique
  const updateBasicCard = (index, field, value) => {
    const updatedCards = [...basicCards];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updatedCards[index][parent][child] = value;
    } else {
      updatedCards[index][field] = value;
    }
    setBasicCards(updatedCards);
  };

  // Mettre à jour une flashcard cloze
  const updateClozeCard = (index, field, value) => {
    const updatedCards = [...clozeCards];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updatedCards[index][parent][child] = value;
    } else {
      updatedCards[index][field] = value;
    }
    setClozeCards(updatedCards);
  };

  // Supprimer une carte
  const removeCard = (type, index) => {
    if (type === 'basic') {
      setBasicCards(basicCards.filter((_, i) => i !== index));
    } else {
      setClozeCards(clozeCards.filter((_, i) => i !== index));
    }
  };

  // Valider les cartes
  const validateAllCards = () => {
    const basicValidation = validateCards(basicCards, 'basic');
    const clozeValidation = validateCards(clozeCards, 'cloze');
    
    const basicErrors = basicValidation.filter(v => !v.valid);
    const clozeErrors = clozeValidation.filter(v => !v.valid);
    
    if (basicErrors.length > 0 || clozeErrors.length > 0) {
      setGenerationStatus('Erreurs de validation détectées');
      return false;
    }
    
    return true;
  };

  // Générer et télécharger le deck
  const generateDeck = async () => {
    if (!validateAllCards()) return;

    try {
      setGenerationStatus('Génération en cours...');
      
      const validBasicCards = basicCards.filter(card => card.front && card.back);
      const validClozeCards = clozeCards.filter(card => card.text && card.clozeText);

      let result;

      if (validBasicCards.length > 0 && validClozeCards.length === 0) {
        // Deck basique uniquement
        result = await generateBasicDeck(deckName, validBasicCards, `${deckName}.apkg`);
        setGenerationStatus(`✅ Deck basique généré avec ${result.stats.totalCards} cartes`);
      } else if (validClozeCards.length > 0 && validBasicCards.length === 0) {
        // Deck cloze uniquement
        result = await generateClozeDeck(deckName, validClozeCards, `${deckName}.apkg`);
        setGenerationStatus(`✅ Deck cloze généré avec ${result.stats.totalCards} cartes`);
      } else if (validBasicCards.length > 0 && validClozeCards.length > 0) {
        // Deck mixte
        const basicResult = await generateBasicDeck(`${deckName} - Basique`, validBasicCards, `${deckName}-basique.apkg`);
        const clozeResult = await generateClozeDeck(`${deckName} - Cloze`, validClozeCards, `${deckName}-cloze.apkg`);
        result = { basic: basicResult, cloze: clozeResult };
        setGenerationStatus(`✅ Decks générés: ${basicResult.stats.totalCards} basiques + ${clozeResult.stats.totalCards} clozes`);
      } else {
        setGenerationStatus('❌ Aucune carte valide à générer');
        return;
      }

      console.log('Résultat de génération:', result);
      
    } catch (error) {
      setGenerationStatus(`❌ Erreur: ${error.message}`);
      console.error('Erreur de génération:', error);
    }
  };

  // États de chargement et d'erreur
  if (isLoading) {
    return <div className="loading">Chargement d'AnkiLang...</div>;
  }

  if (error) {
    return <div className="error">Erreur: {error}</div>;
  }

  if (!isReady) {
    return <div className="error">AnkiLang n'est pas prêt</div>;
  }

  return (
    <div className="flashcard-creator">
      <h1>Créateur de Flashcards Anki</h1>
      
      {/* Configuration du deck */}
      <div className="deck-config">
        <label>
          Nom du deck:
          <input
            type="text"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            placeholder="Mon Deck"
          />
        </label>
      </div>

      {/* Flashcards simples */}
      <div className="section">
        <h2>Flashcards simples (recto/verso)</h2>
        <button onClick={addBasicCard} className="add-button">
          + Ajouter une carte basique
        </button>
        
        {basicCards.map((card, index) => (
          <div key={`basic-${index}`} className="card-editor">
            <div className="card-header">
              <h3>Carte {index + 1}</h3>
              <button onClick={() => removeCard('basic', index)} className="remove-button">
                Supprimer
              </button>
            </div>
            
            <div className="card-fields">
              <label>
                Recto:
                <input
                  type="text"
                  value={card.front}
                  onChange={(e) => updateBasicCard(index, 'front', e.target.value)}
                  placeholder="Question ou mot à apprendre"
                />
              </label>
              
              <label>
                Verso:
                <input
                  type="text"
                  value={card.back}
                  onChange={(e) => updateBasicCard(index, 'back', e.target.value)}
                  placeholder="Réponse ou traduction"
                />
              </label>
              
              <label>
                Audio (optionnel):
                <input
                  type="text"
                  value={card.media.audio}
                  onChange={(e) => updateBasicCard(index, 'media.audio', e.target.value)}
                  placeholder="chemin/vers/audio.mp3"
                />
              </label>
              
              <label>
                Image (optionnel):
                <input
                  type="text"
                  value={card.media.image}
                  onChange={(e) => updateBasicCard(index, 'media.image', e.target.value)}
                  placeholder="chemin/vers/image.jpg"
                />
              </label>
              
              <label>
                Tags (séparés par des virgules):
                <input
                  type="text"
                  value={card.tags.join(', ')}
                  onChange={(e) => updateBasicCard(index, 'tags', e.target.value.split(',').map(t => t.trim()))}
                  placeholder="tag1, tag2, tag3"
                />
              </label>
              
              <label>
                Notes (optionnel):
                <textarea
                  value={card.notes}
                  onChange={(e) => updateBasicCard(index, 'notes', e.target.value)}
                  placeholder="Notes additionnelles"
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Flashcards cloze */}
      <div className="section">
        <h2>Flashcards cloze (texte à trous)</h2>
        <button onClick={addClozeCard} className="add-button">
          + Ajouter une carte cloze
        </button>
        
        {clozeCards.map((card, index) => (
          <div key={`cloze-${index}`} className="card-editor">
            <div className="card-header">
              <h3>Carte cloze {index + 1}</h3>
              <button onClick={() => removeCard('cloze', index)} className="remove-button">
                Supprimer
              </button>
            </div>
            
            <div className="card-fields">
              <label>
                Texte complet:
                <input
                  type="text"
                  value={card.text}
                  onChange={(e) => updateClozeCard(index, 'text', e.target.value)}
                  placeholder="Le chat mange la souris"
                />
              </label>
              
              <label>
                Texte avec clozes:
                <input
                  type="text"
                  value={card.clozeText}
                  onChange={(e) => updateClozeCard(index, 'clozeText', e.target.value)}
                  placeholder="Le ((c1::chat)) mange la ((c2::souris))"
                />
              </label>
              
              <div className="cloze-help">
                <strong>Aide format cloze:</strong>
                <ul>
                  <li><code>((c1::mot))</code> - Remplace "mot" par des espaces</li>
                  <li><code>((c1::mot::indice))</code> - Avec indice</li>
                  <li><code>((c1::mot)) ((c2::autre))</code> - Plusieurs clozes</li>
                </ul>
              </div>
              
              <label>
                Audio (optionnel):
                <input
                  type="text"
                  value={card.media.audio}
                  onChange={(e) => updateClozeCard(index, 'media.audio', e.target.value)}
                  placeholder="chemin/vers/audio.mp3"
                />
              </label>
              
              <label>
                Image (optionnel):
                <input
                  type="text"
                  value={card.media.image}
                  onChange={(e) => updateClozeCard(index, 'media.image', e.target.value)}
                  placeholder="chemin/vers/image.jpg"
                />
              </label>
              
              <label>
                Tags (séparés par des virgules):
                <input
                  type="text"
                  value={card.tags.join(', ')}
                  onChange={(e) => updateClozeCard(index, 'tags', e.target.value.split(',').map(t => t.trim()))}
                  placeholder="cloze, français"
                />
              </label>
              
              <label>
                Notes (optionnel):
                <textarea
                  value={card.notes}
                  onChange={(e) => updateClozeCard(index, 'notes', e.target.value)}
                  placeholder="Notes additionnelles"
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Génération */}
      <div className="generation-section">
        <button 
          onClick={generateDeck}
          disabled={basicCards.length === 0 && clozeCards.length === 0}
          className="generate-button"
        >
          Générer deck Anki
        </button>
        
        {generationStatus && (
          <div className={`status ${generationStatus.includes('✅') ? 'success' : 'error'}`}>
            {generationStatus}
          </div>
        )}
      </div>

      {/* Styles CSS intégrés */}
      <style jsx>{`
        .flashcard-creator {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .deck-config {
          margin-bottom: 30px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 8px;
        }
        
        .deck-config label {
          display: block;
          margin-bottom: 10px;
          font-weight: 500;
        }
        
        .deck-config input {
          width: 100%;
          padding: 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          margin-top: 5px;
        }
        
        .section {
          margin-bottom: 40px;
        }
        
        .section h2 {
          color: #1f2937;
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 10px;
        }
        
        .add-button {
          background: #10b981;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          margin-bottom: 20px;
        }
        
        .add-button:hover {
          background: #059669;
        }
        
        .card-editor {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          background: white;
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .card-header h3 {
          margin: 0;
          color: #374151;
        }
        
        .remove-button {
          background: #ef4444;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .remove-button:hover {
          background: #dc2626;
        }
        
        .card-fields label {
          display: block;
          margin-bottom: 15px;
          font-weight: 500;
        }
        
        .card-fields input,
        .card-fields textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          margin-top: 5px;
        }
        
        .card-fields textarea {
          height: 80px;
          resize: vertical;
        }
        
        .cloze-help {
          background: #f3f4f6;
          padding: 15px;
          border-radius: 6px;
          margin: 15px 0;
        }
        
        .cloze-help ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        
        .cloze-help code {
          background: #e5e7eb;
          padding: 2px 4px;
          border-radius: 3px;
          font-family: monospace;
        }
        
        .generation-section {
          text-align: center;
          margin-top: 40px;
          padding: 30px;
          background: #f8fafc;
          border-radius: 8px;
        }
        
        .generate-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
        }
        
        .generate-button:hover:not(:disabled) {
          background: #2563eb;
        }
        
        .generate-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        
        .status {
          margin-top: 15px;
          padding: 10px;
          border-radius: 6px;
          font-weight: 500;
        }
        
        .status.success {
          background: #d1fae5;
          color: #065f46;
        }
        
        .status.error {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .loading {
          text-align: center;
          padding: 40px;
          color: #6b7280;
        }
        
        .error {
          text-align: center;
          padding: 40px;
          color: #dc2626;
          background: #fee2e2;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
