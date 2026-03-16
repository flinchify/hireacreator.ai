import { getDb } from "./db";

// In-memory sliding window for fast path (backed by DB for persistence)
const windowStore = new Map<string, { count: number; resetAt: number }>();

const TIER_LIMITS: Record<string, { readPerMin: number; writePerMin: number; bookPerHour: number; dailyCap: number }> = {
  free:       { readPerMin: 60,   writePerMin: 10,  bookPerHour: 5,   dailyCap: 100 },
  pro:        { readPerMin: 1000, writePerMin: 100, bookPerHour: 50,  dailyCap: 10000 },
  enterprise: { readPerMin: 5000, writePerMin: 500, bookPerHour: 500, dailyCap: 100000 },
};

type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
};

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(Math.max(0, result.remaining)),
    "X-RateLimit-Reset": String(result.resetAt),
  };
  if (!result.allowed && result.retryAfter) {
    headers["Retry-After"] = String(result.retryAfter);
  }
  return headers;
}

export function checkRateLimit(
  keyId: string,
  tier: string,
  scope: "read" | "write" | "book"
): RateLimitResult {
  const limits = TIER_LIMITS[tier] || TIER_LIMITS.free;
  const windowMs = scope === "book" ? 3600_000 : 60_000;
  const limit =
    scope === "read" ? limits.readPerMin :
    scope === "write" ? limits.writePerMin :
    limits.bookPerHour;

  const windowKey = `${keyId}:${scope}`;
  const now = Date.now();
  const entry = windowStore.get(windowKey);

  if (!entry || now > entry.resetAt) {
    // New window
    windowStore.set(windowKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true, limit, remaining: limit - 1, resetAt: Math.ceil((now + windowMs) / 1000) };
  }

  entry.count++;
  const remaining = limit - entry.count;
  const resetAt = Math.ceil(entry.resetAt / 1000);

  if (entry.count > limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, limit, remaining: 0, resetAt, retryAfter };
  }

  return { allowed: true, limit, remaining, resetAt };
}

// Daily cap check (DB-backed)
export async function checkDailyCap(keyId: string, tier: string): Promise<boolean> {
  const limits = TIER_LIMITS[tier] || TIER_LIMITS.free;
  const sql = getDb();
  const result = await sql`
    SELECT COUNT(*)::int AS cnt FROM rate_limit_log
    WHERE api_key_id = ${keyId} AND created_at > NOW() - INTERVAL '24 hours'
  `;
  return (result[0]?.cnt || 0) < limits.dailyCap;
}

// Log request to DB for audit/persistence
export async function logApiRequest(keyId: string, endpoint: string, ip: string) {
  const sql = getDb();
  await sql`
    INSERT INTO rate_limit_log (api_key_id, endpoint, ip_address) VALUES (${keyId}, ${endpoint}, ${ip})
  `;
}
