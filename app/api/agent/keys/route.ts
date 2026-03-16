import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { createApiKey, listApiKeys, revokeApiKey, deleteApiKey } from "@/lib/api-keys";

async function getUser() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;

  const sql = getDb();
  const rows = await sql`
    SELECT u.id, u.role, u.email FROM users u
    JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  return rows.length > 0 ? rows[0] : null;
}

// GET — list keys
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (user.role !== "agent" && user.role !== "admin") {
    return NextResponse.json({ error: "agent_only", message: "API keys are only available for agent accounts." }, { status: 403 });
  }

  const keys = await listApiKeys(user.id);
  return NextResponse.json({ keys });
}

// POST — create key
export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (user.role !== "agent" && user.role !== "admin") {
    return NextResponse.json({ error: "agent_only" }, { status: 403 });
  }

  // Max 5 keys per account
  const existing = await listApiKeys(user.id);
  if (existing.length >= 5) {
    return NextResponse.json({ error: "max_keys", message: "Maximum 5 API keys per account." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const name = (body.name || "Default").slice(0, 100);
  const scopes = Array.isArray(body.scopes) ? body.scopes.filter((s: string) => ["read", "write", "book"].includes(s)) : ["read"];

  const result = await createApiKey(user.id, name, "free", scopes.length > 0 ? scopes : ["read"]);

  return NextResponse.json({
    key: result.key,
    keyId: result.keyId,
    prefix: result.prefix,
    message: "Store this key securely. You won't be able to see it again.",
  }, { status: 201 });
}

// PATCH — revoke key
export async function PATCH(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  if (!body.keyId) return NextResponse.json({ error: "missing_key_id" }, { status: 400 });

  await revokeApiKey(body.keyId, user.id);
  return NextResponse.json({ success: true });
}

// DELETE — delete key
export async function DELETE(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const keyId = searchParams.get("keyId");
  if (!keyId) return NextResponse.json({ error: "missing_key_id" }, { status: 400 });

  await deleteApiKey(keyId, user.id);
  return NextResponse.json({ success: true });
}
