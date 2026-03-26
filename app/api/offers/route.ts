import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

// Helper function to get authenticated user
async function getAuthenticatedUser() {
  const token = cookies().get("session_token")?.value;
  if (!token) {
    return null;
  }

  const sql = getDb();
  const rows = await sql`
    SELECT u.id, u.email, u.full_name, u.role, u.is_verified
    FROM users u
    JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
    LIMIT 1
  `;

  return rows.length > 0 ? rows[0] : null;
}

// Helper function to normalize handles
function normalizeHandle(handle: string): string {
  return handle.toLowerCase().trim().replace(/^@/, "");
}

// Helper function to check rate limits
async function checkRateLimits(sql: any, brandUserId: string, creatorHandle: string, creatorPlatform: string): Promise<{ allowed: boolean; message?: string }> {
  // Check max 5 offers per brand per day
  const today = new Date().toISOString().split('T')[0];
  const dailyCount = await sql`
    SELECT COUNT(*) as count FROM offers
    WHERE brand_user_id = ${brandUserId}
    AND created_at >= ${today}::date
  `;
  
  if (Number(dailyCount[0].count) >= 5) {
    return { allowed: false, message: "Daily offer limit reached (5 offers per day)" };
  }

  // Check max 3 pending offers to same creator
  const pendingToSameCreator = await sql`
    SELECT COUNT(*) as count FROM offers
    WHERE brand_user_id = ${brandUserId}
    AND creator_platform = ${creatorPlatform}
    AND creator_handle = ${creatorHandle}
    AND status = 'pending'
  `;

  if (Number(pendingToSameCreator[0].count) >= 3) {
    return { allowed: false, message: "Too many pending offers to this creator (max 3 pending)" };
  }

  return { allowed: true };
}

// POST /api/offers - Create an offer (brand only)
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    if (user.role !== "brand" && user.role !== "admin") {
      return NextResponse.json({ error: "Only brands can create offers" }, { status: 403 });
    }

    const body = await req.json();
    const { creator_handle, creator_platform, budget, brief, deliverables, timeline_days } = body;

    // Validate required fields
    if (!creator_handle || !creator_platform || !budget || !brief || !deliverables) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate platform
    const validPlatforms = ["instagram", "tiktok", "youtube", "x"];
    if (!validPlatforms.includes(creator_platform)) {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
    }

    // Normalize handle and validate
    const normalizedHandle = normalizeHandle(creator_handle);
    if (!normalizedHandle || normalizedHandle.length > 100) {
      return NextResponse.json({ error: "Invalid handle" }, { status: 400 });
    }

    // Convert budget to cents and validate
    const budgetCents = Math.round(Number(budget) * 100);
    if (budgetCents <= 0 || budgetCents >= 10000000) {
      return NextResponse.json({ error: "Budget must be between $0.01 and $99,999.99" }, { status: 400 });
    }

    // Calculate service fee: 15% default, 10% for Pro brands, 5% for Enterprise brands
    const sql = getDb();

    // Check brand subscription tier
    const subscriptionRows = await sql`
      SELECT subscription_plan FROM users WHERE id = ${user.id} LIMIT 1
    `;
    const plan = subscriptionRows.length > 0 ? subscriptionRows[0].subscription_plan : null;
    const isEnterprise = plan === 'brand_enterprise';
    const isPro = plan === 'brand_pro';
    const feeRate = isEnterprise ? 0.05 : isPro ? 0.10 : 0.15;
    const feeCents = Math.round(budgetCents * feeRate);
    const totalCents = budgetCents + feeCents;

    // Validate timeline
    const timelineDays = Number(timeline_days) || 14;
    if (timelineDays < 1 || timelineDays > 365) {
      return NextResponse.json({ error: "Timeline must be between 1 and 365 days" }, { status: 400 });
    }

    // Ensure fee_cents column exists
    await sql`ALTER TABLE offers ADD COLUMN IF NOT EXISTS fee_cents INTEGER NOT NULL DEFAULT 0`.catch(() => {});

    // Check rate limits
    const rateCheck = await checkRateLimits(sql, user.id, normalizedHandle, creator_platform);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: rateCheck.message }, { status: 429 });
    }

    // Check if creator user exists
    let creatorUserId = null;
    const existingCreator = await sql`
      SELECT u.id FROM users u
      JOIN social_connections sc ON sc.user_id = u.id
      WHERE sc.platform = ${creator_platform} 
      AND LOWER(sc.handle) = ${normalizedHandle}
      LIMIT 1
    `;
    if (existingCreator.length > 0) {
      creatorUserId = existingCreator[0].id;
    }

    // Create the offer
    const offerResult = await sql`
      INSERT INTO offers (
        brand_user_id, creator_handle, creator_platform, creator_user_id,
        budget_cents, fee_cents, brief, deliverables, timeline_days
      )
      VALUES (
        ${user.id}, ${normalizedHandle}, ${creator_platform}, ${creatorUserId},
        ${budgetCents}, ${feeCents}, ${brief}, ${deliverables}, ${timelineDays}
      )
      RETURNING *
    `;

    const offer = offerResult[0];

    // Auto-create creator profile if it doesn't exist (fire and forget)
    if (!creatorUserId) {
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: creator_platform,
          handle: normalizedHandle,
        }),
      }).catch(() => {}); // Ignore errors
    }

    return NextResponse.json({
      id: offer.id,
      creator_handle: offer.creator_handle,
      creator_platform: offer.creator_platform,
      budget_cents: offer.budget_cents,
      fee_cents: feeCents,
      total_cents: totalCents,
      brief: offer.brief,
      deliverables: offer.deliverables,
      timeline_days: offer.timeline_days,
      status: offer.status,
      expires_at: offer.expires_at,
      created_at: offer.created_at,
    });

  } catch (err) {
    console.error("Create offer error:", err);
    return NextResponse.json({ error: "Failed to create offer" }, { status: 500 });
  }
}

