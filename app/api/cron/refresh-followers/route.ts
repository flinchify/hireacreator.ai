import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { fetchFollowerCount } from "@/lib/fetch-followers";

const BATCH_SIZE = 50;

export async function GET(request: Request) {
  // Verify cron secret (Vercel cron sends Authorization header, or check custom header)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const sql = getDb();

  // Get social connections not refreshed in the last 24 hours, batched
  const stale = await sql`
    SELECT id, platform, handle, url
    FROM social_connections
    WHERE followers_refreshed_at IS NULL
       OR followers_refreshed_at < NOW() - INTERVAL '24 hours'
    ORDER BY followers_refreshed_at ASC NULLS FIRST
    LIMIT ${BATCH_SIZE}
  `;

  if (stale.length === 0) {
    return NextResponse.json({ message: "No stale connections to refresh", updated: 0 });
  }

  let updated = 0;
  let failed = 0;

  // Process in parallel
  const results = await Promise.allSettled(
    stale.map(async (s) => {
      const count = await fetchFollowerCount(
        s.platform as string,
        s.handle as string,
        (s.url as string) || undefined
      );
      return { id: s.id as string, count };
    })
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      const { id, count } = result.value;
      if (count !== null) {
        await sql`
          UPDATE social_connections
          SET follower_count = ${count}, followers_refreshed_at = NOW()
          WHERE id = ${id}
        `;
        updated++;
      } else {
        // Mark as refreshed so we don't re-fetch unsupported platforms every run
        await sql`
          UPDATE social_connections SET followers_refreshed_at = NOW() WHERE id = ${id}
        `;
        updated++;
      }
    } else {
      failed++;
    }
  }

  return NextResponse.json({ message: "Cron refresh complete", updated, failed, total: stale.length });
}
