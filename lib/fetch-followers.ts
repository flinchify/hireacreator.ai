/**
 * Fetches real follower counts from public platform APIs/pages.
 * Returns null if the platform is unsupported, API keys are missing, or an error occurs.
 */
export async function fetchFollowerCount(
  platform: string,
  handle: string,
  url?: string
): Promise<number | null> {
  try {
    switch (platform.toLowerCase()) {
      case "youtube":
        return await fetchYouTubeFollowers(handle);
      case "tiktok":
        return await fetchTikTokFollowers(handle);
      case "twitch":
        return await fetchTwitchFollowers(handle);
      case "github":
        return await fetchGitHubFollowers(handle);
      case "twitter":
      case "x":
        // X API requires paid tier — skip for MVP
        return null;
      case "instagram":
        // No public API available — skip for MVP
        return null;
      default:
        // Kick, Snapchat, LinkedIn, Spotify, Pinterest, Discord, website, etc. — skip for MVP
        return null;
    }
  } catch {
    return null;
  }
}

/** YouTube Data API v3 — requires YOUTUBE_API_KEY env var */
async function fetchYouTubeFollowers(handle: string): Promise<number | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return null;

  // Handle could be a channel ID (starts with UC), @handle, or username
  let endpoint: string;
  if (handle.startsWith("UC") && handle.length === 24) {
    endpoint = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${encodeURIComponent(handle)}&key=${apiKey}`;
  } else {
    // Try forHandle (@ handles) first
    const cleanHandle = handle.startsWith("@") ? handle.slice(1) : handle;
    endpoint = `https://www.googleapis.com/youtube/v3/channels?part=statistics&forHandle=${encodeURIComponent(cleanHandle)}&key=${apiKey}`;
  }

  const res = await fetch(endpoint, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) return null;

  const data = await res.json();
  const items = data.items;
  if (!items || items.length === 0) return null;

  const count = parseInt(items[0].statistics?.subscriberCount, 10);
  return isNaN(count) ? null : count;
}

/** TikTok — scrape follower count from public profile page meta tags */
async function fetchTikTokFollowers(handle: string): Promise<number | null> {
  const cleanHandle = handle.startsWith("@") ? handle.slice(1) : handle;
  const profileUrl = `https://www.tiktok.com/@${encodeURIComponent(cleanHandle)}`;

  const res = await fetch(profileUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; HireACreator/1.0)",
      Accept: "text/html",
    },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) return null;

  const html = await res.text();

  // Try to extract from JSON-LD / SIGI_STATE / __UNIVERSAL_DATA_FOR_REHYDRATION__
  const stateMatch = html.match(/"followerCount"\s*:\s*(\d+)/);
  if (stateMatch) {
    const count = parseInt(stateMatch[1], 10);
    return isNaN(count) ? null : count;
  }

  // Fallback: try meta tag content
  const metaMatch = html.match(
    /<meta[^>]*name="description"[^>]*content="[^"]*?(\d[\d,.]*)\s*Followers/i
  );
  if (metaMatch) {
    const count = parseInt(metaMatch[1].replace(/[,.\s]/g, ""), 10);
    return isNaN(count) ? null : count;
  }

  return null;
}

/** Twitch Helix API — requires TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET env vars */
async function fetchTwitchFollowers(handle: string): Promise<number | null> {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  // Step 1: Get app access token
  const tokenRes = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!tokenRes.ok) return null;

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;
  if (!accessToken) return null;

  // Step 2: Get user ID from login name
  const cleanHandle = handle.startsWith("@") ? handle.slice(1) : handle;
  const userRes = await fetch(
    `https://api.twitch.tv/helix/users?login=${encodeURIComponent(cleanHandle)}`,
    {
      headers: {
        "Client-ID": clientId,
        Authorization: `Bearer ${accessToken}`,
      },
      signal: AbortSignal.timeout(10000),
    }
  );
  if (!userRes.ok) return null;

  const userData = await userRes.json();
  const userId = userData.data?.[0]?.id;
  if (!userId) return null;

  // Step 3: Get follower count
  const followRes = await fetch(
    `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${userId}&first=1`,
    {
      headers: {
        "Client-ID": clientId,
        Authorization: `Bearer ${accessToken}`,
      },
      signal: AbortSignal.timeout(10000),
    }
  );
  if (!followRes.ok) return null;

  const followData = await followRes.json();
  return typeof followData.total === "number" ? followData.total : null;
}

/** GitHub public API — no auth needed */
async function fetchGitHubFollowers(handle: string): Promise<number | null> {
  const cleanHandle = handle.startsWith("@") ? handle.slice(1) : handle;
  const res = await fetch(
    `https://api.github.com/users/${encodeURIComponent(cleanHandle)}`,
    {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "HireACreator/1.0",
      },
      signal: AbortSignal.timeout(10000),
    }
  );
  if (!res.ok) return null;

  const data = await res.json();
  return typeof data.followers === "number" ? data.followers : null;
}
