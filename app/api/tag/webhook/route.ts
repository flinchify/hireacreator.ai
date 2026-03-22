import { NextRequest, NextResponse } from "next/server";
import { processIncomingMention } from "@/lib/bot-processor";

// Instagram webhook verification (hub.challenge)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN =
    process.env.WEBHOOK_VERIFY_TOKEN || "hireacreator-verify-2026";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge || "", { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// Process incoming webhook events (Instagram mentions, X mentions)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Instagram webhook format
    if (body.object === "instagram") {
      const entries = body.entry || [];
      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          if (
            change.field === "mentions" ||
            change.field === "comments"
          ) {
            const value = change.value || {};
            const text: string = value.text || "";
            const mediaId = value.media_id || value.media?.id;
            const commentId = value.comment_id || value.id;
            const fromUsername: string = value.from?.username || "";

            const mentions = extractHandles(text);

            // Process via unified bot processor (fire and forget for speed)
            processIncomingMention({
              platform: "instagram",
              text,
              mentions: mentions.map((h) => `@${h}`),
              requesterHandle: fromUsername,
              postId: mediaId || commentId || "",
              commentId: commentId || undefined,
              mediaId: mediaId || undefined,
            }).catch((err) =>
              console.error("[WEBHOOK] Instagram processing error:", err)
            );
          }
        }
      }
      return NextResponse.json({ status: "ok" });
    }

    // X/Twitter Account Activity API format
    if (body.tweet_create_events || body.for_user_id) {
      const tweets = body.tweet_create_events || [];
      for (const tweet of tweets) {
        const userMentions = tweet.entities?.user_mentions || [];
        const tweetId = tweet.id_str;
        const taggerHandle: string = tweet.user?.screen_name || "";
        const tweetText: string = tweet.text || "";

        const mentionHandles = userMentions.map(
          (m: { screen_name: string }) => `@${m.screen_name}`
        );

        // Process via unified bot processor (fire and forget for speed)
        processIncomingMention({
          platform: "x",
          text: tweetText,
          mentions: mentionHandles,
          requesterHandle: taggerHandle,
          postId: tweetId,
        }).catch((err) =>
          console.error("[WEBHOOK] X processing error:", err)
        );
      }
      return NextResponse.json({ status: "ok" });
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

function extractHandles(text: string): string[] {
  const matches = text.match(/@([a-zA-Z0-9_.]+)/g) || [];
  return matches
    .map((m) => m.replace(/^@/, "").toLowerCase())
    .filter(
      (h) =>
        h !== "hireacreator" &&
        h !== "hireacreatorai" &&
        h.length > 1
    );
}
