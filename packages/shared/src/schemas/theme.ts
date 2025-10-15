import { z } from 'zod';

/**
 * Catégories de thèmes supportées
 */
export const ThemeCategorySchema = z.enum([
  'language',    // Apprentissage de langues (comportement actuel)
  'other'        // Tous les autres domaines (médecine, histoire, culture générale, etc.)
]);

/**
 * Schéma Zod pour un thème de flashcards
 * Un thème regroupe des cartes par domaine d'apprentissage
 */
export const ThemeSchema = z.object({
  id: z.string().min(1, 'ID du thème requis'),
  userId: z.string().min(1, 'ID utilisateur requis'),
  name: z.string().min(1, 'Nom du thème requis').max(128, 'Nom trop long'),
  category: ThemeCategorySchema.default('language'),
  targetLang: z.string().optional(), // Devient optionnel pour les catégories non-linguistiques
  subject: z.string().optional(), // Nouveau : matière/sujet pour les catégories spécialisées
  tags: z.array(z.string()).optional().default([]),
  cardCount: z.number().int().min(0).optional().default(0),
  shareStatus: z.enum(['private', 'community']).optional().default('private'),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional()
});

/**
 * Type TypeScript inféré du schéma Theme
 */
export type Theme = z.infer<typeof ThemeSchema>;

/**
 * Type pour la catégorie de thème
 */
export type ThemeCategory = z.infer<typeof ThemeCategorySchema>;

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
