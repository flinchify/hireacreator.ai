import { NextResponse } from "next/server";

export const maxDuration = 30;

export async function GET() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!accessToken) return NextResponse.json({ error: "No token" });

  const results: any = {};

  // Get media
  const mediaRes = await fetch(
    `https://graph.instagram.com/v21.0/me/media?fields=id,caption,timestamp,comments_count&limit=5&access_token=${accessToken}`
  );
  const mediaData = await mediaRes.json();
  results.media = mediaData;

  // Get comments on first post
  if (mediaData.data && mediaData.data.length > 0) {
    const postId = mediaData.data[0].id;
    const commentsRes = await fetch(
      `https://graph.instagram.com/v21.0/${postId}/comments?fields=id,text,username,timestamp&limit=50&access_token=${accessToken}`
    );
    const commentsData = await commentsRes.json();
    results.comments = commentsData;
    results.postId = postId;
  }

  return NextResponse.json(results);
}
