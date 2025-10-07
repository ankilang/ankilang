/**
 * Helper pour créer des réponses d'erreur au format RFC 7807
 */
export function problem(
  status: number,
  title: string,
  detail?: string,
  type?: string
) {
  const traceId = `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    statusCode: status,
    headers: {
      'Content-Type': 'application/problem+json',
      'X-Trace-Id': traceId,
    },
    body: JSON.stringify({
      type: type || `https://ankilang.netlify.app/problems/${status}`,
      title,
      detail,
      status,
      traceId,
    }),
  };
}
