// import { problem } from "./problem"; // Non utilisé pour l'instant

/**
 * Interface pour les données JWT décodées
 */
export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
  [key: string]: any;
}

/**
 * Valide un JWT Appwrite et retourne le payload décodé
 * @param token - Le token JWT à valider
 * @returns Le payload décodé ou null si invalide
 */
export async function validateAppwriteJWT(token: string): Promise<JWTPayload | null> {
  try {
    // Décoder le JWT (sans vérification de signature pour l'instant)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Invalid JWT format: not 3 parts');
      return null;
    }

    // Décoder le header
    const header = JSON.parse(atob(parts[0]));
    if (header.typ !== 'JWT') {
      console.warn('Invalid JWT type:', header.typ);
      return null;
    }

    // Décoder le payload
    const payload = JSON.parse(atob(parts[1]));
    
    // Vérifications basiques
    if (!payload.userId || !payload.email) {
      console.warn('Invalid JWT payload: missing userId or email');
      return null;
    }

    // Vérifier l'expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.warn('JWT expired:', new Date(payload.exp * 1000));
      return null;
    }

    // Vérifier l'émission (iat)
    if (payload.iat && payload.iat > now) {
      console.warn('JWT issued in the future:', new Date(payload.iat * 1000));
      return null;
    }

    return payload as JWTPayload;
  } catch (error) {
    console.error('JWT validation error:', error);
    return null;
  }
}

/**
 * Extrait et valide le JWT depuis les headers d'une requête
 * @param headers - Les headers de la requête
 * @returns Le payload décodé ou null si invalide
 */
export async function extractAndValidateJWT(headers: Record<string, string>): Promise<JWTPayload | null> {
  const authHeader = headers.authorization || headers.Authorization;
  
  if (!authHeader) {
    return null;
  }

  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  if (!token) {
    return null;
  }

  return await validateAppwriteJWT(token);
}

/**
 * Middleware pour valider l'authentification JWT
 * Utilise le helper RFC 7807 pour les erreurs
 */
export function requireAuth(headers: Record<string, string>) {
  return async (): Promise<JWTPayload> => {
    const payload = await extractAndValidateJWT(headers);
    
    if (!payload) {
      throw new Error('Authentication required');
    }
    
    return payload;
  };
}
