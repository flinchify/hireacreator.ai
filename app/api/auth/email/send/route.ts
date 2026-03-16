import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendLoginCode } from "@/lib/email";
import crypto from "crypto";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { email, role } = body;

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const cleanEmail = email.toLowerCase().trim();
  const sql = getDb();

  // Rate limit: max 5 codes per email per 15 minutes
  const recent = await sql`
    SELECT COUNT(*)::int AS cnt FROM auth_codes
    WHERE email = ${cleanEmail} AND created_at > NOW() - INTERVAL '15 minutes'
  `;
  if ((recent[0]?.cnt || 0) >= 5) {
    return NextResponse.json({ error: "rate_limited", message: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  }

  // Generate 6-digit code
  const code = crypto.randomInt(100000, 999999).toString();

  // Store code (10 min expiry)
  await sql`
    INSERT INTO auth_codes (email, code, role, expires_at)
    VALUES (${cleanEmail}, ${code}, ${role || 'creator'}, NOW() + INTERVAL '10 minutes')
  `;

  // Send via Resend
  try {
    await sendLoginCode(cleanEmail, code);
  } catch (err: any) {
    console.error("Resend error:", err);
    return NextResponse.json({ error: "email_failed", message: "Failed to send email. Try Google sign-in instead." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
