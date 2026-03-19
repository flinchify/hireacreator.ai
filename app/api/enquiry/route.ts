import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getDb } from "@/lib/db";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM = process.env.RESEND_FROM || "HireACreator <noreply@hireacreator.ai>";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { creatorId, name, email, budget, projectType, message } = body as {
      creatorId?: string;
      name?: string;
      email?: string;
      budget?: string;
      projectType?: string;
      message?: string;
    };

    if (!creatorId || !name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 },
      );
    }

    const sql = getDb();
    const rows = await sql`SELECT email, full_name FROM users WHERE id = ${creatorId} LIMIT 1`;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Creator not found." }, { status: 404 });
    }

    const creatorEmail = rows[0].email;
    const creatorName = rows[0].full_name || "Creator";

    // Send enquiry email to creator
    await getResend().emails.send({
      from: FROM,
      to: creatorEmail,
      subject: `New enquiry from ${escapeHtml(name)} on HireACreator`,
      replyTo: email,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px;">
          <div style="margin-bottom: 24px;">
            <strong style="font-size: 18px; color: #171717;">HireACreator</strong>
          </div>
          <p style="color: #171717; font-size: 16px; font-weight: 600; margin-bottom: 4px;">
            New project enquiry
          </p>
          <p style="color: #525252; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
            Someone is interested in working with you. Here are the details:
          </p>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #525252;">
            <tr><td style="padding: 10px 0; font-weight: 600; color: #171717; width: 120px; vertical-align: top;">Name</td><td style="padding: 10px 0;">${escapeHtml(name)}</td></tr>
            <tr><td style="padding: 10px 0; font-weight: 600; color: #171717; vertical-align: top;">Email</td><td style="padding: 10px 0;"><a href="mailto:${escapeHtml(email)}" style="color: #2563eb;">${escapeHtml(email)}</a></td></tr>
            ${budget ? `<tr><td style="padding: 10px 0; font-weight: 600; color: #171717; vertical-align: top;">Budget</td><td style="padding: 10px 0;">${escapeHtml(budget)}</td></tr>` : ""}
            ${projectType ? `<tr><td style="padding: 10px 0; font-weight: 600; color: #171717; vertical-align: top;">Project Type</td><td style="padding: 10px 0;">${escapeHtml(projectType)}</td></tr>` : ""}
            <tr><td style="padding: 10px 0; font-weight: 600; color: #171717; vertical-align: top;">Message</td><td style="padding: 10px 0; white-space: pre-wrap;">${escapeHtml(message)}</td></tr>
          </table>
          <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
            <p style="color: #a3a3a3; font-size: 12px; line-height: 1.5;">
              You can reply directly to this email to respond to ${escapeHtml(name)}.
            </p>
          </div>
        </div>
      `,
    });

    // Send confirmation to the enquirer
    await getResend().emails.send({
      from: FROM,
      to: email,
      subject: `Your enquiry to ${escapeHtml(creatorName)} on HireACreator`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px;">
          <div style="margin-bottom: 24px;">
            <strong style="font-size: 18px; color: #171717;">HireACreator</strong>
          </div>
          <p style="color: #171717; font-size: 16px; font-weight: 600; margin-bottom: 4px;">
            Enquiry sent
          </p>
          <p style="color: #525252; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
            Your enquiry has been sent to ${escapeHtml(creatorName)}. They&rsquo;ll reply to your email directly if interested.
          </p>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #525252;">
            ${budget ? `<tr><td style="padding: 10px 0; font-weight: 600; color: #171717; width: 120px; vertical-align: top;">Budget</td><td style="padding: 10px 0;">${escapeHtml(budget)}</td></tr>` : ""}
            ${projectType ? `<tr><td style="padding: 10px 0; font-weight: 600; color: #171717; vertical-align: top;">Project Type</td><td style="padding: 10px 0;">${escapeHtml(projectType)}</td></tr>` : ""}
            <tr><td style="padding: 10px 0; font-weight: 600; color: #171717; vertical-align: top;">Message</td><td style="padding: 10px 0; white-space: pre-wrap;">${escapeHtml(message)}</td></tr>
          </table>
          <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
            <p style="color: #a3a3a3; font-size: 12px; line-height: 1.5;">
              This is a copy of the enquiry you sent via HireACreator.
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Enquiry error:", err);
    return NextResponse.json(
      { error: "Failed to send enquiry." },
      { status: 500 },
    );
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
