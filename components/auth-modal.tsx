"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "./auth-context";

function isInAppBrowser(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /FBAN|FBAV|Instagram|Line\/|Snapchat|Twitter|TikTok|Musical|BytedanceWebview|Telegram/i.test(ua);
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

type Role = "creator" | "brand" | "agent";
type Step = "choose" | "email" | "code";

export function AuthModal() {
  const { isOpen, tab, defaultRole, close, setTab, refreshUser } = useAuth();
  const [step, setStep] = useState<Step>("choose");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [role, setRole] = useState<Role>("creator");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [inApp, setInApp] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInApp(isInAppBrowser());
  }, []);

  useEffect(() => {
    if (isOpen) {
      setRole((defaultRole as Role) || "creator");
      setStep("choose");
      setEmail("");
      setCode("");
      setError("");
    }
  }, [isOpen, defaultRole]);

  useEffect(() => {
    setStep("choose");
    setEmail("");
    setCode("");
    setError("");
  }, [tab]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    setError("");
    const res = await fetch("/api/auth/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const data = await res.json();
    if (data.success) {
      setStep("code");
    } else {
      setError(data.message || "Failed to send code.");
    }
    setSending(false);
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) return;
    setVerifying(true);
    setError("");
    try {
      const res = await fetch("/api/auth/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshUser();
        // Navigate after login — use window.location for in-app browser compatibility
        const isNew = data.isNewUser;
        const slug = data.user?.slug;
        close();
        if (isNew && slug) {
          window.location.href = `/dashboard?welcome=true`;
        } else {
          window.location.href = `/dashboard`;
        }
        return;
      } else {
        setError(data.message || "Invalid code.");
      }
    } catch (err: any) {
      console.error("Verify error:", err);
      setError(err?.message || "Network error. Please check your connection and try again.");
    }
    setVerifying(false);
  }

  return (
    <div
      ref={backdropRef}
      onClick={e => { if (e.target === backdropRef.current) close(); }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-black/50"
      style={{ animation: "modalFadeIn 0.15s ease-out" }}
    >
      <div
        className="relative w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] overflow-y-auto"
        style={{ animation: "modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <button
          onClick={close}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-600 transition-colors z-10 rounded-lg hover:bg-neutral-100"
          aria-label="Close"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4l10 10M4 14L14 4" /></svg>
        </button>

        <div className="w-10 h-1 bg-neutral-300 rounded-full mx-auto mt-2 sm:hidden" />
        <div className="p-6 sm:p-7">
          <div className="flex items-center gap-2 mb-5">
            <Image src="/logo-512.png" alt="H" width={28} height={28} className="w-7 h-7" />
            <span className="font-display font-bold text-neutral-900">HireACreator</span>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-neutral-100 rounded-full mb-6">
            <button onClick={() => setTab("login")} className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${tab === "login" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"}`}>Log in</button>
            <button onClick={() => setTab("signup")} className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${tab === "signup" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"}`}>Sign up</button>
          </div>

          {/* ─── LOGIN ─── */}
          {tab === "login" && step === "choose" && (
            <>
              <h2 className="font-display text-xl font-bold text-neutral-900 mb-1">Welcome back</h2>
              <p className="text-sm text-neutral-500 mb-6">Sign in to your account.</p>

              {inApp ? (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl mb-5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400 shrink-0"><path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">Enter your email to sign in. For Google sign-in, open in Safari or Chrome.</p>
                </div>
              ) : (
                <>
                  <a href="/api/auth/google" className="flex items-center justify-center gap-2.5 w-full py-3 px-4 bg-white border border-neutral-300 rounded-full text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-all active:scale-[0.98]">
                    <GoogleIcon /> Continue with Google
                  </a>
                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-200" /></div>
                    <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-neutral-400">or</span></div>
                  </div>
                </>
              )}

              <form onSubmit={sendCode}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full px-4 py-3 rounded-full border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent text-neutral-900 placeholder:text-neutral-400 mb-3"
                  required
                />
                {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
                <button type="submit" disabled={sending} className="w-full py-3 text-sm font-medium text-white bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors disabled:opacity-50">
                  {sending ? "Sending code..." : "Email me a code"}
                </button>
              </form>
            </>
          )}

          {tab === "login" && step === "code" && (
            <>
              <h2 className="font-display text-xl font-bold text-neutral-900 mb-1">Check your email</h2>
              <p className="text-sm text-neutral-500 mb-6">
                6-digit code sent to <span className="font-medium text-neutral-900">{email}</span>
              </p>

              <form onSubmit={verifyCode}>
                <input
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3.5 rounded-full border border-neutral-300 text-center text-2xl tracking-[0.4em] font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent text-neutral-900 mb-3"
                  autoFocus
                  required
                />
                {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
                <button type="submit" disabled={verifying || code.length !== 6} className="w-full py-3 text-sm font-medium text-white bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors disabled:opacity-50">
                  {verifying ? "Verifying..." : "Sign In"}
                </button>
              </form>
              <button onClick={() => { setStep("choose"); setCode(""); setError(""); }} className="mt-4 text-sm text-neutral-500 hover:text-neutral-900 transition-colors w-full text-center">
                Use a different email
              </button>
            </>
          )}

          {/* ─── SIGNUP ─── */}
          {tab === "signup" && step === "choose" && (
            <>
              <h2 className="font-display text-xl font-bold text-neutral-900 mb-1">Create your account</h2>
              <p className="text-sm text-neutral-500 mb-5">Join as a creator, brand, or API user.</p>

              <div className="grid grid-cols-3 gap-2 mb-5">
                {([
                  { value: "creator" as Role, label: "Creator", desc: "Offer services" },
                  { value: "brand" as Role, label: "Brand", desc: "Hire creators" },
                  { value: "agent" as Role, label: "Agent", desc: "API access" },
                ]).map(r => (
                  <button
                    key={r.value}
                    onClick={() => setRole(r.value)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      role === r.value ? "border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900" : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <div className="font-semibold text-neutral-900 text-sm">{r.label}</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">{r.desc}</div>
                  </button>
                ))}
              </div>

              {role === "agent" && (
                <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500 shrink-0 mt-0.5"><path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <p className="text-[11px] text-amber-700 leading-relaxed">Agent accounts require domain verification for API write access.</p>
                </div>
              )}

              {inApp ? (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl mb-5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400 shrink-0"><path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">Enter your email to sign up. For Google sign-in, open in Safari or Chrome.</p>
                </div>
              ) : (
                <>
                  <a href={`/api/auth/google?role=${role}`} className="flex items-center justify-center gap-2.5 w-full py-3 px-4 bg-white border border-neutral-300 rounded-full text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-all active:scale-[0.98]">
                    <GoogleIcon /> Continue with Google
                  </a>
                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-200" /></div>
                    <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-neutral-400">or</span></div>
                  </div>
                </>
              )}

              <form onSubmit={sendCode}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full px-4 py-3 rounded-full border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent text-neutral-900 placeholder:text-neutral-400 mb-3"
                  required
                />
                {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
                <button type="submit" disabled={sending} className="w-full py-3 text-sm font-medium text-white bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors disabled:opacity-50">
                  {sending ? "Sending code..." : "Sign up with email"}
                </button>
              </form>
            </>
          )}

          {tab === "signup" && step === "code" && (
            <>
              <h2 className="font-display text-xl font-bold text-neutral-900 mb-1">Check your email</h2>
              <p className="text-sm text-neutral-500 mb-6">
                6-digit code sent to <span className="font-medium text-neutral-900">{email}</span>
              </p>

              <form onSubmit={verifyCode}>
                <input
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3.5 rounded-full border border-neutral-300 text-center text-2xl tracking-[0.4em] font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent text-neutral-900 mb-3"
                  autoFocus
                  required
                />
                {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
                <button type="submit" disabled={verifying || code.length !== 6} className="w-full py-3 text-sm font-medium text-white bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors disabled:opacity-50">
                  {verifying ? "Verifying..." : "Create Account"}
                </button>
              </form>
              <button onClick={() => { setStep("choose"); setCode(""); setError(""); }} className="mt-4 text-sm text-neutral-500 hover:text-neutral-900 transition-colors w-full text-center">
                Use a different email
              </button>
            </>
          )}

          <p className="mt-6 text-[11px] text-neutral-400 leading-relaxed text-center">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-neutral-600" onClick={close}>Terms</Link>{" "}and{" "}
            <Link href="/privacy" className="underline hover:text-neutral-600" onClick={close}>Privacy Policy</Link>.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlideUp { from { opacity: 0; transform: translateY(100px); } to { opacity: 1; transform: translateY(0); } }
        @media (min-width: 640px) {
          @keyframes modalSlideUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        }
      `}</style>
    </div>
  );
}
