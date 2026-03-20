import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { fetchFollowerCount } from "@/lib/fetch-followers";

async function getUser() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.id FROM users u JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  return rows.length > 0 ? rows[0] : null;
}

export async function POST() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const sql = getDb();

    // Rate limit: max 1 refresh per hour per user
    const recent = await sql`
      SELECT MAX(followers_refreshed_at) AS last_refresh
      FROM social_connections
      WHERE user_id = ${user.id} AND followers_refreshed_at IS NOT NULL
    `;
    const lastRefresh = recent[0]?.last_refresh;
    if (lastRefresh) {
      const elapsed = Date.now() - new Date(lastRefresh as string).getTime();
      if (elapsed < 60 * 60 * 1000) {
        const minutesAgo = Math.floor(elapsed / 60000);
        return NextResponse.json(
          { error: "rate_limited", message: `Refreshed ${minutesAgo}m ago. Try again in ${60 - minutesAgo}m.` },
          { status: 429 }
        );
      }
    }

    // Fetch all user's social connections
    const socials = await sql`
      SELECT id, platform, handle, url FROM social_connections WHERE user_id = ${user.id}
    `;

    const results: { id: string; platform: string; follower_count: number | null }[] = [];

    // Fetch follower counts in parallel
    const updates = await Promise.allSettled(
      socials.map(async (s) => {
        const count = await fetchFollowerCount(
          s.platform as string,
          s.handle as string,
          (s.url as string) || undefined
        );
        return { id: s.id as string, platform: s.platform as string, count };
      })
    );

    for (const result of updates) {
      if (result.status === "fulfilled") {
        const { id, platform, count } = result.value;
        if (count !== null) {
          await sql`
            UPDATE social_connections
            SET follower_count = ${count}, followers_refreshed_at = NOW()
            WHERE id = ${id}
          `;
          results.push({ id, platform, follower_count: count });
        } else {
          // Mark as refreshed even if null (unsupported platform), but don't change count
          await sql`
            UPDATE social_connections SET followers_refreshed_at = NOW() WHERE id = ${id}
          `;
          results.push({ id, platform, follower_count: null });
        }
      }
    }

    return NextResponse.json({ updated: results });
  } catch (e) {
    console.error('[RefreshFollowers]', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
