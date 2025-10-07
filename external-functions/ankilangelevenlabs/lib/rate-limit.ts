/**
 * Rate limiting simple en mémoire
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(userId: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const key = `rate_limit_${userId}`;
  const current = rateLimitStore.get(key);

  if (!current || now > current.resetTime) {
    // Nouvelle fenêtre ou première requête
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= maxRequests) {
    return false; // Rate limit dépassé
  }

  // Incrémenter le compteur
  current.count++;
  rateLimitStore.set(key, current);
  return true;
}
