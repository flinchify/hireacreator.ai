import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "";
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);

  const sql = getDb();

  let creators;
  if (category) {
    creators = await sql`
      SELECT
        u.id, u.full_name, u.slug, u.avatar_url, u.headline, u.category,
        u.location, u.creator_score, u.score_breakdown, u.niche_rank,
        u.rating, u.review_count, u.total_projects, u.profile_views,
        u.is_verified, u.verification_status, u.subscription_tier, u.is_featured,
        COALESCE(
          (SELECT SUM(sc.follower_count) FROM social_connections sc WHERE sc.user_id = u.id),
          0
        ) AS total_followers
      FROM users u
      WHERE u.role IN ('creator', 'admin')
        AND u.visible_in_marketplace = TRUE
        AND (u.is_banned IS NULL OR u.is_banned = FALSE)
        AND u.email_verified = TRUE
        AND u.category = ${category}
        AND u.creator_score > 0
      ORDER BY u.creator_score DESC
      LIMIT ${limit}
    `;
  } else {
    creators = await sql`
      SELECT
        u.id, u.full_name, u.slug, u.avatar_url, u.headline, u.category,
        u.location, u.creator_score, u.score_breakdown, u.niche_rank,
        u.rating, u.review_count, u.total_projects, u.profile_views,
        u.is_verified, u.verification_status, u.subscription_tier, u.is_featured,
        COALESCE(
          (SELECT SUM(sc.follower_count) FROM social_connections sc WHERE sc.user_id = u.id),
          0
        ) AS total_followers
      FROM users u
      WHERE u.role IN ('creator', 'admin')
        AND u.visible_in_marketplace = TRUE
        AND (u.is_banned IS NULL OR u.is_banned = FALSE)
        AND u.email_verified = TRUE
        AND u.creator_score > 0
      ORDER BY u.creator_score DESC
      LIMIT ${limit}
    `;
  }

  // Get available categories with creator counts
  const categories = await sql`
    SELECT category, COUNT(*) as count
    FROM users
    WHERE role IN ('creator', 'admin')
      AND visible_in_marketplace = TRUE
      AND (is_banned IS NULL OR is_banned = FALSE)
      AND email_verified = TRUE
      AND category IS NOT NULL AND category != ''
      AND creator_score > 0
    GROUP BY category
    ORDER BY count DESC
  `;

  return NextResponse.json({
    creators: creators.map((c, i) => ({
      rank: i + 1,
      id: c.id,
      name: c.full_name,
      slug: c.slug,
      avatar: c.avatar_url || null,
      headline: c.headline || null,
      category: c.category || null,
      location: c.location || null,
      score: Number(c.creator_score) || 0,
      scoreBreakdown: c.score_breakdown || {},
      nicheRank: Number(c.niche_rank) || 0,
      rating: Number(c.rating) || 0,
      reviewCount: Number(c.review_count) || 0,
      totalProjects: Number(c.total_projects) || 0,
      profileViews: Number(c.profile_views) || 0,
      totalFollowers: Number(c.total_followers) || 0,
      isVerified: c.verification_status === "verified" || c.is_verified === true,
      isPro: ((c.subscription_tier as string) || "free") !== "free",
    })),
    categories: categories.map((c) => ({
      name: c.category as string,
      count: Number(c.count),
    })),
  });
}
