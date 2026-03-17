"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-context";

const animations = [
  {
    id: "spotlight",
    name: "Spotlight",
    desc: "Dramatic spotlight sweep reveals your profile. Premium, cinematic.",
    gradient: "from-amber-200 via-yellow-100 to-orange-200",
    tag: "Premium",
    tagColor: "text-amber-700 bg-amber-100",
  },
  {
    id: "glitch",
    name: "Glitch",
    desc: "Digital glitch effect reveals your card. Techy, eye-catching.",
    gradient: "from-cyan-200 via-fuchsia-100 to-yellow-200",
    tag: "Creative",
    tagColor: "text-fuchsia-700 bg-fuchsia-100",
  },
  {
    id: "particle-burst",
    name: "Particle Burst",
    desc: "Profile emerges from an explosion of particles. Energetic, bold.",
    gradient: "from-orange-200 via-red-100 to-amber-200",
    tag: "Premium",
    tagColor: "text-amber-700 bg-amber-100",
  },
  {
    id: "typewriter",
    name: "Typewriter",
    desc: "Name types itself letter by letter, then profile slides in.",
    gradient: "from-neutral-200 via-neutral-100 to-neutral-300",
    tag: "Minimal",
    tagColor: "text-neutral-700 bg-neutral-100",
  },
  {
    id: "wave",
    name: "Wave Reveal",
    desc: "Smooth wave reveals your profile section by section.",
    gradient: "from-blue-200 via-indigo-100 to-violet-200",
    tag: "Smooth",
    tagColor: "text-blue-700 bg-blue-100",
  },
  {
    id: "neon",
    name: "Neon Glow",
    desc: "Profile pulses with neon glow then settles. Futuristic.",
    gradient: "from-emerald-200 via-teal-100 to-cyan-200",
    tag: "Creative",
    tagColor: "text-fuchsia-700 bg-fuchsia-100",
  },
  {
    id: "cinema",
    name: "Cinema Bars",
    desc: "Cinematic bars slide away to reveal your profile. Like a movie.",
    gradient: "from-neutral-300 via-neutral-200 to-neutral-400",
    tag: "Premium",
    tagColor: "text-amber-700 bg-amber-100",
  },
  {
    id: "morph",
    name: "Morph",
    desc: "Profile morphs from a shape into full layout. Organic, fluid.",
    gradient: "from-purple-200 via-pink-100 to-fuchsia-200",
    tag: "Smooth",
    tagColor: "text-blue-700 bg-blue-100",
  },
  {
    id: "trading-candles",
    name: "Trading Candles",
    desc: "Candlestick chart builds up, then your profile rises like a green candle.",
    gradient: "from-emerald-300 via-green-100 to-lime-200",
    tag: "Creative",
    tagColor: "text-fuchsia-700 bg-fuchsia-100",
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

/* ── Mock profile card used inside each preview ── */
function MockCard({ className }: { className?: string }) {
  return (
    <div className={`w-24 h-32 bg-white/95 rounded-xl shadow-lg p-3 ${className || ""}`}>
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 mx-auto mb-2" />
      <div className="w-14 h-1.5 bg-neutral-200 rounded-full mx-auto mb-1" />
      <div className="w-10 h-1 bg-neutral-100 rounded-full mx-auto mb-2.5" />
      <div className="space-y-1.5">
        <div className="h-1 bg-neutral-100 rounded-full" />
        <div className="h-1 bg-neutral-100 rounded-full w-3/4" />
        <div className="h-1 bg-neutral-100 rounded-full w-1/2" />
      </div>
    </div>
  );
}

/* ── Per-animation live preview ── */
function AnimationPreview({ id, playing }: { id: string; playing: boolean }) {
  const base = "absolute inset-0 flex items-center justify-center overflow-hidden";

  if (!playing) {
    return (
      <div className={base}>
        <MockCard className="opacity-80" />
      </div>
    );
  }

  switch (id) {
    case "spotlight":
      return (
        <div className={base}>
          <div className="absolute inset-0 bg-black/60 z-10" style={{ animation: "spotlightFade 2s ease-out forwards" }} />
          <div className="absolute w-32 h-[200%] bg-white/30 rotate-12 -left-20 z-20" style={{ animation: "spotlightSweep 1.2s ease-in-out forwards" }} />
          <MockCard className="z-30" />
        </div>
      );

    case "glitch":
      return (
        <div className={base}>
          <div style={{ animation: "glitchShake 0.6s ease-in-out" }}>
            <MockCard />
          </div>
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute left-0 right-0 h-[2px] bg-cyan-400/60" style={{ animation: "glitchLine1 0.8s ease-in-out infinite", top: "30%" }} />
            <div className="absolute left-0 right-0 h-[1px] bg-fuchsia-400/50" style={{ animation: "glitchLine2 0.6s ease-in-out infinite", top: "60%" }} />
            <div className="absolute left-0 right-0 h-[2px] bg-yellow-300/40" style={{ animation: "glitchLine3 0.9s ease-in-out infinite", top: "80%" }} />
          </div>
        </div>
      );

    case "particle-burst":
      return (
        <div className={base}>
          <MockCard className="z-10" />
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full z-20"
              style={{
                background: ["#f97316", "#ef4444", "#eab308", "#fb923c"][i % 4],
                animation: `particleBurst 1.5s ease-out ${i * 0.06}s forwards`,
                left: "50%",
                top: "50%",
                "--angle": `${i * 30}deg`,
              } as any}
            />
          ))}
        </div>
      );

    case "typewriter":
      return (
        <div className={base}>
          <div className="text-center z-10">
            <div className="mb-2" style={{ animation: "typeReveal 1.2s steps(8) forwards", overflow: "hidden", whiteSpace: "nowrap", width: "0" }}>
              <span className="text-sm font-bold text-neutral-800 font-mono">@creator</span>
            </div>
            <div style={{ animation: "slideUpFade 0.5s ease-out 1.2s both" }}>
              <MockCard />
            </div>
          </div>
        </div>
      );

    case "wave":
      return (
        <div className={base}>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-200 to-indigo-300" style={{ animation: "waveIn 0.4s ease-out 0s both" }} />
            <div className="w-14 h-1.5 bg-indigo-200 rounded-full" style={{ animation: "waveIn 0.4s ease-out 0.15s both" }} />
            <div className="w-10 h-1 bg-violet-200 rounded-full" style={{ animation: "waveIn 0.4s ease-out 0.3s both" }} />
            <div className="w-20 h-16 bg-white/80 rounded-lg mt-1" style={{ animation: "waveIn 0.4s ease-out 0.45s both" }}>
              <div className="p-2 space-y-1.5">
                <div className="h-1 bg-neutral-100 rounded-full" />
                <div className="h-1 bg-neutral-100 rounded-full w-3/4" />
                <div className="h-1 bg-neutral-100 rounded-full w-1/2" />
                <div className="h-4 bg-blue-100 rounded mt-2" />
              </div>
            </div>
          </div>
        </div>
      );

    case "neon":
      return (
        <div className={base}>
          <div style={{ animation: "neonPulse 1.5s ease-in-out" }}>
            <MockCard className="shadow-[0_0_20px_rgba(16,185,129,0.4),0_0_40px_rgba(16,185,129,0.2)]" />
          </div>
        </div>
      );

    case "cinema":
      return (
        <div className={base}>
          <MockCard className="z-10" />
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-neutral-900 z-20" style={{ animation: "cinemaBarUp 1s ease-in-out 0.5s forwards" }} />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-neutral-900 z-20" style={{ animation: "cinemaBarDown 1s ease-in-out 0.5s forwards" }} />
        </div>
      );

    case "morph":
      return (
        <div className={base}>
          <div style={{ animation: "morphShape 1.5s ease-in-out forwards" }}>
            <MockCard />
          </div>
        </div>
      );

    case "trading-candles":
      return (
        <div className={base}>
          <div className="flex items-end gap-[3px] h-full pt-6 pb-3 px-4">
            {/* Candlestick chart */}
            {[
              { h: 45, body: 25, top: 8, color: "#ef4444", delay: 0 },
              { h: 55, body: 30, top: 5, color: "#22c55e", delay: 0.08 },
              { h: 35, body: 20, top: 10, color: "#ef4444", delay: 0.16 },
              { h: 60, body: 28, top: 8, color: "#22c55e", delay: 0.24 },
              { h: 40, body: 22, top: 6, color: "#ef4444", delay: 0.32 },
              { h: 50, body: 32, top: 4, color: "#22c55e", delay: 0.40 },
              { h: 30, body: 18, top: 5, color: "#ef4444", delay: 0.48 },
              { h: 70, body: 40, top: 6, color: "#22c55e", delay: 0.56 },
            ].map((c, i) => (
              <div key={i} className="flex flex-col items-center flex-1" style={{ animation: `candleGrow 0.5s ease-out ${c.delay}s both` }}>
                {/* Wick top */}
                <div style={{ width: 1, height: c.top, background: c.color, opacity: 0.5 }} />
                {/* Body */}
                <div style={{ width: "100%", height: c.body, background: c.color, borderRadius: 2, minWidth: 6 }} />
                {/* Wick bottom */}
                <div style={{ width: 1, height: c.h - c.body - c.top, background: c.color, opacity: 0.5 }} />
              </div>
            ))}
          </div>
          {/* Profile card rises as the last green candle */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div style={{ animation: "candleReveal 0.6s ease-out 0.7s both" }}>
              <MockCard />
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className={base}>
          <MockCard className="opacity-80" />
        </div>
      );
  }
}

