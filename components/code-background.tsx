"use client";

export function CodeBackground({ variant = "light" }: { variant?: "light" | "dark" }) {
  const opacity = variant === "dark" ? "opacity-[0.12]" : "opacity-[0.08]";
  const textColor = variant === "dark" ? "text-emerald-400" : "text-neutral-500";

  const snippets = [
    { text: 'POST /v1/bookings', x: "5%", y: "8%", delay: "0s", duration: "35s" },
    { text: 'GET /v1/creators?niche=ugc', x: "70%", y: "14%", delay: "4s", duration: "40s" },
    { text: 'mcp.searchCreators({ budget: 2000 })', x: "55%", y: "52%", delay: "8s", duration: "30s" },
    { text: '{ "score": 94, "niche": "UGC" }', x: "12%", y: "68%", delay: "2s", duration: "38s" },
    { text: 'escrow.release("booking_abc")', x: "62%", y: "78%", delay: "6s", duration: "32s" },
    { text: 'Authorization: Bearer hca_sk_...', x: "35%", y: "22%", delay: "10s", duration: "36s" },
    { text: 'GET /v1/creators/score?handle=@emma', x: "20%", y: "42%", delay: "12s", duration: "42s" },
    { text: '200 OK', x: "88%", y: "33%", delay: "3s", duration: "28s" },
    { text: 'webhooks.on("booking.completed")', x: "48%", y: "62%", delay: "7s", duration: "34s" },
    { text: 'X-RateLimit-Remaining: 998', x: "8%", y: "88%", delay: "5s", duration: "37s" },
    { text: 'mcp.connect({ protocol: "2025-03" })', x: "75%", y: "45%", delay: "9s", duration: "33s" },
    { text: 'PUT /v1/creators/:id/page', x: "30%", y: "5%", delay: "11s", duration: "39s" },
    { text: '{ "agent": "gpt-4", "action": "book" }', x: "82%", y: "72%", delay: "1s", duration: "41s" },
    { text: 'POST /v1/escrow/create', x: "45%", y: "35%", delay: "14s", duration: "31s" },
    { text: 'GET /v1/niches?trending=true', x: "18%", y: "55%", delay: "13s", duration: "36s" },
  ];

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${opacity} z-0`}>
      {/* Dot grid */}
      <div className="absolute inset-0" style={{
        backgroundImage: variant === "dark"
          ? "radial-gradient(circle, rgba(52,211,153,0.4) 1px, transparent 1px)"
          : "radial-gradient(circle, rgba(59,130,246,0.5) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />
      {/* Floating code snippets */}
      {snippets.map((s, i) => (
        <div
          key={i}
          className={`absolute font-mono text-[11px] sm:text-xs ${textColor} whitespace-nowrap`}
          style={{
            left: s.x,
            top: s.y,
            animation: `codeFloat ${s.duration} ease-in-out infinite`,
            animationDelay: s.delay,
          }}
        >
          {s.text}
        </div>
      ))}
    </div>
  );
}
