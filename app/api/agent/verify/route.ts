import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { initiateVerification, checkVerification, getVerificationStatus } from "@/lib/agent-verification";

async function getUser() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;

  const sql = getDb();
  const rows = await sql`
    SELECT u.id, u.role FROM users u
    JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  return rows.length > 0 ? rows[0] : null;
}

// GET — check verification status
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const verifications = await getVerificationStatus(user.id);
  return NextResponse.json({ verifications });
}

// POST — initiate verification
export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (user.role !== "agent" && user.role !== "admin") {
    return NextResponse.json({ error: "agent_only" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { domain, method } = body;

  if (!domain || typeof domain !== "string") {
    return NextResponse.json({ error: "missing_domain", message: "Provide the domain you own." }, { status: 400 });
  }

  if (!method || !["dns", "meta_tag", "email"].includes(method)) {
    return NextResponse.json({ error: "invalid_method", message: "Method must be 'dns', 'meta_tag', or 'email'." }, { status: 400 });
  }

  // Rate limit: max 3 pending verifications per user
  const existing = await getVerificationStatus(user.id);
  const pending = existing.filter((v: any) => v.status === "pending");
  if (pending.length >= 3) {
    return NextResponse.json({
      error: "too_many_pending",
      message: "Maximum 3 pending verifications. Complete or wait for existing ones to expire.",
    }, { status: 400 });
  }

  const verification = await initiateVerification(user.id, domain, method);
  return NextResponse.json({ verification }, { status: 201 });
}

// PATCH — check/retry verification
export async function PATCH(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  if (!body.verificationId) {
    return NextResponse.json({ error: "missing_verification_id" }, { status: 400 });
  }

  const result = await checkVerification(body.verificationId, user.id);
  return NextResponse.json(result);
}
