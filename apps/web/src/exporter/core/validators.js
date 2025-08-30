import { z } from 'zod';

// Schéma pour une entrée linguistique de base
export const LanguageEntrySchema = z.object({
  expression: z.string().min(1, "L'expression ne peut pas être vide"),
  meaning: z.string().min(1, "La signification ne peut pas être vide"),
  clozeExpression: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  audio: z.string().optional(),
  image: z.string().optional(),
});

// Schéma pour les options de cloze
export const ClozeOptionsSchema = z.object({
  showBefore: z.enum(["all", "none"]).or(z.number().positive()),
  showAfter: z.enum(["all", "none"]).or(z.number().positive()),
  replaceChar: z.string().length(1, "Le caractère de remplacement doit être un seul caractère"),
  replaceSameLength: z.boolean().default(false),
  alwaysShowBlanks: z.boolean().default(false),
  blanksFormat: z.string().default("[{blanks}]"),
  hintFormat: z.string().default("[{hint}]"),
  blanksAndHintFormat: z.string().default("[{blanks}|{hint}]"),
});

// Schéma pour la configuration du deck
export const DeckConfigSchema = z.object({
  name: z.string().min(1, "Le nom du deck ne peut pas être vide"),
  description: z.string().optional(),
  cardModel: z.enum(["basic", "cloze", "production", "custom"]),
  clozeOptions: ClozeOptionsSchema.optional(),
  includeReversed: z.boolean().default(true),
  includeCloze: z.boolean().default(true),
});

// Schéma pour les données d'import
export const ImportDataSchema = z.object({
  entries: z.array(LanguageEntrySchema),
  config: DeckConfigSchema,
});

// Schéma pour les erreurs RFC 7807
export const ErrorSchema = z.object({
  type: z.string().url().optional(),
  title: z.string(),
  status: z.number(),
  detail: z.string().optional(),
  instance: z.string().optional(),
  errors: z.array(z.object({
    field: z.string(),
    message: z.string(),
  })).optional(),
});

// Fonction utilitaire pour créer des erreurs RFC 7807
export function createError(title, status = 400, detail = null, errors = null) {
  return {
    type: "https://ankilang-exporter.com/errors",
    title,
    status,
    detail,
    instance: window.location.href,
    errors,
  };
}

// Fonction pour valider les données d'entrée
export function validateLanguageData(data) {
  try {
    return {
      success: true,
      data: LanguageEntrySchema.parse(data),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: createError(
          "Données invalides",
          400,
          "Les données fournies ne respectent pas le schéma attendu",
          error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          }))
        ),
      };
    }
    return {
      success: false,
      error: createError("Erreur de validation", 500, error.message),
    };
  }
}

// Fonction pour valider la configuration du deck
export function validateDeckConfig(config) {
  try {
    return {
      success: true,
      data: DeckConfigSchema.parse(config),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: createError(
          "Configuration invalide",
          400,
          "La configuration du deck ne respecte pas le schéma attendu",
          error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          }))
        ),
      };
    }
    return {
      success: false,
      error: createError("Erreur de validation", 500, error.message),
    };
  }
}
