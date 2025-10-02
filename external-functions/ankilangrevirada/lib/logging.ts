/**
 * Logging structuré avec traceId
 */
export function logRequest(traceId: string, userId: string, action: string, details?: any) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    traceId,
    userId,
    action,
    details,
    level: 'info'
  }));
}

export function logError(traceId: string, userId: string, error: Error, context?: any) {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    traceId,
    userId,
    error: error.message,
    stack: error.stack,
    context,
    level: 'error'
  }));
}
