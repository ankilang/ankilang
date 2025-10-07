/**
 * Logging sécurisé (sans PII)
 */
export function logRequest(traceId: string, userId: string, action: string, data?: any) {
  console.log(`[${traceId}] ${action}`, {
    userId: userId.substring(0, 8) + '...', // Masquer l'ID complet
    action,
    timestamp: new Date().toISOString(),
    ...data
  });
}

export function logError(traceId: string, userId: string, error: Error, context?: any) {
  console.error(`[${traceId}] ERROR`, {
    userId: userId.substring(0, 8) + '...',
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...context
  });
}