// GET /api/offers - List offers
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const sql = getDb();

    if (user.role === "brand" || user.role === "admin") {
      // Return offers they sent (including pending ones that need payment)
      const offers = await sql`
        SELECT o.*, u.full_name as creator_name, u.slug as creator_slug, u.avatar_url as creator_avatar
        FROM offers o
        LEFT JOIN users u ON u.id = o.creator_user_id
        WHERE o.brand_user_id = ${user.id}
        ORDER BY o.created_at DESC
      `;

      return NextResponse.json({
        offers: offers.map(offer => ({
          id: offer.id,
          creator_handle: offer.creator_handle,
          creator_platform: offer.creator_platform,
          creator_name: offer.creator_name,
          creator_slug: offer.creator_slug,
          creator_avatar: offer.creator_avatar,
          budget_cents: offer.budget_cents,
          fee_cents: offer.fee_cents || 0,
          brief: offer.brief,
          deliverables: offer.deliverables,
          timeline_days: offer.timeline_days,
          status: offer.status,
          counter_budget_cents: offer.counter_budget_cents,
          counter_message: offer.counter_message,
          delivery_notes: offer.delivery_notes,
          delivered_at: offer.delivered_at,
          completed_at: offer.completed_at,
          stripe_checkout_id: offer.stripe_checkout_id,
          expires_at: offer.expires_at,
          created_at: offer.created_at,
        }))
      });
    } else {
      // Creator - return ALL offers matching their social handles (verified or not)
      const socialConnections = await sql`
        SELECT platform, handle, is_verified FROM social_connections
        WHERE user_id = ${user.id}
      `;

      if (socialConnections.length === 0) {
        return NextResponse.json({
          offers: [],
          message: "Connect a social account to see offers"
        });
      }

      const isVerified = user.is_verified === true;
      let offers: any[] = [];

      // For each social connection, get offers
      for (const sc of socialConnections) {
        const userOffers = await sql`
          SELECT o.*, u.full_name as brand_name, u.avatar_url as brand_avatar
          FROM offers o
          LEFT JOIN users u ON u.id = o.brand_user_id
          WHERE o.creator_platform = ${sc.platform}
          AND o.creator_handle = ${sc.handle.toLowerCase()}
          ORDER BY o.created_at DESC
        `;
        offers.push(...userOffers);
      }

      // Sort by created_at descending
      offers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // For verified social connections, auto-set verified_at on offers
      const verifiedHandles = socialConnections
        .filter((sc: any) => sc.is_verified)
        .map((sc: any) => ({ platform: sc.platform, handle: sc.handle.toLowerCase() }));

      if (verifiedHandles.length > 0) {
        const offersToUpdate = offers.filter((o: any) =>
          !o.verified_at &&
          verifiedHandles.some((vh: any) => vh.platform === o.creator_platform && vh.handle === o.creator_handle)
        );
        if (offersToUpdate.length > 0) {
          const offerIds = offersToUpdate.map((o: any) => o.id);
          await sql`
            UPDATE offers
            SET verified_at = NOW(), creator_user_id = ${user.id}
            WHERE id = ANY(${offerIds})
          `;
        }
      }

      return NextResponse.json({
        is_verified: isVerified,
        offers: offers.map(offer => {
          const base: any = {
            id: offer.id,
            creator_handle: offer.creator_handle,
            creator_platform: offer.creator_platform,
            status: offer.status,
            verified_at: offer.verified_at,
            created_at: offer.created_at,
            expires_at: offer.expires_at,
          };

          // If verified, show full details; if not, show limited info
          if (isVerified) {
            return {
              ...base,
              brand_name: offer.brand_name,
              brand_avatar: offer.brand_avatar,
              budget_cents: offer.budget_cents,
              fee_cents: offer.fee_cents || 0,
              brief: offer.brief,
              deliverables: offer.deliverables,
              timeline_days: offer.timeline_days,
              counter_budget_cents: offer.counter_budget_cents,
              counter_message: offer.counter_message,
              delivery_notes: offer.delivery_notes,
              delivered_at: offer.delivered_at,
              completed_at: offer.completed_at,
            };
          }

          // Not verified - mask sensitive details
          return {
            ...base,
            brand_name: null,
            brand_avatar: null,
            budget_cents: null,
            fee_cents: null,
            brief: null,
            deliverables: null,
            timeline_days: offer.timeline_days,
            is_masked: true,
          };
        })
      });
    }

  } catch (err) {
    console.error("List offers error:", err);
    return NextResponse.json({ error: "Failed to list offers" }, { status: 500 });
  }
}

