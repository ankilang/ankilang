import { Model, Deck, Package, generateId } from '../utils/genanki.js';
import { Flashcard, ClozeFlashcard } from './flashcard.js';

/**
 * Générateur de decks Anki - API principale du microservice
 */
export class AnkiGenerator {
  constructor() {
    this.SQL = null;
    this.initialized = false;
  }

  /**
   * Initialise le générateur
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Vérifier si SQL.js est déjà disponible
      if (typeof initSqlJs === 'undefined') {
        console.log('SQL.js non détecté, chargement en cours...');
        
        // Charger dynamiquement le script SQL.js depuis /public
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = '/sql-wasm.js';
          script.async = true;
          script.onload = () => {
            console.log('SQL.js chargé avec succès');
            resolve();
          };
          script.onerror = () => {
            const error = new Error('Impossible de charger SQL.js depuis /sql-wasm.js');
            console.error('Erreur de chargement SQL.js:', error);
            reject(error);
          };
          document.head.appendChild(script);
        });
        
        // Attendre un peu pour s'assurer que initSqlJs est disponible
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Vérifier que initSqlJs est maintenant disponible
      if (typeof initSqlJs === 'undefined') {
        throw new Error('SQL.js n\'est pas disponible après chargement');
      }

      console.log('Initialisation de SQL.js...');
      const config = {
        // Les fichiers sont servis depuis /public
        locateFile: filename => `/sql-wasm.wasm`
      };

      this.SQL = await initSqlJs(config);
      console.log('SQL.js initialisé avec succès');
      this.initialized = true;
    } catch (error) {
      console.error('Erreur d\'initialisation SQL.js:', error);
      throw new Error(`Erreur d'initialisation SQL.js : ${error.message}`);
    }
  }

  /**
   * Crée un deck avec des flashcards simples
   * @param {string} name - Nom du deck
   * @param {Array} flashcards - Array de Flashcard
   * @param {Object} options - Options de configuration
   * @returns {Object} - Deck créé
   */
  createBasicDeck(name, flashcards, options = {}) {
    if (!Array.isArray(flashcards)) {
      throw new Error('Les flashcards doivent être un array');
    }

    if (flashcards.length === 0) {
      throw new Error('Le deck doit contenir au moins une flashcard');
    }

    // Créer le modèle de cartes
    const model = new Model({
      name: "AnkiLang Basic",
      flds: [
        { name: "Front" },
        { name: "Back" },
        { name: "Media" },
        { name: "Tags" },
        { name: "Notes" },
      ],
      req: [
        [0, "all", [0]], // Card 1: Front -> Back seulement
      ],
      tmpls: [
        {
          name: "Recto → Verso",
          qfmt: `
            <div class="card">
              <div class="front">{{Front}}</div>
            </div>
          `,
          afmt: `
            {{FrontSide}}
            <hr id="answer">
            <div class="back">{{Back}}</div>
            {{#Media}}<div class="media">{{Media}}</div>{{/Media}}
            {{#Tags}}<div class="tags">{{Tags}}</div>{{/Tags}}
            {{#Notes}}<div class="notes">{{Notes}}</div>{{/Notes}}
          `,
        },
      ],
      css: `
        .card {
          font-family: Arial, sans-serif;
          font-size: 20px;
          text-align: center;
          color: black;
          background-color: white;
          padding: 20px;
        }
        .front { font-weight: bold; margin-bottom: 10px; }
        .back { color: #2563eb; }
        .media { margin: 10px 0; }
        .tags { font-size: 12px; color: #64748b; margin-top: 10px; }
        .notes { font-style: italic; color: #64748b; margin-top: 10px; }
      `,
    });

    // Créer le deck
    const deck = new Deck(generateId(), name);

    // Ajouter les notes au deck
    const mediaFiles = [];
    flashcards.forEach(flashcard => {
      // Préparer medias (collecter les URLs à embarquer)
      const prepared = this.prepareMedia(flashcard.media, mediaFiles);
      const mediaHtml = this.generateMediaHtml(prepared);
      const tags = flashcard.tags.join(' ');

      const note = model.note([
        flashcard.front,
        flashcard.back,
        mediaHtml,
        tags,
        flashcard.notes || '',
      ], tags);

      deck.addNote(note);
    });

    return {
      deck,
      model,
      mediaFiles,
      stats: {
        totalCards: flashcards.length,
        totalNotes: deck.notes.length,
      }
    };
  }

