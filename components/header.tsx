"use client";

import Link from "next/link";
import { useState } from "react";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl">
      <nav className="flex items-center justify-between px-6 py-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-xl shadow-lg shadow-black/5">
        <div className="hidden md:flex items-center gap-1">
          <Link
            href="/browse"
            className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 rounded-full border border-transparent hover:border-neutral-200 hover:bg-white/60 transition-all"
          >
            Creators
          </Link>
          <Link
            href="/#for-brands"
            className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 rounded-full border border-transparent hover:border-neutral-200 hover:bg-white/60 transition-all"
          >
            For Brands
          </Link>
          <Link
            href="/#for-agents"
            className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 rounded-full border border-transparent hover:border-neutral-200 hover:bg-white/60 transition-all"
          >
            API
          </Link>
        </div>

        <Link href="/" className="md:absolute md:left-1/2 md:-translate-x-1/2 font-display font-bold text-neutral-900 text-lg">
          HireACreator
        </Link>

        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 rounded-full border border-transparent hover:border-neutral-200 hover:bg-white/60 transition-all"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2 text-sm font-medium text-white bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-neutral-600"
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
        <div className="md:hidden mt-2 rounded-2xl border border-white/20 bg-white/80 backdrop-blur-xl p-4 shadow-lg">
          <div className="flex flex-col gap-1">
            <Link href="/browse" className="px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-xl" onClick={() => setMobileOpen(false)}>
              Creators
            </Link>
            <Link href="/#for-brands" className="px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-xl" onClick={() => setMobileOpen(false)}>
              For Brands
            </Link>
            <Link href="/#for-agents" className="px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-xl" onClick={() => setMobileOpen(false)}>
              API
            </Link>
            <div className="border-t border-neutral-200 my-2" />
            <Link href="/login" className="px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-xl" onClick={() => setMobileOpen(false)}>
              Log in
            </Link>
            <Link href="/signup" className="px-4 py-2.5 text-sm font-medium text-center text-white bg-neutral-900 rounded-xl hover:bg-neutral-800" onClick={() => setMobileOpen(false)}>
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
