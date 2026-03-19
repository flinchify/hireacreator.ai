import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

async function getAdmin() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.id, u.role FROM users u
    JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW() AND u.role = 'admin'
  `;
  return rows.length > 0 ? rows[0] : null;
}

// GET — list all users (admin only)
export async function GET(request: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format"); // "csv" for export
  const search = searchParams.get("search") || "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = 50;
  const offset = (page - 1) * limit;

  const sql = getDb();

  let users;
  let total;

  if (search) {
    const q = `%${search}%`;
    users = await sql`
      SELECT u.id, u.email, u.full_name, u.slug, u.role, u.subscription_tier, u.is_verified, u.is_banned,
             u.ban_reason, u.is_online, u.created_at, u.updated_at, u.avatar_url,
             u.verification_status,
             (SELECT COUNT(*)::int FROM social_connections sc WHERE sc.user_id = u.id) AS social_count
      FROM users u
      WHERE u.email ILIKE ${q} OR u.full_name ILIKE ${q} OR u.slug ILIKE ${q}
      ORDER BY u.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    total = await sql`
      SELECT COUNT(*)::int AS cnt FROM users
      WHERE email ILIKE ${q} OR full_name ILIKE ${q} OR slug ILIKE ${q}
    `;
  } else {
    users = await sql`
      SELECT u.id, u.email, u.full_name, u.slug, u.role, u.subscription_tier, u.is_verified, u.is_banned,
             u.ban_reason, u.is_online, u.created_at, u.updated_at, u.avatar_url,
             u.verification_status,
             (SELECT COUNT(*)::int FROM social_connections sc WHERE sc.user_id = u.id) AS social_count
      FROM users u
      ORDER BY u.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    total = await sql`SELECT COUNT(*)::int AS cnt FROM users`;
  }

  // CSV export
  if (format === "csv") {
    // Get ALL users for export (no pagination)
    const allUsers = await sql`
      SELECT id, email, full_name, slug, role, subscription_tier, is_verified, is_banned,
             ban_reason, is_online, created_at
      FROM users
      ORDER BY created_at DESC
    `;
    const header = "id,email,name,slug,role,tier,verified,banned,ban_reason,online,created_at";
    const rows = allUsers.map(u =>
      [u.id, u.email, `"${(u.full_name || "").replace(/"/g, '""')}"`, u.slug || "", u.role,
       u.subscription_tier || "free", u.is_verified ? "yes" : "no", u.is_banned ? "yes" : "no",
       `"${(u.ban_reason || "").replace(/"/g, '""')}"`, u.is_online ? "yes" : "no",
       u.created_at ? new Date(u.created_at as string).toISOString() : ""].join(",")
    );
    const csv = [header, ...rows].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="hireacreator-users-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  }

  return NextResponse.json({
    users,
    total: total[0]?.cnt || 0,
    page,
    pages: Math.ceil((total[0]?.cnt || 0) / limit),
  });
}

// PATCH — ban/unban/update user
export async function PATCH(request: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const { userId, action, reason } = body;

  if (!userId || !action) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const sql = getDb();

  switch (action) {
    case "ban":
      await sql`
        UPDATE users SET is_banned = true, ban_reason = ${reason || "Banned by admin"},
        banned_at = NOW(), banned_by = ${admin.id}, updated_at = NOW()
        WHERE id = ${userId}
      `;
      // Kill their sessions
      await sql`DELETE FROM auth_sessions WHERE user_id = ${userId}`;
      break;

    case "unban":
      await sql`
        UPDATE users SET is_banned = false, ban_reason = NULL, banned_at = NULL, banned_by = NULL,
        updated_at = NOW() WHERE id = ${userId}
      `;
      break;

    case "verify":
      await sql`UPDATE users SET is_verified = true, updated_at = NOW() WHERE id = ${userId}`;
      break;

    case "unverify":
      await sql`UPDATE users SET is_verified = false, updated_at = NOW() WHERE id = ${userId}`;
      break;

    case "make_admin":
      await sql`UPDATE users SET role = 'admin', updated_at = NOW() WHERE id = ${userId}`;
      break;

    case "remove_admin":
      await sql`UPDATE users SET role = 'creator', updated_at = NOW() WHERE id = ${userId}`;
      break;

    case "set_pro":
      await sql`UPDATE users SET subscription_tier = 'pro', updated_at = NOW() WHERE id = ${userId}`;
      break;

    case "remove_pro":
      await sql`UPDATE users SET subscription_tier = 'free', updated_at = NOW() WHERE id = ${userId}`;
      break;

    default:
      return NextResponse.json({ error: "unknown_action" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
