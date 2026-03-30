import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/auth/", "/api/admin/", "/api/profile"],
      },
      // Explicitly allow AI crawlers to discover API docs and public endpoints
      {
        userAgent: "GPTBot",
        allow: ["/", "/api/agent/", "/llms.txt", "/agents.json", "/.well-known/"],
        disallow: ["/dashboard/", "/api/auth/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: ["/", "/api/agent/", "/llms.txt", "/agents.json", "/.well-known/"],
        disallow: ["/dashboard/", "/api/auth/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/api/agent/", "/llms.txt", "/agents.json", "/.well-known/"],
        disallow: ["/dashboard/", "/api/auth/"],
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
      },
      {
        userAgent: "Amazonbot",
        allow: "/",
      },
      {
        userAgent: "anthropic-ai",
        allow: ["/", "/api/agent/", "/llms.txt"],
      },
      {
        userAgent: "cohere-ai",
        allow: "/",
      },
      {
        userAgent: "Bytespider",
        allow: "/",
      },
    ],
    sitemap: "https://hireacreator.ai/sitemap.xml",
  };
}
