// In-memory rate limiter for login/auth endpoints
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 10; // 10 attempts per window
const LOCKOUT_MS = 30 * 60 * 1000; // 30 min lockout after exceeding

const lockouts = new Map<string, number>();

export function checkLoginRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
} {
  const now = Date.now();

  // Check lockout
  const lockoutUntil = lockouts.get(identifier);
  if (lockoutUntil && now < lockoutUntil) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((lockoutUntil - now) / 1000),
    };
  }
  if (lockoutUntil && now >= lockoutUntil) {
    lockouts.delete(identifier);
  }

  const entry = loginAttempts.get(identifier);

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  entry.count++;

  if (entry.count > MAX_ATTEMPTS) {
    // Trigger lockout
    lockouts.set(identifier, now + LOCKOUT_MS);
    loginAttempts.delete(identifier);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil(LOCKOUT_MS / 1000),
    };
  }

  return { allowed: true, remaining: MAX_ATTEMPTS - entry.count };
}

// IP-based rate limit (stricter)
const ipAttempts = new Map<string, { count: number; resetAt: number }>();
const IP_MAX = 30; // 30 per IP per window (multiple users may share IP)

export function checkIpRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    ipAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  entry.count++;
  return entry.count <= IP_MAX;
}
