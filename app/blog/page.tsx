import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";

export const metadata = {
  title: "Blog - HireACreator.ai",
  description: "Tips, guides, and insights for creators and brands in the creator economy. Learn how to grow, get booked, and build your brand.",
  alternates: { canonical: "https://hireacreator.ai/blog" },
  openGraph: {
    title: "Blog - HireACreator.ai",
    description: "Tips, guides, and insights for creators and brands.",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

const posts = [
  {
    slug: "why-creators-are-leaving-fiverr",
    title: "Why Creators Are Leaving Fiverr in 2026",
    excerpt: "Fiverr takes 20% of every dollar you earn. Here's why creators are switching to platforms with zero fees — and how to make the move.",
    date: "March 16, 2026",
    category: "Creator Economy",
    readTime: "4 min read",
  },
  {
    slug: "link-in-bio-that-actually-converts",
    title: "Your Link-in-Bio Is Costing You Clients",
    excerpt: "A list of links isn't a business page. Learn how to turn your bio link into a full storefront that books clients while you sleep.",
    date: "March 16, 2026",
    category: "Growth",
    readTime: "5 min read",
  },
  {
    slug: "how-brands-find-creators-2026",
    title: "How Brands Actually Find Creators in 2026",
    excerpt: "Forget cold DMs. Brands are using marketplaces, AI agents, and verified profiles to find creators. Here's how to get discovered.",
    date: "March 16, 2026",
    category: "For Brands",
    readTime: "6 min read",
  },
  {
    slug: "pricing-your-creator-services",
    title: "How to Price Your Creator Services (Without Underselling)",
    excerpt: "Most creators charge too little. Here's a framework for pricing UGC, photography, consulting, and more — based on what brands actually pay.",
    date: "March 16, 2026",
    category: "Creator Tips",
    readTime: "7 min read",
  },
  {
    slug: "ai-agents-creator-economy",
    title: "AI Agents Are Coming for the Creator Economy — Here's Why That's Good",
    excerpt: "AI agents that can search, evaluate, and book creators autonomously. What this means for creators and how to prepare.",
    date: "March 16, 2026",
    category: "AI & Tech",
    readTime: "5 min read",
  },
  {
    slug: "hire-tiktok-ugc-creators-for-ads",
    title: "How to Hire TikTok UGC Creators for Ads in 2026",
    excerpt: "UGC ads convert 29% better than studio content. Here's how to find creators, write briefs, and use AI agents to automate the entire process.",
    date: "March 19, 2026",
    category: "For Brands",
    readTime: "7 min read",
  },
  {
    slug: "creator-marketplace-api-ai-agents",
    title: "Creator Marketplace API: How AI Agents Hire Content Creators",
    excerpt: "Agentic commerce is here. Learn how AI agents use MCP and REST APIs to search, evaluate, and book creators autonomously.",
    date: "March 19, 2026",
    category: "AI & Tech",
    readTime: "8 min read",
  },
  {
    slug: "hireacreator-vs-linktree-vs-stan-store",
    title: "HireACreator vs Linktree vs Stan Store: Which Is Right for You?",
    excerpt: "An honest comparison of three creator platforms. Features, pricing, and why AI-native matters for future-proofing your business.",
    date: "March 19, 2026",
    category: "Creator Economy",
    readTime: "7 min read",
  },
  {
    slug: "monetize-content-creator-2026",
    title: "10 Ways to Monetize Your Content as a Creator in 2026",
    excerpt: "From UGC campaigns to consulting to digital products — here's what each method pays, how hard it is, and which platforms to use.",
    date: "March 19, 2026",
    category: "Creator Tips",
    readTime: "8 min read",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <section className="pt-40 sm:pt-48 pb-20 bg-gradient-to-br from-blue-50 via-white to-blue-50/30 relative">
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,rgb(0,0,0)_1px,transparent_0)] bg-[length:32px_32px]"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <h1 style={{ fontFamily: "var(--font-serif)" }} className="text-4xl sm:text-5xl font-bold text-neutral-900 tracking-tight mb-4">
            Blog
          </h1>
          <p className="text-lg text-neutral-500 mb-14">
            Insights for creators, brands, and anyone building in the creator economy.
          </p>

          <div className="space-y-0 divide-y divide-neutral-100">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block py-8 group first:pt-0"
              >
                <div className="flex items-center gap-3 text-sm text-neutral-400 mb-3">
                  <span className="font-medium text-neutral-600">{post.category}</span>
                  <span>&middot;</span>
                  <span>{post.date}</span>
                  <span>&middot;</span>
                  <span>{post.readTime}</span>
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 group-hover:text-neutral-600 transition-colors mb-2">
                  {post.title}
                </h2>
                <p className="text-neutral-500 leading-relaxed">
                  {post.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
