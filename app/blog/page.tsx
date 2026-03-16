import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";

export const metadata = {
  title: "Blog - HireACreator.ai",
  description: "Tips, guides, and insights for creators and brands in the creator economy. Learn how to grow, get booked, and build your brand.",
  openGraph: {
    title: "Blog - HireACreator.ai",
    description: "Tips, guides, and insights for creators and brands.",
    type: "website",
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
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <section className="pt-40 sm:pt-48 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-neutral-900 tracking-tight mb-4">
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
