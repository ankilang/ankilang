export const cacheLog = {
  hit: (a: string, k: string) => console.log(`[Cache][${a}] HIT: ${k}`),
  // MISS: réduire le bruit → debug au lieu de log
  miss: (a: string, k: string) => console.debug(`[Cache][${a}] MISS: ${k}`),
  set: (a: string, k: string, ttl?: number) =>
    console.log(`[Cache][${a}] SET: ${k}${ttl ? ` ttl=${ttl}ms` : ''}`),
  del: (a: string, k: string) => console.log(`[Cache][${a}] DEL: ${k}`)
};
