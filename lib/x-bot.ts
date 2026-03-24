import crypto from "crypto";

export const X_CONFIGURED = !!process.env.X_BEARER_TOKEN;

function getBearer(): string | null {
  return process.env.X_BEARER_TOKEN || null;
}

/** RFC 3986 percent-encoding */
export function encodeRFC3986(str: string): string {
  return encodeURIComponent(str).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

/** Generate OAuth 1.0a Authorization header for X API */
export function generateOAuthHeader(
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

/** Get masked OAuth details for debug output */
export function getMaskedOAuthDetails(): Record<string, string> {
  const mask = (s: string | undefined) =>
    s ? s.slice(0, 4) + "..." + s.slice(-4) : "NOT SET";
  return {
    X_API_KEY: mask(process.env.X_API_KEY),
    X_API_SECRET: mask(process.env.X_API_SECRET),
    X_ACCESS_TOKEN: mask(process.env.X_ACCESS_TOKEN),
    X_ACCESS_SECRET: mask(process.env.X_ACCESS_SECRET),
    X_BEARER_TOKEN: mask(process.env.X_BEARER_TOKEN),
  };
}

export async function replyToTweet(
  tweetId: string,
  message: string
): Promise<{ ok: boolean; data?: any; error?: string }> {
  const postUrl = "https://api.x.com/2/tweets";
  const oauthHeader = generateOAuthHeader("POST", postUrl);

  try {
    const res = await fetch(postUrl, {
      method: "POST",
      headers: {
        Authorization: oauthHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: message,
        reply: { in_reply_to_tweet_id: tweetId },
      }),
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();
    return { ok: res.ok, data };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function getUserByUsername(
  username: string
): Promise<{
  id: string;
  name: string;
  description: string;
  profile_image_url?: string;
  url?: string;
  pinned_tweet_id?: string;
  public_metrics: { followers_count: number; following_count: number; tweet_count: number };
} | null> {
  const bearer = getBearer();
  if (!bearer) return null;

  try {
    const res = await fetch(
      `https://api.x.com/2/users/by/username/${encodeURIComponent(username)}?user.fields=name,description,profile_image_url,public_metrics,url,pinned_tweet_id`,
      {
        headers: { Authorization: `Bearer ${bearer}` },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const user = data.data;
    if (!user) return null;
    return {
      id: user.id,
      name: user.name || "",
      description: user.description || "",
      profile_image_url: user.profile_image_url,
      url: user.url,
      pinned_tweet_id: user.pinned_tweet_id,
      public_metrics: {
        followers_count: user.public_metrics?.followers_count || 0,
        following_count: user.public_metrics?.following_count || 0,
        tweet_count: user.public_metrics?.tweet_count || 0,
      },
    };
  } catch {
    return null;
  }
}

/** Fetch tweet by ID with text and entities */
export async function lookupTweet(
  tweetId: string
): Promise<{ text: string; author_id: string; entities?: any } | null> {
  const bearer = getBearer();
  if (!bearer) return null;

  try {
    const res = await fetch(
      `https://api.x.com/2/tweets/${tweetId}?tweet.fields=author_id,text,entities`,
      {
        headers: { Authorization: `Bearer ${bearer}` },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const tweet = data.data;
    if (!tweet) return null;
    return { text: tweet.text || "", author_id: tweet.author_id || "", entities: tweet.entities };
  } catch {
    return null;
  }
}

/** Get user's mentions via /2/users/:id/mentions (alternative to search) */
export async function getUserMentions(
  userId: string
): Promise<{ data: any[]; includes?: any; meta?: any; raw?: any } | null> {
  const bearer = getBearer();
  if (!bearer) return null;

  try {
    const res = await fetch(
      `https://api.x.com/2/users/${userId}/mentions?tweet.fields=author_id,created_at,text&user.fields=username,name,profile_image_url,public_metrics&expansions=author_id&max_results=20`,
      {
        headers: { Authorization: `Bearer ${bearer}` },
        signal: AbortSignal.timeout(10000),
      }
    );
    const raw = await res.json();
    if (!res.ok) return { data: [], raw };
    return {
      data: raw.data || [],
      includes: raw.includes,
      meta: raw.meta,
      raw,
    };
  } catch {
    return null;
  }
}

/** Search recent tweets with a given query string */
export async function searchRecentTweets(
  query: string
): Promise<{ data: any[]; includes?: any; meta?: any; raw?: any; url: string }> {
  const bearer = getBearer();
  if (!bearer) return { data: [], url: "", raw: { error: "No bearer token" } };

  const url = `https://api.x.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&tweet.fields=author_id,created_at,text&user.fields=username,name,profile_image_url,public_metrics&expansions=author_id&max_results=20`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${bearer}` },
      signal: AbortSignal.timeout(10000),
    });
    const raw = await res.json();
    return {
      data: raw.data || [],
      includes: raw.includes,
      meta: raw.meta,
      raw,
      url,
    };
  } catch (e: any) {
    return { data: [], url, raw: { error: e.message } };
  }
}

/** Scrape X profile data + pinned tweet for a given handle */
export async function scrapeXProfile(handle: string): Promise<{
  user: Awaited<ReturnType<typeof getUserByUsername>>;
  pinnedTweet: Awaited<ReturnType<typeof lookupTweet>>;
  links: string[];
}> {
  const user = await getUserByUsername(handle);
  let pinnedTweet: Awaited<ReturnType<typeof lookupTweet>> = null;
  const links: string[] = [];

  if (user) {
    // Extract links from bio
    if (user.url) links.push(user.url);
    const urlMatches = user.description?.match(/https?:\/\/[^\s]+/g);
    if (urlMatches) links.push(...urlMatches);

    // Fetch pinned tweet
    if (user.pinned_tweet_id) {
      pinnedTweet = await lookupTweet(user.pinned_tweet_id);
      if (pinnedTweet?.entities?.urls) {
        for (const u of pinnedTweet.entities.urls) {
          if (u.expanded_url) links.push(u.expanded_url);
        }
      }
      // Also extract URLs from pinned tweet text
      const pinnedUrls = pinnedTweet?.text?.match(/https?:\/\/[^\s]+/g);
      if (pinnedUrls) links.push(...pinnedUrls);
    }
  }

  return { user, pinnedTweet, links: Array.from(new Set(links)) };
}

/** Generate a smart reply based on tweet content — delegates to shared bot-replies */
export { generateSmartReply } from "./bot-replies";
