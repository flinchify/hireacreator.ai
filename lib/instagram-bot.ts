export const INSTAGRAM_CONFIGURED = !!process.env.INSTAGRAM_ACCESS_TOKEN;

function getToken(): string | null {
  return process.env.INSTAGRAM_ACCESS_TOKEN || null;
}

function getPageId(): string | null {
  return process.env.INSTAGRAM_PAGE_ID || null;
}

export async function replyToComment(
  commentId: string,
  message: string
): Promise<boolean> {
  const token = getToken();
  if (!token) return false;

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${commentId}/replies`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, access_token: token }),
        signal: AbortSignal.timeout(10000),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export async function replyToMention(
  mediaId: string,
  message: string
): Promise<boolean> {
  const token = getToken();
  if (!token) return false;

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${mediaId}/comments`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, access_token: token }),
        signal: AbortSignal.timeout(10000),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export async function getCommentDetails(
  commentId: string
): Promise<{ text: string; username: string; mediaId: string } | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${commentId}?fields=text,username,media&access_token=${token}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      text: data.text || "",
      username: data.username || "",
      mediaId: data.media?.id || "",
    };
  } catch {
    return null;
  }
}

export async function getUserProfile(
  username: string
): Promise<{
  id: string;
  name: string;
  biography: string;
  followers_count: number;
  profile_picture_url: string;
} | null> {
  const token = getToken();
  const pageId = getPageId();
  if (!token || !pageId) return null;

  try {
    const searchRes = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}?fields=business_discovery.username(${encodeURIComponent(username)}){id,name,biography,followers_count,profile_picture_url}&access_token=${token}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!searchRes.ok) return null;
    const data = await searchRes.json();
    const bd = data.business_discovery;
    if (!bd) return null;
    return {
      id: bd.id || "",
      name: bd.name || "",
      biography: bd.biography || "",
      followers_count: bd.followers_count || 0,
      profile_picture_url: bd.profile_picture_url || "",
    };
  } catch {
    return null;
  }
}
