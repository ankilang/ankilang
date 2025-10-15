// Types partagés pour éviter les problèmes de workspace dans Cloudflare Pages
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
  imageUrlType: z.enum(['appwrite', 'external']).optional().default('external'), // Type de source d'image
  audioUrl: z.string().url().optional(), // URL de l'audio (pour lecture rapide/export)
  audioFileId: z.string().nullable().optional(), // ID du fichier dans le bucket Appwrite
  audioMime: z.string().nullable().optional(), // Type MIME de l'audio (ex: audio/mpeg)
  targetLanguage: z.string().optional(), // Langue cible pour l'audio (ex: 'fr', 'de', 'oc')
  tags: z.array(z.string()).optional().default([]),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  
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

/**
 * Catégories de thèmes supportées
 */
export const ThemeCategorySchema = z.enum([
  'language',    // Apprentissage de langues (comportement actuel)
  'other'        // Tous les autres domaines (médecine, histoire, culture générale, etc.)
]);

/**
 * Schéma Zod pour un thème
 */
export const ThemeSchema = z.object({
  id: z.string().min(1, 'ID du thème requis'),
  userId: z.string().min(1, 'ID utilisateur requis'),
  name: z.string().min(1, 'Nom du thème requis'),
  category: ThemeCategorySchema.default('language'),
  targetLang: z.string().optional(), // Devient optionnel pour les catégories non-linguistiques
  subject: z.string().optional(), // Nouveau : matière/sujet pour les catégories spécialisées
  cardCount: z.number().int().min(0).default(0),
  shareStatus: z.enum(['private', 'public']).default('private'),
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
 * Schéma pour la création d'un thème
 */
export const CreateThemeSchema = ThemeSchema.omit({
  id: true,
  userId: true,
  cardCount: true,
  createdAt: true,
  updatedAt: true
}).extend({
  shareStatus: z.enum(['private', 'public']).default('private')
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

/**
 * Interface pour les cartes Appwrite (avec propriétés Appwrite)
 */
export interface AppwriteCard {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  themeId: string;
  type: 'basic' | 'cloze';
  frontFR?: string;
  backText?: string;
  clozeTextTarget?: string;
  extra?: string;
  imageUrl?: string;
  audioUrl?: string;
  audioFileId?: string | null;
  audioMime?: string | null;
  tags?: string[];
}

/**
 * Interface pour les thèmes Appwrite (avec propriétés Appwrite)
 */
export interface AppwriteTheme {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  name: string;
  targetLang: string;
  cardCount: number;
  shareStatus: 'private' | 'public';
}

/**
 * Interface pour l'authentification
 */
export interface AuthUser {
  $id: string;
  name?: string;
  email: string;
  emailVerification: boolean;
  phone?: string;
  phoneVerification: boolean;
  prefs: Record<string, any>;
  registration: string;
  lastLogin: string;
  labels: string[];
}

/**
 * Interface pour la réponse d'authentification
 */
export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

/**
 * Schémas d'authentification
 */
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe trop court')
});

export const signupSchema = z.object({
  name: z.string().min(2, 'Nom trop court'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe trop court')
});

export type LoginData = z.infer<typeof loginSchema>;
export type SignupData = z.infer<typeof signupSchema>;