export function AnimationsContent() {
  const { user } = useAuth();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const tags = ["all", "Premium", "Creative", "Smooth", "Minimal"];
  const filtered = filter === "all" ? animations : animations.filter(a => a.tag === filter);

  function triggerPreview(id: string) {
    setPlayingId(null);
    // Small delay to reset animations
    requestAnimationFrame(() => {
      setPlayingId(id);
    });
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero — split layout */}
      <section className="pt-32 sm:pt-40 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
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

            {/* AI card */}
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
              <div className="absolute -top-3 -right-3 w-20 h-20 bg-gradient-to-br from-purple-400 to-blue-400 rounded-2xl opacity-20 blur-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Filter tabs + Grid */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-neutral-900">Pre-made collection</h2>
              <p className="text-sm text-neutral-500 mt-1">Hover or tap to preview. Plays once when someone visits your profile.</p>
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

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filtered.map(anim => (
              <div
                key={anim.id}
                className="group relative bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:border-neutral-300 hover:shadow-xl transition-all duration-300 cursor-pointer"
                onMouseEnter={() => { setHoveredId(anim.id); triggerPreview(anim.id); }}
                onMouseLeave={() => { setHoveredId(null); setPlayingId(null); }}
                onClick={() => { triggerPreview(anim.id); }}
              >
                {/* Preview area */}
                <div className={`relative h-40 sm:h-44 bg-gradient-to-br ${anim.gradient} overflow-hidden`}>
                  <AnimationPreview id={anim.id} playing={playingId === anim.id} />

                  {/* Replay hint */}
                  <div className={`absolute bottom-2 right-2 z-30 flex items-center gap-1 px-2 py-1 bg-black/50 rounded-full transition-opacity duration-200 ${
                    hoveredId === anim.id ? "opacity-100" : "opacity-0"
                  }`}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 105.64-11.36L1 10" />
                    </svg>
                    <span className="text-[9px] text-white font-medium">Hover to replay</span>
                  </div>

                  {/* Tag */}
                  <div className="absolute top-2.5 left-2.5 z-30">
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

      {/* Keyframes for all animation previews */}
      <style>{`
        /* Spotlight */
        @keyframes spotlightSweep {
          0% { transform: translateX(-100%) rotate(12deg); }
          100% { transform: translateX(400%) rotate(12deg); }
        }
        @keyframes spotlightFade {
          0% { opacity: 1; }
          60% { opacity: 1; }
          100% { opacity: 0; }
        }

        /* Glitch */
        @keyframes glitchShake {
          0%, 100% { transform: translate(0); }
          10% { transform: translate(-3px, 1px); }
          20% { transform: translate(3px, -2px); }
          30% { transform: translate(-2px, 3px); }
          40% { transform: translate(2px, -1px); }
          50% { transform: translate(-1px, 2px); }
          60% { transform: translate(3px, 1px); }
          70% { transform: translate(-3px, -1px); }
          80% { transform: translate(1px, 2px); }
          90% { transform: translate(-2px, -2px); }
        }
        @keyframes glitchLine1 {
          0%, 100% { transform: translateX(0); opacity: 0; }
          20% { transform: translateX(-8px); opacity: 1; }
          40% { transform: translateX(6px); opacity: 0.5; }
          60% { transform: translateX(-4px); opacity: 0.8; }
          80% { transform: translateX(2px); opacity: 0; }
        }
        @keyframes glitchLine2 {
          0%, 100% { transform: translateX(0); opacity: 0; }
          15% { transform: translateX(10px); opacity: 0.8; }
          35% { transform: translateX(-6px); opacity: 0.3; }
          65% { transform: translateX(4px); opacity: 0.6; }
          85% { transform: translateX(-2px); opacity: 0; }
        }
        @keyframes glitchLine3 {
          0%, 100% { transform: translateX(0); opacity: 0; }
          25% { transform: translateX(-12px); opacity: 0.6; }
          50% { transform: translateX(8px); opacity: 0.4; }
          75% { transform: translateX(-3px); opacity: 0.7; }
        }

        /* Particle Burst */
        @keyframes particleBurst {
          0% {
            transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-70px) scale(0);
            opacity: 0;
          }
        }

        /* Typewriter */
        @keyframes typeReveal {
          0% { width: 0; }
          100% { width: 5.5em; }
        }
        @keyframes slideUpFade {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        /* Wave */
        @keyframes waveIn {
          0% { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        /* Neon */
        @keyframes neonPulse {
          0% { filter: brightness(1) drop-shadow(0 0 0 transparent); transform: scale(0.95); opacity: 0.5; }
          25% { filter: brightness(1.3) drop-shadow(0 0 20px rgba(16,185,129,0.6)); transform: scale(1.02); opacity: 1; }
          50% { filter: brightness(0.9) drop-shadow(0 0 10px rgba(16,185,129,0.3)); transform: scale(0.99); }
          75% { filter: brightness(1.2) drop-shadow(0 0 15px rgba(16,185,129,0.5)); transform: scale(1.01); }
          100% { filter: brightness(1) drop-shadow(0 0 0 transparent); transform: scale(1); }
        }

        /* Cinema */
        @keyframes cinemaBarUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-100%); }
        }
        @keyframes cinemaBarDown {
          0% { transform: translateY(0); }
          100% { transform: translateY(100%); }
        }

        /* Morph */
        @keyframes morphShape {
          0% { border-radius: 50%; transform: scale(0.3) rotate(180deg); opacity: 0; }
          40% { border-radius: 30%; transform: scale(0.8) rotate(90deg); opacity: 0.8; }
          70% { border-radius: 20%; transform: scale(1.05) rotate(20deg); opacity: 1; }
          100% { border-radius: 0; transform: scale(1) rotate(0deg); opacity: 1; }
        }

        /* Trading Candles */
        @keyframes candleGrow {
          0% { transform: scaleY(0); opacity: 0; transform-origin: bottom; }
          100% { transform: scaleY(1); opacity: 1; transform-origin: bottom; }
        }
        @keyframes candleReveal {
          0% { opacity: 0; transform: translateY(20px) scale(0.8); }
          60% { opacity: 1; transform: translateY(-5px) scale(1.02); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
