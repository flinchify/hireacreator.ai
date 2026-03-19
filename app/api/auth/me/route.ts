import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

export async function GET() {
  const token = cookies().get("session_token")?.value;
  if (!token) {
    return NextResponse.json({ user: null });
  }

  let rows;
  try {
    const sql = getDb();
    rows = await sql`
      SELECT u.id, u.email, u.full_name, u.slug, u.avatar_url, u.cover_url,
             u.headline, u.bio, u.location, u.role, u.category,
             u.hourly_rate, u.currency, u.is_verified, u.is_featured,
             u.is_online, u.subscription_tier, u.stripe_account_id, u.website_url,
             u.business_name, u.business_url, u.has_intro_animation,
             u.rating, u.review_count, u.total_projects, u.total_earnings,
             u.email_verified, u.onboarding_complete
      FROM users u
      JOIN auth_sessions s ON s.user_id = u.id
      WHERE s.token = ${token} AND s.expires_at > NOW()
    `;
  } catch (e) {
    // DB error (cold start, connection timeout) — don't delete cookie, just return null
    // User will retry on next page load
    console.error("Auth check DB error:", e);
    return NextResponse.json({ user: null });
  }

  if (rows.length === 0) {
    // Genuinely invalid/expired session — clear cookie
    cookies().delete("session_token");
    return NextResponse.json({ user: null });
  }

  const u = rows[0];
  return NextResponse.json({
    user: {
      id: u.id,
      email: u.email,
      name: u.full_name,
      slug: u.slug,
      avatar: u.avatar_url,
      cover: u.cover_url,
      headline: u.headline,
      bio: u.bio,
      location: u.location,
      role: u.role,
      category: u.category,
      hourlyRate: u.hourly_rate,
      currency: u.currency,
      isVerified: u.is_verified,
      isOnline: u.is_online,
      isPro: (u.subscription_tier || "free") !== "free",
      subscriptionTier: u.subscription_tier || "free",
      websiteUrl: u.website_url,
      businessName: u.business_name,
      businessUrl: u.business_url,
      rating: u.rating,
      reviewCount: u.review_count,
      totalProjects: u.total_projects,
      totalEarnings: u.total_earnings,
      emailVerified: u.email_verified || false,
      onboardingComplete: u.onboarding_complete || false,
      stripeAccountId: u.stripe_account_id || null,
    },
  });
}
