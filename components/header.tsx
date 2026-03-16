"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
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

export function Header({ theme = "light" }: { theme?: HeaderTheme }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openLogin, openSignup } = useAuth();
  const t = themes[theme];

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl">
      <nav className={`flex items-center justify-between px-6 py-3 rounded-full border ${t.nav}`}>
        <div className="hidden md:flex items-center gap-1">
          <Link
            href="/browse"
            className={`px-4 py-2 text-sm font-medium rounded-full border border-transparent transition-all ${t.link}`}
          >
            Creators
          </Link>
          <Link
            href="/brands"
            className={`px-4 py-2 text-sm font-medium rounded-full border border-transparent transition-all ${t.link}`}
          >
            For Brands
          </Link>
          <Link
            href="/api"
            className={`px-4 py-2 text-sm font-medium rounded-full border border-transparent transition-all ${t.link}`}
          >
            API
          </Link>
        </div>

        <Link href="/" className={`md:absolute md:left-1/2 md:-translate-x-1/2 flex items-center ${t.logo}`}>
          <Image
            src="/logo-512.png"
            alt="HireACreator"
            width={32}
            height={32}
            className="w-8 h-8"
            priority
          />
        </Link>

        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={openLogin}
            className={`px-4 py-2 text-sm font-medium rounded-full border border-transparent transition-all ${t.loginBtn}`}
          >
            Log in
          </button>
          <button
            onClick={() => openSignup()}
            className={`px-5 py-2 text-sm font-medium rounded-full transition-colors ${t.ctaBtn}`}
          >
            Get Started
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className={`md:hidden p-2 ${t.mobileToggle}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {mobileOpen ? (
              <path d="M4 4l12 12M4 16L16 4" />
            ) : (
              <path d="M3 6h14M3 10h14M3 14h14" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={`md:hidden mt-2 rounded-2xl border p-4 shadow-lg ${t.mobileMenu}`}>
          <div className="flex flex-col gap-1">
            <Link href="/browse" className={`px-4 py-2.5 text-sm font-medium rounded-xl ${t.mobileLink}`} onClick={() => setMobileOpen(false)}>
              Creators
            </Link>
            <Link href="/brands" className={`px-4 py-2.5 text-sm font-medium rounded-xl ${t.mobileLink}`} onClick={() => setMobileOpen(false)}>
              For Brands
            </Link>
            <Link href="/api" className={`px-4 py-2.5 text-sm font-medium rounded-xl ${t.mobileLink}`} onClick={() => setMobileOpen(false)}>
              API
            </Link>
            <div className={`border-t my-2 ${t.mobileDivider}`} />
            <button
              onClick={() => { setMobileOpen(false); openLogin(); }}
              className={`px-4 py-2.5 text-sm font-medium rounded-xl text-left ${t.mobileLink}`}
            >
              Log in
            </button>
            <button
              onClick={() => { setMobileOpen(false); openSignup(); }}
              className={`px-4 py-2.5 text-sm font-medium text-center rounded-xl ${t.mobileCta}`}
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
