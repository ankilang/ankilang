import { FlexibleClozeModel, Deck, Package, generateId } from '../utils/genanki.js';
import { getClozeNumbers, validateClozeExpression } from '../utils/cloze.js';
import { validateLanguageData, validateDeckConfig, createError } from './validators.js';

/**
 * Exportateur principal pour AnkiLang
 * Combine GenAnki-JS et les clozes flexibles d'Anki Cloze Anything
 */
export class AnkiLangExporter {
  constructor() {
    this.SQL = null;
    this.initialized = false;
  }

  /**
   * Initialise l'exportateur avec SQL.js
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Charger SQL.js
      if (typeof initSqlJs === 'undefined') {
        throw new Error('SQL.js n\'est pas chargé. Assurez-vous d\'inclure sql.js dans votre page.');
      }

      const config = {
        locateFile: filename => `/node_modules/sql.js/dist/${filename}`
      };

      this.SQL = await initSqlJs(config);
      this.initialized = true;
    } catch (error) {
      throw new Error(`Erreur d'initialisation : ${error.message}`);
    }
  }

  /**
   * Crée un deck avec des données linguistiques
   * @param {string} name - Nom du deck
   * @param {Array} entries - Entrées linguistiques
   * @param {Object} config - Configuration du deck
   * @returns {Object} - Deck créé
   */
  createDeck(name, entries, config = {}) {
    // Valider les données d'entrée
    const validationResults = entries.map(entry => validateLanguageData(entry));
    const invalidEntries = validationResults.filter(result => !result.success);
    
    if (invalidEntries.length > 0) {
      throw new Error(`Données invalides : ${invalidEntries.map(e => e.error.title).join(', ')}`);
    }

    // Valider la configuration
    const configValidation = validateDeckConfig(config);
    if (!configValidation.success) {
      throw new Error(`Configuration invalide : ${configValidation.error.title}`);
    }

    const validEntries = validationResults.map(result => result.data);
    const validConfig = configValidation.data;

    // Créer le modèle de cartes
    const model = this.createModel(validConfig);

    // Créer le deck
    const deck = new Deck(generateId(), name);

    // Ajouter les notes au deck
    validEntries.forEach(entry => {
      const notes = this.createNotesFromEntry(entry, model, validConfig);
      deck.addNotes(notes);
    });

    return {
      deck,
      model,
      config: validConfig,
      stats: {
        totalEntries: validEntries.length,
        totalNotes: deck.notes.length,
        clozeCount: this.countClozes(validEntries),
      }
    };
  }

  /**
   * Crée un modèle de cartes basé sur la configuration
   * @param {Object} config - Configuration du deck
   * @returns {Model} - Modèle de cartes
   */
  createModel(config) {
    const baseFields = [
      { name: "Expression" },
      { name: "Meaning" },
      { name: "Notes" },
      { name: "Tags" },
    ];

    // Ajouter les champs pour les clozes si nécessaire
    if (config.cardModel === 'cloze' || config.includeCloze) {
      baseFields.push({ name: "ClozeExpression" });
      // Ajouter les champs de contrôle pour les clozes
      for (let i = 1; i <= 10; i++) {
        baseFields.push({ name: `ClozeExpression${i}` });
      }
    }

    const modelProps = {
      name: "AnkiLang Flexible",
      flds: baseFields,
      req: [
        [0, "all", [0, 1]], // Card 1: Expression -> Meaning
        [1, "all", [1, 0]], // Card 2: Meaning -> Expression (si activé)
      ],
      clozeOptions: config.clozeOptions || {},
      includeReversed: config.includeReversed !== false,
    };

    return new FlexibleClozeModel(modelProps);
  }

  /**
   * Crée les notes pour une entrée linguistique
   * @param {Object} entry - Entrée linguistique
   * @param {Model} model - Modèle de cartes
   * @param {Object} config - Configuration
   * @returns {Array} - Notes créées
   */
  createNotesFromEntry(entry, model, config) {
    const notes = [];
    const tags = entry.tags ? entry.tags.join(' ') : '';

    // Note de base (Expression ↔ Meaning)
    const baseFields = [
      entry.expression,
      entry.meaning,
      entry.notes || '',
      tags,
    ];

    // Ajouter les champs de cloze si nécessaire
    if (config.cardModel === 'cloze' || config.includeCloze) {
      const clozeExpression = entry.clozeExpression || entry.expression;
      baseFields.push(clozeExpression);

      // Ajouter les champs de contrôle pour les clozes
      const clozeNumbers = getClozeNumbers(clozeExpression);
      for (let i = 1; i <= 10; i++) {
        baseFields.push(clozeNumbers.has(i) ? '1' : '');
      }
    }

    // Créer la note principale
    const mainNote = model.note(baseFields, tags);
    notes.push(mainNote);

    // Créer des notes supplémentaires pour les clozes si nécessaire
    if (config.cardModel === 'cloze' && entry.clozeExpression) {
      const clozeValidation = validateClozeExpression(entry.clozeExpression);
      if (clozeValidation.valid) {
        const clozeNotes = this.createClozeNotes(entry, model, clozeValidation.clozes);
        notes.push(...clozeNotes);
      }
    }

    return notes;
  }

