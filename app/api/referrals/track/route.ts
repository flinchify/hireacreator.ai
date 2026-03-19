import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// POST — track a referral during signup
// Called when someone signs up with a referral code
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { referralCode, referredUserId } = body;

    if (!referralCode || !referredUserId) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    const sql = getDb();

    // Find referrer by code
    const referrer = await sql`
      SELECT id FROM users WHERE referral_code = ${referralCode} AND id != ${referredUserId}
    `;

    if (referrer.length === 0) {
      return NextResponse.json({ error: "invalid_code" }, { status: 404 });
    }

    // Link referred_by on the new user
    await sql`UPDATE users SET referred_by = ${referrer[0].id} WHERE id = ${referredUserId}`;

    // Create referral record
    await sql`
      INSERT INTO referrals (referrer_id, referred_id, status, commission_percent, expires_at)
      VALUES (${referrer[0].id}, ${referredUserId}, 'signed_up', 20, NOW() + INTERVAL '12 months')
      ON CONFLICT (referrer_id, referred_id) DO NOTHING
    `;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Referral track error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
