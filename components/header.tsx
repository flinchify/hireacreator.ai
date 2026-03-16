"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "./ui/button";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-neutral-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="font-display font-bold text-lg text-neutral-900">
              HireACreator
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/browse"
              className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Browse Creators
            </Link>
            <Link
              href="/#for-creators"
              className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              For Creators
            </Link>
            <Link
              href="/#for-agents"
              className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              For AI Agents
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>

          <button
            className="md:hidden p-2 text-neutral-600"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {mobileOpen ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-neutral-100 mt-2 pt-4">
            <nav className="flex flex-col gap-3">
              <Link
                href="/browse"
                className="text-sm text-neutral-600 hover:text-neutral-900 py-1"
                onClick={() => setMobileOpen(false)}
              >
                Browse Creators
              </Link>
              <Link
                href="/#for-creators"
                className="text-sm text-neutral-600 hover:text-neutral-900 py-1"
                onClick={() => setMobileOpen(false)}
              >
                For Creators
              </Link>
              <Link
                href="/#for-agents"
                className="text-sm text-neutral-600 hover:text-neutral-900 py-1"
                onClick={() => setMobileOpen(false)}
              >
                For AI Agents
              </Link>
              <div className="flex gap-2 pt-2">
                <Link href="/login" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup" className="flex-1">
                  <Button size="sm" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
