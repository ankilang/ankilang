// Netlify Function: Media Proxy
// Proxifie des médias cross-origin (ex: Votz) pour contourner CORS lors du téléchargement
// Sécurisé par une liste blanche stricte d'hôtes autorisés.

export const handler: import('@netlify/functions').Handler = async (event) => {
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
    return json(400, { error: 'Missing url parameter' })
  }

  let target: URL
  try {
    target = new URL(url)
  } catch {
    return json(400, { error: 'Invalid url parameter' })
  }

  // Whitelist stricte des hôtes autorisés
  const ALLOWED_HOSTS = new Set(['votz.eu'])
  if (!ALLOWED_HOSTS.has(target.hostname)) {
    return json(403, { error: 'Host not allowed' })
  }

  try {
    const upstream = await fetch(target.toString(), { method: 'GET' })

    if (!upstream.ok) {
      return json(upstream.status, { error: `Upstream error: ${upstream.status} ${upstream.statusText}` })
    }

    const arrayBuf = await upstream.arrayBuffer()
    const b64 = Buffer.from(arrayBuf).toString('base64')

    // Déterminer un Content-Type raisonnable
    const ct = upstream.headers.get('content-type') || guessContentType(target.pathname)
    const filename = filenameParam || guessFilename(target.pathname, ct)

    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        ...corsHeaders(),
        'Content-Type': ct,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${sanitizeFilename(filename)}"`,
      },
      body: b64,
    }
  } catch (err: any) {
    return json(500, { error: `Proxy failure: ${err?.message || 'unknown error'}` })
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
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

