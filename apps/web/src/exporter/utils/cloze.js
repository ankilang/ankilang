// Logique des clozes flexibles basée sur Anki Cloze Anything
// Basé sur https://github.com/matthayes/anki_cloze_anything

const defaults = {
  showBefore: "all",
  showAfter: "all",
  replaceChar: ".",
  replaceSameLength: false,
  alwaysShowBlanks: false,
  blanksFormat: "[{blanks}]",
  hintFormat: "[{hint}]",
  blanksAndHintFormat: "[{blanks}|{hint}]",
  keepRegex: /[!,.:;?—–…]/,
};

// Regex pour détecter les clozes flexibles
const CLOZE_REGEX = /\(\(c(\d+)::(.+?)(?:::(.+?))?\)\)/g;
const CHAR_KEEP_REGEX = /(`[\s\S]+?`)/g;
const SPACE_SPLIT = /\s+/;
const COMBINING_DIACRITIC_MARKS = /[\u0300-\u036f]/g;

/**
 * Extrait les numéros de cloze d'un contenu
 * @param {string} content - Le contenu à analyser
 * @returns {Set<number>} - Ensemble des numéros de cloze trouvés
 */
export function getClozeNumbers(content) {
  const matches = [...content.matchAll(CLOZE_REGEX)];
  return new Set(matches.map(match => parseInt(match[1])));
}

/**
 * Parse une expression cloze et retourne ses composants
 * @param {string} clozeText - Le texte cloze à parser
 * @returns {Array} - Array d'objets {number, content, hint}
 */
export function parseClozeExpression(clozeText) {
  const clozes = [];
  let match;
  
  while ((match = CLOZE_REGEX.exec(clozeText)) !== null) {
    clozes.push({
      number: parseInt(match[1]),
      content: match[2],
      hint: match[3] || null,
    });
  }
  
  return clozes.sort((a, b) => a.number - b.number);
}

/**
 * Remplace les caractères par des espaces de la même longueur
 * @param {string} content - Le contenu à remplacer
 * @param {string} replaceChar - Le caractère de remplacement
 * @param {RegExp} keepRegex - Regex pour les caractères à conserver
 * @returns {string} - Le contenu avec les remplacements
 */
export function replaceCharsWithBlanks(content, replaceChar = ".", keepRegex = defaults.keepRegex) {
  // Vérifier si le contenu contient du HTML
  if (content.indexOf("<") >= 0) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    content = doc.documentElement.textContent;
  }

  // Normaliser et supprimer les diacritiques pour le calcul de longueur
  content = content.normalize("NFD").replace(COMBINING_DIACRITIC_MARKS, "");
  
  const split = content.split(RegExp("(" + SPACE_SPLIT.source + "|" + keepRegex.source + ")"));
  const parts = [];
  
  split.forEach((part, i) => {
    if (i % 2 === 0) {
      // Remplacer les caractères non-espace
      parts.push(replaceChar.repeat(part.length));
    } else {
      // Conserver les espaces et caractères spéciaux
      parts.push(part);
    }
  });
  
  return parts.join("");
}

/**
 * Traite les caractères à conserver (entourés de backticks)
 * @param {string} content - Le contenu à traiter
 * @returns {string} - Le contenu avec les caractères conservés
 */
export function processKeepCharacters(content) {
  return content.replace(CHAR_KEEP_REGEX, (match, p1) => {
    // Supprimer les backticks et conserver le contenu
    return p1.slice(1, -1);
  });
}

/**
 * Génère le rendu d'une cloze pour l'affichage
 * @param {Object} cloze - L'objet cloze {number, content, hint}
 * @param {Object} options - Options de rendu
 * @returns {string} - Le HTML rendu de la cloze
 */
export function renderCloze(cloze, options = {}) {
  const {
    replaceChar = defaults.replaceChar,
    replaceSameLength = defaults.replaceSameLength,
    alwaysShowBlanks = defaults.alwaysShowBlanks,
    blanksFormat = defaults.blanksFormat,
    hintFormat = defaults.hintFormat,
    blanksAndHintFormat = defaults.blanksAndHintFormat,
    keepRegex = defaults.keepRegex,
  } = options;

  let content = cloze.content;
  let hint = cloze.hint;

  // Traiter les caractères à conserver
  content = processKeepCharacters(content);

  // Générer les espaces
  let blanks;
  if (replaceSameLength) {
    blanks = replaceCharsWithBlanks(content, replaceChar, keepRegex);
  } else {
    // Remplacer chaque caractère non-espace par le caractère de remplacement
    blanks = content.replace(/[^\s]/g, replaceChar);
  }

  // Déterminer le format à utiliser
  let result;
  if (hint && !alwaysShowBlanks) {
    // Afficher seulement l'indice
    result = hintFormat.replace("{hint}", hint);
  } else if (hint && alwaysShowBlanks) {
    // Afficher les espaces et l'indice
    result = blanksAndHintFormat
      .replace("{blanks}", blanks)
      .replace("{hint}", hint);
  } else {
    // Afficher seulement les espaces
    result = blanksFormat.replace("{blanks}", blanks);
  }

  return `<span class="cloze cloze-${cloze.number}">${result}</span>`;
}

