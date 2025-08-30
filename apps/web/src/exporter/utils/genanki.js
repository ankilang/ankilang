// Adaptation de GenAnki-JS pour AnkiLang Exporter
// Basé sur https://github.com/krmanik/genanki-js

const MODEL_STD = 0;
const MODEL_CLOZE = 1;

// Configuration par défaut pour les modèles
const defaultModel = {
  type: MODEL_STD,
  css: `
    .card {
      font-family: arial;
      font-size: 20px;
      text-align: center;
      color: black;
      background-color: white;
    }
    .cloze {
      font-weight: bold;
      color: blue;
    }
    .current-cloze {
      color: blue;
      font-weight: bold;
    }
    .other-cloze {
      color: grey;
    }
  `,
  mod: new Date().getTime(),
};

const defaultField = {
  name: "",
  ord: 0,
  sticky: false,
  rtl: false,
  font: "Arial",
  size: 12,
};

const defaultTemplate = {
  name: "",
  ord: 0,
  qfmt: "",
  afmt: "",
  bqfmt: "",
  bafmt: "",
};

// Classe pour créer des modèles de cartes
export class Model {
  constructor(props) {
    this.props = {
      ...defaultModel,
      ...props,
      flds: props.flds.map((f, i) => ({ ...defaultField, ord: i, ...f })),
      tmpls: props.tmpls.map((t, i) => ({ ...defaultTemplate, ord: i, name: `Card ${i + 1}`, ...t })),
      mod: new Date().getTime(),
    };
    this.fieldNameToOrd = {};
    this.props.flds.forEach(f => { this.fieldNameToOrd[f.name] = f.ord; });
  }

  note(fields, tags = null, guid = null) {
    if (Array.isArray(fields)) {
      if (fields.length !== this.props.flds.length) {
        throw new Error(`Expected ${this.props.flds.length} fields for model '${this.props.name}' but got ${fields.length}`);
      }
      return new Note(this, fields, tags, guid);
    } else {
      const field_names = Object.keys(fields);
      const fields_list = [];
      field_names.forEach(field_name => {
        const ord = this.fieldNameToOrd[field_name];
        if (ord == null) throw new Error(`Field '${field_name}' does not exist in the model`);
        fields_list[ord] = fields[field_name];
      });
      return new Note(this, fields_list, tags, guid);
    }
  }
}

// Classe pour les modèles de clozes flexibles
export class FlexibleClozeModel extends Model {
  constructor(props) {
    const clozeOptions = props.clozeOptions || {};
    
    super({
      type: MODEL_STD, // On utilise MODEL_STD car on gère les clozes nous-mêmes
      css: `
        .card {
          font-family: arial;
          font-size: 20px;
          text-align: center;
          color: black;
          background-color: white;
        }
        .cloze {
          font-weight: bold;
          color: blue;
        }
        .current-cloze {
          color: blue;
          font-weight: bold;
        }
        .other-cloze {
          color: grey;
        }
        #cloze {
          visibility: hidden;
        }
        #cloze.show {
          visibility: visible;
        }
      `,
      tmpls: this.createClozeTemplates(props, clozeOptions),
      ...props,
    });
  }

  createClozeTemplates(props, clozeOptions) {
    const templates = [];
    
    // Template pour les cartes de reconnaissance (Expression → Meaning)
    templates.push({
      name: "Reconnaissance",
      qfmt: `
        <div id="cloze" data-card="{{Card}}" 
             data-cloze-show-before="${clozeOptions.showBefore || 'all'}" 
             data-cloze-show-after="${clozeOptions.showAfter || 'all'}"
             data-cloze-replace-char="${clozeOptions.replaceChar || '.'}"
             data-cloze-replace-same-length="${clozeOptions.replaceSameLength || false}"
             data-cloze-always-show-blanks="${clozeOptions.alwaysShowBlanks || false}">
          {{Expression}}
        </div>
        <script defer type="text/javascript" src="cloze_anything.js"></script>
      `,
      afmt: `
        {{FrontSide}}
        <hr id="answer">
        <div id="cloze" data-card="{{Card}}" 
             data-cloze-show-before="${clozeOptions.showBefore || 'all'}" 
             data-cloze-show-after="${clozeOptions.showAfter || 'all'}">
          {{Expression}}
        </div>
        {{Meaning}}
        {{#Notes}}<br><br><i>{{Notes}}</i>{{/Notes}}
        <script defer type="text/javascript" src="cloze_anything.js"></script>
      `,
    });

    // Template pour les cartes de production (Meaning → Expression)
    if (props.includeReversed !== false) {
      templates.push({
        name: "Production",
        qfmt: "{{Meaning}}",
        afmt: `
          {{FrontSide}}
          <hr id="answer">
          {{Expression}}
          {{#Notes}}<br><br><i>{{Notes}}</i>{{/Notes}}
        `,
      });
    }

    return templates;
  }
}

