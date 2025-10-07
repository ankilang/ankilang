import type { Handler, Context } from "@netlify/functions";
import { problem } from "./problem";

export interface AuthenticatedEvent {
  httpMethod: string;
  path: string;
  headers: Record<string, string>;
  body: string | null;
  queryStringParameters: Record<string, string> | null;
  multiValueQueryStringParameters: Record<string, string[]> | null;
  isBase64Encoded: boolean;
  requestContext: {
    requestId: string;
    http: {
      method: string;
      path: string;
      protocol: string;
      sourceIp: string;
      userAgent: string;
    };
  };
}

/**
 * Middleware d'authentification JWT Appwrite
 */
export const withAuth = (handler: (event: AuthenticatedEvent) => Promise<any>) => {
  return async (event: any, context: Context) => {
    // Gérer les requêtes OPTIONS (CORS preflight)
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Trace-Id',
          'Access-Control-Max-Age': '86400',
        },
        body: '',
      };
    }

    try {
      // Vérifier la présence du token JWT
      const authHeader = event.headers.authorization || event.headers.Authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return problem(401, "Unauthorized", "Missing or invalid authorization header");
      }

      const token = authHeader.substring(7);
      if (!token) {
        return problem(401, "Unauthorized", "Missing JWT token");
      }

      // TODO: Valider le JWT avec Appwrite (pour l'instant, on fait confiance)
      // En production, il faudrait vérifier la signature du JWT
      
      return await handler(event as AuthenticatedEvent);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return problem(500, "Internal server error", "Authentication failed");
    }
  };
};

/**
 * Extrait l'ID utilisateur du JWT (simplifié pour le développement)
 */
export function getUserId(event: AuthenticatedEvent): string {
  // TODO: Parser le JWT pour extraire l'ID utilisateur
  // Pour l'instant, on retourne un ID factice
  return 'dev-user-123';
}
