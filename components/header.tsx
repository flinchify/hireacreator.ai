"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "./auth-context";

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
        className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-neutral-100 transition-colors"
      >
        {user.avatar ? (
          <img src={user.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center">
            <span className="text-xs font-medium text-neutral-600">{user.name?.charAt(0) || "?"}</span>
          </div>
        )}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-neutral-200 rounded-xl shadow-lg py-1 z-50">
          <div className="px-4 py-3 border-b border-neutral-100">
            <div className="font-medium text-neutral-900 text-sm truncate">{user.name}</div>
            <div className="text-xs text-neutral-400 truncate">{user.email}</div>
            {user.isPro && (
              <span className="inline-flex items-center mt-1 px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold uppercase tracking-wider rounded-full">
                PRO
              </span>
            )}
          </div>
          <Link href="/dashboard" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
            Dashboard
          </Link>
          {user.role !== "brand" && (
            <Link href={user.slug ? `/u/${user.slug}` : "/dashboard"} onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
              My Link in Bio
            </Link>
          )}
          <Link href="/dashboard/settings" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
            Settings
          </Link>
          <Link href="/referrals" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center gap-2">
            Referrals
            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold rounded-full">20%</span>
          </Link>
          <div className="border-t border-neutral-100 mt-1 pt-1">
            <button
              onClick={() => { setOpen(false); logout(); }}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Sign Out
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
      <nav className={`flex items-center justify-between px-5 sm:px-6 py-3 rounded-2xl border transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-neutral-200/50 shadow-sm"
          : "bg-white/80 backdrop-blur-xl border-neutral-200/50"
      }`}>
        <div className="hidden lg:flex items-center gap-0.5">
          {user?.role === "brand" ? (
            <Link href="/browse" className="px-4 py-2 text-[13px] font-medium transition-colors text-neutral-600 hover:text-neutral-900">
              Explore
            </Link>
          ) : (
            <Link href="/browse" className="px-4 py-2 text-[13px] font-medium transition-colors text-neutral-600 hover:text-neutral-900">
              Creators
            </Link>
          )}
          {!user && (
            <Link href="/for-brands" className="px-4 py-2 text-[13px] font-medium transition-colors text-neutral-600 hover:text-neutral-900">
              For Brands
            </Link>
          )}
          <Link href="/leaderboard" className="px-4 py-2 text-[13px] font-medium transition-colors text-neutral-600 hover:text-neutral-900">
            Leaderboard
          </Link>
          <Link href="/pricing" className="px-4 py-2 text-[13px] font-medium transition-colors text-neutral-600 hover:text-neutral-900">
            Pricing
          </Link>
          <Link href="/how-it-works" className="px-4 py-2 text-[13px] font-medium transition-colors text-neutral-600 hover:text-neutral-900">
            How It Works
          </Link>
        </div>

        <Link href="/" className="lg:absolute lg:left-1/2 lg:-translate-x-1/2 flex items-center text-neutral-900">
          <Image src="/logo-512.png" alt="HireACreator" width={32} height={32} className="w-8 h-8" priority />
        </Link>

        <div className="hidden lg:flex items-center gap-2">
          {loading ? (
            <div className="w-20 h-8" />
          ) : user ? (
            <>
              <Link href={user.slug ? `/u/${user.slug}` : "/dashboard"} className="px-4 py-2 text-[13px] font-medium transition-colors text-neutral-600 hover:text-neutral-900">
                Link in Bio
              </Link>
              <Link href="/dashboard" className="px-4 py-2 text-[13px] font-medium transition-colors text-neutral-600 hover:text-neutral-900">
                Dashboard
              </Link>
              <UserMenu />
            </>
          ) : (
            <>
              <button onClick={openLogin} className="px-4 py-2 text-[13px] font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
                Log in
              </button>
              <button onClick={() => openSignup()} className="px-4 py-1.5 text-[13px] font-semibold rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-[0.98]">
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="lg:hidden p-2 text-neutral-700" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {mobileOpen ? <path d="M4 4l12 12M4 16L16 4" /> : <path d="M3 6h14M3 10h14M3 14h14" />}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden mt-2 rounded-2xl border border-neutral-100 p-4 shadow-xl bg-white">
          <div className="flex flex-col gap-1">
            <Link href="/browse" className="px-4 py-3 text-sm font-medium rounded-xl min-h-[48px] flex items-center text-neutral-800 hover:bg-neutral-50" onClick={() => setMobileOpen(false)}>
              {user?.role === "brand" ? "Explore" : "Creators"}
            </Link>
            {!user && <Link href="/for-brands" className="px-4 py-3 text-sm font-medium rounded-xl min-h-[48px] flex items-center text-neutral-800 hover:bg-neutral-50" onClick={() => setMobileOpen(false)}>For Brands</Link>}
            <Link href="/leaderboard" className="px-4 py-3 text-sm font-medium rounded-xl min-h-[48px] flex items-center text-neutral-800 hover:bg-neutral-50" onClick={() => setMobileOpen(false)}>Leaderboard</Link>
            <Link href="/pricing" className="px-4 py-3 text-sm font-medium rounded-xl min-h-[48px] flex items-center text-neutral-800 hover:bg-neutral-50" onClick={() => setMobileOpen(false)}>Pricing</Link>
            <Link href="/how-it-works" className="px-4 py-3 text-sm font-medium rounded-xl min-h-[48px] flex items-center text-neutral-800 hover:bg-neutral-50" onClick={() => setMobileOpen(false)}>How It Works</Link>
            <div className="border-t border-neutral-100 my-2" />
            {user ? (
              <>
                <Link href="/dashboard" className="px-4 py-3 text-sm font-medium rounded-xl min-h-[48px] flex items-center text-neutral-800 hover:bg-neutral-50" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                {user.role !== "brand" && <Link href={user.slug ? `/u/${user.slug}` : "/dashboard"} className="px-4 py-3 text-sm font-medium rounded-xl min-h-[48px] flex items-center text-neutral-800 hover:bg-neutral-50" onClick={() => setMobileOpen(false)}>My Link in Bio</Link>}
              </>
            ) : (
              <>
                <button onClick={() => { setMobileOpen(false); openLogin(); }} className="px-4 py-3 text-sm font-medium rounded-xl text-left min-h-[48px] flex items-center text-neutral-800 hover:bg-neutral-50">Log in</button>
                <button onClick={() => { setMobileOpen(false); openSignup(); }} className="px-4 py-3 text-sm font-semibold text-center rounded-full min-h-[48px] flex items-center justify-center active:scale-[0.98] transition-transform bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20">Get Started</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
