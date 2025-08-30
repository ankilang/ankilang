# AnkiLang Exporter - Intégration

Ce projet ankilang a été étendu avec la fonctionnalité d'export vers Anki.

## Structure

```
src/
├── exporter/              # Module d'export Anki
│   ├── core/             # Classes principales
│   │   ├── flashcard.js
│   │   ├── anki-generator.js
│   │   └── validators.js
│   ├── utils/            # Utilitaires
│   │   ├── genanki.js
│   │   └── cloze.js
│   ├── hooks/            # Hook React
│   │   └── useAnkiLang.js
│   └── index.js          # Point d'entrée
├── components/
│   └── AnkiExporter.jsx  # Composant d'exemple
└── ...
```

## Utilisation

### Hook React

```jsx
import { useAnkiLang } from './src/exporter/hooks/useAnkiLang.js';

function MyComponent() {
  const { isReady, generateBasicDeck } = useAnkiLang();
  
  const cards = [
    { front: 'Bonjour', back: 'Hello', tags: ['français'] }
  ];
  
  const exportDeck = async () => {
    await generateBasicDeck('Mon Deck', cards, 'deck.apkg');
  };
  
  return <button onClick={exportDeck}>Exporter</button>;
}
```

### API directe

```jsx
import { ankiLangExporter } from './src/exporter/index.js';

const cards = [
  { front: 'Bonjour', back: 'Hello' }
];

await ankiLangExporter.generateBasicDeck('Mon Deck', cards, 'deck.apkg');
```

### Composant d'exemple

```jsx
import { AnkiExporter } from './src/components/AnkiExporter.jsx';

function App() {
  return (
    <div>
      <AnkiExporter />
    </div>
  );
}
```

## Dépendances ajoutées

- sql.js
- file-saver
- jszip
- zod

## Configuration

Les fichiers WASM de SQL.js ont été copiés dans `public/`.
