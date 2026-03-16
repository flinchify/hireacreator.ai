import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import type { Metadata } from "next";

const posts: Record<string, { title: string; date: string; category: string; readTime: string; content: string; description: string }> = {
  "why-creators-are-leaving-fiverr": {
    title: "Why Creators Are Leaving Fiverr in 2026",
    date: "March 16, 2026",
    category: "Creator Economy",
    readTime: "4 min read",
    description: "Fiverr takes 20% of every dollar you earn. Here's why creators are switching to platforms with zero fees.",
    content: `
Fiverr changed the creator economy when it launched. For the first time, anyone could list a service and get paid online. But in 2026, the cracks are showing.

## The 20% problem

Fiverr takes 20% of every sale. On a $1,000 project, that's $200 gone before you see a cent. Add in the 5.5% buyer fee, and the total platform tax is over 25%.

For a creator doing $5,000/month in bookings, that's $12,000/year going to Fiverr. That's not a fee — that's a salary.

## The race to the bottom

Fiverr's marketplace structure incentivises low pricing. Buyers sort by cheapest first. Creators undercut each other to win the Buy Box. The result? A marketplace where $5 logos compete with $500 brand identities, and the $5 logo usually wins.

This doesn't work for professional creators. If you're delivering real value — UGC campaigns, brand photography, consulting — you need a platform that values quality over price.

## What creators actually want

We've spoken to hundreds of creators. They want three things:

1. **Keep their earnings.** 0% platform fees on what they charge.
2. **Control their brand.** A profile that looks like them, not a Fiverr template.
3. **Get discovered by serious brands.** Not buyers looking for the cheapest option.

## The alternative

HireACreator was built for this. Creators keep 100% of their earnings. Profiles are full storefronts — portfolio, services with clear pricing, verified reviews, and instant booking.

Brands pay a 10% service fee on top of the creator's price. The creator never loses a cent.

If you're still on Fiverr, do the maths on what you're paying them every year. Then ask yourself if it's worth it.

[Create your free profile on HireACreator.ai](/browse)
    `.trim(),
  },
  "link-in-bio-that-actually-converts": {
    title: "Your Link-in-Bio Is Costing You Clients",
    date: "March 16, 2026",
    category: "Growth",
    readTime: "5 min read",
    description: "A list of links isn't a business page. Turn your bio link into a storefront that books clients.",
    content: `
Every creator has a link in their bio. Most of them are a dead end.

## The Linktree problem

Linktree is a list of links. That's it. A visitor lands on your page, sees 6 links to different platforms, and leaves. There's no portfolio. No pricing. No way to book you. No reason to stay.

You're sending potential clients to a page that says "here are some other places you can find me." That's not a sales page — that's a detour.

## What a bio link should do

Your link-in-bio should be the single most important page on the internet for your business. It should:

- **Show your work.** Portfolio pieces that prove you can deliver.
- **List your services with prices.** No "DM for rates." Buyers want transparency.
- **Let people book instantly.** A button that takes payment and locks in the deal.
- **Build trust.** Verified badge, reviews from real clients, follower counts.

## The conversion difference

A Linktree converts at roughly 3-5% (click-through to any link). A properly built creator storefront converts at 8-15% (visitor to booking inquiry).

That's 3x more clients from the same traffic. If you're getting 1,000 profile visits per month, that's the difference between 30 and 150 potential bookings.

## How to switch

1. Create your HireACreator profile (free, takes 2 minutes)
2. Add your services with clear pricing
3. Upload portfolio pieces
4. Drop your new link in your bio: hireacreator.ai/yourname
5. Watch bookings come in instead of "can you send me your rates?"

[Claim your profile](/browse)
    `.trim(),
  },
  "how-brands-find-creators-2026": {
    title: "How Brands Actually Find Creators in 2026",
    date: "March 16, 2026",
    category: "For Brands",
    readTime: "6 min read",
    description: "Brands are using marketplaces, AI agents, and verified profiles to find creators. Here's how.",
    content: `
The old way of finding creators — scrolling Instagram for hours, DMing 50 people, getting 5 replies — is dead.

## The shift to marketplaces

Brands are moving to creator marketplaces for the same reason people moved from classifieds to Amazon: efficiency. Search, filter, compare, book. Done in minutes, not weeks.

The best marketplaces let you filter by niche, audience size, engagement rate, location, and budget. Every creator has a verified profile with real work and real reviews.

## AI agents are entering the chat

The biggest shift in 2026 isn't another app — it's AI agents that can autonomously find, evaluate, and book creators.

Imagine telling your AI marketing assistant: "Find me 3 UGC creators in Australia who specialise in skincare, have over 50K followers, and charge under $1,500 per video." The agent searches, compares options, and presents you with a shortlist. You approve, it books.

This is already possible via MCP and REST APIs on platforms built for it.

## What this means for creators

If you're not on a platform where AI agents can find you, you're invisible to a growing segment of brand spend. Having a verified, structured profile with clear services and pricing isn't just nice-to-have — it's how you get discovered by both humans and AI.

## What this means for brands

Stop wasting hours on manual outreach. Use platforms with structured data, verified profiles, and API access. The brands that automate creator sourcing will move 10x faster than those still in DMs.

[Browse verified creators](/browse)
    `.trim(),
  },
  "pricing-your-creator-services": {
    title: "How to Price Your Creator Services (Without Underselling)",
    date: "March 16, 2026",
    category: "Creator Tips",
    readTime: "7 min read",
    description: "A framework for pricing UGC, photography, consulting, and more — based on what brands actually pay.",
    content: `
Most creators charge too little. Not because they don't know their value — but because they don't know what the market pays.

## The underpricing trap

When you're starting out, it feels safer to charge less. "I'll raise my prices once I have more experience." The problem? Low prices attract low-quality clients. And low-quality clients leave bad reviews, kill your motivation, and keep you stuck.

## A simple pricing framework

**Step 1: Calculate your minimum.**
How much do you need to earn per month? Divide by how many projects you can handle. That's your floor.

**Step 2: Research the market.**
Here's what brands are paying in 2026:
- Single UGC video (15-30s): $300-800
- UGC package (3 videos): $900-2,000
- Product photography (10 shots): $500-1,500
- Brand strategy consultation (1 hour): $200-500
- Monthly content retainer: $2,000-6,000

**Step 3: Price for the client you want.**
If you price at $200 for a UGC video, you'll attract startups with no budget. If you price at $800, you'll attract brands with marketing budgets. The work is the same. The clients are different.

## How to present pricing

1. Always show prices on your profile. "DM for rates" loses 50% of potential clients.
2. Offer 3 tiers (basic, standard, premium). Anchoring works.
3. Include what's in each package. Deliverables, timeline, revisions.
4. Show your rate per hour if you do consulting. It builds trust.

## When to raise prices

If you're booking more than 80% of inquiries, your prices are too low. Raise by 20% and see what happens. You might lose some volume but make more per project.

[List your services with clear pricing](/browse)
    `.trim(),
  },
  "ai-agents-creator-economy": {
    title: "AI Agents Are Coming for the Creator Economy — Here's Why That's Good",
    date: "March 16, 2026",
    category: "AI & Tech",
    readTime: "5 min read",
    description: "AI agents that can search, evaluate, and book creators autonomously. What this means for the creator economy.",
    content: `
AI agents aren't replacing creators. They're replacing the boring parts of hiring them.

## What AI agents do

An AI marketing agent can:
- Search creator databases by niche, location, and budget
- Evaluate engagement rates and portfolio quality
- Compare multiple creators side-by-side
- Place bookings and submit briefs
- Track delivery and manage campaigns

All autonomously. No human in the loop unless you want one.

## Why this is good for creators

Right now, a brand's marketing manager might evaluate 10 creators before booking one. With AI agents, they can evaluate 1,000 creators and book the best 10 — all before lunch.

More brands booking faster means more revenue for creators. The pie gets bigger.

## Why this is good for brands

The average time from "we need a creator" to "creator is booked" is currently 2-3 weeks. With AI agents, it's 2-3 minutes.

That speed advantage compounds. Brands that automate creator sourcing can run 10x more campaigns in the same time.

## How to prepare

As a creator:
- Make sure your profile is on platforms with API access
- Keep your services, pricing, and portfolio up to date
- Respond quickly — AI agents factor in response time

As a brand:
- Look for platforms with MCP and REST API support
- Start experimenting with AI agents for creator discovery
- Set clear briefs and budgets so agents can match efficiently

The future of the creator economy isn't less human — it's humans doing the creative work while AI handles the logistics.

[Explore the API](/api)
    `.trim(),
  },
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = posts[params.slug];
  if (!post) return { title: "Not Found" };
  return {
    title: `${post.title} - HireACreator.ai Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: "2026-03-16",
    },
  };
}

export function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }));
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = posts[params.slug];
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <article className="pt-40 sm:pt-48 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/blog" className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors mb-8 inline-block">
            &larr; Back to blog
          </Link>

          <div className="flex items-center gap-3 text-sm text-neutral-400 mb-4">
            <span className="font-medium text-neutral-600">{post.category}</span>
            <span>&middot;</span>
            <span>{post.date}</span>
            <span>&middot;</span>
            <span>{post.readTime}</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight leading-tight mb-8">
            {post.title}
          </h1>

          <div className="prose prose-neutral prose-lg max-w-none">
            {post.content.split("\n\n").map((block, i) => {
              if (block.startsWith("## ")) {
                return <h2 key={i} className="font-display text-2xl font-bold text-neutral-900 mt-10 mb-4">{block.replace("## ", "")}</h2>;
              }
              if (block.startsWith("- **")) {
                const items = block.split("\n").filter(Boolean);
                return (
                  <ul key={i} className="space-y-2 my-4">
                    {items.map((item, j) => (
                      <li key={j} className="text-neutral-600 leading-relaxed" dangerouslySetInnerHTML={{
                        __html: item.replace(/^- /, "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                      }} />
                    ))}
                  </ul>
                );
              }
              if (block.startsWith("1. ") || block.startsWith("**Step")) {
                const items = block.split("\n").filter(Boolean);
                return (
                  <ol key={i} className="space-y-2 my-4 list-decimal list-inside">
                    {items.map((item, j) => (
                      <li key={j} className="text-neutral-600 leading-relaxed" dangerouslySetInnerHTML={{
                        __html: item.replace(/^\d+\.\s*/, "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                      }} />
                    ))}
                  </ol>
                );
              }
              if (block.startsWith("[")) {
                const match = block.match(/\[(.+?)\]\((.+?)\)/);
                if (match) {
                  return (
                    <div key={i} className="my-8">
                      <Link href={match[2]} className="inline-flex px-6 py-3 bg-neutral-900 text-white rounded-full font-medium hover:bg-neutral-800 transition-colors">
                        {match[1]}
                      </Link>
                    </div>
                  );
                }
              }
              return <p key={i} className="text-neutral-600 leading-relaxed my-4" dangerouslySetInnerHTML={{
                __html: block.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
              }} />;
            })}
          </div>
        </div>
      </article>
      <Footer />
    </div>
  );
}
