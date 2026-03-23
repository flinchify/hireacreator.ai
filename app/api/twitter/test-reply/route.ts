import { NextResponse } from "next/server";
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

function encodeRFC3986(str: string): string {
  return encodeURIComponent(str).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

/**
 * GET /api/twitter/test-reply
 * Debug endpoint: reads recent mentions and tries to reply to the newest one.
 * Shows full step-by-step output.
 */
export async function GET() {
  const bearerToken = process.env.X_BEARER_TOKEN;
  if (!bearerToken) return NextResponse.json({ error: "No X_BEARER_TOKEN" });

  const results: any = { steps: [] };

  try {
    // Step 1: Search for recent mentions
    const searchUrl =
      "https://api.x.com/2/tweets/search/recent?query=%40hireacreatorAI&tweet.fields=author_id,created_at,text&user.fields=username,name,profile_image_url,public_metrics&expansions=author_id&max_results=10";

    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${bearerToken}` },
      signal: AbortSignal.timeout(10000),
    });
    const searchData = await searchRes.json();
    results.steps.push({
      step: "search_mentions",
      status: searchRes.status,
      tweet_count: searchData.data?.length || 0,
      meta: searchData.meta,
    });

    if (!searchData.data?.length) {
      results.steps.push({ step: "done", note: "No mentions found" });
      return NextResponse.json(results);
    }

    // Build user map
    const userMap = new Map<string, any>();
    for (const u of searchData.includes?.users || []) {
      userMap.set(u.id, u);
    }

    // Show first 5 mentions
    results.mentions = searchData.data.slice(0, 5).map((t: any) => ({
      id: t.id,
      text: t.text,
      author: userMap.get(t.author_id)?.username || t.author_id,
      created_at: t.created_at,
    }));

    // Step 2: Find newest mention not from us
    const mention = searchData.data.find((t: any) => {
      const author = userMap.get(t.author_id);
      return author?.username?.toLowerCase() !== "hireacreatorai";
    });

    if (!mention) {
      results.steps.push({
        step: "find_mention",
        found: false,
        note: "All mentions are from @hireacreatorAI itself",
      });
      return NextResponse.json(results);
    }

    const author = userMap.get(mention.author_id);
    const username = author?.username || "unknown";

    results.steps.push({
      step: "find_mention",
      found: true,
      tweet_id: mention.id,
      from: username,
      text: mention.text,
      author_details: author,
    });

    // Step 3: Check OAuth credentials
    if (
      !process.env.X_API_KEY ||
      !process.env.X_API_SECRET ||
      !process.env.X_ACCESS_TOKEN ||
      !process.env.X_ACCESS_SECRET
    ) {
      results.steps.push({
        step: "check_oauth",
        error: "Missing OAuth credentials. Need: X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET",
      });
      return NextResponse.json(results);
    }
    results.steps.push({ step: "check_oauth", status: "ok" });

    // Step 4: Reply to the tweet
    const replyText = `Hey @${username}! We just built your creator profile on HireACreator. Claim it free: hireacreator.ai/claim?platform=x&handle=${username}`;

    const postUrl = "https://api.x.com/2/tweets";
    const oauthHeader = generateOAuthHeader("POST", postUrl);

    const replyRes = await fetch(postUrl, {
      method: "POST",
      headers: {
        Authorization: oauthHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: replyText,
        reply: { in_reply_to_tweet_id: mention.id },
      }),
      signal: AbortSignal.timeout(10000),
    });
    const replyData = await replyRes.json();
    results.steps.push({
      step: "reply",
      status: replyRes.status,
      ok: replyRes.ok,
      data: replyData,
      reply_text: replyText,
    });

    return NextResponse.json(results);
  } catch (e: any) {
    results.error = e.message;
    return NextResponse.json(results);
  }
}
