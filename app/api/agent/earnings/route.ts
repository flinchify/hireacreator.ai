import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const auth = await authenticateApiRequest(request, "read");
    if (!auth.ok) return auth.response;

    const sql = getDb();
    const userId = auth.key.userId;

    // Get completed bookings where this agent is the creator
    const [completedBookings, pendingBookings, monthlySummary] = await Promise.all([
      sql`
        SELECT b.id, b.amount, b.currency, b.completed_at, b.created_at,
               s.title AS service_title, s.category AS service_category,
               u.full_name AS client_name
        FROM bookings b
        JOIN services s ON s.id = b.service_id
        JOIN users u ON u.id = b.client_id
        WHERE b.creator_id = ${userId} AND b.status = 'completed'
        ORDER BY b.completed_at DESC
        LIMIT 50
      `,
      sql`
        SELECT COALESCE(SUM(amount), 0)::int AS total
        FROM bookings
        WHERE creator_id = ${userId} AND status IN ('accepted', 'in_progress')
      `,
      sql`
        SELECT
          TO_CHAR(completed_at, 'YYYY-MM') AS month,
          COUNT(*)::int AS bookings,
          SUM(amount)::int AS earned,
          STRING_AGG(DISTINCT s.category, ', ') AS categories
        FROM bookings b
        JOIN services s ON s.id = b.service_id
        WHERE b.creator_id = ${userId} AND b.status = 'completed' AND b.completed_at IS NOT NULL
        GROUP BY TO_CHAR(completed_at, 'YYYY-MM')
        ORDER BY month DESC
        LIMIT 12
      `,
    ]);

    const totalEarned = completedBookings.reduce((sum: number, b: any) => sum + (b.amount || 0), 0);
    const pendingPayout = pendingBookings[0]?.total || 0;

    // Breakdown by service category
    const categoryMap: Record<string, { count: number; earned: number }> = {};
    for (const b of completedBookings) {
      const cat = b.service_category || "uncategorized";
      if (!categoryMap[cat]) categoryMap[cat] = { count: 0, earned: 0 };
      categoryMap[cat].count++;
      categoryMap[cat].earned += b.amount || 0;
    }

    return NextResponse.json({
      total_earned: totalEarned,
      pending_payout: pendingPayout,
      available_balance: totalEarned - pendingPayout,
      currency: "USD",
      recent_transactions: completedBookings.map((b: any) => ({
        booking_id: b.id,
        amount: b.amount,
        currency: b.currency || "USD",
        service: b.service_title,
        category: b.service_category,
        client: b.client_name,
        completed_at: b.completed_at,
        created_at: b.created_at,
      })),
      breakdown_by_category: Object.entries(categoryMap).map(([category, data]) => ({
        category,
        bookings: data.count,
        earned: data.earned,
      })),
      monthly_summary: monthlySummary.map((m: any) => ({
        month: m.month,
        bookings: m.bookings,
        earned: m.earned,
        categories: m.categories,
      })),
    });
  } catch (err: any) {
    console.error("[Agent Earnings Error]", err);
    return NextResponse.json(
      { error: "internal_error", message: "Failed to fetch earnings." },
      { status: 500 }
    );
  }
}
