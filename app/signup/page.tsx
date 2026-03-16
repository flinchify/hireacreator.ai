"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  const [step, setStep] = useState<"email" | "code" | "profile">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [role, setRole] = useState<"creator" | "brand">("creator");

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
                Create your account
              </h1>
              <p className="text-sm text-neutral-500 mb-8">
                Join as a creator or brand. Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-neutral-900 font-medium hover:underline"
                >
                  Log in
                </Link>
              </p>

              {/* Role Selector */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setRole("creator")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    role === "creator"
                      ? "border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <div className="font-semibold text-neutral-900 text-sm">
                    Creator
                  </div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    Offer services and build your brand
                  </div>
                </button>
                <button
                  onClick={() => setRole("brand")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    role === "brand"
                      ? "border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <div className="font-semibold text-neutral-900 text-sm">
                    Brand
                  </div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    Find and hire top creators
                  </div>
                </button>
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
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="text-center text-2xl tracking-[0.5em] font-mono"
                  required
                />
                <Button type="submit" className="w-full" size="lg">
                  Verify
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

          {step === "profile" && (
            <>
              <h1 className="font-display text-2xl font-bold text-neutral-900 mb-2">
                Set up your profile
              </h1>
              <p className="text-sm text-neutral-500 mb-8">
                Tell us a bit about yourself to get started.
              </p>
              <form className="space-y-4">
                <Input label="Full name" placeholder="Jane Smith" required />
                {role === "creator" && (
                  <>
                    <Input
                      label="Headline"
                      placeholder="UGC Creator & Brand Storyteller"
                    />
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-neutral-700">
                        Category
                      </label>
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
                  <Input
                    label="Company name"
                    placeholder="Acme Inc."
                  />
                )}
                <Button type="button" className="w-full" size="lg">
                  Complete Setup
                </Button>
              </form>
            </>
          )}

          <p className="mt-8 text-xs text-neutral-400 leading-relaxed">
            By creating an account, you agree to our{" "}
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
            &ldquo;HireACreator helped me go from freelancing on the side to
            running a full-time creative business. I booked $12K in my first
            month on the platform.&rdquo;
          </blockquote>
          <div className="mt-6 flex items-center gap-3">
            <img
              src="https://randomuser.me/api/portraits/women/44.jpg"
              alt="Sophia Chen"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="text-white font-medium text-sm">Sophia Chen</div>
              <div className="text-neutral-400 text-sm">
                UGC Creator, Los Angeles
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
