import { z } from 'zod';

/**
 * Schéma Zod pour un thème de flashcards
 * Un thème regroupe des cartes par langue cible
 */
export const ThemeSchema = z.object({
  id: z.string().min(1, 'ID du thème requis'),
  userId: z.string().min(1, 'ID utilisateur requis'),
  name: z.string().min(1, 'Nom du thème requis').max(128, 'Nom trop long'),
  targetLang: z.string().min(2, 'Langue cible requise').max(10, 'Code langue trop long'),
  tags: z.array(z.string()).optional().default([]),
  cardCount: z.number().int().min(0).optional().default(0),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional()
});

/**
 * Type TypeScript inféré du schéma Theme
 */
export type Theme = z.infer<typeof ThemeSchema>;

/**
 * Schéma pour la création d'un thème (sans id et timestamps)
 */
export const CreateThemeSchema = ThemeSchema.omit({
  id: true,
  userId: true,
  cardCount: true,
  createdAt: true,
  updatedAt: true
});

/**
 * Type pour la création d'un thème
 */
export type CreateTheme = z.infer<typeof CreateThemeSchema>;

/**
 * Schéma pour la mise à jour d'un thème
 */
export const UpdateThemeSchema = CreateThemeSchema.partial();

/**
 * Type pour la mise à jour d'un thème
 */
export type UpdateTheme = z.infer<typeof UpdateThemeSchema>;
