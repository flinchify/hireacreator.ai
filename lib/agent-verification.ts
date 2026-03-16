import { getDb } from "./db";
import crypto from "crypto";

function generateToken(): string {
  return "hca-verify-" + crypto.randomBytes(24).toString("hex");
}

export async function initiateVerification(
  userId: string,
  domain: string,
  method: "dns" | "meta_tag" | "email"
) {
  const sql = getDb();

  // Normalize domain
  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();

  // Check for existing pending verification for this domain
  const existing = await sql`
    SELECT id FROM agent_verifications
    WHERE user_id = ${userId} AND domain = ${cleanDomain} AND status = 'pending' AND expires_at > NOW()
  `;

  if (existing.length > 0) {
    // Return existing verification
    const row = await sql`
      SELECT id, method, domain, verification_token, status, expires_at
      FROM agent_verifications WHERE id = ${existing[0].id}
    `;
    return row[0];
  }

  const token = generateToken();

  const result = await sql`
    INSERT INTO agent_verifications (user_id, method, domain, verification_token)
    VALUES (${userId}, ${method}, ${cleanDomain}, ${token})
    RETURNING id, method, domain, verification_token, status, expires_at
  `;

  return result[0];
}

export async function checkVerification(verificationId: string, userId: string) {
  const sql = getDb();

  const rows = await sql`
    SELECT id, method, domain, verification_token, status, attempts, max_attempts, expires_at
    FROM agent_verifications
    WHERE id = ${verificationId} AND user_id = ${userId}
  `;

  if (rows.length === 0) return { error: "not_found" };

  const v = rows[0];

  if (v.status === "verified") return { status: "verified", domain: v.domain };
  if (new Date(v.expires_at) < new Date()) {
    await sql`UPDATE agent_verifications SET status = 'expired' WHERE id = ${v.id}`;
    return { error: "expired" };
  }
  if (v.attempts >= v.max_attempts) {
    await sql`UPDATE agent_verifications SET status = 'failed' WHERE id = ${v.id}`;
    return { error: "max_attempts" };
  }

  // Increment attempt counter
  await sql`UPDATE agent_verifications SET attempts = attempts + 1 WHERE id = ${v.id}`;

  let verified = false;

  try {
    if (v.method === "dns") {
      verified = await verifyDns(v.domain, v.verification_token);
    } else if (v.method === "meta_tag") {
      verified = await verifyMetaTag(v.domain, v.verification_token);
    } else if (v.method === "email") {
      // Email verification handled separately via code flow
      return { status: "pending", message: "Check your domain email for the verification code." };
    }
  } catch {
    return { status: "pending", message: "Verification check failed. Try again." };
  }

  if (verified) {
    await sql`
      UPDATE agent_verifications SET status = 'verified', verified_at = NOW() WHERE id = ${v.id}
    `;
    // Mark user as verified
    await sql`UPDATE users SET is_verified = true WHERE id = ${userId}`;
    return { status: "verified", domain: v.domain };
  }

  return {
    status: "pending",
    attemptsRemaining: v.max_attempts - v.attempts - 1,
    instructions: getInstructions(v.method, v.domain, v.verification_token),
  };
}

async function verifyDns(domain: string, token: string): Promise<boolean> {
  // Check TXT record: _hireacreator.{domain} = {token}
  try {
    const { resolve } = await import("dns/promises");
    const records = await resolve(`_hireacreator.${domain}`, "TXT");
    return records.some((r) => r.join("").includes(token));
  } catch {
    return false;
  }
}

async function verifyMetaTag(domain: string, token: string): Promise<boolean> {
  // Fetch the domain's homepage and look for meta tag
  try {
    const res = await fetch(`https://${domain}`, {
      headers: { "User-Agent": "HireACreator-Verify/1.0" },
      signal: AbortSignal.timeout(10000),
    });
    const html = await res.text();
    // Look for: <meta name="hireacreator-verification" content="{token}" />
    return html.includes(`content="${token}"`) && html.includes("hireacreator-verification");
  } catch {
    return false;
  }
}

function getInstructions(method: string, domain: string, token: string) {
  if (method === "dns") {
    return {
      type: "dns",
      record: "TXT",
      host: `_hireacreator.${domain}`,
      value: token,
      note: "Add this TXT record to your DNS. It may take up to 24 hours to propagate.",
    };
  }
  if (method === "meta_tag") {
    return {
      type: "meta_tag",
      tag: `<meta name="hireacreator-verification" content="${token}" />`,
      location: `https://${domain} — inside the <head> section`,
      note: "Add this meta tag to your homepage's HTML head.",
    };
  }
  return {
    type: "email",
    email: `admin@${domain}`,
    note: "We'll send a verification code to this address.",
  };
}

export async function getVerificationStatus(userId: string) {
  const sql = getDb();
  return sql`
    SELECT id, method, domain, status, verified_at, expires_at, created_at
    FROM agent_verifications WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
}
