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

export async function sendLoginCode(email: string, code: string) {
  return getResend().emails.send({
    from: FROM,
    to: email,
    subject: `${code} is your HireACreator login code`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 400px; margin: 0 auto; padding: 40px 20px;">
        <div style="margin-bottom: 24px;">
          <strong style="font-size: 18px; color: #171717;">HireACreator</strong>
        </div>
        <p style="color: #525252; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          Enter this code to sign in to your account. It expires in 10 minutes.
        </p>
        <div style="background: #f5f5f5; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #171717;">
            ${code}
          </span>
        </div>
        <p style="color: #a3a3a3; font-size: 12px; line-height: 1.5;">
          If you didn't request this code, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL || "https://hireacreator.ai"}/verify?token=${token}`;
  return getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Verify your HireACreator email",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 400px; margin: 0 auto; padding: 40px 20px;">
        <div style="margin-bottom: 24px;">
          <strong style="font-size: 18px; color: #171717;">HireACreator</strong>
        </div>
        <p style="color: #525252; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          Click the button below to verify your email address.
        </p>
        <a href="${url}" style="display: inline-block; background: #171717; color: white; padding: 12px 24px; border-radius: 100px; text-decoration: none; font-size: 14px; font-weight: 500;">
          Verify Email
        </a>
        <p style="color: #a3a3a3; font-size: 12px; line-height: 1.5; margin-top: 24px;">
          This link expires in 24 hours. If you didn't create an account, ignore this email.
        </p>
      </div>
    `,
  });
}
