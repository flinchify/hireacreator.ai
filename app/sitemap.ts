import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://hireacreator.ai";
  const now = new Date();

  const blogSlugs = [
    "why-creators-are-leaving-fiverr",
    "link-in-bio-that-actually-converts",
    "how-brands-find-creators-2026",
    "pricing-your-creator-services",
    "ai-agents-creator-economy",
    "hire-tiktok-ugc-creators-for-ads",
    "creator-marketplace-api-ai-agents",
    "hireacreator-vs-linktree-vs-stan-store",
    "monetize-content-creator-2026",
  ];

  return [
    // Core
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/browse`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${baseUrl}/pricing`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/how-it-works`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },

    // Audience pages
    { url: `${baseUrl}/for-creators`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/for-brands`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/for-agents`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },

    // Hire verticals (high SEO value)
    { url: `${baseUrl}/hire/ugc-creators`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/hire/tiktok-creators`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/hire/instagram-creators`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/hire/video-editors`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },

    // Comparison pages
    { url: `${baseUrl}/compare`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/compare/fiverr`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/compare/upwork`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/compare/linktree`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },

    // Trust & social proof
    { url: `${baseUrl}/trust`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/leaderboard`, lastModified: now, changeFrequency: "daily", priority: 0.75 },
    { url: `${baseUrl}/referrals`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },

    // Tools
    { url: `${baseUrl}/animations`, lastModified: now, changeFrequency: "monthly", priority: 0.65 },
    { url: `${baseUrl}/score`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/campaigns`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },

    // API docs
    { url: `${baseUrl}/api`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },

    // Info
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/claim`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },

    // Blog
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    ...blogSlugs.map((slug) => ({
      url: `${baseUrl}/blog/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),

    // Legal
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/data-deletion`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
