"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-context";

const animations = [
  {
    id: "spotlight",
    name: "Spotlight",
    desc: "Dramatic spotlight sweep reveals your profile. Premium, cinematic.",
    gradient: "from-amber-200 via-yellow-100 to-orange-200",
    darkGradient: "from-amber-900/30 via-yellow-900/20 to-orange-900/30",
    tag: "Premium",
    tagColor: "text-amber-700 bg-amber-100",
  },
  {
    id: "glitch",
    name: "Glitch",
    desc: "Digital glitch effect reveals your card. Techy, eye-catching.",
    gradient: "from-cyan-200 via-fuchsia-100 to-yellow-200",
    darkGradient: "from-cyan-900/30 via-fuchsia-900/20 to-yellow-900/30",
    tag: "Creative",
    tagColor: "text-fuchsia-700 bg-fuchsia-100",
  },
  {
    id: "particle-burst",
    name: "Particle Burst",
    desc: "Profile emerges from an explosion of particles. Energetic, bold.",
    gradient: "from-orange-200 via-red-100 to-amber-200",
    darkGradient: "from-orange-900/30 via-red-900/20 to-amber-900/30",
    tag: "Premium",
    tagColor: "text-amber-700 bg-amber-100",
  },
  {
    id: "typewriter",
    name: "Typewriter",
    desc: "Name types itself letter by letter, then profile slides in.",
    gradient: "from-neutral-200 via-neutral-100 to-neutral-300",
    darkGradient: "from-neutral-800/30 via-neutral-700/20 to-neutral-800/30",
    tag: "Minimal",
    tagColor: "text-neutral-700 bg-neutral-100",
  },
  {
    id: "wave",
    name: "Wave Reveal",
    desc: "Smooth wave reveals your profile section by section.",
    gradient: "from-blue-200 via-indigo-100 to-violet-200",
    darkGradient: "from-blue-900/30 via-indigo-900/20 to-violet-900/30",
    tag: "Smooth",
    tagColor: "text-blue-700 bg-blue-100",
  },
  {
    id: "neon",
    name: "Neon Glow",
    desc: "Profile pulses with neon glow then settles. Futuristic.",
    gradient: "from-emerald-200 via-teal-100 to-cyan-200",
    darkGradient: "from-emerald-900/30 via-teal-900/20 to-cyan-900/30",
    tag: "Creative",
    tagColor: "text-fuchsia-700 bg-fuchsia-100",
  },
  {
    id: "cinema",
    name: "Cinema Bars",
    desc: "Cinematic bars slide away to reveal your profile. Like a movie.",
    gradient: "from-neutral-300 via-neutral-200 to-neutral-400",
    darkGradient: "from-neutral-800/40 via-neutral-700/30 to-neutral-800/40",
    tag: "Premium",
    tagColor: "text-amber-700 bg-amber-100",
  },
  {
    id: "morph",
    name: "Morph",
    desc: "Profile morphs from a shape into full layout. Organic, fluid.",
    gradient: "from-purple-200 via-pink-100 to-fuchsia-200",
    darkGradient: "from-purple-900/30 via-pink-900/20 to-fuchsia-900/30",
    tag: "Smooth",
    tagColor: "text-blue-700 bg-blue-100",
  },
];

async function purchase(type: string) {
  const res = await fetch("/api/checkout/animation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ animationType: type }),
  });
  const data = await res.json();
  if (data.url) window.location.href = data.url;
  else if (data.error === "unauthorized") alert("Please sign in first.");
}

