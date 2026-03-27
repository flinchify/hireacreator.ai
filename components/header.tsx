"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "./auth-context";

const mono = { fontFamily: "'JetBrains Mono', monospace" };

function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-none border border-neutral-700 hover:border-emerald-500/50 hover:bg-neutral-800 transition-all"
      >
        {user.avatar ? (
          <img src={user.avatar} alt={`${user.name || "User"} avatar`} className="w-6 h-6 rounded-none object-cover" />
        ) : (
          <div className="w-6 h-6 rounded-none bg-neutral-800 border border-neutral-600 flex items-center justify-center">
            <span className="text-[10px] font-mono text-emerald-400">{user.name?.charAt(0) || "?"}</span>
          </div>
        )}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-500">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-neutral-900 border border-neutral-700 rounded-none shadow-2xl shadow-black/50 py-1 z-[100]" style={mono}>
          <div className="px-4 py-3 border-b border-neutral-700/50">
            <div className="font-medium text-neutral-200 text-xs truncate">{user.name}</div>
            <div className="text-[10px] text-neutral-500 truncate mt-0.5">{user.email}</div>
            {user.isPro && (
              <span className="inline-flex items-center mt-1.5 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-wider border border-emerald-500/30">
                PRO
              </span>
            )}
          </div>
          <Link href="/dashboard" onClick={() => setOpen(false)} className="block px-4 py-2 text-xs text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800 transition-colors">
            ~/dashboard
          </Link>
          {user.role !== "brand" && (
            <Link href={user.slug ? `/u/${user.slug}` : "/dashboard"} onClick={() => setOpen(false)} className="block px-4 py-2 text-xs text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800 transition-colors">
              ~/link-in-bio
            </Link>
          )}
          <Link href="/dashboard/settings" onClick={() => setOpen(false)} className="block px-4 py-2 text-xs text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800 transition-colors">
            ~/settings
          </Link>
          {user.role === "admin" && (
            <Link href="/admin" onClick={() => setOpen(false)} className="block px-4 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-neutral-800 transition-colors">
              ~/admin
            </Link>
          )}
          <Link href="/referrals" onClick={() => setOpen(false)} className="block px-4 py-2 text-xs text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800 transition-colors flex items-center gap-2">
            ~/referrals
            <span className="px-1 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/30">20%</span>
          </Link>
          <div className="border-t border-neutral-700/50 mt-1 pt-1">
            <button
              onClick={() => { setOpen(false); logout(); }}
              className="block w-full text-left px-4 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-neutral-800 transition-colors"
            >
              exit()
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, loading, openLogin, openSignup } = useAuth();

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-5xl">
      <nav className={`relative flex items-center justify-between px-4 sm:px-5 py-2.5 rounded-none border transition-all duration-300 ${
        scrolled
          ? "bg-neutral-950/90 backdrop-blur-xl border-neutral-700/60 shadow-lg shadow-black/30"
          : "bg-neutral-950/80 backdrop-blur-xl border-neutral-800/60"
      }`} style={mono}>
        {/* Animated scan line */}
        <div className="absolute inset-0 rounded-none overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(52,211,153,0.1) 2px, rgba(52,211,153,0.1) 4px)",
          }} />
        </div>

        <div className="hidden lg:flex items-center gap-0">
          {user?.role === "brand" ? (
            <Link href="/browse" className="px-3 py-1.5 text-[11px] font-medium tracking-wide uppercase transition-colors text-neutral-400 hover:text-emerald-400">
              explore
            </Link>
          ) : (
            <Link href="/browse" className="px-3 py-1.5 text-[11px] font-medium tracking-wide uppercase transition-colors text-neutral-400 hover:text-emerald-400">
              discover
            </Link>
          )}
          <span className="text-neutral-600 text-[10px] select-none">/</span>
          {!user && (
            <>
              <Link href="/for-brands" className="px-3 py-1.5 text-[11px] font-medium tracking-wide uppercase transition-colors text-neutral-400 hover:text-emerald-400">
                brands
              </Link>
              <span className="text-neutral-600 text-[10px] select-none">/</span>
            </>
          )}
          <Link href="/leaderboard" className="px-3 py-1.5 text-[11px] font-medium tracking-wide uppercase transition-colors text-neutral-400 hover:text-emerald-400">
            rankings
          </Link>
          <span className="text-neutral-600 text-[10px] select-none">/</span>
          <Link href="/pricing" className="px-3 py-1.5 text-[11px] font-medium tracking-wide uppercase transition-colors text-neutral-400 hover:text-emerald-400">
            plans
          </Link>
          <span className="text-neutral-600 text-[10px] select-none">/</span>
          <Link href="/how-it-works" className="px-3 py-1.5 text-[11px] font-medium tracking-wide uppercase transition-colors text-neutral-400 hover:text-emerald-400">
            how_it_works
          </Link>
          <span className="text-neutral-600 text-[10px] select-none">/</span>
          <Link href="/api" className="px-3 py-1.5 text-[11px] font-medium tracking-wide uppercase transition-colors text-emerald-500 hover:text-emerald-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            api
          </Link>
        </div>

        <Link href="/" className="lg:absolute lg:left-1/2 lg:-translate-x-1/2 flex items-center gap-2">
          <Image src="/logo-3d.png" alt="HireACreator" width={32} height={32} className="w-8 h-8" priority />
          <span className="text-[13px] font-bold text-white tracking-tight hidden sm:inline lg:hidden">HireACreator</span>
        </Link>

        <div className="hidden lg:flex items-center gap-2">
          {loading ? (
            <div className="w-20 h-8" />
          ) : user ? (
            <>
              <Link href={user.slug ? `/u/${user.slug}` : "/dashboard"} className="px-3 py-1.5 text-[11px] font-medium tracking-wide uppercase transition-colors text-neutral-400 hover:text-emerald-400">
                bio
              </Link>
              <Link href="/dashboard" className="px-3 py-1.5 text-[11px] font-medium tracking-wide uppercase transition-colors text-neutral-400 hover:text-emerald-400">
                dash
              </Link>
              <UserMenu />
            </>
          ) : (
            <>
              <button onClick={openLogin} className="px-4 py-1.5 text-[11px] font-medium tracking-wide uppercase text-neutral-400 hover:text-white transition-colors border border-transparent hover:border-neutral-600">
                sign_in
              </button>
              <button onClick={() => openSignup()} className="px-4 py-1.5 text-[11px] font-bold tracking-wide uppercase rounded-none bg-emerald-500 text-neutral-950 hover:bg-emerald-400 transition-all active:scale-[0.98] border border-emerald-400">
                get_started
              </button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="lg:hidden p-2 text-neutral-400 hover:text-emerald-400 transition-colors" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {mobileOpen ? <path d="M4 4l12 12M4 16L16 4" /> : <path d="M3 6h14M3 10h14M3 14h14" />}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden mt-1 rounded-none border border-neutral-700 p-3 shadow-2xl shadow-black/50 bg-neutral-950/95 backdrop-blur-xl" style={mono}>
          <div className="flex flex-col gap-0.5">
            <Link href="/browse" className="px-4 py-3 text-[11px] font-medium tracking-wide uppercase min-h-[48px] flex items-center text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800/50 transition-colors" onClick={() => setMobileOpen(false)}>
              {user?.role === "brand" ? "> explore" : "> discover"}
            </Link>
            {!user && <Link href="/for-brands" className="px-4 py-3 text-[11px] font-medium tracking-wide uppercase min-h-[48px] flex items-center text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800/50 transition-colors" onClick={() => setMobileOpen(false)}>&gt; brands</Link>}
            <Link href="/leaderboard" className="px-4 py-3 text-[11px] font-medium tracking-wide uppercase min-h-[48px] flex items-center text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800/50 transition-colors" onClick={() => setMobileOpen(false)}>&gt; rankings</Link>
            <Link href="/pricing" className="px-4 py-3 text-[11px] font-medium tracking-wide uppercase min-h-[48px] flex items-center text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800/50 transition-colors" onClick={() => setMobileOpen(false)}>&gt; plans</Link>
            <Link href="/how-it-works" className="px-4 py-3 text-[11px] font-medium tracking-wide uppercase min-h-[48px] flex items-center text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800/50 transition-colors" onClick={() => setMobileOpen(false)}>&gt; how_it_works</Link>
            <Link href="/api" className="px-4 py-3 text-[11px] font-medium tracking-wide uppercase min-h-[48px] flex items-center text-emerald-500 hover:text-emerald-300 hover:bg-neutral-800/50 transition-colors gap-2" onClick={() => setMobileOpen(false)}>
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              &gt; api
            </Link>
            <div className="border-t border-neutral-700/50 my-2" />
            {user ? (
              <>
                <Link href="/dashboard" className="px-4 py-3 text-[11px] font-medium tracking-wide uppercase min-h-[48px] flex items-center text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800/50 transition-colors" onClick={() => setMobileOpen(false)}>&gt; dashboard</Link>
                {user.role !== "brand" && <Link href={user.slug ? `/u/${user.slug}` : "/dashboard"} className="px-4 py-3 text-[11px] font-medium tracking-wide uppercase min-h-[48px] flex items-center text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800/50 transition-colors" onClick={() => setMobileOpen(false)}>&gt; link_in_bio</Link>}
                {user.role === "admin" && <Link href="/admin" className="px-4 py-3 text-[11px] font-medium tracking-wide uppercase min-h-[48px] flex items-center text-red-400 hover:text-red-300 hover:bg-neutral-800/50 transition-colors" onClick={() => setMobileOpen(false)}>&gt; admin</Link>}
              </>
            ) : (
              <>
                <button onClick={() => { setMobileOpen(false); openLogin(); }} className="px-4 py-3 text-[11px] font-medium tracking-wide uppercase text-left min-h-[48px] flex items-center text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors">&gt; sign_in</button>
                <button onClick={() => { setMobileOpen(false); openSignup(); }} className="px-4 py-3 text-[11px] font-bold tracking-wide uppercase text-center min-h-[48px] flex items-center justify-center active:scale-[0.98] transition-transform bg-emerald-500 text-neutral-950 border border-emerald-400 mt-1">&gt; get_started</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
