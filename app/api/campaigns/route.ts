import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const niche = searchParams.get("niche");
    const platform = searchParams.get("platform");
    const minBudget = searchParams.get("minBudget");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const offset = (page - 1) * limit;

    let campaigns;

    if (niche && platform) {
      campaigns = await db`
        SELECT c.*, u.full_name as brand_name, u.avatar_url as brand_avatar
        FROM brand_campaigns c
        LEFT JOIN users u ON c.brand_id = u.id
        WHERE c.status = 'active'
        AND c.niche = ${niche}
        AND ${platform} = ANY(c.platforms)
        AND (c.deadline IS NULL OR c.deadline > NOW())
        ORDER BY c.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (niche) {
      campaigns = await db`
        SELECT c.*, u.full_name as brand_name, u.avatar_url as brand_avatar
        FROM brand_campaigns c
        LEFT JOIN users u ON c.brand_id = u.id
        WHERE c.status = 'active'
        AND c.niche = ${niche}
        AND (c.deadline IS NULL OR c.deadline > NOW())
        ORDER BY c.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (platform) {
      campaigns = await db`
        SELECT c.*, u.full_name as brand_name, u.avatar_url as brand_avatar
        FROM brand_campaigns c
        LEFT JOIN users u ON c.brand_id = u.id
        WHERE c.status = 'active'
        AND ${platform} = ANY(c.platforms)
        AND (c.deadline IS NULL OR c.deadline > NOW())
        ORDER BY c.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      campaigns = await db`
        SELECT c.*, u.full_name as brand_name, u.avatar_url as brand_avatar
        FROM brand_campaigns c
        LEFT JOIN users u ON c.brand_id = u.id
        WHERE c.status = 'active'
        AND (c.deadline IS NULL OR c.deadline > NOW())
        ORDER BY c.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    return NextResponse.json({ campaigns, page, limit });
  } catch (err) {
    console.error("Campaigns GET error:", err);
    return NextResponse.json({ error: "Failed to fetch campaigns." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();

    // Check auth
    const token = req.cookies.get("session_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await db`
      SELECT user_id FROM auth_sessions WHERE token = ${token} AND expires_at > NOW() LIMIT 1
    `;
    if (!sessions.length) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = sessions[0].user_id as string;
    const users = await db`SELECT role FROM users WHERE id = ${userId} LIMIT 1`;
    if (!users.length || (users[0].role !== "brand" && users[0].role !== "admin")) {
      return NextResponse.json({ error: "Only brand accounts can create campaigns." }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, budget_cents, budget_per_creator_cents, niche, min_followers, max_followers, platforms, max_creators, deadline } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    const result = await db`
      INSERT INTO brand_campaigns (
        brand_id, title, description, budget_cents, budget_per_creator_cents,
        niche, min_followers, max_followers, platforms, max_creators, deadline, status
      ) VALUES (
        ${userId}, ${title}, ${description || null}, ${budget_cents || null},
        ${budget_per_creator_cents || null}, ${niche || null}, ${min_followers || 0},
        ${max_followers || null}, ${platforms || []}, ${max_creators || 10},
        ${deadline || null}, 'active'
      )
      RETURNING id
    `;

    return NextResponse.json({ id: result[0].id, status: "active" }, { status: 201 });
  } catch (err) {
    console.error("Campaigns POST error:", err);
    return NextResponse.json({ error: "Failed to create campaign." }, { status: 500 });
  }
}
