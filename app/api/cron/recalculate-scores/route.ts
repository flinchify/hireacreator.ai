import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { calculateCreatorScore } from "@/lib/creator-score";

export async function GET(request: Request) {
  try {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const sql = getDb();

  // Get all creators with their aggregated data
  const creators = await sql`
    SELECT
      u.id,
      u.avatar_url,
      u.bio,
      u.headline,
      u.location,
      u.category,
      u.cover_url,
      u.rating,
      u.review_count,
      u.total_projects,
      u.profile_views,
      u.subscription_tier,
      u.verification_status,
      u.is_verified,
      COALESCE(
        (SELECT SUM(sc.follower_count) FROM social_connections sc WHERE sc.user_id = u.id),
        0
      ) AS total_followers,
      COALESCE(
        (SELECT COUNT(*) FROM social_connections sc WHERE sc.user_id = u.id),
        0
      ) AS platform_count,
      COALESCE(
        (SELECT COUNT(*) FROM services s WHERE s.user_id = u.id AND s.is_active = TRUE),
        0
      ) AS active_service_count,
      COALESCE(
        (SELECT COUNT(*) FROM portfolio_items p WHERE p.user_id = u.id),
        0
      ) AS portfolio_count,
      COALESCE(
        (SELECT SUM(bl.click_count) FROM bio_links bl WHERE bl.user_id = u.id),
        0
      ) AS total_link_clicks
    FROM users u
    WHERE u.role IN ('creator', 'admin')
  `;

  let updated = 0;

  for (const c of creators) {
    const score = calculateCreatorScore({
      hasAvatar: !!c.avatar_url,
      hasBio: !!(c.bio && (c.bio as string).trim()),
      hasHeadline: !!(c.headline && (c.headline as string).trim()),
      hasLocation: !!(c.location && (c.location as string).trim()),
      hasCategory: !!(c.category && (c.category as string).trim()),
      hasCover: !!c.cover_url,
      totalFollowers: Number(c.total_followers) || 0,
      platformCount: Number(c.platform_count) || 0,
      profileViews: Number(c.profile_views) || 0,
      totalLinkClicks: Number(c.total_link_clicks) || 0,
      rating: Number(c.rating) || 0,
      reviewCount: Number(c.review_count) || 0,
      totalProjects: Number(c.total_projects) || 0,
      activeServiceCount: Number(c.active_service_count) || 0,
      portfolioCount: Number(c.portfolio_count) || 0,
      isVerified: c.verification_status === "verified" || c.is_verified === true,
      isPro: ((c.subscription_tier as string) || "free") !== "free",
    });

    await sql`
      UPDATE users
      SET creator_score = ${score.total},
          score_breakdown = ${JSON.stringify(score)}::jsonb,
          score_updated_at = NOW()
      WHERE id = ${c.id}
    `;
    updated++;
  }

  // Update niche ranks based on new scores
  await sql`
    WITH ranked AS (
      SELECT id, category,
        ROW_NUMBER() OVER (PARTITION BY category ORDER BY creator_score DESC) AS rank
      FROM users
      WHERE role IN ('creator', 'admin')
        AND category IS NOT NULL AND category != ''
        AND visible_in_marketplace = TRUE
        AND (is_banned IS NULL OR is_banned = FALSE)
    )
    UPDATE users u
    SET niche_rank = r.rank
    FROM ranked r
    WHERE u.id = r.id
  `;

  return NextResponse.json({ message: "Scores recalculated", updated });
  } catch (e) {
    console.error('[RecalculateScores]', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
