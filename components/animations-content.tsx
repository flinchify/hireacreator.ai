"use client";

import { AnimateOnScroll, StaggerChildren } from "@/components/animate-on-scroll";

const animations = [
  {
    id: "spotlight",
    name: "Spotlight",
    description: "A dramatic spotlight sweep across your profile card as it fades in. Premium and cinematic.",
    preview: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15), transparent 50%)",
    animation: "spotlight 1.2s ease-out",
    category: "Premium",
  },
  {
    id: "glitch",
    name: "Glitch",
    description: "A quick digital glitch effect that reveals your profile. Techy and eye-catching.",
    preview: "linear-gradient(135deg, #0ff, #f0f, #ff0)",
    animation: "glitch 0.8s steps(8)",
    category: "Creative",
  },
  {
    id: "particle-burst",
    name: "Particle Burst",
    description: "Your profile emerges from an explosion of particles. Energetic and bold.",
    preview: "radial-gradient(circle, #fbbf24 0%, transparent 70%)",
    animation: "particleBurst 1s ease-out",
    category: "Premium",
  },
  {
    id: "typewriter",
    name: "Typewriter",
    description: "Your name types itself letter by letter, then the rest of your profile slides in.",
    preview: "linear-gradient(90deg, #171717, #525252)",
    animation: "typewriter 1.5s steps(20)",
    category: "Minimal",
  },
  {
    id: "wave",
    name: "Wave Reveal",
    description: "A smooth wave animation that reveals your profile section by section from top to bottom.",
    preview: "linear-gradient(180deg, #3b82f6, #8b5cf6)",
    animation: "waveReveal 1s ease-out",
    category: "Smooth",
  },
  {
    id: "neon",
    name: "Neon Glow",
    description: "Your profile card pulses with a neon glow before settling. Futuristic and striking.",
    preview: "linear-gradient(135deg, #22c55e, #06b6d4)",
    animation: "neonGlow 1.2s ease-out",
    category: "Creative",
  },
  {
    id: "cinema",
    name: "Cinema Bars",
    description: "Black cinematic bars slide away to reveal your profile. Like a movie title card.",
    preview: "linear-gradient(180deg, #000 25%, transparent 25%, transparent 75%, #000 75%)",
    animation: "cinemaBars 1s ease-out",
    category: "Premium",
  },
  {
    id: "morph",
    name: "Morph",
    description: "Your profile morphs from a simple shape into its full layout. Organic and fluid.",
    preview: "radial-gradient(ellipse, #e879f9, #a855f7)",
    animation: "morph 1.2s ease-in-out",
    category: "Smooth",
  },
];

async function handlePurchase(animationType: string) {
  const res = await fetch("/api/checkout/animation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ animationType }),
  });
  const data = await res.json();
  if (data.url) {
    window.location.href = data.url;
  } else if (data.error === "unauthorized") {
    alert("Please sign in to purchase an animation.");
  }
}

async function handleAiGenerate() {
  const res = await fetch("/api/checkout/animation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ animationType: "ai-custom" }),
  });
  const data = await res.json();
  if (data.url) {
    window.location.href = data.url;
  } else if (data.error === "unauthorized") {
    alert("Please sign in to generate an animation.");
  }
}

export function AnimationsContent() {
  return (
    <>
      <section className="pt-40 sm:pt-52 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-neutral-100 rounded-full text-sm font-medium text-neutral-600 mb-6">
              Animations Marketplace
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-neutral-900 tracking-tight mb-4">
              Make your profile unforgettable
            </h1>
            <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
              When someone clicks your profile, they see a custom intro animation before your page loads.
              First impressions matter — make yours count.
            </p>
          </div>

          {/* AI Design — hero feature */}
          <AnimateOnScroll>
            <div className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 rounded-3xl p-8 sm:p-12 mb-16 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-500 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500 rounded-full blur-3xl" />
              </div>
              <div className="relative text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-white/70 mb-6">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  AI-Powered
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
                  AI-Generated Custom Animation
                </h2>
                <p className="text-neutral-400 text-lg max-w-xl mx-auto mb-8">
                  Our AI analyses your profile — your niche, your brand colours, your vibe — and generates
                  a completely unique intro animation. No two are alike.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={handleAiGenerate}
                    className="px-8 py-3.5 text-base font-medium text-neutral-900 bg-white rounded-full hover:bg-neutral-100 transition-all hover:scale-105 shadow-lg"
                  >
                    Generate with AI — $4.99
                  </button>
                  <span className="text-sm text-neutral-500">
                    One-time purchase. Yours forever.
                  </span>
                </div>
              </div>
            </div>
          </AnimateOnScroll>

          {/* Pre-made animations grid */}
          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold text-neutral-900 mb-2">
              Pre-made animations
            </h2>
            <p className="text-neutral-500">
              Choose from our curated collection. Each animation plays once when someone visits your profile.
            </p>
          </div>

          <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" staggerMs={80}>
            {animations.map((anim) => (
              <div
                key={anim.id}
                className="aos-stagger-item group border border-neutral-200 rounded-2xl overflow-hidden hover:border-neutral-300 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => handlePurchase(anim.id)}
              >
                {/* Preview */}
                <div
                  className="h-32 relative overflow-hidden"
                  style={{ background: anim.preview }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-0.5 bg-black/40 backdrop-blur-sm text-white text-[10px] font-medium rounded-full">
                      {anim.category}
                    </span>
                  </div>
                </div>
                {/* Info */}
                <div className="p-4">
                  <h3 className="font-display font-bold text-neutral-900 mb-1">{anim.name}</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed mb-3">{anim.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-neutral-900">$4.99</span>
                    <span className="text-[10px] text-neutral-400">one-time</span>
                  </div>
                </div>
              </div>
            ))}
          </StaggerChildren>

          {/* How it works */}
          <div className="mt-20 max-w-3xl mx-auto text-center">
            <h2 className="font-display text-2xl font-bold text-neutral-900 mb-10">
              How it works
            </h2>
            <div className="grid sm:grid-cols-3 gap-8">
              <div>
                <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="font-display font-bold text-neutral-900">1</span>
                </div>
                <h3 className="font-semibold text-neutral-900 mb-1">Choose or generate</h3>
                <p className="text-sm text-neutral-500">Pick a pre-made animation or let AI create one unique to your brand.</p>
              </div>
              <div>
                <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="font-display font-bold text-neutral-900">2</span>
                </div>
                <h3 className="font-semibold text-neutral-900 mb-1">Pay once</h3>
                <p className="text-sm text-neutral-500">$4.99. No subscription. The animation is yours forever.</p>
              </div>
              <div>
                <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="font-display font-bold text-neutral-900">3</span>
                </div>
                <h3 className="font-semibold text-neutral-900 mb-1">Applied instantly</h3>
                <p className="text-sm text-neutral-500">Every visitor sees your intro animation when they land on your profile.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
