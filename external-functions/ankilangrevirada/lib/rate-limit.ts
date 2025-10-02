/**
 * Rate limiting par utilisateur
 */
const rateLimit = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(userId: string, limit: number = 100, windowMs: number = 3600000): boolean {
  const now = Date.now();
  const userLimit = rateLimit.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimit.set(userId, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (userLimit.count >= limit) {
    return false;
  }
  
  userLimit.count++;
  return true;
}
