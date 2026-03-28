"use client";

import { useRef, useEffect, useCallback } from "react";

const SNIPPETS = [
  "{", "}", "[", "]", "=>", "POST", "GET", "/api", "/hire", "/book", "200", "OK",
  "@creator", "#ugc", "/profile", "/book", "fees", "0%",
  "async", "await", "fetch()", ".json()", "webhook", "agent",
  "escrow", "brief", "niche", "API", "REST", "token",
];

interface Particle {
  x: number;
  y: number;
  text: string;
  speed: number;
  drift: number;
  opacity: number;
  maxOpacity: number;
  size: number;
  fadePhase: number; // 0-1 controls fade in/out cycle
  fadeSpeed: number;
}

function createParticle(w: number, h: number, startAtTop = false): Particle {
  const maxOpacity = 0.04 + Math.random() * 0.08; // 0.04–0.12
  return {
    x: Math.random() * w,
    y: startAtTop ? -20 : Math.random() * h,
    text: SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)],
    speed: 0.15 + Math.random() * 0.35,
    drift: (Math.random() - 0.5) * 0.3,
    opacity: 0,
    maxOpacity,
    size: 10 + Math.random() * 4,
    fadePhase: startAtTop ? 0 : Math.random(),
    fadeSpeed: 0.002 + Math.random() * 0.003,
  };
}

export function CodeRainBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  const getCount = useCallback((w: number) => {
    if (w < 640) return 25;
    if (w < 1024) return 45;
    return 70;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas!.parentElement!.clientWidth;
      const h = canvas!.parentElement!.clientHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Re-init particles for new size
      const count = getCount(w);
      const particles: Particle[] = [];
      for (let i = 0; i < count; i++) {
        particles.push(createParticle(w, h, false));
      }
      particlesRef.current = particles;
    }

    resize();
    window.addEventListener("resize", resize);

    function animate() {
      const w = canvas!.parentElement!.clientWidth;
      const h = canvas!.parentElement!.clientHeight;
      ctx!.clearRect(0, 0, w, h);

      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.speed;
        p.x += p.drift;

        // Fade cycle: sine wave from 0 to maxOpacity
        p.fadePhase += p.fadeSpeed;
        if (p.fadePhase > 1) p.fadePhase = 0;
        p.opacity = p.maxOpacity * Math.sin(p.fadePhase * Math.PI);

        // Reset if off screen
        if (p.y > h + 20 || p.x < -50 || p.x > w + 50) {
          const fresh = createParticle(w, h, true);
          particles[i] = fresh;
          continue;
        }

        ctx!.font = `${p.size}px 'JetBrains Mono', monospace`;
        ctx!.fillStyle = `rgba(59,130,246,${p.opacity})`;
        ctx!.fillText(p.text, p.x, p.y);
      }

      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [getCount]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