// PATCH /api/offers - Update offer status
export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { offer_id, action, counter_budget, counter_message } = body;

    if (!offer_id || !action) {
      return NextResponse.json({ error: "Missing offer_id or action" }, { status: 400 });
    }

    const validActions = ["view", "accept", "decline", "counter", "deliver", "approve", "dispute"];
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const sql = getDb();

    // Get the offer
    const offers = await sql`
      SELECT * FROM offers WHERE id = ${offer_id} LIMIT 1
    `;

    if (offers.length === 0) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    const offer = offers[0];

    // Check if user can perform this action
    if (action === "view") {
      // Only creator can view, and only if they own this offer and status is pending
      if (offer.creator_user_id !== user.id || offer.status !== "pending") {
        return NextResponse.json({ error: "Cannot view this offer" }, { status: 403 });
      }

      await sql`
        UPDATE offers 
        SET status = 'viewed', updated_at = NOW()
        WHERE id = ${offer_id}
      `;

      return NextResponse.json({ success: true, status: "viewed" });
    }

    if (action === "accept") {
      // Only if verified_at is set, status is 'viewed' or 'countered', and user owns the offer
      if (!offer.verified_at || offer.creator_user_id !== user.id || !["viewed", "countered"].includes(offer.status)) {
        return NextResponse.json({ error: "Cannot accept this offer" }, { status: 403 });
      }

      // Require bio-verified account to accept offers
      if (!user.is_verified) {
        return NextResponse.json({ error: "You must verify your social account before accepting offers. Go to your dashboard to verify." }, { status: 403 });
      }

      await sql`
        UPDATE offers
        SET status = 'accepted', updated_at = NOW()
        WHERE id = ${offer_id}
      `;

      // Create checkout session for the brand to pay
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const checkoutRes = await fetch(`${appUrl}/api/checkout/offer`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Cookie: `session_token=${cookies().get("session_token")?.value}` },
          body: JSON.stringify({ offer_id }),
        });
        if (checkoutRes.ok) {
          const checkoutData = await checkoutRes.json();
          return NextResponse.json({ success: true, status: "accepted", checkout_url: checkoutData.url });
        }
      } catch (e) {
        // Checkout creation failed but accept still succeeded
        console.error("Failed to create checkout for accepted offer:", e);
      }

      return NextResponse.json({ success: true, status: "accepted" });
    }

    if (action === "decline") {
      // Only if creator owns it
      if (offer.creator_user_id !== user.id) {
        return NextResponse.json({ error: "Cannot decline this offer" }, { status: 403 });
      }

      await sql`
        UPDATE offers 
        SET status = 'declined', updated_at = NOW()
        WHERE id = ${offer_id}
      `;

      return NextResponse.json({ success: true, status: "declined" });
    }

    if (action === "counter") {
      // Only if verified_at is set, requires counter_budget and counter_message
      if (!offer.verified_at || offer.creator_user_id !== user.id) {
        return NextResponse.json({ error: "Cannot counter this offer" }, { status: 403 });
      }

      if (!user.is_verified) {
        return NextResponse.json({ error: "You must verify your social account before countering offers." }, { status: 403 });
      }

      if (!counter_budget || !counter_message) {
        return NextResponse.json({ error: "Counter budget and message required" }, { status: 400 });
      }

      const counterBudgetCents = Math.round(Number(counter_budget) * 100);
      if (counterBudgetCents <= 0 || counterBudgetCents >= 10000000) {
        return NextResponse.json({ error: "Counter budget must be between $0.01 and $99,999.99" }, { status: 400 });
      }

      await sql`
        UPDATE offers
        SET status = 'countered',
            counter_budget_cents = ${counterBudgetCents},
            counter_message = ${counter_message},
            updated_at = NOW()
        WHERE id = ${offer_id}
      `;

      return NextResponse.json({
        success: true,
        status: "countered",
        counter_budget_cents: counterBudgetCents,
        counter_message
      });
    }

    if (action === "deliver") {
      // Creator marks as delivered — must be paid first
      if (offer.creator_user_id !== user.id) {
        return NextResponse.json({ error: "Not your offer" }, { status: 403 });
      }
      if (offer.status !== "paid") {
        return NextResponse.json({ error: "Offer must be paid before marking as delivered" }, { status: 400 });
      }

      const { delivery_notes } = body;

      await sql`
        UPDATE offers
        SET status = 'delivered',
            delivery_notes = ${delivery_notes || null},
            delivered_at = NOW(),
            updated_at = NOW()
        WHERE id = ${offer_id}
      `;

      return NextResponse.json({ success: true, status: "delivered" });
    }

    if (action === "approve") {
      // Brand approves delivery → completed → trigger payout
      if (offer.brand_user_id !== user.id) {
        return NextResponse.json({ error: "Not your offer" }, { status: 403 });
      }
      if (offer.status !== "delivered") {
        return NextResponse.json({ error: "Offer must be delivered before approving" }, { status: 400 });
      }

      await sql`
        UPDATE offers
        SET status = 'completed',
            completed_at = NOW(),
            updated_at = NOW()
        WHERE id = ${offer_id}
      `;

      // Trigger payout to creator via Stripe transfer
      if (offer.creator_user_id) {
        const creatorRows = await sql`
          SELECT stripe_account_id FROM users WHERE id = ${offer.creator_user_id} LIMIT 1
        `;

        if (creatorRows.length > 0 && creatorRows[0].stripe_account_id) {
          try {
            const stripe = getStripe();
            await stripe.transfers.create({
              amount: offer.budget_cents as number,
              currency: "aud",
              destination: creatorRows[0].stripe_account_id as string,
              metadata: { offer_id: offer.id, creator_user_id: offer.creator_user_id },
            });
            console.log(`Payout of ${offer.budget_cents} cents to creator ${offer.creator_user_id}`);

            // Update creator stats
            await sql`
              UPDATE users
              SET total_earnings = COALESCE(total_earnings, 0) + ${offer.budget_cents},
                  total_projects = COALESCE(total_projects, 0) + 1,
                  updated_at = NOW()
              WHERE id = ${offer.creator_user_id}
            `;
          } catch (err) {
            console.error("Stripe transfer failed:", err);
            // Don't fail the approval — admin can retry transfer
          }
        } else {
          console.log(`Creator ${offer.creator_user_id} has no Stripe account — payout pending`);
        }
      }

      return NextResponse.json({ success: true, status: "completed" });
    }

    if (action === "dispute") {
      // Brand disputes delivery
      if (offer.brand_user_id !== user.id) {
        return NextResponse.json({ error: "Not your offer" }, { status: 403 });
      }
      if (offer.status !== "delivered") {
        return NextResponse.json({ error: "Can only dispute delivered offers" }, { status: 400 });
      }

      await sql`
        UPDATE offers
        SET status = 'disputed', updated_at = NOW()
        WHERE id = ${offer_id}
      `;

      return NextResponse.json({ success: true, status: "disputed" });
    }

  } catch (err) {
    console.error("Update offer error:", err);
    return NextResponse.json({ error: "Failed to update offer" }, { status: 500 });
  }
}