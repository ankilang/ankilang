// Netlify Function: Media Proxy
// Proxifie des médias cross-origin (ex: Votz) pour contourner CORS lors du téléchargement
// Sécurisé par une liste blanche stricte d'hôtes autorisés.

export const handler: import('@netlify/functions').Handler = async (event) => {
  // Générer un traceId pour cette requête
  const traceId = event.headers['x-trace-id'] || `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  console.log(`[${traceId}] Media proxy request: ${event.httpMethod} ${event.path}`);
  
  // Validation CORS stricte
  const origin = event.headers.origin || event.headers.Origin;
  if (origin && !isAllowedOrigin(origin)) {
    console.warn(`[${traceId}] Blocked request from unauthorized origin: ${origin}`);
    return {
      statusCode: 403,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Origin not allowed' }),
    };
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders(),
      body: '',
    }
  }

  const url = event.queryStringParameters?.url
  const filenameParam = event.queryStringParameters?.filename

  if (!url) {
    console.warn(`[${traceId}] Missing url parameter`);
    return json(400, { error: 'Missing url parameter' })
  }

  let target: URL
  try {
    target = new URL(url)
  } catch {
    return json(400, { error: 'Invalid url parameter' })
  }

  // Whitelist stricte des hôtes autorisés
  const ALLOWED_HOSTS = new Set(['votz.eu', 'fra.cloud.appwrite.io'])
  const isAppwriteDomain = target.hostname.endsWith('.appwrite.io')
  
  if (!ALLOWED_HOSTS.has(target.hostname) && !isAppwriteDomain) {
    return json(403, { error: 'Host not allowed' })
  }

  try {
    console.log(`[${traceId}] Fetching media from: ${target.toString()}`);
    
    const upstream = await fetch(target.toString(), { 
      method: 'GET',
      headers: {
        'User-Agent': 'Ankilang-Media-Proxy/1.0',
      }
    });

    if (!upstream.ok) {
      console.error(`[${traceId}] Upstream error: ${upstream.status} ${upstream.statusText}`);
      return json(upstream.status, { error: `Upstream error: ${upstream.status} ${upstream.statusText}` })
    }

    const arrayBuf = await upstream.arrayBuffer()
    const b64 = Buffer.from(arrayBuf).toString('base64')

    // Déterminer un Content-Type raisonnable
    const ct = upstream.headers.get('content-type') || guessContentType(target.pathname)
    const filename = filenameParam || guessFilename(target.pathname, ct)

    console.log(`[${traceId}] Successfully proxied media: ${filename} (${arrayBuf.byteLength} bytes, ${ct})`);

    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        ...corsHeaders(),
        'Content-Type': ct,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${sanitizeFilename(filename)}"`,
        'X-Trace-Id': traceId,
      },
      body: b64,
    }
  } catch (err: any) {
    console.error(`[${traceId}] Proxy failure:`, err);
    return json(500, { error: `Proxy failure: ${err?.message || 'unknown error'}` })
  }
}

function corsHeaders() {
  // Origines autorisées (à configurer selon l'environnement)
  const allowedOrigins = [
    'http://localhost:5173',  // Dev local
    'http://localhost:3000',   // Dev alternatif
    'https://ankilang.netlify.app',  // Production Netlify
    'https://ankilang.com',    // Domaine de production
    'https://ankilang.pages.dev',  // Production Cloudflare Pages
  ];
  
  // En production, utiliser l'origine spécifique au lieu de *
  const origin = process.env.NODE_ENV === 'production' 
    ? 'https://ankilang.pages.dev'  // Cloudflare Pages par défaut
    : '*';
  
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Trace-Id',
    'Access-Control-Max-Age': '86400', // 24h cache pour preflight
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
  }
}

function json(statusCode: number, data: any) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    body: JSON.stringify(data),
  }
}

function guessContentType(pathname: string): string {
  const lower = pathname.toLowerCase()
  if (lower.endsWith('.mp3')) return 'audio/mpeg'
  if (lower.endsWith('.wav')) return 'audio/wav'
  if (lower.endsWith('.ogg')) return 'audio/ogg'
  // Cas Votz: pas d'extension → mp3
  return 'audio/mpeg'
}

function guessFilename(pathname: string, contentType: string): string {
  const base = pathname.split('/').pop() || 'audio'
  const sanitized = sanitizeFilename(base)
  const ext = contentTypeToExt(contentType)
  return sanitized.includes('.') ? sanitized : `${sanitized}.${ext}`
}

function contentTypeToExt(ct: string): string {
  const map: Record<string, string> = {
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg',
  }
  return map[ct] || 'bin'
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

/**
 * Valide si une origine est autorisée
 */
function isAllowedOrigin(origin: string): boolean {
  const allowedOrigins = [
    'http://localhost:5173',  // Dev local
    'http://localhost:3000',   // Dev alternatif
    'https://ankilang.netlify.app',  // Production Netlify
    'https://ankilang.com',    // Domaine de production
    'https://ankilang.pages.dev',  // Production Cloudflare Pages
  ];
  
  return allowedOrigins.includes(origin);
}

