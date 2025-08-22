import { z } from 'zod';

/**
 * Schéma Zod pour une carte de flashcard
 * Supporte les types Basic et Cloze (texte à trous)
 */
export const CardSchema = z.object({
  id: z.string().min(1, 'ID de la carte requis'),
  userId: z.string().min(1, 'ID utilisateur requis'),
  themeId: z.string().min(1, 'ID du thème requis'),
  type: z.enum(['basic', 'cloze'], {
    errorMap: () => ({ message: 'Type doit être "basic" ou "cloze"' })
  }),
  frontFR: z.string().optional(), // Texte français (pour Basic)
  backText: z.string().optional(), // Texte traduit (pour Basic)
  clozeTextTarget: z.string().optional(), // Texte avec {{cN::...}} (pour Cloze)
  extra: z.string().optional(), // Informations supplémentaires
  imageUrl: z.string().url().optional(), // URL de l'image
  audioUrl: z.string().url().optional(), // URL de l'audio
  tags: z.array(z.string()).optional().default([]),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional()
});

/**
 * Type TypeScript inféré du schéma Card
 */
export type Card = z.infer<typeof CardSchema>;

/**
 * Schéma pour une carte Basic (Front/Back)
 */
export const BasicCardSchema = CardSchema.extend({
  type: z.literal('basic'),
  frontFR: z.string().min(1, 'Texte français requis pour Basic'),
  backText: z.string().min(1, 'Texte traduit requis pour Basic')
});

/**
 * Type pour une carte Basic
 */
export type BasicCard = z.infer<typeof BasicCardSchema>;

/**
 * Schéma pour une carte Cloze (texte à trous)
 */
export const ClozeCardSchema = CardSchema.extend({
  type: z.literal('cloze'),
  clozeTextTarget: z.string().min(1, 'Texte à trous requis pour Cloze').refine(
    (text) => /\{\{c\d+::[^}]+\}\}/.test(text),
    'Texte Cloze doit contenir au moins un trou {{cN::...}}'
  )
});

/**
 * Type pour une carte Cloze
 */
export type ClozeCard = z.infer<typeof ClozeCardSchema>;

/**
 * Schéma pour la création d'une carte (sans id et timestamps)
 */
export const CreateCardSchema = CardSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true
});

/**
 * Type pour la création d'une carte
 */
export type CreateCard = z.infer<typeof CreateCardSchema>;

/**
 * Schéma pour la mise à jour d'une carte
 */
export const UpdateCardSchema = CreateCardSchema.partial();

/**
 * Type pour la mise à jour d'une carte
 */
export type UpdateCard = z.infer<typeof UpdateCardSchema>;

/**
 * Union type pour tous les types de cartes
 */
export type AnyCard = BasicCard | ClozeCard;