  /**
   * Crée des notes spécifiques pour les clozes
   * @param {Object} entry - Entrée linguistique
   * @param {Model} model - Modèle de cartes
   * @param {Array} clozes - Clozes trouvées
   * @returns {Array} - Notes de cloze
   */
  createClozeNotes(entry, model, clozes) {
    const notes = [];
    const tags = entry.tags ? entry.tags.join(' ') : '';

    clozes.forEach(cloze => {
      const fields = [
        entry.expression,
        entry.meaning,
        entry.notes || '',
        tags,
        entry.clozeExpression,
      ];

      // Activer seulement cette cloze
      for (let i = 1; i <= 10; i++) {
        fields.push(i === cloze.number ? '1' : '');
      }

      const note = model.note(fields, tags);
      notes.push(note);
    });

    return notes;
  }

  /**
   * Compte le nombre total de clozes dans les entrées
   * @param {Array} entries - Entrées linguistiques
   * @returns {number} - Nombre total de clozes
   */
  countClozes(entries) {
    return entries.reduce((total, entry) => {
      if (entry.clozeExpression) {
        const numbers = getClozeNumbers(entry.clozeExpression);
        return total + numbers.size;
      }
      return total;
    }, 0);
  }

  /**
   * Exporte un deck vers un fichier Anki (.apkg)
   * @param {Object} deckData - Données du deck
   * @param {string} filename - Nom du fichier de sortie
   * @returns {Promise} - Promesse résolue quand l'export est terminé
   */
  async exportToAnki(deckData, filename) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const ankiPackage = new Package();
      ankiPackage.addDeck(deckData.deck);

      // Ajouter le script JavaScript pour les clozes flexibles
      const clozeScript = await this.getClozeScript();
      ankiPackage.addMediaFile('cloze_anything.js', clozeScript);

      // Exporter le fichier
      await ankiPackage.writeToFile(filename);

      return {
        success: true,
        filename,
        stats: deckData.stats,
      };
    } catch (error) {
      throw new Error(`Erreur d'export : ${error.message}`);
    }
  }

  /**
   * Récupère le script JavaScript pour les clozes flexibles
   * @returns {Promise<string>} - Contenu du script
   */
  async getClozeScript() {
    // Pour l'instant, on retourne un script simplifié
    // En production, on chargerait le vrai script depuis anki_cloze_anything
    return `
      // Script simplifié pour les clozes flexibles
      // Basé sur Anki Cloze Anything
      
      document.addEventListener('DOMContentLoaded', function() {
        const clozeElements = document.querySelectorAll('#cloze');
        
        clozeElements.forEach(function(element) {
          const card = element.getAttribute('data-card');
          const content = element.innerHTML;
          
          // Logique de rendu des clozes
          // TODO: Implémenter la logique complète
          console.log('Rendu de cloze pour:', card, content);
        });
      });
    `;
  }

  /**
   * Importe des données depuis un fichier CSV
   * @param {File} file - Fichier CSV
   * @returns {Promise<Array>} - Données importées
   */
  async importFromCSV(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const csv = event.target.result;
          const lines = csv.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          const entries = [];

          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
              const values = lines[i].split(',').map(v => v.trim());
              const entry = {};
              
              headers.forEach((header, index) => {
                if (values[index]) {
                  entry[header.toLowerCase()] = values[index];
                }
              });

              // Valider l'entrée
              const validation = validateLanguageData(entry);
              if (validation.success) {
                entries.push(validation.data);
              }
            }
          }

          resolve(entries);
        } catch (error) {
          reject(new Error(`Erreur d'import CSV : ${error.message}`));
        }
      };

      reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
      reader.readAsText(file);
    });
  }

  /**
   * Importe des données depuis un fichier JSON
   * @param {File} file - Fichier JSON
   * @returns {Promise<Array>} - Données importées
   */
  async importFromJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          const entries = Array.isArray(data) ? data : [data];
          
          const validatedEntries = entries.map(entry => {
            const validation = validateLanguageData(entry);
            if (!validation.success) {
              throw new Error(`Entrée invalide : ${validation.error.title}`);
            }
            return validation.data;
          });

          resolve(validatedEntries);
        } catch (error) {
          reject(new Error(`Erreur d'import JSON : ${error.message}`));
        }
      };

      reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
      reader.readAsText(file);
    });
  }
}
