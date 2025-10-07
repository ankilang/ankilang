import type { Handler } from "@netlify/functions";
import { withAuth, getUserId, type AuthenticatedEvent } from "../lib/auth";
import { problem } from "../lib/problem";
import { corsHeaders } from "../lib/cors";
import { checkRateLimit } from "../lib/rate-limit";
import { logRequest, logError } from "../lib/logging";

/**
 * ElevenLabs TTS - Fonction sécurisée
 */
const elevenlabsHandler = async (event: AuthenticatedEvent) => {
  const traceId = event.headers['x-trace-id'] || 'no-trace';
  const userId = getUserId(event);
  
  try {
    // Vérifier le rate limiting
    if (!checkRateLimit(userId, 50, 3600000)) { // 50 req/heure
      return problem(429, "Rate limit exceeded", "Too many TTS requests");
    }
    
    logRequest(traceId, userId, 'elevenlabs_request', {
      method: event.httpMethod,
      path: event.path
    });
    
    // Parse du body
    const body = JSON.parse(event.body || '{}');
    const { text, voice_id, model_id, language_code, voice_settings, output_format, save_to_storage } = body;
    
    if (!text || !voice_id) {
      return problem(400, "Bad Request", "Missing required fields: text, voice_id");
    }

    // TODO: Implémenter l'intégration ElevenLabs réelle
    // Pour l'instant, on simule une réponse
    const mockAudio = btoa("mock-audio-data-for-development");
    
    const result = {
      audio: mockAudio,
      contentType: 'audio/mpeg',
      size: mockAudio.length,
      duration: 2.5,
      fileUrl: save_to_storage ? `https://mock-storage.com/audio/${Date.now()}.mp3` : undefined,
      fileId: save_to_storage ? `file_${Date.now()}` : undefined
    };
    
    logRequest(traceId, userId, 'elevenlabs_success', { 
      textLength: text.length,
      voiceId: voice_id,
      language: language_code 
    });
    
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
    logError(traceId, userId, error as Error, { function: 'elevenlabs' });
    return problem(500, "Internal server error", "An error occurred processing the TTS request");
  }
};

// Exporter la fonction avec le middleware d'authentification
export const handler = withAuth(elevenlabsHandler);
