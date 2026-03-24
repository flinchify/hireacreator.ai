import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

async function getAdmin() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.id, u.role FROM users u
    JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW() AND u.role = 'admin'
  `;
  return rows.length > 0 ? rows[0] : null;
}

export async function GET(request: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const url = new URL(request.url);
  const section = url.searchParams.get("section") || "overview";
  const sql = getDb();

  try {
    if (section === "overview") {
      const [
        userCounts,
        offerStats,
        revenue,
        newUsersToday,
        newUsersWeek,
        newUsersMonth,
      ] = await Promise.all([
        sql`
          SELECT
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE role = 'creator') as creators,
            COUNT(*) FILTER (WHERE role = 'brand') as brands,
            COUNT(*) FILTER (WHERE role = 'admin') as admins
          FROM users
        `,
        sql`
          SELECT
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'pending') as pending,
            COUNT(*) FILTER (WHERE status = 'accepted') as accepted,
            COUNT(*) FILTER (WHERE status = 'paid') as paid,
            COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
            COUNT(*) FILTER (WHERE status = 'completed') as completed,
            COUNT(*) FILTER (WHERE status = 'disputed') as disputed,
            COUNT(*) FILTER (WHERE status = 'declined') as declined,
            COUNT(*) FILTER (WHERE status = 'expired') as expired
          FROM offers
        `.catch(() => [{ total: 0, pending: 0, accepted: 0, paid: 0, delivered: 0, completed: 0, disputed: 0, declined: 0, expired: 0 }]),
        sql`
          SELECT
            COALESCE(SUM(fee_cents) FILTER (WHERE status = 'completed'), 0) as total_fees,
            COALESCE(SUM(budget_cents) FILTER (WHERE status = 'completed'), 0) as total_gmv,
            COALESCE(SUM(fee_cents) FILTER (WHERE status = 'completed' AND completed_at >= date_trunc('month', NOW())), 0) as fees_this_month,
            COALESCE(AVG(budget_cents) FILTER (WHERE status = 'completed'), 0) as avg_deal_size
          FROM offers
        `.catch(() => [{ total_fees: 0, total_gmv: 0, fees_this_month: 0, avg_deal_size: 0 }]),
        sql`SELECT COUNT(*) as count FROM users WHERE created_at >= CURRENT_DATE`,
        sql`SELECT COUNT(*) as count FROM users WHERE created_at >= date_trunc('week', NOW())`,
        sql`SELECT COUNT(*) as count FROM users WHERE created_at >= date_trunc('month', NOW())`,
      ]);

      return NextResponse.json({
        users: userCounts[0],
        offers: offerStats[0],
        revenue: revenue[0],
        newUsers: {
          today: Number(newUsersToday[0].count),
          thisWeek: Number(newUsersWeek[0].count),
          thisMonth: Number(newUsersMonth[0].count),
        },
      });
    }

    if (section === "bots") {
      const [xCount, igCount, xRecent, igRecent, settings] = await Promise.all([
        sql`SELECT COUNT(*) as count FROM x_replied_tweets`.catch(() => [{ count: 0 }]),
        sql`SELECT COUNT(*) as count FROM ig_replied_comments`.catch(() => [{ count: 0 }]),
        sql`SELECT tweet_id, username, replied_at FROM x_replied_tweets ORDER BY replied_at DESC LIMIT 10`.catch(() => []),
        sql`SELECT comment_id, username, replied_at FROM ig_replied_comments ORDER BY replied_at DESC LIMIT 10`.catch(() => []),
        sql`SELECT key, value FROM site_settings WHERE key IN ('x_bot_enabled', 'ig_bot_enabled')`,
      ]);

      const settingsMap: Record<string, string> = {};
      for (const r of settings) settingsMap[r.key as string] = r.value as string;

      return NextResponse.json({
        x: {
          totalReplies: Number(xCount[0].count),
          recentReplies: xRecent,
          enabled: settingsMap.x_bot_enabled !== "false",
        },
        ig: {
          totalReplies: Number(igCount[0].count),
          recentReplies: igRecent,
          enabled: settingsMap.ig_bot_enabled !== "false",
        },
      });
    }

    if (section === "offers") {
      const status = url.searchParams.get("status");
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = 50;
      const offset = (page - 1) * limit;

      const [offers, total] = await Promise.all([
        status
          ? sql`
              SELECT o.id, o.creator_handle, o.creator_platform, o.budget_cents, o.fee_cents,
                     o.status, o.brief, o.created_at, o.delivered_at, o.completed_at,
                     u.full_name as brand_name, u.email as brand_email
              FROM offers o
              LEFT JOIN users u ON u.id = o.brand_user_id
              WHERE o.status = ${status}
              ORDER BY o.created_at DESC
              LIMIT ${limit} OFFSET ${offset}
            `.catch(() => [])
          : sql`
              SELECT o.id, o.creator_handle, o.creator_platform, o.budget_cents, o.fee_cents,
                     o.status, o.brief, o.created_at, o.delivered_at, o.completed_at,
                     u.full_name as brand_name, u.email as brand_email
              FROM offers o
              LEFT JOIN users u ON u.id = o.brand_user_id
              ORDER BY o.created_at DESC
              LIMIT ${limit} OFFSET ${offset}
            `.catch(() => []),
        status
          ? sql`SELECT COUNT(*) as count FROM offers WHERE status = ${status}`.catch(() => [{ count: 0 }])
          : sql`SELECT COUNT(*) as count FROM offers`.catch(() => [{ count: 0 }]),
      ]);

      return NextResponse.json({ offers, total: Number(total[0].count), page, limit });
    }

    if (section === "users") {
      const search = url.searchParams.get("q") || "";
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = 50;
      const offset = (page - 1) * limit;
      const like = "%" + search + "%";

      const [users, total] = await Promise.all([
        search
          ? sql`
              SELECT u.id, u.full_name, u.email, u.role, u.subscription_tier, u.is_verified,
                     u.is_banned, u.created_at,
                     (SELECT COUNT(*) FROM social_connections WHERE user_id = u.id) as social_count
              FROM users u
              WHERE u.full_name ILIKE ${like} OR u.email ILIKE ${like}
              ORDER BY u.created_at DESC
              LIMIT ${limit} OFFSET ${offset}
            `
          : sql`
              SELECT u.id, u.full_name, u.email, u.role, u.subscription_tier, u.is_verified,
                     u.is_banned, u.created_at,
                     (SELECT COUNT(*) FROM social_connections WHERE user_id = u.id) as social_count
              FROM users u
              ORDER BY u.created_at DESC
              LIMIT ${limit} OFFSET ${offset}
            `,
        search
          ? sql`SELECT COUNT(*) as count FROM users u WHERE u.full_name ILIKE ${like} OR u.email ILIKE ${like}`
          : sql`SELECT COUNT(*) as count FROM users`,
      ]);

      return NextResponse.json({ users, total: Number(total[0].count), page, limit });
    }

    if (section === "profiles") {
      const search = url.searchParams.get("q") || "";
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = 50;
      const offset = (page - 1) * limit;
      const like = "%" + search + "%";

      const [profiles, total] = await Promise.all([
        search
          ? sql`
              SELECT id, platform, platform_handle, display_name, follower_count, creator_score,
                     claimed_by, claimed_at, auto_profile_slug, created_at
              FROM claimed_profiles
              WHERE platform_handle ILIKE ${like} OR display_name ILIKE ${like}
              ORDER BY creator_score DESC
              LIMIT ${limit} OFFSET ${offset}
            `.catch(() => [])
          : sql`
              SELECT id, platform, platform_handle, display_name, follower_count, creator_score,
                     claimed_by, claimed_at, auto_profile_slug, created_at
              FROM claimed_profiles
              ORDER BY creator_score DESC
              LIMIT ${limit} OFFSET ${offset}
            `.catch(() => []),
        search
          ? sql`SELECT COUNT(*) as count FROM claimed_profiles WHERE platform_handle ILIKE ${like} OR display_name ILIKE ${like}`.catch(() => [{ count: 0 }])
          : sql`SELECT COUNT(*) as count FROM claimed_profiles`.catch(() => [{ count: 0 }]),
      ]);

      return NextResponse.json({ profiles, total: Number(total[0].count), page, limit });
    }

    if (section === "revenue") {
      const [totals, topCreators] = await Promise.all([
        sql`
          SELECT
            COALESCE(SUM(fee_cents) FILTER (WHERE status = 'completed'), 0) as total_fees,
            COALESCE(SUM(budget_cents) FILTER (WHERE status = 'completed'), 0) as total_gmv,
            COALESCE(SUM(fee_cents) FILTER (WHERE status = 'completed' AND completed_at >= date_trunc('month', NOW())), 0) as fees_this_month,
            COALESCE(AVG(budget_cents) FILTER (WHERE status = 'completed'), 0) as avg_deal_size,
            COUNT(*) FILTER (WHERE status = 'completed') as completed_count
          FROM offers
        `.catch(() => [{ total_fees: 0, total_gmv: 0, fees_this_month: 0, avg_deal_size: 0, completed_count: 0 }]),
        sql`
          SELECT o.creator_handle, o.creator_platform,
                 SUM(o.budget_cents) as total_earned,
                 COUNT(*) as deal_count
          FROM offers o
          WHERE o.status = 'completed'
          GROUP BY o.creator_handle, o.creator_platform
          ORDER BY total_earned DESC
          LIMIT 10
        `.catch(() => []),
      ]);

      return NextResponse.json({ totals: totals[0], topCreators });
    }

    if (section === "settings") {
      const rows = await sql`SELECT key, value FROM site_settings`;
      const settings: Record<string, string> = {};
      for (const r of rows) settings[r.key as string] = r.value as string;
      return NextResponse.json(settings);
    }

    return NextResponse.json({ error: "Unknown section" }, { status: 400 });
  } catch (e: any) {
    console.error("Admin dashboard error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const { action } = body;
  const sql = getDb();

  try {
    if (action === "update_settings") {
      const { settings } = body;
      for (const [key, value] of Object.entries(settings || {})) {
        await sql`
          INSERT INTO site_settings (key, value, updated_at) VALUES (${key}, ${value as string}, NOW())
          ON CONFLICT (key) DO UPDATE SET value = ${value as string}, updated_at = NOW()
        `;
      }
      return NextResponse.json({ success: true });
    }

    if (action === "force_complete_offer") {
      const { offerId } = body;
      await sql`UPDATE offers SET status = 'completed', completed_at = NOW(), updated_at = NOW() WHERE id = ${offerId}`;
      return NextResponse.json({ success: true });
    }

    if (action === "force_refund_offer") {
      const { offerId } = body;
      await sql`UPDATE offers SET status = 'declined', updated_at = NOW() WHERE id = ${offerId}`;
      return NextResponse.json({ success: true });
    }

    if (action === "mark_disputed") {
      const { offerId } = body;
      await sql`UPDATE offers SET status = 'disputed', updated_at = NOW() WHERE id = ${offerId}`;
      return NextResponse.json({ success: true });
    }

    if (action === "ban_user") {
      const { userId, reason } = body;
      await sql`UPDATE users SET is_banned = true, ban_reason = ${reason || "Banned by admin"}, banned_at = NOW(), banned_by = ${admin.id} WHERE id = ${userId}`;
      return NextResponse.json({ success: true });
    }

    if (action === "unban_user") {
      const { userId } = body;
      await sql`UPDATE users SET is_banned = false, ban_reason = NULL, banned_at = NULL, banned_by = NULL WHERE id = ${userId}`;
      return NextResponse.json({ success: true });
    }

    if (action === "change_role") {
      const { userId, role } = body;
      if (!["creator", "brand", "admin"].includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      await sql`UPDATE users SET role = ${role} WHERE id = ${userId}`;
      return NextResponse.json({ success: true });
    }

    if (action === "delete_profile") {
      const { profileId } = body;
      await sql`DELETE FROM claimed_profiles WHERE id = ${profileId}`;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    console.error("Admin action error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
