import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  searchRecentTweets,
  getUserByUsername,
  getUserMentions,
  replyToTweet,
  generateSmartReply,
  scrapeXProfile,
} from "@/lib/x-bot";

export const maxDuration = 30;

/**
 * GET /api/twitter/poll-mentions
 * Polls for recent tweets mentioning @hireacreatorAI using multiple query
 * strategies, auto-replies with smart context-aware messages, and scrapes
 * the mentioning user's X profile to build a creator profile.
 */
export async function GET(request: Request) {
  // Verify secret
  const cronSecret =
    process.env.X_WEBHOOK_VERIFY_TOKEN ||
    process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN ||
    process.env.CRON_SECRET;
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");
  if (cronSecret && secret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bearerToken = process.env.X_BEARER_TOKEN;
  if (!bearerToken) {
    return NextResponse.json({ error: "No X_BEARER_TOKEN" }, { status: 500 });
  }
  if (
    !process.env.X_API_KEY ||
    !process.env.X_API_SECRET ||
    !process.env.X_ACCESS_TOKEN ||
    !process.env.X_ACCESS_SECRET
  ) {
    return NextResponse.json(
      { error: "Missing X OAuth credentials" },
      { status: 500 }
    );
  }

  const sql = getDb();
  const replies: any[] = [];
  const debug: any = { queries_tried: [], mentions_source: null };

  try {
    // Ensure tracking table exists
    await sql`
      CREATE TABLE IF NOT EXISTS x_replied_tweets (
        tweet_id TEXT PRIMARY KEY,
        username TEXT,
        replied_at TIMESTAMPTZ DEFAULT NOW()
      )
    `.catch(() => {});

    // --- Strategy 1: Try multiple search queries ---
    const queries = [
      "@hireacreatorAI",
      "to:hireacreatorAI",
      "hireacreatorAI",
    ];

    let tweets: any[] = [];
    let users: any[] = [];
    let winningQuery: string | null = null;

    for (const q of queries) {
      const result = await searchRecentTweets(q);
      debug.queries_tried.push({
        query: q,
        url: result.url,
        result_count: result.data.length,
        meta: result.meta,
        error: result.raw?.errors || result.raw?.error || null,
      });

      if (result.data.length > 0 && !winningQuery) {
        tweets = result.data;
        users = result.includes?.users || [];
        winningQuery = q;
      }
    }

    // --- Strategy 2: Try /2/users/:id/mentions endpoint ---
    const botUser = await getUserByUsername("hireacreatorAI");
    if (botUser) {
      const mentionsResult = await getUserMentions(botUser.id);
      debug.queries_tried.push({
        query: `mentions_endpoint (user_id: ${botUser.id})`,
        url: `https://api.x.com/2/users/${botUser.id}/mentions`,
        result_count: mentionsResult?.data.length || 0,
        meta: mentionsResult?.meta,
        error: mentionsResult?.raw?.errors || null,
      });

      if (mentionsResult && mentionsResult.data.length > 0 && tweets.length === 0) {
        tweets = mentionsResult.data;
        users = mentionsResult.includes?.users || [];
        winningQuery = "mentions_endpoint";
      }
    } else {
      debug.queries_tried.push({
        query: "mentions_endpoint",
        error: "Could not resolve user ID for @hireacreatorAI",
      });
    }

    debug.mentions_source = winningQuery;
    debug.total_tweets_found = tweets.length;

    if (tweets.length === 0) {
      return NextResponse.json({
        tweets_checked: 0,
        replies: [],
        debug,
        message: "No recent mentions found across all query strategies.",
      });
    }

    // Build author_id -> user map
    const userMap = new Map<string, any>();
    for (const u of users) {
      userMap.set(u.id, u);
    }

    // Process ALL mentions
    for (const tweet of tweets) {
      const author = userMap.get(tweet.author_id);
      const username = author?.username || "";

      // Skip our own tweets
      if (username.toLowerCase() === "hireacreatorai") continue;

      // Check if we already replied to this exact tweet
      const existing = await sql`
        SELECT tweet_id FROM x_replied_tweets WHERE tweet_id = ${tweet.id}
      `.catch(() => []);
      if (existing && existing.length > 0) continue;

      // Rate limit: max 3 replies per user per 24 hours (anti-spam)
      if (username) {
        const recentReplies = await sql`
          SELECT COUNT(*) as cnt FROM x_replied_tweets 
          WHERE username = ${username} AND replied_at > NOW() - INTERVAL '24 hours'
        `.catch(() => [{ cnt: 0 }]);
        const count = Number(recentReplies[0]?.cnt || 0);
        if (count >= 3) {
          debug.rate_limited = debug.rate_limited || [];
          (debug.rate_limited as any[]).push({ tweet_id: tweet.id, from: username });
          continue;
        }
      }

      // Generate smart reply
      const replyText = generateSmartReply(tweet.text, username);

      // Reply to the tweet
      const replyResult = await replyToTweet(tweet.id, replyText);

      // Track the reply
      if (replyResult.ok) {
        await sql`
          INSERT INTO x_replied_tweets (tweet_id, username) VALUES (${tweet.id}, ${username})
        `.catch(() => {});
      }

      // Scrape profile and build creator profile (fire and forget)
      if (replyResult.ok && username) {
        (async () => {
          try {
            const profile = await scrapeXProfile(username);
            await fetch(
              `${process.env.NEXT_PUBLIC_APP_URL || "https://hireacreator.ai"}/api/score`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  platform: "x",
                  handle: username,
                  xProfile: profile.user,
                  pinnedTweet: profile.pinnedTweet,
                  links: profile.links,
                }),
              }
            ).catch(() => {});
          } catch {}
        })();
      }

      replies.push({
        tweet_id: tweet.id,
        from: username,
        text: tweet.text,
        reply_text: replyText,
        reply_status: replyResult.ok ? "replied" : "failed",
        reply_data: replyResult.data || replyResult.error,
      });
    }

    return NextResponse.json({
      tweets_checked: tweets.length,
      replies,
      debug,
      message:
        replies.length === 0
          ? "No new mentions to reply to."
          : `Replied to ${replies.length} mention(s).`,
    });
  } catch (e: any) {
    console.error("[X Poll Mentions] Error:", e);
    return NextResponse.json({ error: e.message, debug }, { status: 500 });
  }
}