export function AnimationsContent() {
  const { user } = useAuth();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const tags = ["all", "Premium", "Creative", "Smooth", "Minimal"];
  const filtered = filter === "all" ? animations : animations.filter(a => a.tag === filter);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero — split layout */}
      <section className="pt-32 sm:pt-40 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left — copy */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-900 text-white text-xs font-medium rounded-full mb-5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
                </svg>
                Profile Animations
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight leading-[1.1] mb-5">
                First impressions<br />that stick
              </h1>
              <p className="text-neutral-500 text-lg leading-relaxed mb-8 max-w-md">
                A custom intro animation plays once when someone visits your profile. 
                Stand out from every other creator page on the internet.
              </p>
              <div className="flex items-center gap-6 text-sm text-neutral-400">
                <span className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  $4.99 one-time
                </span>
                <span className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  Yours forever
                </span>
                <span className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  Applied instantly
                </span>
              </div>
            </div>

            {/* Right — AI card */}
            <div className="relative">
              <div className="bg-neutral-950 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute inset-0">
                  <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl" />
                  <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl" />
                </div>
                <div className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-white/60 text-xs font-medium uppercase tracking-wider">AI-Powered</span>
                  </div>
                  <h2 className="font-display text-2xl font-bold text-white mb-2">Custom AI Animation</h2>
                  <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                    AI analyses your profile — niche, brand colours, vibe — and generates a completely unique intro. No two are alike.
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => purchase("ai-custom")}
                      className="px-6 py-3 text-sm font-medium text-neutral-900 bg-white rounded-full hover:bg-neutral-100 transition-all hover:scale-105 active:scale-95"
                    >
                      Generate — $4.99
                    </button>
                    <span className="text-xs text-neutral-500">One-time</span>
                  </div>
                </div>
              </div>
              {/* Floating accent */}
              <div className="absolute -top-3 -right-3 w-20 h-20 bg-gradient-to-br from-purple-400 to-blue-400 rounded-2xl opacity-20 blur-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Filter tabs + Grid */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header + filters */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-neutral-900">Pre-made collection</h2>
              <p className="text-sm text-neutral-500 mt-1">Pick one. Plays once when someone visits your profile.</p>
            </div>
            <div className="flex gap-1 overflow-x-auto pb-1">
              {tags.map(t => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all active:scale-95 ${
                    filter === t ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 bg-white border border-neutral-200"
                  }`}
                >
                  {t === "all" ? "All" : t}
                </button>
              ))}
            </div>
          </div>

          {/* Grid — 2 cols mobile, 3 cols tablet, 4 cols desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filtered.map(anim => (
              <div
                key={anim.id}
                className="group relative bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:border-neutral-300 hover:shadow-xl transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredId(anim.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => purchase(anim.id)}
              >
                {/* Preview area */}
                <div className={`relative h-36 sm:h-40 bg-gradient-to-br ${anim.gradient} overflow-hidden`}>
                  {/* Animated preview on hover */}
                  <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                    hoveredId === anim.id ? "scale-110" : "scale-100"
                  }`}>
                    {/* Mock profile card */}
                    <div className={`w-20 h-24 sm:w-24 sm:h-28 bg-white/90 backdrop-blur rounded-xl shadow-lg p-2.5 transition-all duration-500 ${
                      hoveredId === anim.id ? "translate-y-0 opacity-100" : "translate-y-2 opacity-80"
                    }`}>
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 mx-auto mb-1.5" />
                      <div className="w-12 sm:w-14 h-1.5 bg-neutral-200 rounded-full mx-auto mb-1" />
                      <div className="w-8 sm:w-10 h-1 bg-neutral-100 rounded-full mx-auto mb-2" />
                      <div className="space-y-1">
                        <div className="h-1 bg-neutral-100 rounded-full" />
                        <div className="h-1 bg-neutral-100 rounded-full w-3/4" />
                      </div>
                    </div>
                  </div>

                  {/* Play button on hover */}
                  <div className={`absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-all`}>
                    <div className={`w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                      hoveredId === anim.id ? "scale-100 opacity-100" : "scale-75 opacity-0"
                    }`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-neutral-900 ml-0.5">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* Tag */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${anim.tagColor}`}>
                      {anim.tag}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3.5 sm:p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-display font-bold text-neutral-900 text-sm">{anim.name}</h3>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed mb-3 line-clamp-2">{anim.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-neutral-900 text-sm">$4.99</span>
                    <span className="text-[10px] text-neutral-400 group-hover:text-neutral-900 transition-colors font-medium">
                      {hoveredId === anim.id ? "Buy now →" : "one-time"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


    </div>
  );
}
