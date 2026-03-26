"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { PlatformIcon } from "./icons/platforms";
import type { Creator } from "@/lib/types";

/* ─── Helpers ─── */

function ensureMinCards(arr: Creator[], min: number): Creator[] {
  if (arr.length === 0) return [];
  const result = [...arr];
  while (result.length < min) {
    result.push(...arr);
  }
  return result.slice(0, Math.max(min, arr.length));
}

function getCardStyle(offset: number): React.CSSProperties {
  // offset: distance from active card (can be negative)
  const absOff = Math.abs(offset);
  const sign = Math.sign(offset);

  const translateY = sign * absOff * 100;
  const translateZ = -absOff * 120;
  const rotateX = sign * absOff * 8;
  const scale = Math.max(1 - absOff * 0.12, 0.6);
  const opacity = Math.max(1 - absOff * 0.25, 0);

  return {
    transform: `perspective(1200px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${-rotateX}deg) scale(${scale})`,
    opacity,
    zIndex: 10 - absOff,
    pointerEvents: absOff === 0 ? "auto" : "none",
    transition: "all 0.6s cubic-bezier(0.23, 1, 0.32, 1)",
    position: "absolute" as const,
    willChange: "transform, opacity",
  };
}

/* ─── Particle Field ─── */

function ParticleCanvas({ width, height }: { width: number; height: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<{ x: number; y: number; vx: number; vy: number; r: number; a: number }[]>([]);

  useEffect(() => {
    if (!width || !height) return;
    const count = Math.floor((width * height) / 12000);
    particles.current = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      a: Math.random() * 0.5 + 0.1,
    }));

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles.current) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
    />
  );
}

/* ─── Main Component ─── */

