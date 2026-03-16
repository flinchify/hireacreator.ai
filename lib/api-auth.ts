import { NextResponse } from "next/server";
import { validateApiKey } from "./api-keys";
import { checkRateLimit, getRateLimitHeaders, checkDailyCap, logApiRequest } from "./rate-limit";

type ApiKeyData = NonNullable<Awaited<ReturnType<typeof validateApiKey>>>;

type AuthResult =
  | { ok: true; key: ApiKeyData }
  | { ok: false; response: NextResponse };

/**
 * Authenticate and rate-limit an API request.
 * Returns either the validated key data or an error response.
 */
export async function authenticateApiRequest(
  request: Request,
  requiredScope: "read" | "write" | "book"
): Promise<AuthResult> {
  // Extract bearer token
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "missing_auth", message: "Include Authorization: Bearer <api_key> header." },
        { status: 401 }
      ),
    };
  }

  const token = authHeader.slice(7);
  const keyData = await validateApiKey(token);

  if (!keyData) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "invalid_key", message: "API key is invalid, revoked, or expired." },
        { status: 401 }
      ),
    };
  }

  // Check scope
  if (!keyData.scopes.includes(requiredScope) && !keyData.scopes.includes("*")) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "insufficient_scope",
          message: `This key does not have '${requiredScope}' scope. Current scopes: ${keyData.scopes.join(", ")}`,
        },
        { status: 403 }
      ),
    };
  }

  // Ownership verification required for write/book operations
  if ((requiredScope === "write" || requiredScope === "book") && !keyData.isVerified) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "verification_required",
          message: "Domain ownership verification is required for write and booking operations. Complete verification in your dashboard.",
        },
        { status: 403 }
      ),
    };
  }

  // Rate limit check (in-memory fast path)
  const rateLimitResult = checkRateLimit(keyData.keyId, keyData.tier, requiredScope);
  if (!rateLimitResult.allowed) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "rate_limited",
          message: `Rate limit exceeded. Retry after ${rateLimitResult.retryAfter}s.`,
          limit: rateLimitResult.limit,
          retryAfter: rateLimitResult.retryAfter,
        },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      ),
    };
  }

  // Daily cap check (DB-backed)
  const withinCap = await checkDailyCap(keyData.keyId, keyData.tier);
  if (!withinCap) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "daily_limit_exceeded",
          message: "Daily request cap exceeded. Upgrade your tier for higher limits.",
        },
        { status: 429 }
      ),
    };
  }

  // Log the request
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0";
  const url = new URL(request.url);
  await logApiRequest(keyData.keyId, url.pathname, ip).catch(() => {});

  return { ok: true, key: keyData };
}
