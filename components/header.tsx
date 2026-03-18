"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "./auth-context";

type HeaderTheme = "light" | "dark";

const themes = {
  light: {
    nav: "border-neutral-200/60 bg-white/70 backdrop-blur-xl shadow-lg shadow-black/5",
    link: "text-neutral-700 hover:text-neutral-900 hover:border-neutral-200 hover:bg-neutral-100/60",
    logo: "text-neutral-900",
    loginBtn: "text-neutral-700 hover:text-neutral-900 hover:border-neutral-200 hover:bg-neutral-100/60",
    ctaBtn: "text-white bg-neutral-900 hover:bg-neutral-800",
    mobileToggle: "text-neutral-600",
    mobileMenu: "border-neutral-200/60 bg-white/90 backdrop-blur-xl",
    mobileLink: "text-neutral-700 hover:bg-neutral-100",
    mobileDivider: "border-neutral-200",
    mobileCta: "text-white bg-neutral-900 hover:bg-neutral-800",
  },
  dark: {
    nav: "border-white/10 bg-white/5 backdrop-blur-xl shadow-lg shadow-black/20",
    link: "text-neutral-300 hover:text-white hover:border-white/20 hover:bg-white/10",
    logo: "text-white",
    loginBtn: "text-neutral-300 hover:text-white hover:border-white/20 hover:bg-white/10",
    ctaBtn: "text-neutral-900 bg-white hover:bg-neutral-100",
    mobileToggle: "text-neutral-400",
    mobileMenu: "border-white/10 bg-neutral-900/90 backdrop-blur-xl",
    mobileLink: "text-neutral-300 hover:bg-white/10",
    mobileDivider: "border-neutral-700",
    mobileCta: "text-neutral-900 bg-white hover:bg-neutral-100",
  },
};

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
          <Link href="/messages" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
            Messages
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

export function Header({ theme = "light" }: { theme?: HeaderTheme }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading, openLogin, openSignup } = useAuth();
  const t = themes[theme];

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl">
      <nav className={`flex items-center justify-between px-6 py-3 rounded-full border ${t.nav}`}>
        <div className="hidden md:flex items-center gap-1">
          {user?.role === "brand" ? (
            <Link href="/browse" className={`px-4 py-2 text-sm font-medium rounded-full border border-transparent transition-all ${t.link}`}>
              Explore
            </Link>
          ) : (
            <Link href="/browse" className={`px-4 py-2 text-sm font-medium rounded-full border border-transparent transition-all ${t.link}`}>
              Creators
            </Link>
          )}
          {!user && (
            <Link href="/for-brands" className={`px-4 py-2 text-sm font-medium rounded-full border border-transparent transition-all ${t.link}`}>
              For Brands
            </Link>
          )}
          <Link href="/pricing" className={`px-4 py-2 text-sm font-medium rounded-full border border-transparent transition-all ${t.link}`}>
            Pricing
          </Link>
        </div>

        <Link href="/" className={`md:absolute md:left-1/2 md:-translate-x-1/2 flex items-center ${t.logo}`}>
          <Image src="/logo-512.png" alt="HireACreator" width={32} height={32} className="w-8 h-8" priority />
        </Link>

        <div className="hidden md:flex items-center gap-2">
          {loading ? (
            <div className="w-20 h-8" />
          ) : user ? (
            <>
              <Link href={user.slug ? `/u/${user.slug}` : "/dashboard"} className={`px-4 py-2 text-sm font-medium rounded-full border border-transparent transition-all ${t.link}`}>
                Link in Bio
              </Link>
              <Link href="/dashboard" className={`px-4 py-2 text-sm font-medium rounded-full border border-transparent transition-all ${t.link}`}>
                Dashboard
              </Link>
              <UserMenu />
            </>
          ) : (
            <>
              <button onClick={openLogin} className={`px-4 py-2 text-sm font-medium rounded-full border border-transparent transition-all ${t.loginBtn}`}>
                Log in
              </button>
              <button onClick={() => openSignup()} className={`px-5 py-2 text-sm font-medium rounded-full transition-colors ${t.ctaBtn}`}>
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className={`md:hidden p-2 ${t.mobileToggle}`} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {mobileOpen ? <path d="M4 4l12 12M4 16L16 4" /> : <path d="M3 6h14M3 10h14M3 14h14" />}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={`md:hidden mt-2 rounded-2xl border p-4 shadow-lg ${t.mobileMenu}`}>
          <div className="flex flex-col gap-1">
            <Link href="/browse" className={`px-4 py-2.5 text-sm font-medium rounded-xl ${t.mobileLink}`} onClick={() => setMobileOpen(false)}>
              {user?.role === "brand" ? "Explore" : "Creators"}
            </Link>
            {!user && <Link href="/for-brands" className={`px-4 py-2.5 text-sm font-medium rounded-xl ${t.mobileLink}`} onClick={() => setMobileOpen(false)}>For Brands</Link>}
            <Link href="/pricing" className={`px-4 py-2.5 text-sm font-medium rounded-xl ${t.mobileLink}`} onClick={() => setMobileOpen(false)}>Pricing</Link>
            <div className={`border-t my-2 ${t.mobileDivider}`} />
            {user ? (
              <>
                <Link href="/dashboard" className={`px-4 py-2.5 text-sm font-medium rounded-xl ${t.mobileLink}`} onClick={() => setMobileOpen(false)}>Dashboard</Link>
                <Link href="/messages" className={`px-4 py-2.5 text-sm font-medium rounded-xl ${t.mobileLink}`} onClick={() => setMobileOpen(false)}>Messages</Link>
                {user.role !== "brand" && <Link href={user.slug ? `/u/${user.slug}` : "/dashboard"} className={`px-4 py-2.5 text-sm font-medium rounded-xl ${t.mobileLink}`} onClick={() => setMobileOpen(false)}>My Link in Bio</Link>}
              </>
            ) : (
              <>
                <button onClick={() => { setMobileOpen(false); openLogin(); }} className={`px-4 py-2.5 text-sm font-medium rounded-xl text-left ${t.mobileLink}`}>Log in</button>
                <button onClick={() => { setMobileOpen(false); openSignup(); }} className={`px-4 py-2.5 text-sm font-medium text-center rounded-xl ${t.mobileCta}`}>Get Started</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
