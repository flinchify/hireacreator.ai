import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

async function getUser() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.* FROM users u
    JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  return rows.length > 0 ? rows[0] : null;
}

export async function GET() {
  try {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sql = getDb();
  const creatorId = user.id;

  const [
    totalEarnedRow,
    thisMonthRow,
    pendingRow,
    availableRow,
    monthlyData,
    recentBookings,
  ] = await Promise.all([
    // Total earned (completed bookings)
    sql`
      SELECT COALESCE(SUM(amount), 0)::int AS total
      FROM bookings
      WHERE creator_id = ${creatorId} AND status IN ('completed', 'paid')
    `,

    // This month
    sql`
      SELECT COALESCE(SUM(amount), 0)::int AS total
      FROM bookings
      WHERE creator_id = ${creatorId}
        AND status IN ('completed', 'paid')
        AND created_at >= DATE_TRUNC('month', NOW())
    `,

    // Pending (unpaid completed bookings)
    sql`
      SELECT COALESCE(SUM(amount), 0)::int AS total
      FROM bookings
      WHERE creator_id = ${creatorId}
        AND status = 'completed'
        AND (payout_status IS NULL OR payout_status = 'pending')
    `,

    // Available for payout
    sql`
      SELECT COALESCE(SUM(amount), 0)::int AS total
      FROM bookings
      WHERE creator_id = ${creatorId}
        AND status = 'completed'
        AND (payout_status IS NULL OR payout_status IN ('pending', 'processing'))
    `,

    // Monthly data (last 6 months)
    sql`
      SELECT
        TO_CHAR(m, 'YYYY-MM') AS month,
        COALESCE(SUM(b.amount), 0)::int AS amount
      FROM generate_series(
        DATE_TRUNC('month', NOW()) - INTERVAL '5 months',
        DATE_TRUNC('month', NOW()),
        '1 month'
      ) AS m
      LEFT JOIN bookings b
        ON b.creator_id = ${creatorId}
        AND b.status IN ('completed', 'paid')
        AND DATE_TRUNC('month', b.created_at) = m
      GROUP BY m
      ORDER BY m
    `,

    // Recent bookings (last 20)
    sql`
      SELECT
        b.id,
        COALESCE(u.full_name, 'Unknown') AS client_name,
        COALESCE(s.title, 'Service') AS service,
        b.amount,
        b.status,
        b.payout_status,
        b.created_at AS date
      FROM bookings b
      LEFT JOIN users u ON u.id = b.client_id
      LEFT JOIN services s ON s.id = b.service_id
      WHERE b.creator_id = ${creatorId}
      ORDER BY b.created_at DESC
      LIMIT 20
    `,
  ]);

  return NextResponse.json({
    totalEarned: totalEarnedRow[0]?.total || 0,
    thisMonth: thisMonthRow[0]?.total || 0,
    pending: pendingRow[0]?.total || 0,
    available: availableRow[0]?.total || 0,
    monthlyData: monthlyData.map((r: any) => ({ month: r.month, amount: r.amount })),
    recentBookings: recentBookings.map((r: any) => ({
      id: r.id,
      clientName: r.client_name,
      service: r.service,
      amount: r.amount,
      status: r.status,
      payoutStatus: r.payout_status,
      date: r.date,
    })),
  });
  } catch (e) {
    console.error("[Earnings] Error:", e);
    return NextResponse.json({ totalEarned: 0, thisMonth: 0, pending: 0, available: 0, monthlyData: [], recentBookings: [] });
  }
}
