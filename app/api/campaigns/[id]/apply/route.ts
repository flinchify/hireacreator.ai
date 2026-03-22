import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

async function getSessionUser() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.id, u.role FROM users u
    JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  return rows.length > 0 ? (rows[0] as { id: string; role: string }) : null;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const campaignId = params.id;
  if (!campaignId) {
    return NextResponse.json({ error: "Campaign ID required" }, { status: 400 });
  }

  let body: { pitch?: string; claimed_profile_id?: string } = {};
  try {
    body = await request.json();
  } catch {
    // No body is ok
  }

  const sql = getDb();

  // Verify campaign exists and is active
  const campaigns = await sql`
    SELECT id, status, max_creators, applications_count, deadline
    FROM brand_campaigns
    WHERE id = ${campaignId}
  `;

  if (campaigns.length === 0) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  const campaign = campaigns[0];

  if (campaign.status !== "active") {
    return NextResponse.json({ error: "Campaign is not active" }, { status: 400 });
  }

  if (campaign.deadline && new Date(campaign.deadline as string) < new Date()) {
    return NextResponse.json({ error: "Campaign deadline has passed" }, { status: 400 });
  }

  if (
    (campaign.applications_count as number) >= (campaign.max_creators as number)
  ) {
    return NextResponse.json(
      { error: "Campaign has reached maximum applicants" },
      { status: 400 }
    );
  }

  // Check if already applied
  const existingApps = await sql`
    SELECT id FROM campaign_applications
    WHERE campaign_id = ${campaignId} AND user_id = ${user.id}
  `;

  if (existingApps.length > 0) {
    return NextResponse.json(
      { error: "You have already applied to this campaign" },
      { status: 409 }
    );
  }

  // Create application
  const result = await sql`
    INSERT INTO campaign_applications (campaign_id, user_id, claimed_profile_id, pitch, status)
    VALUES (
      ${campaignId},
      ${user.id},
      ${body.claimed_profile_id || null},
      ${body.pitch?.trim() || null},
      'pending'
    )
    RETURNING id, status, created_at
  `;

  // Increment applications count
  await sql`
    UPDATE brand_campaigns
    SET applications_count = applications_count + 1, updated_at = NOW()
    WHERE id = ${campaignId}
  `;

  return NextResponse.json({ application: result[0] }, { status: 201 });
}
