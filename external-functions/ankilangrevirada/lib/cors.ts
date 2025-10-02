/**
 * Headers CORS sécurisés
 */
export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': 'https://ankilang.netlify.app',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Trace-Id',
    'Access-Control-Max-Age': '86400', // 24h cache pour preflight
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
  };
}
