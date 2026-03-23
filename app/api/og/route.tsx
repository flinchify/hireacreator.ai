import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 50%, #1e293b 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.05,
            backgroundImage: "radial-gradient(circle, #3b82f6 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        
        {/* Blue gradient orb */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)",
          }}
        />
        
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            left: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(14,165,233,0.2) 0%, transparent 70%)",
          }}
        />

        {/* Logo */}
        <img
          src="https://hireacreator.ai/logo-512.png"
          alt=""
          width={80}
          height={80}
          style={{ marginBottom: "24px" }}
        />
        
        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            textAlign: "center",
          }}
        >
          HireACreator.ai
        </div>
        
        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.7)",
            marginTop: "16px",
            textAlign: "center",
            maxWidth: "800px",
          }}
        >
          The creator marketplace where creators keep 100%
        </div>
        
        {/* Platform badges */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "40px",
            alignItems: "center",
          }}
        >
          {/* Instagram badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "12px",
              padding: "10px 20px",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
            <span style={{ color: "white", fontSize: 16, fontWeight: 600 }}>Instagram</span>
          </div>
          
          {/* X badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "12px",
              padding: "10px 20px",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span style={{ color: "white", fontSize: 16, fontWeight: 600 }}>X</span>
          </div>
          
          {/* 0% badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(59,130,246,0.3)",
              borderRadius: "12px",
              padding: "10px 20px",
              border: "1px solid rgba(59,130,246,0.4)",
            }}
          >
            <span style={{ color: "white", fontSize: 16, fontWeight: 700 }}>0% Creator Fees</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
