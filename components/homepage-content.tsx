"use client";

import { useEffect, useRef, useState } from "react";
import { ScoreChecker } from "./score-checker";

function useCountUp(target: number, duration = 2000) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(target * eased));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { value, ref };
}

function FloatingCard({ name, score, niche, delay }: { name: string; score: number; niche: string; delay: number }) {
  return (
    <div
      className="absolute backdrop-blur-xl bg-white/70 border border-white/30 rounded-2xl p-4 shadow-lg shadow-neutral-900/5"
      style={{
        animation: `float ${6 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center text-sm font-bold text-neutral-600">
          {name[0]}
        </div>
        <div>
          <div className="text-sm font-semibold text-neutral-900">{name}</div>
          <div className="text-xs text-neutral-500">{niche}</div>
        </div>
        <div className="ml-4 text-lg font-bold text-neutral-900">{score}</div>
      </div>
    </div>
  );
}

const TICKER_ITEMS = [
  "@jessicafitness scored 87/100",
  "@techreviewer99 claimed their profile",
  "@foodie.sarah matched with 3 brands",
  "@travelnomad_ scored 92/100",
  "Nike posted a new campaign",
  "@beautybylisa claimed their profile",
  "@codewithalex scored 78/100",
  "@urbanstyle.co matched with 5 brands",
  "Gymshark launched a creator campaign",
  "@chef.marco scored 84/100",
  "@yogawithjen claimed their profile",
  "Shopify posted a new campaign",
];

function Ticker() {
  return (
    <div className="relative overflow-hidden py-4 border-y border-neutral-100">
      <div className="flex animate-ticker whitespace-nowrap">
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span key={i} className="inline-flex items-center px-6 text-sm text-neutral-500">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 mr-3 flex-shrink-0" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

const PLATFORMS_SVG = {
  instagram: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13.2a8.16 8.16 0 005.58 2.2V12a4.85 4.85 0 01-3.77-1.54V6.69h3.77z"/>
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
};

export function HomepageContent({ featured, creatorCount }: { featured: unknown[]; creatorCount: number }) {
  const stat1 = useCountUp(creatorCount || 12847);
  const stat2 = useCountUp(2500);
  const stat3 = useCountUp(1200000);

  return (
    <>
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-15px) rotate(1deg); }
          66% { transform: translateY(10px) rotate(-1deg); }
        }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 40s linear infinite;
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        .gradient-mesh {
          background:
            radial-gradient(ellipse at 20% 50%, rgba(120, 119, 198, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(255, 119, 115, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 40% 80%, rgba(76, 190, 243, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 60%, rgba(255, 200, 87, 0.06) 0%, transparent 50%);
          background-size: 200% 200%;
          animation: gradient-shift 15s ease infinite;
        }
      `}</style>

      {/* Hero */}
      <section className="relative gradient-mesh min-h-[90vh] flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto text-center animate-fade-in-up">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900 mb-6" style={{ fontFamily: "var(--font-outfit)" }}>
            The Future of Creator-Brand Deals
          </h1>
          <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Tag us on Instagram. We build your profile. Brands find you. Get paid.
          </p>
          <div className="flex justify-center mb-8">
            <ScoreChecker variant="hero" />
          </div>
          <p className="text-sm text-neutral-400">No signup required to check your score</p>
        </div>

        {/* Floating cards */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block">
          <div className="absolute top-[15%] left-[5%]">
            <FloatingCard name="Jessica" score={87} niche="Fitness" delay={0} />
          </div>
          <div className="absolute top-[25%] right-[8%]">
            <FloatingCard name="Alex" score={92} niche="Tech" delay={1.5} />
          </div>
          <div className="absolute bottom-[20%] left-[10%]">
            <FloatingCard name="Sarah" score={78} niche="Food" delay={3} />
          </div>
          <div className="absolute bottom-[30%] right-[5%]">
            <FloatingCard name="Marco" score={84} niche="Travel" delay={2} />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 border-b border-neutral-100">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div ref={stat1.ref}>
            <div className="text-4xl font-bold text-neutral-900" style={{ fontFamily: "var(--font-outfit)" }}>
              {stat1.value.toLocaleString()}+
            </div>
            <div className="text-sm text-neutral-500 mt-1">Creators Scored</div>
          </div>
          <div ref={stat2.ref}>
            <div className="text-4xl font-bold text-neutral-900" style={{ fontFamily: "var(--font-outfit)" }}>
              {stat2.value.toLocaleString()}+
            </div>
            <div className="text-sm text-neutral-500 mt-1">Brand Deals</div>
          </div>
          <div ref={stat3.ref}>
            <div className="text-4xl font-bold text-neutral-900" style={{ fontFamily: "var(--font-outfit)" }}>
              ${(stat3.value / 1000000).toFixed(1)}M+
            </div>
            <div className="text-sm text-neutral-500 mt-1">Earned by Creators</div>
          </div>
        </div>
      </section>

      {/* Ticker */}
      <Ticker />

      {/* How It Works */}
      <section className="py-24 lg:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
              How It Works
            </h2>
            <p className="text-neutral-600 max-w-xl mx-auto">Three steps from unknown to brand-deal ready</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Tag @hireacreator",
                desc: "On Instagram, TikTok, X, or YouTube. Tag us or any creator you think deserves brand deals.",
                icons: Object.values(PLATFORMS_SVG),
              },
              {
                step: "02",
                title: "AI Builds Your Profile",
                desc: "We analyze your content, score your brand potential, and create your portfolio page — automatically.",
                icons: null,
              },
              {
                step: "03",
                title: "Get Brand Deals",
                desc: "Brands browse scored creators and send deals directly. You set your rates. You get paid.",
                icons: null,
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-6xl font-bold text-neutral-100 mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">{item.title}</h3>
                <p className="text-neutral-600 leading-relaxed mb-4">{item.desc}</p>
                {item.icons && (
                  <div className="flex justify-center gap-3 text-neutral-400">
                    {item.icons.map((icon, i) => (
                      <div key={i} className="p-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors">
                        {icon}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Score Demo */}
      <section className="py-24 lg:py-32 px-6 bg-neutral-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
            See What You Are Worth
          </h2>
          <p className="text-neutral-600 mb-10 max-w-lg mx-auto">
            Enter your handle and get your creator score instantly. No signup required.
          </p>
          <div className="flex justify-center">
            <ScoreChecker />
          </div>
        </div>
      </section>

      {/* For Creators */}
      <section className="py-24 lg:py-32 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">For Creators</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-6" style={{ fontFamily: "var(--font-outfit)" }}>
              Stop Chasing Brands. Let Them Find You.
            </h2>
            <div className="space-y-4">
              {[
                "Free AI-built portfolio and link-in-bio page",
                "Creator score visible to thousands of brands",
                "Apply to campaigns that match your niche",
                "Get paid directly through the platform",
                "Share your score to stand out from the crowd",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-neutral-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 6L5 8L9 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <span className="text-neutral-700">{item}</span>
                </div>
              ))}
            </div>
            <a href="/claim" className="inline-block mt-8 px-8 py-3 bg-neutral-900 text-white rounded-xl font-semibold text-sm hover:bg-neutral-800 transition-colors">
              Claim Your Profile
            </a>
          </div>
          <div className="relative">
            <div className="backdrop-blur-xl bg-white/70 border border-neutral-200 rounded-2xl p-8 shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-100 to-pink-100 flex items-center justify-center text-2xl font-bold text-neutral-600">J</div>
                <div>
                  <div className="font-bold text-lg text-neutral-900">Jessica Martinez</div>
                  <div className="text-sm text-neutral-500">@jessicafitness</div>
                </div>
                <div className="ml-auto text-3xl font-bold text-green-500" style={{ fontFamily: "var(--font-outfit)" }}>87</div>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Reach", width: "84%" },
                  { label: "Engagement", width: "72%" },
                  { label: "Niche Demand", width: "100%" },
                ].map((bar) => (
                  <div key={bar.label}>
                    <div className="flex justify-between text-xs text-neutral-500 mb-1">
                      <span>{bar.label}</span>
                    </div>
                    <div className="h-1.5 bg-neutral-100 rounded-full">
                      <div className="h-full bg-neutral-900 rounded-full" style={{ width: bar.width }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-100 text-sm text-neutral-600">
                Estimated rate: <span className="font-semibold text-neutral-900">$150 - $300/post</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Brands */}
      <section className="py-24 lg:py-32 px-6 bg-neutral-50">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">For Brands</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-6" style={{ fontFamily: "var(--font-outfit)" }}>
            Find the Perfect Creator in Seconds
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto mb-12">
            Access a database of scored, categorized creators. Post a campaign, get matched with the right creators, and manage everything in one place.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "AI-Matched Creators", desc: "Our algorithm finds creators that fit your brand, niche, and budget." },
              { title: "Scored & Verified", desc: "Every creator has a transparency score. Know what you are paying for." },
              { title: "Campaign Management", desc: "Post briefs, review applications, and manage deals in one dashboard." },
              { title: "Secure Payments", desc: "Escrow-based payments through Stripe. Pay only when satisfied." },
            ].map((card) => (
              <div key={card.title} className="bg-white border border-neutral-200 rounded-2xl p-6 text-left hover:shadow-lg transition-shadow">
                <h3 className="font-bold text-neutral-900 mb-2">{card.title}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
          <a href="/campaigns" className="inline-block mt-10 px-8 py-3 bg-neutral-900 text-white rounded-xl font-semibold text-sm hover:bg-neutral-800 transition-colors">
            Post a Campaign
          </a>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-16 px-6 border-t border-neutral-100">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-neutral-400 mb-6">Creators from every platform. One profile.</p>
          <div className="flex justify-center gap-8 text-neutral-300">
            {Object.values(PLATFORMS_SVG).map((icon, i) => (
              <div key={i} className="hover:text-neutral-600 transition-colors">{icon}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 lg:py-32 px-6 bg-neutral-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
            Your brand profile is waiting.
          </h2>
          <p className="text-neutral-400 mb-10">Enter your handle and see your score in 10 seconds.</p>
          <div className="flex justify-center">
            <ScoreChecker variant="dark" />
          </div>
          <p className="text-sm text-neutral-500 mt-6">No signup required. Free forever.</p>
        </div>
      </section>
    </>
  );
}
