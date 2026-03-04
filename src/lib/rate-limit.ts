interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitResult {
  ok: boolean;
  remaining: number;
}

export function createRateLimiter(maxRequests = 5, windowMs = 60_000) {
  const map = new Map<string, RateLimitEntry>();

  return function checkRateLimit(ip: string): RateLimitResult {
    const now = Date.now();
    const entry = map.get(ip);

    if (!entry || now > entry.resetTime) {
      map.set(ip, { count: 1, resetTime: now + windowMs });
      return { ok: true, remaining: maxRequests - 1 };
    }

    entry.count++;
    if (entry.count > maxRequests) {
      return { ok: false, remaining: 0 };
    }

    return { ok: true, remaining: maxRequests - entry.count };
  };
}
