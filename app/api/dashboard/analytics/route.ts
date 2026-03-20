import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

async function getUser() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.* FROM users u
    JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  return rows.length > 0 ? rows[0] : null;
}

export async function GET() {
  try {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sql = getDb();
  const creatorId = user.id;

  // All queries in parallel
  const [
    viewsTotal,
    viewsDaily,
    clicksTotal,
    clicksByType,
    enquiriesTotal,
    enquiriesDaily,
    topReferrers,
  ] = await Promise.all([
    // Total profile views
    sql`SELECT COUNT(*)::int AS total FROM profile_views WHERE creator_id = ${creatorId}`,

    // Daily views (last 30 days)
    sql`
      SELECT d::date AS date, COALESCE(c.count, 0)::int AS count
      FROM generate_series(NOW() - INTERVAL '29 days', NOW(), '1 day') AS d
      LEFT JOIN (
        SELECT DATE(created_at) AS day, COUNT(*)::int AS count
        FROM profile_views
        WHERE creator_id = ${creatorId} AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
      ) c ON c.day = d::date
      ORDER BY d
    `,

    // Total link clicks
    sql`SELECT COUNT(*)::int AS total FROM link_clicks WHERE creator_id = ${creatorId}`,

    // Clicks by type
    sql`
      SELECT link_type AS type, COUNT(*)::int AS count
      FROM link_clicks
      WHERE creator_id = ${creatorId}
      GROUP BY link_type
      ORDER BY count DESC
    `,

    // Total enquiries
    sql`SELECT COUNT(*)::int AS total FROM enquiry_log WHERE creator_id = ${creatorId}`,

    // Daily enquiries (last 30 days)
    sql`
      SELECT d::date AS date, COALESCE(c.count, 0)::int AS count
      FROM generate_series(NOW() - INTERVAL '29 days', NOW(), '1 day') AS d
      LEFT JOIN (
        SELECT DATE(created_at) AS day, COUNT(*)::int AS count
        FROM enquiry_log
        WHERE creator_id = ${creatorId} AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
      ) c ON c.day = d::date
      ORDER BY d
    `,

    // Top referrers
    sql`
      SELECT
        CASE
          WHEN referrer IS NULL OR referrer = '' THEN 'Direct'
          ELSE SPLIT_PART(SPLIT_PART(referrer, '://', 2), '/', 1)
        END AS domain,
        COUNT(*)::int AS count
      FROM profile_views
      WHERE creator_id = ${creatorId}
      GROUP BY domain
      ORDER BY count DESC
      LIMIT 10
    `,
  ]);

  return NextResponse.json({
    views: {
      total: viewsTotal[0]?.total || 0,
      daily: viewsDaily.map((r: any) => ({ date: r.date, count: r.count })),
    },
    clicks: {
      total: clicksTotal[0]?.total || 0,
      byType: clicksByType.map((r: any) => ({ type: r.type, count: r.count })),
    },
    enquiries: {
      total: enquiriesTotal[0]?.total || 0,
      daily: enquiriesDaily.map((r: any) => ({ date: r.date, count: r.count })),
    },
    topReferrers: topReferrers.map((r: any) => ({ domain: r.domain, count: r.count })),
  });
  } catch (e) {
    console.error('[Analytics]', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
