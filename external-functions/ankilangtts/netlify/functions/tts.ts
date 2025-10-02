import type { Handler } from "@netlify/functions";
import { withAuth, getUserId, type AuthenticatedEvent } from "./lib/auth";
import { problem } from "./lib/problem";
import { corsHeaders } from "./lib/cors";
import { checkRateLimit } from "./lib/rate-limit";
import { logRequest, logError } from "./lib/logging";

/**
 * TTS multilingue - Fonction sécurisée
 */
const ttsHandler = async (event: AuthenticatedEvent) => {
  const traceId = event.headers['x-trace-id'] || 'no-trace';
  const userId = getUserId(event);
  
  try {
    // Vérifier le rate limiting
    if (!checkRateLimit(userId, 100, 3600000)) { // 100 req/heure
      return problem(429, "Rate limit exceeded", "Too many requests");
    }
    
    logRequest(traceId, userId, 'tts_request', {
      method: event.httpMethod,
      path: event.path
    });
    
    // Parse du body
    const body = JSON.parse(event.body || '{}');
    
    // TODO: Implémenter la logique métier spécifique à ankilangtts
    // Exemple pour revirada:
    // const { text, targetLang } = body;
    // const result = await translateOccitan(text, targetLang);
    
    const result = {
      success: true,
      message: 'TTS multilingue processed successfully',
      traceId,
      userId
    };
    
    logRequest(traceId, userId, 'tts_success', { result });
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(),
        'X-Trace-Id': traceId,
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    logError(traceId, userId, error as Error, { function: 'tts' });
    return problem(500, "Internal server error", "An error occurred processing the request");
  }
};

// Exporter la fonction avec le middleware d'authentification
export const handler = withAuth(ttsHandler);
