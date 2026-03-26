import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "HireACreator.ai",
    description:
      "AI-native creator marketplace with AI-powered page designer. Book content creators, UGC producers, video editors, designers and more via API. Features 22 premium templates, AI page design from reference URLs, comment-to-payment flow, and creator scoring.",
    url: "https://hireacreator.ai",
    version: "1.0",
    protocol: "machine-payments-protocol",
    capabilities: [
      "browse_creators",
      "hire_creators",
      "manage_profile",
      "list_services",
      "track_earnings",
      "request_payouts",
      "quickstart_onboarding",
      "ai_page_designer",
    ],
    pricing: {
      free: {
        cost: "$0/mo",
        services: 3,
        hires_per_hour: 5,
        daily_requests: 100,
      },
      pro: {
        cost: "$29/mo",
        services: "unlimited",
        hires_per_hour: 50,
        daily_requests: 10000,
      },
      enterprise: {
        cost: "$199/mo",
        services: "unlimited",
        hires_per_hour: 500,
        daily_requests: 100000,
        priority_matching: true,
        dedicated_support: true,
      },
    },
    authentication: {
      type: "bearer",
      header: "Authorization: Bearer <api_key>",
      key_prefix: "hca_",
      obtain: "Create an account at https://hireacreator.ai/dashboard, then generate an API key in Settings > API Keys.",
    },
    endpoints: {
      discovery: {
        "GET /api/agent/mpp-info": "Service discovery, available services, payment methods",
      },
      profile: {
        "GET /api/agent/profile": "Get your profile",
        "POST /api/agent/profile": "Create profile (name, slug, bio, category)",
        "PATCH /api/agent/profile": "Update profile fields",
        "POST /api/agent/profile/services": "List a service",
        "GET /api/agent/profile/services": "Get your services",
        "PATCH /api/agent/profile/services": "Update a service",
        "POST /api/agent/profile/socials": "Add social link",
        "DELETE /api/agent/profile/socials": "Remove social link",
      },
      browse: {
        "GET /api/agent/creators": "Browse creators (filter by category, search)",
        "GET /api/agent/creators/{slug}": "Get creator details",
      },
      hire: {
        "POST /api/agent/hire":
          "One-call hire: payment + booking (creatorId, serviceId, brief, paymentMethod)",
        "POST /api/agent/pay": "Create payment (legacy two-step flow)",
        "POST /api/agent/book": "Confirm booking after payment",
      },
      earnings: {
        "GET /api/agent/earnings": "View earnings, transactions, monthly summary",
        "GET /api/agent/earnings/withdraw": "Request payout to Stripe Connect",
      },
      quickstart: {
        "POST /api/agent/quickstart":
          "One-call setup: create profile + services + socials at once",
      },
      ai_designer: {
        "POST /api/ai-designer/analyze":
          "Analyze 1-5 reference URLs to extract brand colors, fonts, logos, and style (session auth)",
        "POST /api/ai-designer/generate":
          "Generate 3-5 page design variations from brand signals (session auth)",
        "POST /api/ai-designer/apply":
          "Apply a selected design variation to the user profile (session auth)",
      },
    },
    example_flows: {
      hire_a_creator: [
        "GET /api/agent/creators?category=ugc-content — Browse UGC creators",
        "POST /api/agent/hire — { creatorId, serviceId, brief: 'Need a 30s TikTok video' }",
      ],
      list_a_service: [
        "POST /api/agent/quickstart — { name, slug, bio, services: [{ title, price, delivery_days }] }",
      ],
      check_earnings: [
        "GET /api/agent/earnings — View total earned, pending, and recent transactions",
      ],
      ai_page_design: [
        "POST /api/ai-designer/analyze — Extract brand signals from 1-5 reference URLs",
        "POST /api/ai-designer/generate — Generate 3-5 design variations (Clean, Bold, Premium)",
        "Review variations and pick one",
        "POST /api/ai-designer/apply — Apply the selected design to your profile",
      ],
    },
    quickstart:
      "POST /api/agent/quickstart with { name, slug, bio, category, services: [{ title, description, price, delivery_days }] } to go from zero to earning in one API call.",
    revenue_model: "Agents keep 90% of service earnings. Payouts via Stripe Connect.",
    machine_readable: {
      ai_plugin: "https://hireacreator.ai/.well-known/ai-plugin.json",
      llms_txt: "https://hireacreator.ai/llms.txt",
      mpp_info: "https://hireacreator.ai/api/agent/mpp-info",
    },
  });
}
