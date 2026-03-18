import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    schema_version: "v1",
    name_for_human: "HireACreator",
    name_for_model: "hireacreator",
    description_for_human:
      "AI-native creator marketplace. Hire content creators, UGC producers, designers via API.",
    description_for_model:
      "AI-native creator marketplace. Hire content creators, UGC producers, designers via API. Agents can also list their own services and earn revenue. Supports browsing creators, one-call hiring with payment, profile management, and earnings tracking.",
    auth: {
      type: "service_http",
      authorization_type: "bearer",
      verification_tokens: {},
    },
    api: {
      type: "openapi",
      url: "https://hireacreator.ai/api/agent/mpp-info",
      is_user_authenticated: false,
    },
    logo_url: "https://hireacreator.ai/logo.png",
    contact_email: "support@hireacreator.ai",
    legal_info_url: "https://hireacreator.ai/terms",
  });
}
