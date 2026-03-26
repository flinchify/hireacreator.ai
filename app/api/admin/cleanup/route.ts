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

async function deleteUserAndRelatedData(sql: any, userId: string): Promise<void> {
  // Analytics
  try { await sql`DELETE FROM profile_views WHERE creator_id = ${userId}`; } catch {}
  try { await sql`DELETE FROM link_clicks WHERE creator_id = ${userId}`; } catch {}
  try { await sql`DELETE FROM enquiry_log WHERE creator_id = ${userId}`; } catch {}
  // Animations, links, verification
  try { await sql`DELETE FROM profile_animations WHERE user_id = ${userId}`; } catch {}
  try { await sql`DELETE FROM bio_links WHERE user_id = ${userId}`; } catch {}
  try { await sql`DELETE FROM verification_codes WHERE user_id = ${userId}`; } catch {}
  // Featured rotations
  try { await sql`DELETE FROM featured_rotations WHERE creator_id = ${userId}`; } catch {}
  // Agent activity (nullable FK)
  try { await sql`UPDATE agent_activity SET agent_user_id = NULL WHERE agent_user_id = ${userId}`; } catch {}
  // Messaging
  try { await sql`DELETE FROM message_reports WHERE reporter_id = ${userId}`; } catch {}
  try { await sql`DELETE FROM messages WHERE sender_id = ${userId}`; } catch {}
  try { await sql`DELETE FROM conversations WHERE participant_a = ${userId} OR participant_b = ${userId}`; } catch {}
  // Calendar
  try { await sql`DELETE FROM calendar_bookings WHERE creator_id = ${userId}`; } catch {}
  try { await sql`UPDATE calendar_bookings SET client_id = NULL WHERE client_id = ${userId}`; } catch {}
  try { await sql`DELETE FROM calendar_sessions WHERE user_id = ${userId}`; } catch {}
  try { await sql`DELETE FROM availability_slots WHERE user_id = ${userId}`; } catch {}
  // Agent verifications
  try { await sql`DELETE FROM agent_verifications WHERE user_id = ${userId}`; } catch {}
  // API keys + rate limits
  try { await sql`DELETE FROM rate_limit_log WHERE api_key_id IN (SELECT id FROM api_keys WHERE user_id = ${userId})`; } catch {}
  try { await sql`DELETE FROM api_keys WHERE user_id = ${userId}`; } catch {}
  // Offers
  try { await sql`DELETE FROM offers WHERE brand_user_id = ${userId} OR creator_user_id = ${userId}`; } catch {}
  // Reviews, bookings
  try { await sql`DELETE FROM reviews WHERE reviewer_id = ${userId} OR creator_id = ${userId}`; } catch {}
  try { await sql`DELETE FROM bookings WHERE client_id = ${userId} OR creator_id = ${userId}`; } catch {}
  // Portfolio, services, socials, sessions
  try { await sql`DELETE FROM portfolio_items WHERE user_id = ${userId}`; } catch {}
  try { await sql`DELETE FROM services WHERE user_id = ${userId}`; } catch {}
  try { await sql`DELETE FROM social_connections WHERE user_id = ${userId}`; } catch {}
  try { await sql`DELETE FROM auth_sessions WHERE user_id = ${userId}`; } catch {}
  // Outreach, stars
  try { await sql`DELETE FROM outreach_contacts WHERE user_id = ${userId}`; } catch {}
  try { await sql`DELETE FROM stars WHERE user_id = ${userId}`; } catch {}

  // Delete user
  await sql`DELETE FROM users WHERE id = ${userId}`;
}

export async function POST() {
  try {
    const admin = await getAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const sql = getDb();

    // Find mock accounts
    const agentAccounts = await sql`
      SELECT id, email, full_name FROM users WHERE email LIKE '%@demo-agent.hireacreator.ai'
    `;
    const arbAccount = await sql`
      SELECT id, email, full_name FROM users WHERE email = 'demo@arb.com.au'
    `;
    const gibberishAccount = await sql`
      SELECT id, email, full_name FROM users WHERE slug = 'buildingmeth22'
    `;

    const allAccounts = [
      ...agentAccounts.map((a: any) => ({ ...a, label: `agent: ${a.email}` })),
      ...arbAccount.map((a: any) => ({ ...a, label: `arb: ${a.email}` })),
      ...gibberishAccount.map((a: any) => ({ ...a, label: `gibberish: ${a.full_name || a.email}` })),
    ];

    if (allAccounts.length === 0) {
      return NextResponse.json({ message: "No mock data found. Database is clean.", deleted: 0 });
    }

    const deletedLabels: string[] = [];
    for (const account of allAccounts) {
      await deleteUserAndRelatedData(sql, account.id);
      deletedLabels.push(account.label);
    }

    return NextResponse.json({
      message: `Cleaned up ${allAccounts.length} mock account(s)`,
      deleted: allAccounts.length,
      accounts: deletedLabels,
    });

  } catch (err) {
    console.error("Cleanup error:", err);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
