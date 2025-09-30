import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'Adresse e-mail invalide.' }),
  password: z
    .string()
    .min(8, { message: 'Le mot de passe doit faire au moins 8 caractères.' }),
});

export const signupSchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit faire au moins 2 caractères.' }),
  email: z.string().email({ message: 'Adresse e-mail invalide.' }),
  password: z
    .string()
    .min(8, { message: 'Le mot de passe doit faire au moins 8 caractères.' }),
});

export type LoginData = z.infer<typeof loginSchema>;
export type SignupData = z.infer<typeof signupSchema>;
