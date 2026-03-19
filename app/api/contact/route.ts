import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM = process.env.RESEND_FROM || "HireACreator <noreply@hireacreator.ai>";
const TO = "inpromptyou@gmail.com";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company, email, budget, message } = body as {
      company?: string;
      email?: string;
      budget?: string;
      message?: string;
    };

    if (!company || !email) {
      return NextResponse.json(
        { error: "Company name and email are required." },
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

    await getResend().emails.send({
      from: FROM,
      to: TO,
      subject: `Brand inquiry from ${company}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
          <div style="margin-bottom: 24px;">
            <strong style="font-size: 18px; color: #171717;">New Brand Inquiry</strong>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #525252;">
            <tr><td style="padding: 8px 0; font-weight: 600; color: #171717;">Company</td><td style="padding: 8px 0;">${escapeHtml(company)}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 600; color: #171717;">Email</td><td style="padding: 8px 0;">${escapeHtml(email)}</td></tr>
            ${budget ? `<tr><td style="padding: 8px 0; font-weight: 600; color: #171717;">Monthly Budget</td><td style="padding: 8px 0;">${escapeHtml(budget)}</td></tr>` : ""}
            ${message ? `<tr><td style="padding: 8px 0; font-weight: 600; color: #171717; vertical-align: top;">Message</td><td style="padding: 8px 0;">${escapeHtml(message)}</td></tr>` : ""}
          </table>
        </div>
      `,
      replyTo: email,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json(
      { error: "Failed to send message." },
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