  /**
   * Crée un deck avec des flashcards cloze
   * @param {string} name - Nom du deck
   * @param {Array} clozeFlashcards - Array de ClozeFlashcard
   * @param {Object} options - Options de configuration
   * @returns {Object} - Deck créé
   */
  createClozeDeck(name, clozeFlashcards, options = {}) {
    if (!Array.isArray(clozeFlashcards)) {
      throw new Error('Les flashcards cloze doivent être un array');
    }

    if (clozeFlashcards.length === 0) {
      throw new Error('Le deck doit contenir au moins une flashcard');
    }

    // Valider toutes les clozes
    const invalidCards = clozeFlashcards.filter(card => !card.validateClozes().valid);
    if (invalidCards.length > 0) {
      throw new Error(`Cartes invalides : ${invalidCards.map(card => card.id).join(', ')}`);
    }

    // Créer le modèle de cartes cloze NATIF Anki (type: 1)
    const model = new Model({
      name: "AnkiLang Cloze",
      type: 1, // Type Cloze natif Anki
      flds: [ 
        { name: 'Text' },     // Champ principal avec clozes {{c1::...}}
        { name: 'Media' },    // Médias (images, audio)
        { name: 'Tags' },     // Tags
        { name: 'Notes' }     // Notes supplémentaires
      ],
      req: [ [0, 'all', [0]] ],
      tmpls: [
        {
          name: "Cloze",
          qfmt: `
            <div class="card">
              <div class="cloze-question">{{cloze:Text}}</div>
            </div>
          `,
          afmt: `
            <div class="card">
              <div class="cloze-answer">{{cloze:Text}}</div>
              <hr id="answer">
              {{#Media}}<div class="media">{{Media}}</div>{{/Media}}
              {{#Tags}}<div class="tags">{{Tags}}</div>{{/Tags}}
              {{#Notes}}<div class="notes">{{Notes}}</div>{{/Notes}}
            </div>
          `,
        },
      ],
      css: `
        .card {
          font-family: Arial, sans-serif;
          font-size: 20px;
          text-align: center;
          color: black;
          background-color: white;
          padding: 20px;
        }
        .cloze-question { margin-bottom: 15px; }
        .cloze-answer { margin-bottom: 15px; }
        .media { margin: 15px 0; }
        .media img { max-width: 100%; height: auto; }
        .tags { font-size: 12px; color: #64748b; margin-top: 15px; }
        .notes { font-style: italic; color: #64748b; margin-top: 15px; }
        .cloze { font-weight: bold; color: #0066cc; background-color: #e6f3ff; padding: 2px 4px; border-radius: 3px; }
      `,
    });

    // Créer le deck
    const deck = new Deck(generateId(), name);

    // Ajouter les notes au deck
    const mediaFiles = [];
    clozeFlashcards.forEach(flashcard => {
      const prepared = this.prepareMedia(flashcard.media, mediaFiles);
      const mediaHtml = this.generateMediaHtml(prepared);
      const tags = flashcard.tags.join(' ');

      // Convertir le format ((c1::...)) vers {{c1::...}} pour Anki natif
      const ankiClozeText = this.convertToAnkiClozeFormat(flashcard.clozeText);
      console.log(`🔄 Conversion cloze: "${flashcard.clozeText}" → "${ankiClozeText}"`);

      const note = model.note([
        ankiClozeText, // Format Anki natif {{c1::...}}
        mediaHtml,
        tags,
        flashcard.notes || '',
      ], tags);

      deck.addNote(note);
    });

    return {
      deck,
      model,
      mediaFiles,
      stats: {
        totalCards: clozeFlashcards.length,
        totalNotes: deck.notes.length,
        totalClozes: clozeFlashcards.reduce((total, card) => {
          return total + card.validateClozes().clozeCount;
        }, 0),
      }
    };
  }