/**
 * Génère le rendu complet d'un contenu avec clozes
 * @param {string} content - Le contenu avec clozes
 * @param {number} currentCloze - Le numéro de la cloze actuelle
 * @param {Object} options - Options de rendu
 * @returns {string} - Le HTML rendu complet
 */
export function renderClozeContent(content, currentCloze, options = {}) {
  const {
    showBefore = defaults.showBefore,
    showAfter = defaults.showAfter,
  } = options;

  const clozes = parseClozeExpression(content);
  let result = content;

  clozes.forEach(cloze => {
    let shouldShow = false;

    // Déterminer si cette cloze doit être affichée
    if (cloze.number === currentCloze) {
      shouldShow = false; // La cloze actuelle est toujours cachée
    } else {
      const distance = Math.abs(cloze.number - currentCloze);
      
      if (showBefore === "all" && cloze.number < currentCloze) {
        shouldShow = true;
      } else if (showAfter === "all" && cloze.number > currentCloze) {
        shouldShow = true;
      } else if (typeof showBefore === "number" && cloze.number < currentCloze && distance <= showBefore) {
        shouldShow = true;
      } else if (typeof showAfter === "number" && cloze.number > currentCloze && distance <= showAfter) {
        shouldShow = true;
      }
    }

    // Remplacer la cloze par son rendu
    const clozeRegex = new RegExp(`\\(\\(c${cloze.number}::([^:]+?)(?::([^:]+?))?\\)\\)`, 'g');
    
    if (shouldShow) {
      // Afficher le contenu de la cloze
      result = result.replace(clozeRegex, (match, content, hint) => {
        return `<span class="other-cloze">${content}</span>`;
      });
    } else {
      // Rendre la cloze
      result = result.replace(clozeRegex, (match, content, hint) => {
        return renderCloze({
          number: cloze.number,
          content: content,
          hint: hint,
        }, options);
      });
    }
  });

  return result;
}

/**
 * Crée un template de carte cloze flexible
 * @param {string} fieldName - Nom du champ contenant les clozes
 * @param {Object} options - Options de configuration
 * @returns {Object} - Template de carte
 */
export function createFlexibleClozeTemplate(fieldName, options = {}) {
  const clozeOptions = {
    ...defaults,
    ...options,
  };

  return {
    name: "Cloze Flexible",
    qfmt: `
      <div id="cloze" data-card="{{Card}}" 
           data-cloze-show-before="${clozeOptions.showBefore}" 
           data-cloze-show-after="${clozeOptions.showAfter}"
           data-cloze-replace-char="${clozeOptions.replaceChar}"
           data-cloze-replace-same-length="${clozeOptions.replaceSameLength}"
           data-cloze-always-show-blanks="${clozeOptions.alwaysShowBlanks}"
           data-cloze-blanks-format="${clozeOptions.blanksFormat}"
           data-cloze-hint-format="${clozeOptions.hintFormat}"
           data-cloze-blanks-and-hint-format="${clozeOptions.blanksAndHintFormat}">
        {{${fieldName}}}
      </div>
      <script defer type="text/javascript" src="cloze_anything.js"></script>
    `,
    afmt: `
      {{FrontSide}}
      <hr id="answer">
      <div id="cloze" data-card="{{Card}}" 
           data-cloze-show-before="${clozeOptions.showBefore}" 
           data-cloze-show-after="${clozeOptions.showAfter}">
        {{${fieldName}}}
      </div>
      <script defer type="text/javascript" src="cloze_anything.js"></script>
    `,
  };
}

/**
 * Valide une expression cloze
 * @param {string} content - Le contenu à valider
 * @returns {Object} - Résultat de validation
 */
export function validateClozeExpression(content) {
  const clozes = parseClozeExpression(content);
  const numbers = clozes.map(c => c.number);
  const duplicates = numbers.filter((num, index) => numbers.indexOf(num) !== index);
  
  if (duplicates.length > 0) {
    return {
      valid: false,
      error: `Numéros de cloze dupliqués : ${duplicates.join(', ')}`,
    };
  }

  if (numbers.length === 0) {
    return {
      valid: false,
      error: "Aucune cloze trouvée dans le contenu",
    };
  }

  return {
    valid: true,
    clozes: clozes,
    count: clozes.length,
  };
}
