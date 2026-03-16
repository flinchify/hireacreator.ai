"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "./auth-context";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

type Step = "email" | "code" | "profile";
type Role = "creator" | "brand" | "agent";

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
            <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
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
                    <Button variant="outline" className="w-full rounded-full">Google</Button>
                    <Button variant="outline" className="w-full rounded-full">Twitter</Button>
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
                    <Button variant="outline" className="w-full rounded-full">Google</Button>
                    <Button variant="outline" className="w-full rounded-full">Twitter</Button>
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