// Classe pour les notes
export class Note {
  constructor(model, fields, tags = null, guid = null) {
    this.model = model;
    this.fields = fields;
    this.tags = tags;
    this._guid = guid;
  }

  get guid() {
    return this._guid ? this._guid : this.generateGuid();
  }

  generateGuid() {
    // Génération d'un GUID simple basé sur le contenu
    const content = this.fields.join('|');
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  get cards() {
    if (this.model.props.type === MODEL_STD) {
      const isEmpty = f => {
        return !f || f.toString().trim().length === 0;
      };
      const rv = [];
      for (const [card_ord, any_or_all, required_field_ords] of this.model.props.req) {
        const op = any_or_all === "any" ? "some" : "every";
        if (required_field_ords[op](f => !isEmpty(this.fields[f]))) {
          rv.push(card_ord);
        }
      }
      return rv;
    } else {
      // Logique pour les clozes natives d'Anki (non utilisée ici)
      return [0];
    }
  }
}

// Classe pour les decks
export class Deck {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.notes = [];
  }

  addNote(note) {
    this.notes.push(note);
  }

  addNotes(notes) {
    notes.forEach(note => this.addNote(note));
  }
}

// Classe pour les paquets Anki
export class Package {
  constructor() {
    this.decks = [];
    this.mediaFiles = [];
  }

  addDeck(deck) {
    this.decks.push(deck);
  }

  addMediaFile(filename, data) {
    this.mediaFiles.push({ filename, data });
  }

  async writeToFile(filename) {
    // Structure Anki .apkg compatible
    // Un fichier .apkg Anki contient :
    // - collection.anki2 (base SQLite avec tous les decks/notes/cartes)
    // - media (fichier JSON avec index des médias)
    // - fichiers médias (images, audio, etc.)
    
    console.log('📦 Création du package .apkg Anki...');
    
    const { default: JSZip } = await import('jszip')
    const zip = new JSZip()
    
    // Vérifier que collection.anki2 est présent (obligatoire pour Anki)
    const hasCollection = this.mediaFiles.some(mf => mf.filename === 'collection.anki2')
    if (!hasCollection) {
      throw new Error('collection.anki2 manquant. Le fichier .apkg ne sera pas importable dans Anki.')
    }
    
    // Ajouter tous les fichiers médias
    const mediaIndex = {}
    const numericFiles = new Set()
    let mediaCounter = 0
    
    for (const mf of this.mediaFiles) {
      if (mf.filename === 'collection.anki2') {
        console.log('📄 Ajout de collection.anki2...');
        zip.file('collection.anki2', mf.data)
      } else {
        const indexName = String(mediaCounter)
        console.log(`📁 Ajout du média: ${mf.filename} → index ${indexName}`);
        mediaIndex[indexName] = mf.filename
        zip.file(indexName, mf.data)
        numericFiles.add(indexName)
        mediaCounter++
      }
    }
    
    // Créer le fichier media (index des médias pour Anki)
    console.log('📋 Création du fichier media...');
    zip.file('media', JSON.stringify(mediaIndex))

    // Validation interne: s'assurer que chaque index du manifest a bien un fichier numéroté dans le zip
    const missing = Object.keys(mediaIndex).filter(k => !numericFiles.has(k))
    if (missing.length) {
      console.error('❌ Incohérence media: index manquants dans le package', missing)
      throw new Error(`Incohérence media: index manquants dans l'archive: ${missing.join(', ')}`)
    }
    
    // Ajouter un fichier media vide si aucun média n'est présent (requis par Anki)
    if (Object.keys(mediaIndex).length === 0) {
      console.log('📋 Ajout d\'un fichier media vide (requis par Anki)');
    }
    
    // Ajouter les fichiers requis par Anki 2.1
    console.log('📋 Ajout des fichiers requis par Anki...');
    
    // Fichier de version (requis par Anki)
    zip.file('version', '2.1')
    
    // Fichier de configuration globale (requis par Anki)
    const globalConfig = {
      version: 2.1,
      created: Math.floor(Date.now() / 1000),
      modified: Math.floor(Date.now() / 1000),
      schema: 11
    }
    zip.file('config.json', JSON.stringify(globalConfig))
    
    // Générer le blob et télécharger
    console.log('💾 Génération du fichier .apkg...');
    const blob = await zip.generateAsync({ type: 'blob' })
    
    const a = document.createElement('a')
    const url = URL.createObjectURL(blob)
    a.href = url
    a.download = filename.endsWith('.apkg') ? filename : `${filename}.apkg`
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 0)
    
    console.log('✅ Package .apkg généré avec succès !');
    console.log(`📊 Statistiques: ${this.decks.length} deck(s), ${this.mediaFiles.length} fichier(s) média`);
  }
}

// Fonction utilitaire pour créer un ID unique
export function generateId() {
  return Math.floor(Math.random() * 1000000000000);
}
