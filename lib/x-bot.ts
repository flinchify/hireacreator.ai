export const X_CONFIGURED = !!process.env.X_BEARER_TOKEN;

function getBearer(): string | null {
  return process.env.X_BEARER_TOKEN || null;
}

function getOAuthHeaders(): Record<string, string> | null {
  const key = process.env.X_API_KEY;
  const secret = process.env.X_API_SECRET;
  const token = process.env.X_ACCESS_TOKEN;
  const tokenSecret = process.env.X_ACCESS_SECRET;
  if (!key || !secret || !token || !tokenSecret) return null;
  // For tweet creation, we need OAuth 1.0a — use Basic auth with consumer credentials
  // In production this would use proper OAuth signing; here we use Bearer for reads
  // and a simplified approach for writes
  return {
    Authorization: `Bearer ${process.env.X_BEARER_TOKEN}`,
    "Content-Type": "application/json",
  };
}

export async function replyToTweet(
  tweetId: string,
  message: string
): Promise<boolean> {
  const headers = getOAuthHeaders();
  if (!headers) return false;

  try {
    const res = await fetch("https://api.x.com/2/tweets", {
      method: "POST",
      headers,
      body: JSON.stringify({
        text: message,
        reply: { in_reply_to_tweet_id: tweetId },
      }),
      signal: AbortSignal.timeout(10000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getUserByUsername(
  username: string
): Promise<{
  id: string;
  name: string;
  description: string;
  public_metrics: { followers_count: number };
} | null> {
  const bearer = getBearer();
  if (!bearer) return null;

  try {
    const res = await fetch(
      `https://api.x.com/2/users/by/username/${encodeURIComponent(username)}?user.fields=description,public_metrics`,
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
      public_metrics: {
        followers_count: user.public_metrics?.followers_count || 0,
      },
    };
  } catch {
    return null;
  }
}

export async function lookupTweet(
  tweetId: string
): Promise<{ text: string; author_id: string } | null> {
  const bearer = getBearer();
  if (!bearer) return null;

  try {
    const res = await fetch(
      `https://api.x.com/2/tweets/${tweetId}?tweet.fields=author_id`,
      {
        headers: { Authorization: `Bearer ${bearer}` },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const tweet = data.data;
    if (!tweet) return null;
    return { text: tweet.text || "", author_id: tweet.author_id || "" };
  } catch {
    return null;
  }
}
