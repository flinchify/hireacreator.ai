import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

async function getUser() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.id, u.slug, u.referral_code, u.referral_earnings_cents FROM users u
    JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  return rows.length > 0 ? rows[0] : null;
}

// GET — referral stats for current user
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sql = getDb();

  // Auto-generate referral code if missing
  if (!user.referral_code) {
    const slug = (user.slug as string) || "";
    const prefix = slug.slice(0, 3).toLowerCase();
    const rand = Math.random().toString(36).slice(2, 6);
    const code = `${prefix}-${rand}`;
    try {
      await sql`UPDATE users SET referral_code = ${code} WHERE id = ${user.id}`;
      user.referral_code = code;
    } catch {
      const fallback = Math.random().toString(36).slice(2, 10);
      await sql`UPDATE users SET referral_code = ${fallback} WHERE id = ${user.id}`;
      user.referral_code = fallback;
    }
  }

  // Get user's credit balance
  const balanceRow = await sql`SELECT credit_balance_cents FROM users WHERE id = ${user.id}`;
  const creditBalanceCents = (balanceRow[0]?.credit_balance_cents as number) || 0;

  const referrals = await sql`
    SELECT r.*, u.full_name, u.email, u.avatar_url, u.subscription_tier, u.created_at AS user_created
    FROM referrals r
    JOIN users u ON u.id = r.referred_id
    WHERE r.referrer_id = ${user.id}
    ORDER BY r.created_at DESC
  `;

  const stats = await sql`
    SELECT
      COUNT(*)::int AS total_referrals,
      COUNT(*) FILTER (WHERE r.status = 'active')::int AS active_paying,
      COUNT(*) FILTER (WHERE r.status = 'signed_up')::int AS pending,
      COUNT(*) FILTER (WHERE r.reward_granted = TRUE)::int AS rewards_earned,
      COALESCE(SUM(r.total_earned_cents), 0)::int AS total_earned_cents
    FROM referrals r
    WHERE r.referrer_id = ${user.id}
  `;

  // Monthly recurring estimate
  const activeReferrals = await sql`
    SELECT r.commission_percent, u.subscription_tier FROM referrals r
    JOIN users u ON u.id = r.referred_id
    WHERE r.referrer_id = ${user.id} AND r.status = 'active' AND r.expires_at > NOW()
  `;

  let monthlyEstimateCents = 0;
  for (const ar of activeReferrals) {
    const tier = ar.subscription_tier;
    const pct = (ar.commission_percent as number) || 20;
    let monthlyCents = 0;
    if (tier === "pro") monthlyCents = 1900;
    else if (tier === "business") monthlyCents = 4900;
    else if (tier === "analytics") monthlyCents = 19900;
    else if (tier === "enterprise") monthlyCents = 99900;
    else if (tier === "api_pro") monthlyCents = 4900;
    monthlyEstimateCents += Math.floor(monthlyCents * pct / 100);
  }

  return NextResponse.json({
    referralCode: user.referral_code,
    referralLink: `https://hireacreator.ai/ref/${user.referral_code}`,
    stats: {
      totalReferrals: stats[0]?.total_referrals || 0,
      activePaying: stats[0]?.active_paying || 0,
      pending: stats[0]?.pending || 0,
      rewardsEarned: stats[0]?.rewards_earned || 0,
      totalEarnedCents: stats[0]?.total_earned_cents || 0,
      creditBalanceCents,
      monthlyEstimateCents,
    },
    referrals: referrals.map(r => ({
      id: r.id,
      name: r.full_name || "Anonymous",
      email: r.email,
      avatar: r.avatar_url,
      tier: r.subscription_tier || "free",
      status: r.status,
      commissionPercent: r.commission_percent,
      totalEarnedCents: r.total_earned_cents,
      joinedAt: r.created_at,
      expiresAt: r.expires_at,
    })),
  });
}