export function TesseractCreators({ featured }: { featured: Creator[] }) {
  const cards = ensureMinCards(featured, 7);
  const [active, setActive] = useState(Math.floor(cards.length / 2));
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });
  const wheelLock = useRef(false);

  // Measure container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setDimensions({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Auto-cycle
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % cards.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [paused, cards.length]);

  // Scroll wheel navigation
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (wheelLock.current) return;
      wheelLock.current = true;
      setTimeout(() => (wheelLock.current = false), 400);

      if (e.deltaY > 0) {
        setActive((prev) => (prev + 1) % cards.length);
      } else {
        setActive((prev) => (prev - 1 + cards.length) % cards.length);
      }
    },
    [cards.length]
  );

  // Touch/swipe
  const touchStart = useRef<number | null>(null);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientY;
  }, []);
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStart.current === null) return;
      const diff = touchStart.current - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          setActive((prev) => (prev + 1) % cards.length);
        } else {
          setActive((prev) => (prev - 1 + cards.length) % cards.length);
        }
      }
      touchStart.current = null;
    },
    [cards.length]
  );

  // Visible range
  const visibleRange = 3;

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0a0a0c 0%, #111118 100%)" }}
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(59,130,246,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Particles */}
      <div ref={containerRef} className="absolute inset-0 pointer-events-none">
        {dimensions.w > 0 && <ParticleCanvas width={dimensions.w} height={dimensions.h} />}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-5 py-16 sm:py-20">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-neutral-500 mb-3">
            Featured Creators
          </p>
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl text-white"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Discover talent
          </h2>
        </div>

        {/* 3D Card Stack */}
        <div
          className="relative mx-auto h-[500px] sm:h-[600px] flex items-center justify-center"
          style={{ perspective: "1200px" }}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {cards.map((creator, i) => {
            let offset = i - active;
            // Wrap around for circular navigation
            if (offset > cards.length / 2) offset -= cards.length;
            if (offset < -cards.length / 2) offset += cards.length;

            if (Math.abs(offset) > visibleRange) return null;

            const isActive = offset === 0;

            return (
              <div
                key={`${creator.id}-${i}`}
                className="w-[280px] sm:w-[340px]"
                style={getCardStyle(offset)}
              >
                <Link
                  href={`/creators/${creator.slug}`}
                  className="block"
                  tabIndex={isActive ? 0 : -1}
                >
                  <div
                    className="relative rounded-2xl overflow-hidden border transition-all duration-600"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      borderColor: isActive
                        ? "rgba(59,130,246,0.4)"
                        : "rgba(255,255,255,0.08)",
                      boxShadow: isActive
                        ? "0 0 40px rgba(59,130,246,0.15), 0 8px 32px rgba(0,0,0,0.4)"
                        : "0 4px 16px rgba(0,0,0,0.3)",
                    }}
                  >
                    {/* Active glow */}
                    {isActive && (
                      <div
                        className="absolute -inset-px rounded-2xl pointer-events-none"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, transparent 50%, rgba(139,92,246,0.1) 100%)",
                        }}
                      />
                    )}

                    {/* Glass reflection */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(165deg, rgba(255,255,255,0.08) 0%, transparent 40%)",
                      }}
                    />

                    <div className="relative p-5 sm:p-6">
                      {/* Avatar + badges */}
                      <div className="flex items-center gap-3.5 mb-4">
                        <div
                          className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0"
                          style={{
                            boxShadow: isActive
                              ? "0 0 0 2px rgba(59,130,246,0.5), 0 0 16px rgba(59,130,246,0.3)"
                              : "0 0 0 1px rgba(255,255,255,0.1)",
                          }}
                        >
                          {creator.avatar ? (
                            <img
                              src={creator.avatar}
                              alt={creator.name || "Creator"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                              {(creator.name || "?")[0]}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-white font-semibold text-sm sm:text-base truncate">
                              {creator.name || creator.slug}
                            </h3>
                            {creator.isVerified && (
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="flex-shrink-0"
                              >
                                <path
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  stroke="#3b82f6"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                            {creator.isPro && (
                              <span className="text-[9px] font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-orange-400 text-black px-1.5 py-0.5 rounded flex-shrink-0">
                                Pro
                              </span>
                            )}
                          </div>
                          <p className="text-neutral-400 text-xs truncate mt-0.5">
                            {creator.headline || "Creator"}
                          </p>
                        </div>
                      </div>

                      {/* Category */}
                      {creator.category && (
                        <span className="inline-block text-[10px] uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-2.5 py-1 mb-3">
                          {creator.category}
                        </span>
                      )}

                      {/* Score bar */}
                      {typeof creator.creatorScore === "number" && creator.creatorScore > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-[10px] text-neutral-500 mb-1">
                            <span>Creator Score</span>
                            <span className="text-white font-medium">
                              {creator.creatorScore}
                            </span>
                          </div>
                          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                              style={{ width: `${Math.min(creator.creatorScore, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Socials */}
                      {creator.socials && creator.socials.length > 0 && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                          <div className="flex items-center gap-1.5">
                            {creator.socials.slice(0, 4).map((s: any, si: number) => (
                              <div
                                key={si}
                                className="text-neutral-400 hover:text-white transition-colors"
                              >
                                <PlatformIcon
                                  platform={s.platform}
                                  size={14}
                                  className="opacity-60"
                                />
                              </div>
                            ))}
                          </div>
                          {creator.socials.some(
                            (s: any) => s.followers && s.followers > 0
                          ) && (
                            <span className="text-[10px] text-neutral-500 ml-auto">
                              {formatFollowers(
                                creator.socials.reduce(
                                  (sum: number, s: any) => sum + (s.followers || 0),
                                  0
                                )
                              )}{" "}
                              followers
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Navigation dots */}
        <div className="flex justify-center gap-1.5 mt-6">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Go to creator ${i + 1}`}
              className="transition-all duration-300"
              style={{
                width: i === active ? 24 : 6,
                height: 6,
                borderRadius: 3,
                background:
                  i === active
                    ? "rgba(59,130,246,0.8)"
                    : "rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Format followers count ─── */

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}
