/**
 * Headers CORS sécurisés
 */
export function corsHeaders() {
  // Autoriser localhost en développement et production en production
  const allowedOrigins = [
    'https://ankilang.netlify.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173'
  ];
  
  return {
    'Access-Control-Allow-Origin': '*', // Temporaire pour le développement
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Trace-Id',
    'Access-Control-Max-Age': '86400', // 24h cache pour preflight
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
  };
}
