import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import crypto from "crypto";

export const maxDuration = 30;

/** Generate OAuth 1.0a Authorization header for X API */
function generateOAuthHeader(
  method: string,
  url: string,
  bodyParams: Record<string, string> = {}
): string {
  const consumerKey = process.env.X_API_KEY!;
  const consumerSecret = process.env.X_API_SECRET!;
  const token = process.env.X_ACCESS_TOKEN!;
  const tokenSecret = process.env.X_ACCESS_SECRET!;

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString("hex");

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: timestamp,
    oauth_token: token,
    oauth_version: "1.0",
  };

  // Combine oauth params + body params for signature base
  const allParams = { ...oauthParams, ...bodyParams };
  const paramString = Object.keys(allParams)
    .sort()
    .map((k) => `${encodeRFC3986(k)}=${encodeRFC3986(allParams[k])}`)
    .join("&");

  const baseString = `${method.toUpperCase()}&${encodeRFC3986(url)}&${encodeRFC3986(paramString)}`;
  const signingKey = `${encodeRFC3986(consumerSecret)}&${encodeRFC3986(tokenSecret)}`;
  const signature = crypto
    .createHmac("sha1", signingKey)
    .update(baseString)
    .digest("base64");

  oauthParams["oauth_signature"] = signature;

  const header = Object.keys(oauthParams)
    .sort()
    .map((k) => `${encodeRFC3986(k)}="${encodeRFC3986(oauthParams[k])}"`)
    .join(", ");

  return `OAuth ${header}`;
}

/** RFC 3986 percent-encoding */
function encodeRFC3986(str: string): string {
  return encodeURIComponent(str).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

/**
 * GET /api/twitter/poll-mentions
 * Polls for recent tweets mentioning @hireacreatorAI and auto-replies.
 * Tracks replied tweets in DB to avoid double-replies.
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
      { error: "Missing X OAuth credentials (X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET)" },
      { status: 500 }
    );
  }

  const sql = getDb();
  const results: any[] = [];

  try {
    // Ensure tracking table exists
    await sql`
      CREATE TABLE IF NOT EXISTS x_replied_tweets (
        tweet_id TEXT PRIMARY KEY,
        username TEXT,
        replied_at TIMESTAMPTZ DEFAULT NOW()
      )
    `.catch(() => {});

    // 1. Search recent tweets mentioning @hireacreatorAI
    const searchUrl =
      "https://api.x.com/2/tweets/search/recent?query=%40hireacreatorAI&tweet.fields=author_id,created_at,text&user.fields=username,name,profile_image_url,public_metrics&expansions=author_id&max_results=20";

    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${bearerToken}` },
      signal: AbortSignal.timeout(10000),
    });
    const searchData = await searchRes.json();

    if (!searchRes.ok) {
      return NextResponse.json(
        { error: "X API search failed", details: searchData },
        { status: searchRes.status }
      );
    }

    const tweets = searchData.data || [];
    const users = searchData.includes?.users || [];

    // Build author_id -> user map
    const userMap = new Map<string, any>();
    for (const u of users) {
      userMap.set(u.id, u);
    }

    if (tweets.length === 0) {
      return NextResponse.json({
        tweets_checked: 0,
        replies: [],
        message: "No recent mentions of @hireacreatorAI found.",
      });
    }

    // 2. Process each mention
    for (const tweet of tweets) {
      const author = userMap.get(tweet.author_id);
      const username = author?.username || "";

      // Skip our own tweets
      if (username.toLowerCase() === "hireacreatorai") continue;

      // Check if we already replied
      const existing = await sql`
        SELECT tweet_id FROM x_replied_tweets WHERE tweet_id = ${tweet.id}
      `.catch(() => []);

      if (existing && existing.length > 0) continue;

      // 3. Reply to the tweet
      const replyText = `Hey @${username}! We just built your creator profile on HireACreator. Claim it free: hireacreator.ai/claim?platform=x&handle=${username}`;

      try {
        const postUrl = "https://api.x.com/2/tweets";
        const body = JSON.stringify({
          text: replyText,
          reply: { in_reply_to_tweet_id: tweet.id },
        });

        const oauthHeader = generateOAuthHeader("POST", postUrl);

        const replyRes = await fetch(postUrl, {
          method: "POST",
          headers: {
            Authorization: oauthHeader,
            "Content-Type": "application/json",
          },
          body,
          signal: AbortSignal.timeout(10000),
        });
        const replyData = await replyRes.json();

        // Track the reply
        if (replyRes.ok) {
          await sql`
            INSERT INTO x_replied_tweets (tweet_id, username) VALUES (${tweet.id}, ${username})
          `.catch(() => {});
        }

        // Fire and forget: auto-build their profile
        if (replyRes.ok) {
          fetch(
            `${process.env.NEXT_PUBLIC_APP_URL || "https://hireacreator.ai"}/api/score`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ platform: "x", handle: username }),
            }
          ).catch(() => {});
        }

        results.push({
          tweet_id: tweet.id,
          from: username,
          text: tweet.text,
          reply_status: replyRes.ok ? "replied" : "failed",
          reply_data: replyData,
        });
      } catch (e: any) {
        results.push({
          tweet_id: tweet.id,
          from: username,
          text: tweet.text,
          reply_status: "error",
          error: e.message,
        });
      }
    }

    return NextResponse.json({
      tweets_checked: tweets.length,
      replies: results,
      message:
        results.length === 0
          ? "No new mentions to reply to."
          : `Replied to ${results.length} mention(s).`,
    });
  } catch (e: any) {
    console.error("[X Poll Mentions] Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
