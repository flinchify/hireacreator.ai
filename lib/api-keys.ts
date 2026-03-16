import { getDb } from "./db";
import crypto from "crypto";

const KEY_PREFIX = "hca_";

function generateKey(): string {
  return KEY_PREFIX + crypto.randomBytes(32).toString("hex");
}

function hashKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

function getPrefix(key: string): string {
  return key.slice(0, 12); // "hca_" + first 8 hex chars
}

export async function createApiKey(
  userId: string,
  name: string = "Default",
  tier: string = "free",
  scopes: string[] = ["read"]
): Promise<{ key: string; keyId: string; prefix: string }> {
  const sql = getDb();
  const key = generateKey();
  const hash = hashKey(key);
  const prefix = getPrefix(key);

  const result = await sql`
    INSERT INTO api_keys (user_id, name, key_prefix, key_hash, tier, scopes)
    VALUES (${userId}, ${name}, ${prefix}, ${hash}, ${tier}, ${scopes})
    RETURNING id
  `;

  return { key, keyId: result[0].id, prefix };
}

export async function validateApiKey(key: string) {
  if (!key.startsWith(KEY_PREFIX)) return null;

  const sql = getDb();
  const hash = hashKey(key);

  const result = await sql`
    SELECT ak.id, ak.user_id, ak.tier, ak.scopes, ak.is_active, ak.expires_at,
           u.role, u.email,
           av.status AS verification_status
    FROM api_keys ak
    JOIN users u ON u.id = ak.user_id
    LEFT JOIN agent_verifications av ON av.user_id = ak.user_id AND av.status = 'verified'
    WHERE ak.key_hash = ${hash}
    LIMIT 1
  `;

  if (result.length === 0) return null;

  const row = result[0];

  // Check if key is active
  if (!row.is_active) return null;

  // Check expiry
  if (row.expires_at && new Date(row.expires_at) < new Date()) return null;

  // Update last used
  await sql`UPDATE api_keys SET last_used_at = NOW() WHERE id = ${row.id}`;

  return {
    keyId: row.id,
    userId: row.user_id,
    tier: row.tier,
    scopes: row.scopes as string[],
    role: row.role,
    email: row.email,
    isVerified: row.verification_status === "verified",
  };
}

export async function listApiKeys(userId: string) {
  const sql = getDb();
  return sql`
    SELECT id, name, key_prefix, tier, scopes, is_active, last_used_at, expires_at, created_at
    FROM api_keys WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
}

export async function revokeApiKey(keyId: string, userId: string) {
  const sql = getDb();
  await sql`
    UPDATE api_keys SET is_active = false WHERE id = ${keyId} AND user_id = ${userId}
  `;
}

export async function deleteApiKey(keyId: string, userId: string) {
  const sql = getDb();
  await sql`DELETE FROM api_keys WHERE id = ${keyId} AND user_id = ${userId}`;
}