  /**
   * Crée un deck combinant Basic et Cloze dans un seul paquet
   */
  createCombinedDeck(name, basicFlashcards = [], clozeFlashcards = [], options = {}) {
    if (!basicFlashcards.length && !clozeFlashcards.length) {
      throw new Error('Le deck doit contenir au moins une flashcard')
    }

    const basicModel = new Model({
      name: "AnkiLang Basic",
      flds: [ { name: 'Front' }, { name: 'Back' }, { name: 'Media' }, { name: 'Tags' }, { name: 'Notes' } ],
      req: [ [0, 'all', [0]] ],
      tmpls: [
        { name: 'Recto → Verso', qfmt: `<div class="card"><div class="front">{{Front}}</div></div>`, afmt: `{{FrontSide}}<hr id="answer"><div class="back">{{Back}}</div>{{#Media}}<div class="media">{{Media}}</div>{{/Media}}{{#Tags}}<div class="tags">{{Tags}}</div>{{/Tags}}{{#Notes}}<div class="notes">{{Notes}}</div>{{/Notes}}` }
      ],
      css: `.card{font-family:Arial,sans-serif;font-size:20px;text-align:center;color:black;background-color:white;padding:20px}.front{font-weight:bold;margin-bottom:10px}.back{color:#2563eb}.media{margin:10px 0}.tags{font-size:12px;color:#64748b;margin-top:10px}.notes{font-style:italic;color:#64748b;margin-top:10px}`
    })

    const clozeModel = new Model({
      name: "AnkiLang Cloze",
      type: 1, // Type Cloze natif Anki
      flds: [ 
        { name: 'Text' },     // Champ principal avec clozes {{c1::...}}
        { name: 'Media' },    // Médias (images, audio)
        { name: 'Tags' },     // Tags
        { name: 'Notes' }     // Notes supplémentaires
      ],
      req: [ [0, 'all', [0]] ],
      tmpls: [ 
        { 
          name: 'Cloze', 
          qfmt: `<div class="card"><div class="cloze-question">{{cloze:Text}}</div></div>`, 
          afmt: `<div class="card"><div class="cloze-answer">{{cloze:Text}}</div><hr id="answer">{{#Media}}<div class="media">{{Media}}</div>{{/Media}}{{#Tags}}<div class="tags">{{Tags}}</div>{{/Tags}}{{#Notes}}<div class="notes">{{Notes}}</div>{{/Notes}}</div>` 
        } 
      ],
      css: `.card{font-family:Arial,sans-serif;font-size:20px;text-align:center;color:black;background-color:white;padding:20px}.cloze-question{margin-bottom:15px}.cloze-answer{margin-bottom:15px}.media{margin:15px 0}.media img{max-width:100%;height:auto}.tags{font-size:12px;color:#64748b;margin-top:15px}.notes{font-style:italic;color:#64748b;margin-top:15px}.cloze{font-weight:bold;color:#0066cc;background-color:#e6f3ff;padding:2px 4px;border-radius:3px}`
    })

    const deck = new Deck(generateId(), name)
    const mediaFiles = []

    basicFlashcards.forEach(f => {
      const prepared = this.prepareMedia(f.media, mediaFiles)
      const mediaHtml = this.generateMediaHtml(prepared)
      const tags = (f.tags||[]).join(' ')
      const note = basicModel.note([ f.front, f.back, mediaHtml, tags, f.notes || '' ], tags)
      deck.addNote(note)
    })

    clozeFlashcards.forEach(f => {
      const prepared = this.prepareMedia(f.media, mediaFiles)
      const mediaHtml = this.generateMediaHtml(prepared)
      const tags = (f.tags||[]).join(' ')
      
      // Convertir le format ((c1::...)) vers {{c1::...}} pour Anki natif
      const ankiClozeText = this.convertToAnkiClozeFormat(f.clozeText);
      console.log(`🔄 Conversion cloze combiné: "${f.clozeText}" → "${ankiClozeText}"`);
      
      const note = clozeModel.note([ ankiClozeText, mediaHtml, tags, f.notes || '' ], tags)
      deck.addNote(note)
    })

    return { deck, models: [basicModel, clozeModel], mediaFiles, stats: { totalCards: basicFlashcards.length + clozeFlashcards.length, totalNotes: deck.notes.length } }
  }

  /**
   * Génère le HTML pour les médias
   * @param {Object} media - Objet contenant audio et/ou image
   * @returns {string} - HTML des médias au format Anki
   */
  generateMediaHtml(media) {
    if (!media) return '';

    let html = '';
    
    // Format Anki pour l'audio : [sound:filename.mp3]
    // Les balises HTML5 <audio> ne fonctionnent PAS dans Anki
    if (media.audio) {
      html += `[sound:${media.audio}]`;
    }
    
    // Format Anki pour les images : <img src="filename.ext">
    // Seul le nom de fichier (pas d'URL complète) doit être utilisé
    if (media.image) {
      html += `<img src="${media.image}" alt="Image" style="max-width: 100%; height: auto;">`;
    }

    return html;
  }

