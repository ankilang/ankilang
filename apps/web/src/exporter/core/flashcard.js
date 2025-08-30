import { z } from 'zod';

// Schéma de validation pour une flashcard
export const FlashcardSchema = z.object({
  id: z.string().optional(),
  front: z.string().min(1, "Le recto ne peut pas être vide"),
  back: z.string().min(1, "Le verso ne peut pas être vide"),
  media: z.object({
    audio: z.string().optional(),
    image: z.string().optional(),
  }).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

// Schéma pour une flashcard cloze
export const ClozeFlashcardSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, "Le texte ne peut pas être vide"),
  clozeText: z.string().min(1, "Le texte avec clozes ne peut pas être vide"),
  media: z.object({
    audio: z.string().optional(),
    image: z.string().optional(),
  }).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

/**
 * Classe représentant une flashcard simple (recto/verso)
 */
export class Flashcard {
  constructor(data) {
    const validated = FlashcardSchema.parse(data);
    this.id = validated.id || this.generateId();
    this.front = validated.front;
    this.back = validated.back;
    this.media = validated.media || {};
    this.tags = validated.tags || [];
    this.notes = validated.notes || '';
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Ajoute un fichier audio
   * @param {string} audioPath - Chemin vers le fichier audio
   */
  addAudio(audioPath) {
    this.media.audio = audioPath;
  }

  /**
   * Ajoute une image
   * @param {string} imagePath - Chemin vers l'image
   */
  addImage(imagePath) {
    this.media.image = imagePath;
  }

  /**
   * Ajoute des tags
   * @param {string|Array} tags - Tags à ajouter
   */
  addTags(tags) {
    const tagArray = Array.isArray(tags) ? tags : [tags];
    this.tags.push(...tagArray);
  }

  /**
   * Convertit en objet pour export
   */
  toObject() {
    return {
      id: this.id,
      front: this.front,
      back: this.back,
      media: this.media,
      tags: this.tags,
      notes: this.notes,
    };
  }
}

/**
 * Classe représentant une flashcard cloze (texte à trous)
 */
export class ClozeFlashcard {
  constructor(data) {
    const validated = ClozeFlashcardSchema.parse(data);
    this.id = validated.id || this.generateId();
    this.text = validated.text;
    this.clozeText = validated.clozeText;
    this.media = validated.media || {};
    this.tags = validated.tags || [];
    this.notes = validated.notes || '';
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Ajoute un fichier audio
   * @param {string} audioPath - Chemin vers le fichier audio
   */
  addAudio(audioPath) {
    this.media.audio = audioPath;
  }

  /**
   * Ajoute une image
   * @param {string} imagePath - Chemin vers l'image
   */
  addImage(imagePath) {
    this.media.image = imagePath;
  }

  /**
   * Ajoute des tags
   * @param {string|Array} tags - Tags à ajouter
   */
  addTags(tags) {
    const tagArray = Array.isArray(tags) ? tags : [tags];
    this.tags.push(...tagArray);
  }

  /**
   * Valide le format des clozes
   * @returns {Object} Résultat de validation
   */
  validateClozes() {
    const clozeRegex = /\(\(c(\d+)::([^:]+?)(?::([^:]+?))?\)\)/g;
    const matches = [...this.clozeText.matchAll(clozeRegex)];
    const numbers = matches.map(match => parseInt(match[1]));
    const duplicates = numbers.filter((num, index) => numbers.indexOf(num) !== index);

    if (duplicates.length > 0) {
      return {
        valid: false,
        error: `Numéros de cloze dupliqués : ${duplicates.join(', ')}`,
      };
    }

    return {
      valid: true,
      clozeCount: numbers.length,
      clozes: matches.map(match => ({
        number: parseInt(match[1]),
        content: match[2],
        hint: match[3] || null,
      })),
    };
  }

  /**
   * Convertit en objet pour export
   */
  toObject() {
    return {
      id: this.id,
      text: this.text,
      clozeText: this.clozeText,
      media: this.media,
      tags: this.tags,
      notes: this.notes,
    };
  }
}
