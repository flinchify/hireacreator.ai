import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const VERIFY_TOKEN = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || "hireacreator-ig-verify-2026";

/**
 * GET — Webhook verification (Meta sends this to confirm your endpoint)
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("[Instagram Webhook] Verified");
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/**
 * POST — Incoming webhook events (mentions, comments)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[Instagram Webhook] Event:", JSON.stringify(body, null, 2));

    const sql = getDb();

    // Process each entry
    for (const entry of body.entry || []) {
      // Handle mentions
      for (const change of entry.changes || []) {
        if (change.field === "mentions" || change.field === "comments") {
          const mediaId = change.value?.media_id;
          const commentId = change.value?.id;
          const text = change.value?.text || "";
          const from = change.value?.from;

          // Log the mention
          await sql`
            INSERT INTO instagram_webhooks (event_type, media_id, comment_id, from_username, from_id, text, raw_payload)
            VALUES (
              ${change.field},
              ${mediaId || null},
              ${commentId || null},
              ${from?.username || null},
              ${from?.id || null},
              ${text},
              ${JSON.stringify(change.value)}
            )
          `.catch(() => {
            // Table might not exist yet, just log
            console.log("[Instagram Webhook] Could not save to DB, logging only");
          });

          // If someone tagged @hireacreatorai, auto-build their profile
          if (text.toLowerCase().includes("@hireacreator") && from?.username) {
            console.log(`[Instagram Webhook] Mention detected from @${from.username}`);
            
            // Queue profile creation (fire and forget)
            fetch(`${process.env.NEXT_PUBLIC_APP_URL || "https://hireacreator.ai"}/api/score`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ platform: "instagram", handle: from.username }),
            }).catch(() => {});

            // Auto-reply to the comment
            if (commentId) {
              const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
              if (accessToken) {
                const replyText = `Hey @${from.username}! We just built your creator profile on HireACreator. Claim it free: hireacreator.ai/claim?platform=instagram&handle=${from.username}`;
                
                fetch(`https://graph.instagram.com/v21.0/${commentId}/replies`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    message: replyText,
                    access_token: accessToken,
                  }),
                }).catch((err) => {
                  console.error("[Instagram Webhook] Reply failed:", err);
                });
              }
            }
          }
        }
      }
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("[Instagram Webhook] Error:", e);
    // Still return 200 — Meta will retry on non-200
    return NextResponse.json({ received: true });
  }
}
