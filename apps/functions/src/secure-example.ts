import { withAuth, getUserId, type AuthenticatedEvent } from "./lib/auth";
import { problem } from "./lib/problem";

/**
 * Exemple de fonction Netlify sécurisée avec authentification JWT
 * Cette fonction démontre l'utilisation du middleware d'authentification
 */
const secureHandler = async (event: AuthenticatedEvent) => {
  try {
    // L'utilisateur est déjà authentifié grâce au middleware withAuth
    const userId = getUserId(event);
    
    console.log(`[${event.headers['x-trace-id'] || 'no-trace'}] Secure function called by user: ${userId}`);
    
    // Logique métier sécurisée
    const result = {
      message: "Fonction sécurisée exécutée avec succès",
      userId,
      timestamp: new Date().toISOString(),
      traceId: event.headers['x-trace-id'] || 'no-trace'
    };
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Trace-Id': result.traceId,
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Secure function error:', error);
    return problem(500, "Internal server error", "An error occurred processing the request");
  }
};

// Exporter la fonction avec le middleware d'authentification
export const handler = withAuth(secureHandler as any);