  /** Prépare les fichiers médias: si URLs, créé des noms de fichiers à embarquer */
  prepareMedia(media = {}, mediaFiles = []) {
    if (!media) return {}
    const out = { ...media }
    const planAdd = (url, prefix) => {
      try {
        if (!url || /^data:/.test(url)) return null
        
        // Nettoyer l'URL pour extraire l'extension
        const cleanUrl = url.split('?')[0].split('#')[0];
        
        // Détection spéciale pour Votz : les URLs sans extension doivent être traitées comme MP3
        let ext;
        const isVotzUrl = cleanUrl.includes('votz.eu/uploads/');
        
        if (isVotzUrl && prefix === 'AUD') {
          // Les URLs Votz sont des fichiers MP3 sans extension dans l'URL
          ext = 'mp3';
          console.log(`🎵 URL Votz détectée, extension forcée à mp3`);
        } else {
          // Regex stricte : uniquement 2-4 caractères alphabétiques après un point final
          const extMatch = cleanUrl.match(/\.([a-zA-Z]{2,4})$/);
          ext = extMatch ? extMatch[1].toLowerCase() : (prefix === 'IMG' ? 'jpg' : 'mp3');
        }
        
        // Vérifier que l'extension est valide pour Anki
        const validImageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        const validAudioExts = ['mp3', 'wav', 'ogg', 'm4a'];
        
        let finalExt = ext;
        if (prefix === 'IMG' && !validImageExts.includes(ext)) {
          console.warn(`⚠️ Extension d'image non supportée: ${ext}, utilisation de jpg`);
          finalExt = 'jpg';
        } else if (prefix === 'AUD' && !validAudioExts.includes(ext)) {
          console.warn(`⚠️ Extension audio non supportée: ${ext}, utilisation de mp3`);
          finalExt = 'mp3';
        }
        
        const name = `${prefix}_${this.simpleHash(url)}.${finalExt}`
        mediaFiles.push({ url, filename: name })
        console.log(`📋 Média planifié: ${name} (${url}) [ext: ${finalExt}]`);
        return name
      } catch (error) {
        console.error(`❌ Erreur lors de la préparation du média:`, error);
        return null
      }
    }
    if (media.image) out.image = planAdd(media.image, 'IMG') || media.image
    if (media.audio) out.audio = planAdd(media.audio, 'AUD') || media.audio
    return out
  }

