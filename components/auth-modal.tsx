"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "./auth-context";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

type Step = "email" | "code" | "profile";
type Role = "creator" | "brand" | "agent";

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" className="mr-2 shrink-0">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export function AuthModal() {
  const { isOpen, tab, defaultRole, close, setTab } = useAuth();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [role, setRole] = useState<Role>("creator");
  const backdropRef = useRef<HTMLDivElement>(null);

  // Sync role when modal opens with a default
  useEffect(() => {
    if (isOpen) {
      setRole(defaultRole as Role);
      setStep("email");
      setEmail("");
      setCode("");
    }
  }, [isOpen, defaultRole]);

  // Reset step when switching tabs
  useEffect(() => {
    setStep("email");
    setEmail("");
    setCode("");
  }, [tab]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) close();
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={close}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 transition-colors z-10"
          aria-label="Close"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 4l12 12M4 16L16 4" />
          </svg>
        </button>

        <div className="p-8 pt-6">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <Image src="/logo-512.png" alt="H" width={32} height={32} className="w-8 h-8" />
            <span className="font-display font-bold text-lg text-neutral-900">
              HireACreator
            </span>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 p-1 bg-neutral-100 rounded-full mb-6">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${
                tab === "login"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              Log in
            </button>
            <button
              onClick={() => setTab("signup")}
              className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${
                tab === "signup"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              Sign up
            </button>
          </div>

          {/* LOGIN FLOW */}
          {tab === "login" && (
            <>
              {step === "email" && (
                <>
                  <h2 className="font-display text-xl font-bold text-neutral-900 mb-1">
                    Welcome back
                  </h2>
                  <p className="text-sm text-neutral-500 mb-6">
                    Enter your email to sign in.
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (email) setStep("code");
                    }}
                    className="space-y-4"
                  >
                    <Input
                      label="Email address"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Button type="submit" className="w-full rounded-full" size="lg">
                      Continue
                    </Button>
                  </form>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-neutral-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-neutral-400">Or continue with</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <a href="/api/auth/google" className="inline-block">
                      <Button variant="outline" className="w-full rounded-full" type="button">
                        <GoogleIcon />
                        Google
                      </Button>
                    </a>
                    <Button variant="outline" className="w-full rounded-full" disabled>Twitter</Button>
                  </div>
                </>
              )}

              {step === "code" && (
                <>
                  <h2 className="font-display text-xl font-bold text-neutral-900 mb-1">
                    Check your email
                  </h2>
                  <p className="text-sm text-neutral-500 mb-6">
                    We sent a 6-digit code to{" "}
                    <span className="font-medium text-neutral-900">{email}</span>
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                    }}
                    className="space-y-4"
                  >
                    <Input
                      label="Verification code"
                      type="text"
                      placeholder="000000"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="text-center text-2xl tracking-[0.5em] font-mono"
                      required
                    />
                    <Button type="submit" className="w-full rounded-full" size="lg">
                      Sign In
                    </Button>
                  </form>
                  <button
                    onClick={() => { setStep("email"); setCode(""); }}
                    className="mt-4 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                  >
                    Use a different email
                  </button>
                </>
              )}
            </>
          )}

          {/* SIGNUP FLOW */}
          {tab === "signup" && (
            <>
              {step === "email" && (
                <>
                  <h2 className="font-display text-xl font-bold text-neutral-900 mb-1">
                    Create your account
                  </h2>
                  <p className="text-sm text-neutral-500 mb-6">
                    Join as a creator, brand, or API user.
                  </p>

                  {/* Role selector */}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    {([
                      { value: "creator" as Role, label: "Creator", desc: "Offer services" },
                      { value: "brand" as Role, label: "Brand", desc: "Hire creators" },
                      { value: "agent" as Role, label: "Agent", desc: "API access" },
                    ]).map((r) => (
                      <button
                        key={r.value}
                        onClick={() => setRole(r.value)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          role === r.value
                            ? "border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900"
                            : "border-neutral-200 hover:border-neutral-300"
                        }`}
                      >
                        <div className="font-semibold text-neutral-900 text-sm">{r.label}</div>
                        <div className="text-xs text-neutral-500 mt-0.5">{r.desc}</div>
                      </button>
                    ))}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (email) setStep("code");
                    }}
                    className="space-y-4"
                  >
                    <Input
                      label="Email address"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Button type="submit" className="w-full rounded-full" size="lg">
                      Continue
                    </Button>
                  </form>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-neutral-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-neutral-400">Or continue with</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <a href={`/api/auth/google?role=${role}`} className="inline-block">
                      <Button variant="outline" className="w-full rounded-full" type="button">
                        <GoogleIcon />
                        Google
                      </Button>
                    </a>
                    <Button variant="outline" className="w-full rounded-full" disabled>Twitter</Button>
                  </div>
                </>
              )}

              {step === "code" && (
                <>
                  <h2 className="font-display text-xl font-bold text-neutral-900 mb-1">
                    Check your email
                  </h2>
                  <p className="text-sm text-neutral-500 mb-6">
                    We sent a 6-digit code to{" "}
                    <span className="font-medium text-neutral-900">{email}</span>
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (code.length === 6) setStep("profile");
                    }}
                    className="space-y-4"
                  >
                    <Input
                      label="Verification code"
                      type="text"
                      placeholder="000000"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="text-center text-2xl tracking-[0.5em] font-mono"
                      required
                    />
                    <Button type="submit" className="w-full rounded-full" size="lg">
                      Verify
                    </Button>
                  </form>
                  <button
                    onClick={() => { setStep("email"); setCode(""); }}
                    className="mt-4 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                  >
                    Use a different email
                  </button>
                </>
              )}

              {step === "profile" && (
                <>
                  <h2 className="font-display text-xl font-bold text-neutral-900 mb-1">
                    Set up your profile
                  </h2>
                  <p className="text-sm text-neutral-500 mb-6">
                    Tell us a bit about yourself to get started.
                  </p>
                  <form className="space-y-4">
                    <Input label="Full name" placeholder="Jane Smith" required />
                    {role === "creator" && (
                      <>
                        <Input label="Headline" placeholder="UGC Creator & Brand Storyteller" />
                        <div className="space-y-1.5">
                          <label className="block text-sm font-medium text-neutral-700">Category</label>
                          <select className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent">
                            <option value="">Select a category</option>
                            <option>UGC Creator</option>
                            <option>Video Editor</option>
                            <option>Photographer</option>
                            <option>Graphic Designer</option>
                            <option>Social Media Manager</option>
                            <option>Copywriter</option>
                            <option>Brand Strategist</option>
                            <option>Motion Designer</option>
                            <option>Podcast Producer</option>
                            <option>Influencer</option>
                          </select>
                        </div>
                      </>
                    )}
                    {role === "brand" && (
                      <Input label="Company name" placeholder="Acme Inc." />
                    )}
                    {role === "agent" && (
                      <Input label="Company or project name" placeholder="My AI App" />
                    )}
                    <Button type="button" className="w-full rounded-full" size="lg">
                      Complete Setup
                    </Button>
                  </form>
                </>
              )}
            </>
          )}

          <p className="mt-6 text-xs text-neutral-400 leading-relaxed text-center">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-neutral-600" onClick={close}>
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-neutral-600" onClick={close}>
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
