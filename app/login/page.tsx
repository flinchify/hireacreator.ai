"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  return (
    <div className="min-h-screen flex">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="font-display font-bold text-lg text-neutral-900">
              HireACreator
            </span>
          </Link>

          {step === "email" && (
            <>
              <h1 className="font-display text-2xl font-bold text-neutral-900 mb-2">
                Welcome back
              </h1>
              <p className="text-sm text-neutral-500 mb-8">
                Enter your email to sign in. New here?{" "}
                <Link
                  href="/signup"
                  className="text-neutral-900 font-medium hover:underline"
                >
                  Create an account
                </Link>
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
                <Button type="submit" className="w-full" size="lg">
                  Continue
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-neutral-400">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full">
                  Google
                </Button>
                <Button variant="outline" className="w-full">
                  Twitter
                </Button>
              </div>
            </>
          )}

          {step === "code" && (
            <>
              <h1 className="font-display text-2xl font-bold text-neutral-900 mb-2">
                Check your email
              </h1>
              <p className="text-sm text-neutral-500 mb-8">
                We sent a 6-digit code to{" "}
                <span className="font-medium text-neutral-900">{email}</span>
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // In production, verify code via API
                }}
                className="space-y-4"
              >
                <Input
                  label="Verification code"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="text-center text-2xl tracking-[0.5em] font-mono"
                  required
                />
                <Button type="submit" className="w-full" size="lg">
                  Sign In
                </Button>
              </form>
              <button
                onClick={() => setStep("email")}
                className="mt-4 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                Use a different email
              </button>
            </>
          )}

          <p className="mt-8 text-xs text-neutral-400 leading-relaxed">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-neutral-600">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-neutral-600">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Right - Visual */}
      <div className="hidden lg:flex flex-1 bg-neutral-950 items-center justify-center p-16">
        <div className="max-w-md">
          <blockquote className="text-xl text-white font-display leading-relaxed">
            &ldquo;We replaced three agencies with creators from HireACreator.
            Better content, faster turnaround, and a fraction of the cost.&rdquo;
          </blockquote>
          <div className="mt-6 flex items-center gap-3">
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="Marcus Johnson"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="text-white font-medium text-sm">
                Marcus Johnson
              </div>
              <div className="text-neutral-400 text-sm">
                Head of Content, DTC Brand
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
