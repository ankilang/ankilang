import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { problem } from "./problem";

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
 * Interface pour les événements avec authentification
 */
export interface AuthenticatedEvent extends HandlerEvent {
  user: JWTPayload;
}

/**
 * Middleware d'authentification JWT pour les fonctions Netlify
 */
export function withAuth(handler: Handler): Handler {
  return async (event: HandlerEvent, context: HandlerContext) => {
    try {
      // Extraire le token JWT du header Authorization
      const authHeader = event.headers.authorization || event.headers.Authorization;
      
      if (!authHeader) {
        return problem(401, "Authentication required", "Missing Authorization header");
      }

      // Vérifier le format Bearer
      if (!authHeader.startsWith("Bearer ")) {
        return problem(401, "Invalid authentication format", "Expected Bearer token");
      }

      const token = authHeader.substring(7);
      
      if (!token) {
        return problem(401, "Invalid token", "Empty token provided");
      }

      // Décoder et valider le JWT
      const payload = await validateJWT(token);
      
      if (!payload) {
        return problem(401, "Invalid token", "Token validation failed");
      }

      // Vérifier l'expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        return problem(401, "Token expired", "JWT has expired");
      }

      // Ajouter les informations utilisateur à l'événement
      const authenticatedEvent = {
        ...event,
        user: payload
      } as AuthenticatedEvent;

      // Ajouter le traceId si présent
      const traceId = event.headers['x-trace-id'] || event.headers['X-Trace-Id'] || generateTraceId();
      
      // Appeler le handler avec l'événement authentifié
      const response = await handler(authenticatedEvent, context);
      
      // Ajouter le traceId à la réponse
      if (response && response.headers) {
        response.headers['X-Trace-Id'] = traceId;
      }

      return response || {
        statusCode: 200,
        headers: { 'X-Trace-Id': traceId },
        body: 'OK'
      };
    } catch (error) {
      console.error('Auth middleware error:', error);
      return problem(500, "Authentication error", "Internal server error during authentication");
    }
  };
}

/**
 * Valide un JWT Appwrite
 * Note: Dans un environnement de production, vous devriez utiliser une bibliothèque
 * comme jsonwebtoken avec la clé publique Appwrite pour valider la signature
 */
async function validateJWT(token: string): Promise<JWTPayload | null> {
  try {
    // Pour l'instant, on fait un décodage simple du JWT
    // En production, il faudrait valider la signature avec la clé publique Appwrite
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(atob(parts[1]));
    
    // Vérifications basiques
    if (!payload.userId || !payload.email) {
      return null;
    }

    return payload as JWTPayload;
  } catch (error) {
    console.error('JWT validation error:', error);
    return null;
  }
}

/**
 * Génère un traceId unique
 */
function generateTraceId(): string {
  return `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Helper pour extraire l'userId d'un événement authentifié
 */
export function getUserId(event: AuthenticatedEvent): string {
  return event.user.userId;
}

/**
 * Helper pour vérifier si un utilisateur est authentifié
 */
export function isAuthenticated(event: HandlerEvent): event is AuthenticatedEvent {
  return Boolean(
    'user' in event && 
    event.user && 
    typeof event.user === 'object' && 
    'userId' in event.user &&
    typeof (event.user as any).userId === 'string'
  );
}
