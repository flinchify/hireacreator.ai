import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { email, role } = body;

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const sql = getDb();

  // Create table if not exists
  await sql`
    CREATE TABLE IF NOT EXISTS waitlist (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      role VARCHAR(20) DEFAULT 'creator',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Upsert
  await sql`
    INSERT INTO waitlist (email, role)
    VALUES (${email.toLowerCase().trim()}, ${role || "creator"})
    ON CONFLICT (email) DO NOTHING
  `;

  // Get count
  const count = await sql`SELECT COUNT(*)::int AS cnt FROM waitlist`;

  return NextResponse.json({ success: true, position: count[0]?.cnt || 1 });
}

export async function GET() {
  const sql = getDb();
  try {
    const count = await sql`SELECT COUNT(*)::int AS cnt FROM waitlist`;
    return NextResponse.json({ count: count[0]?.cnt || 0 });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
