import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const auth = await authenticateApiRequest(request, "write");
    if (!auth.ok) return auth.response;

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "invalid_body", message: "Request body must be valid JSON." },
        { status: 400 }
      );
    }

    const { platform, url, username } = body;
    const handle = username || body.handle;

    if (!platform || !handle) {
      return NextResponse.json(
        { error: "missing_fields", message: "platform and username (or handle) are required." },
        { status: 400 }
      );
    }

    const sql = getDb();

    // Max 15 social links
    const count = await sql`SELECT COUNT(*)::int AS cnt FROM social_connections WHERE user_id = ${auth.key.userId}`;
    if ((count[0]?.cnt || 0) >= 15) {
      return NextResponse.json(
        { error: "max_socials", message: "Maximum 15 social links allowed." },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO social_connections (user_id, platform, handle, url, follower_count)
      VALUES (${auth.key.userId}, ${platform.toLowerCase()}, ${handle}, ${url || null}, 0)
      RETURNING id, platform, handle, url
    `;

    return NextResponse.json({
      success: true,
      social: result[0],
    }, { status: 201 });
  } catch (err: any) {
    console.error("[Agent Socials POST Error]", err);
    return NextResponse.json(
      { error: "internal_error", message: "Failed to add social link." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await authenticateApiRequest(request, "write");
    if (!auth.ok) return auth.response;

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "invalid_body", message: "Request body must be valid JSON." },
        { status: 400 }
      );
    }

    const { platform, connectionId } = body;

    if (!platform && !connectionId) {
      return NextResponse.json(
        { error: "missing_fields", message: "Provide platform or connectionId to identify the social link to remove." },
        { status: 400 }
      );
    }

    const sql = getDb();

    if (connectionId) {
      await sql`DELETE FROM social_connections WHERE id = ${connectionId} AND user_id = ${auth.key.userId}`;
    } else {
      await sql`DELETE FROM social_connections WHERE platform = ${platform.toLowerCase()} AND user_id = ${auth.key.userId}`;
    }

    return NextResponse.json({ success: true, message: "Social link removed." });
  } catch (err: any) {
    console.error("[Agent Socials DELETE Error]", err);
    return NextResponse.json(
      { error: "internal_error", message: "Failed to remove social link." },
      { status: 500 }
    );
  }
}