  simpleHash(str) {
    let h = 0
    for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0
    return (h >>> 0).toString(36)
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

      // Construire collection.anki2 (SQLite) minimal pour Anki
      console.log('Construction de collection.anki2...');
      try {
        const dbBuf = await this.buildCollection(deckData)
        ankiPackage.addMediaFile('collection.anki2', dbBuf)
        console.log('collection.anki2 généré avec succès');
      } catch (e) {
        console.error('❌ ERREUR CRITIQUE: collection.anki2 build failed, package will not be importable in Anki:', e);
        throw new Error(`Impossible de générer collection.anki2: ${e.message}. Le fichier .apkg ne sera pas importable dans Anki.`);
      }

      // Les clozes utilisent maintenant le format natif Anki - plus besoin de script JS
      console.log('✅ Utilisation des clozes natives Anki - pas de script JavaScript requis');

      // Ajouter les médias embarqués (téléchargement en ArrayBuffer)
      const successfulMediaFiles = [];
      if (deckData.mediaFiles && deckData.mediaFiles.length) {
        console.log(`📁 Téléchargement de ${deckData.mediaFiles.length} fichier(s) média...`);
        
        for (const mf of deckData.mediaFiles) {
          // Plus besoin de vérifier cloze_anything.js car nous utilisons les clozes natives
          
          try {
            // Vérifier si c'est un blob base64 (mode 'file' de Votz)
            if (mf.url.startsWith('data:audio/')) {
              console.log(`📥 Blob base64 détecté: ${mf.filename}`);
              
              // Extraire les données base64
              const base64Data = mf.url.split(',')[1];
              const binaryData = atob(base64Data);
              const arrayBuffer = new ArrayBuffer(binaryData.length);
              const uint8Array = new Uint8Array(arrayBuffer);
              
              for (let i = 0; i < binaryData.length; i++) {
                uint8Array[i] = binaryData.charCodeAt(i);
              }
              
              // Vérifier le format audio (WAV vs MP3)
              const isWav = mf.url.startsWith('data:audio/wav');
              const isMp3 = mf.url.startsWith('data:audio/mpeg') || mf.url.startsWith('data:audio/mp3');
              
              if (isWav) {
                console.log(`🎵 Fichier WAV détecté, conversion en MP3 pour Anki`);
                // Pour l'instant, on garde le WAV (Anki le supporte)
                // TODO: Convertir WAV → MP3 si nécessaire
              }
              
              ankiPackage.addMediaFile(mf.filename, arrayBuffer);
              successfulMediaFiles.push(mf.filename);
              console.log(`✅ ${mf.filename} ajouté directement (${arrayBuffer.byteLength} octets, format: ${isWav ? 'WAV' : isMp3 ? 'MP3' : 'AUDIO'})`);
              continue;
            }
            
            // Vérifier si c'est un ID de fichier Appwrite (après upload)
            if (mf.url && !mf.url.startsWith('http') && !mf.url.startsWith('data:')) {
              console.log(`📥 Fichier Appwrite détecté: ${mf.filename} (ID: ${mf.url})`);
              
              try {
                // Télécharger le fichier depuis Appwrite Storage
                const downloadUrl = `https://fra.cloud.appwrite.io/v1/storage/buckets/flashcard-images/files/${mf.url}/view?project=ankilang`;
                const res = await fetch(downloadUrl, { credentials: 'include' });
                
                if (!res.ok) {
                  throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                }
                
                const arrayBuffer = await res.arrayBuffer();
                
                if (arrayBuffer.byteLength === 0) {
                  throw new Error('Fichier vide');
                }
                
                ankiPackage.addMediaFile(mf.filename, arrayBuffer);
                successfulMediaFiles.push(mf.filename);
                console.log(`✅ ${mf.filename} téléchargé depuis Appwrite (${arrayBuffer.byteLength} octets)`);
                continue;
              } catch (error) {
                console.error(`❌ Échec du téléchargement du fichier Appwrite ${mf.filename}:`, error.message);
                // Ne pas ajouter le fichier échoué au package
              }
            }
            
            const downloadUrl = this.getMediaDownloadUrl(mf.url, mf.filename)
            console.log(`📥 Téléchargement: ${mf.filename} depuis ${downloadUrl}`);
            
            // Déterminer si on doit inclure les credentials (pour Appwrite uniquement)
            const isAppwrite = mf.url.includes('appwrite.io')
            const fetchOptions = isAppwrite ? { credentials: 'include' } : {}
            
            const res = await fetch(downloadUrl, fetchOptions)
            
            if (!res.ok) {
              throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            
            const contentType = res.headers.get('content-type') || 'unknown';
            console.log(`📄 Content-Type: ${contentType}`);
            
            const buf = await res.arrayBuffer()
            
            if (buf.byteLength === 0) {
              throw new Error('Fichier vide');
            }
            
            // Vérifier que c'est bien un fichier média et pas une page HTML
            const uint8 = new Uint8Array(buf);
            const firstBytes = Array.from(uint8.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join(' ');
            console.log(`🔍 Premiers octets: ${firstBytes}`);
            
            // Détecter si c'est du HTML (commence par '<' = 0x3C)
            if (uint8[0] === 0x3C || uint8[0] === 0x7B) {
              const textPreview = new TextDecoder().decode(uint8.slice(0, 100));
              console.error(`❌ Le fichier semble être du texte/HTML, pas un média:`, textPreview);
              throw new Error('Le fichier téléchargé n\'est pas un fichier média valide');
            }
            
            ankiPackage.addMediaFile(mf.filename, buf)
            successfulMediaFiles.push(mf.filename);
            console.log(`✅ ${mf.filename} téléchargé (${buf.byteLength} octets, type: ${contentType})`);
          } catch (e) {
            console.error(`❌ Échec du téléchargement de ${mf.filename}:`, e.message);
            // Ne pas ajouter le fichier échoué au package
          }
        }
        
        console.log(`📊 Médias téléchargés avec succès: ${successfulMediaFiles.length}/${deckData.mediaFiles.length}`);
      }

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
   * Retourne l'URL à utiliser pour télécharger un média (proxy si nécessaire)
   */
  getMediaDownloadUrl(url, filename) {
    try {
      const u = new URL(url)
      
      // Votz : accès direct (plus de proxy nécessaire avec mode 'file')
      if (u.hostname === 'votz.eu') {
        console.log(`🎵 Accès direct Votz: ${url}`);
        return url
      }
      
      // Appwrite Storage : accès direct avec les credentials du navigateur
      // L'utilisateur est déjà authentifié, donc fetch() avec credentials: 'include'
      // fonctionnera grâce aux cookies de session Appwrite
      if (u.hostname === 'fra.cloud.appwrite.io' || u.hostname.includes('appwrite.io')) {
        console.log(`✅ Accès direct Appwrite (authentifié): ${url}`);
        return url
      }
      
      // URLs Pexels et autres : accès direct
      console.log(`✅ Accès direct: ${url}`);
      return url
    } catch {
      return url
    }
  }

  /**
   * Construit une base SQLite collection.anki2 minimale
   */
  async buildCollection(deckData) {
    if (!this.SQL) await this.initialize()
    const db = new this.SQL.Database()

    const exec = (sql) => db.exec(sql)
    const now = Math.floor(Date.now() / 1000)
    const crt = Math.floor(Date.now() / 1000 / 86400)

    // Schéma minimal (Anki 2.1 compatible de base)
    exec(`
      CREATE TABLE col(
        id integer primary key,
        crt integer not null,
        mod integer not null,
        scm integer not null,
        ver integer not null,
        dty integer not null,
        usn integer not null,
        ls integer not null,
        conf text not null,
        models text not null,
        decks text not null,
        dconf text not null,
        tags text not null
      );
      CREATE TABLE notes(
        id integer primary key,
        guid text not null,
        mid integer not null,
        mod integer not null,
        usn integer not null,
        tags text not null,
        flds text not null,
        sfld integer not null,
        csum integer not null,
        flags integer not null,
        data text not null
      );
      CREATE TABLE cards(
        id integer primary key,
        nid integer not null,
        did integer not null,
        ord integer not null,
        mod integer not null,
        usn integer not null,
        type integer not null,
        queue integer not null,
        due integer not null,
        ivl integer not null,
        factor integer not null,
        reps integer not null,
        lapses integer not null,
        left integer not null,
        odue integer not null,
        odid integer not null,
        flags integer not null,
        data text not null
      );
      CREATE TABLE revlog(id integer primary key, cid integer, usn integer, ease integer, ivl integer, lastIvl integer, factor integer, time integer, type integer);
      CREATE TABLE graves(id integer primary key, type integer, usn integer);
    `)

    const deck = deckData.deck
    const modelsList = deckData.models ? deckData.models : (deckData.model ? [deckData.model] : [])

    // Assigner IDs aux modèles
    const models = {}
    modelsList.forEach((m, i) => {
      const id = (m.props && m.props.id) ? m.props.id : (generateId() + i)
      m.__id = id
      models[id] = {
        id,
        name: m.props.name,
        type: m.props.type || 0, // Utiliser le type spécifié dans le modèle (0 = Standard, 1 = Cloze)
        mod: now,
        usn: -1,
        sortf: 0,
        vers: [],
        tags: [],
        did: null,
        flds: m.props.flds.map((f, idx) => ({ 
          name: f.name, 
          ord: idx, 
          sticky: false, 
          rtl: false, 
          font: 'Arial', 
          size: 20, 
          media: [] 
        })),
        tmpls: m.props.tmpls.map((t, idx) => ({ 
          name: t.name || `Card ${idx+1}`,
          ord: idx,
          qfmt: t.qfmt,
          afmt: t.afmt,
          bqfmt: '',
          bafmt: '',
          did: null,
          bfont: 'Arial',
          bsize: 12
        })),
        css: m.props.css || '',
        latexPre: '', latexPost: '',
        latexsvg: false,
        req: m.props.req || []
      }
    })

    const decks = {}
    decks[deck.id] = {
      id: deck.id,
      name: deck.name,
      // Anki 2.1 attend mtimeSecs; on garde mod pour compat
      mtimeSecs: now,
      mod: now,
      usn: -1,
      desc: '',
      dyn: 0,
      conf: 1,
      collapsed: false,
      browserCollapsed: false,
      // Compteurs du jour
      newToday: [0, 0],
      revToday: [0, 0],
      lrnToday: [0, 0],
      timeToday: [0, 0]
    }

    const colConf = { 
      nextPos: 1, 
      estTimes: true, 
      activeDecks: [deck.id], 
      curDeck: deck.id,
      // Ajouter des paramètres requis par Anki 2.1
      collapseTime: 1200,
      timeLim: 0,
      estTimes: true,
      nextPos: 1,
      sortType: "noteCrt",
      sortBackwards: false,
      addToCur: true,
      curDeck: deck.id,
      newBury: true,
      newSpread: 0,
      dueCounts: true,
      dueCountsLimit: 999999,
      showIntervals: "answer",
      showProgress: true,
      learnAheadLimit: 20,
      catchup: {
        new: {
          limit: 200,
          delays: [1, 10],
          initialFactor: 2500,
          separate: true,
          order: 1,
          perDay: 20,
          bury: true
        },
        rev: {
          limit: 200,
          perDay: 200,
          delays: [1, 10],
          initialFactor: 2500,
          separate: true,
          order: 1,
          bury: true
        },
        lapse: {
          limit: 200,
          delays: [10],
          leechAction: 0,
          leechFails: 8,
          minInt: 1,
          mult: 0.0
        }
      }
    }
    const dconf = {
      1: {
        id: 1,
        mod: now,
        name: 'Default',
        usn: -1,
        maxTaken: 60,
        autoplay: true,
        replayq: true,
        timer: 0,
        resched: true,
        // Paramètres pour les nouvelles cartes
        new: {
          bury: true,
          delays: [1, 10],
          initialFactor: 2500,
          ints: [1, 4, 7],
          order: 1, // 0 = aléatoire, 1 = ordre d'ajout
          perDay: 20,
          separate: true
        },
        // Paramètres pour les révisions
        rev: {
          bury: true,
          ease4: 1.3,
          ivlFct: 1.0,
          maxIvl: 36500,
          perDay: 200,
          hardFactor: 1.2
        },
        // Paramètres pour les lapses
        lapse: {
          delays: [10],
          leechAction: 0,
          leechFails: 8,
          minInt: 1,
          mult: 0.0
        }
      }
    }

    const insertCol = db.prepare(`INSERT INTO col VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    insertCol.run([
      1, crt, now, now, 11, 0, 0, 0,
      JSON.stringify(colConf),
      JSON.stringify(models),
      JSON.stringify(decks),
      JSON.stringify(dconf),
      JSON.stringify({})
    ])
    insertCol.free()
    
    // Ajouter des données minimales pour éviter les erreurs Anki
    console.log('📊 Ajout des données minimales à la base SQLite...');

    // S'assurer qu'il y a au moins un modèle par défaut
    if (Object.keys(models).length === 0) {
      console.warn('⚠️ Aucun modèle trouvé, ajout d\'un modèle par défaut');
      const defaultModelId = generateId();
      models[defaultModelId] = {
        id: defaultModelId,
        name: "Basic",
        type: 0,
        mod: now,
        usn: -1,
        sortf: 0,
        vers: [],
        tags: [],
        did: null,
        flds: [
          { name: "Front", ord: 0, sticky: false, rtl: false, font: "Arial", size: 20, media: [] },
          { name: "Back", ord: 1, sticky: false, rtl: false, font: "Arial", size: 20, media: [] }
        ],
        tmpls: [
          {
            name: "Card 1",
            ord: 0,
            qfmt: "{{Front}}",
            afmt: "{{FrontSide}}\n\n<hr id=answer>\n\n{{Back}}",
            bqfmt: "",
            bafmt: "",
            did: null,
            bfont: "Arial",
            bsize: 12
          }
        ],
        css: ".card { font-family: arial; font-size: 20px; text-align: center; color: black; background-color: white; }",
        latexPre: "",
        latexPost: "",
        latexsvg: false,
        req: [[0, "all", [0, 1]]]
      };
    }

    // Insert notes + cards
    const US = '\u001f'
    let nid = generateId()
    let cid = generateId()
    let due = 1

    const insNote = db.prepare(`INSERT INTO notes VALUES(?,?,?,?,?,?,?,?,?,?,?)`)
    const insCard = db.prepare(`INSERT INTO cards VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)

    // S'assurer qu'il y a au moins une note pour éviter les erreurs Anki
    if (deck.notes.length === 0) {
      console.warn('⚠️ Aucune note dans le deck, ajout d\'une note vide pour compatibilité Anki');
      // Ajouter une note vide pour éviter les erreurs Anki
      const emptyNoteId = nid++;
      const emptyCardId = cid++;
      const defaultModelId = Object.keys(models)[0]; // Utiliser le premier modèle disponible
      insNote.run([ emptyNoteId, this.generateGuid(), defaultModelId, now, -1, ' ', '', 0, 0, 0, '' ]);
      insCard.run([ emptyCardId, emptyNoteId, deck.id, 0, now, -1, 0, 0, 1, 0, 2500, 0, 0, 0, 0, 0, 0, '' ]);
    } else {
      deck.notes.forEach(note => {
        const model = note.model
        const mid = model.__id
        const fields = note.fields
        const flds = fields.join(US)
        const sfldStr = (fields[0] || '').toString()
        const sfld = sfldStr.length
        const csum = this.simpleCsum(sfldStr)
        const tags = note.tags ? ` ${note.tags} ` : ''

        const thisNid = nid++
        insNote.run([ thisNid, note.guid, mid, now, -1, tags, flds, sfld, csum, 0, '' ])

        // Créer une carte par template utilisé
        const cardOrds = note.cards
        for (const ord of cardOrds) {
          const thisCid = cid++
          insCard.run([ thisCid, thisNid, deck.id, ord, now, -1, 0, 0, due++, 0, 2500, 0, 0, 0, 0, 0, 0, '' ])
        }
      })
    }

    insNote.free(); insCard.free()

    // Ajouter une entrée minimale dans revlog pour éviter les erreurs Anki
    const insRevlog = db.prepare(`INSERT INTO revlog VALUES(?,?,?,?,?,?,?,?,?)`)
    insRevlog.run([1, 1, -1, 1, 0, 0, 2500, 0, 0])
    insRevlog.free()

    const data = db.export()
    const buf = new Uint8Array(data)
    db.close()
    
    // Vérifier que la base SQLite est valide
    if (buf.length === 0) {
      throw new Error('La base SQLite générée est vide');
    }
    
    // Vérifier que la base contient les données essentielles
    const tempDb = new this.SQL.Database(buf);
    try {
      const colResult = tempDb.exec('SELECT COUNT(*) as count FROM col');
      const notesResult = tempDb.exec('SELECT COUNT(*) as count FROM notes');
      const cardsResult = tempDb.exec('SELECT COUNT(*) as count FROM cards');
      
      console.log(`📊 Vérification SQLite: col=${colResult[0]?.values[0]?.[0] || 0}, notes=${notesResult[0]?.values[0]?.[0] || 0}, cards=${cardsResult[0]?.values[0]?.[0] || 0}`);
      
      if (colResult[0]?.values[0]?.[0] === 0) {
        throw new Error('Table col vide - structure SQLite invalide');
      }
    } finally {
      tempDb.close();
    }
    
    console.log(`📊 Base SQLite générée: ${buf.length} octets`);
    return buf
  }

  simpleCsum(str) {
    let h = 0
    for (let i = 0; i < str.length; i++) h = (h * 239 + str.charCodeAt(i)) >>> 0
    return h
  }

  /**
   * Génère un GUID unique pour les notes
   * @returns {string} - GUID au format Anki
   */
  generateGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Convertit le format ((c1::...)) vers {{c1::...}} pour Anki natif
   * @param {string} clozeText - Texte avec clozes au format ((c1::...))
   * @returns {string} - Texte avec clozes au format Anki natif {{c1::...}}
   */
  convertToAnkiClozeFormat(clozeText) {
    if (!clozeText) return '';
    
    // Convertir ((c1::réponse::indice)) vers {{c1::réponse::indice}}
    // Convertir ((c1::réponse)) vers {{c1::réponse}}
    return clozeText.replace(/\(\(c(\d+)::([^:)]+?)(?::([^)]+?))?\)\)/g, (match, number, answer, hint) => {
      if (hint) {
        return `{{c${number}::${answer}::${hint}}}`;
      } else {
        return `{{c${number}::${answer}}}`;
      }
    });
  }

  /**
   * Récupère le script JavaScript pour les clozes flexibles (OBSOLÈTE - gardé pour compatibilité)
   * @returns {Promise<string>} - Contenu du script
   */
  async getClozeScript() {
    return `
      // Script pour les clozes flexibles AnkiLang
      (function() {
        'use strict';
        
        function processClozes() {
          const clozeElements = document.querySelectorAll('.cloze-text');
          
          clozeElements.forEach(function(element) {
            if (element.dataset.processed) return; // Éviter le double traitement
            
            const content = element.innerHTML;
            
            // Remplacer les clozes flexibles par des espaces
            const processedContent = content.replace(/\\(\\(c\\d+::[^:]+?(?::[^:]+?)?\\)\\)/g, function(match) {
              const clozeMatch = match.match(/\\(\\(c(\\d+)::([^:]+?)(?::([^:]+?))?\\)\\)/);
              if (clozeMatch) {
                const number = clozeMatch[1];
                const content = clozeMatch[2];
                const hint = clozeMatch[3];
                
                if (hint) {
                  return '<span class="cloze" data-cloze="' + number + '">[' + hint + ']</span>';
                } else {
                  return '<span class="cloze" data-cloze="' + number + '">[...]</span>';
                }
              }
              return match;
            });
            
            element.innerHTML = processedContent;
            element.dataset.processed = 'true';
          });
        }
        
        // Traitement immédiat si DOM est déjà chargé
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', processClozes);
        } else {
          processClozes();
        }
        
        // Traitement pour les cartes Anki (après chargement)
        if (typeof anki !== 'undefined') {
          anki.addEventListener('showAnswer', processClozes);
          anki.addEventListener('showQuestion', processClozes);
        }
      })();
    `;
  }

  /**
   * Crée une flashcard simple
   * @param {Object} data - Données de la flashcard
   * @returns {Flashcard} - Instance de Flashcard
   */
  createFlashcard(data) {
    return new Flashcard(data);
  }

  /**
   * Crée une flashcard cloze
   * @param {Object} data - Données de la flashcard cloze
   * @returns {ClozeFlashcard} - Instance de ClozeFlashcard
   */
  createClozeFlashcard(data) {
    return new ClozeFlashcard(data);
  }
}
