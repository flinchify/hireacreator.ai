"use client";

import { useState, useEffect } from "react";

interface VerifySocialModalProps {
  open: boolean;
  onClose: () => void;
  platform: string;
  handle: string;
  onVerified?: () => void;
}

export function VerifySocialModal({ open, onClose, platform, handle, onVerified }: VerifySocialModalProps) {
  const [step, setStep] = useState<"loading" | "code" | "checking" | "success" | "error">("loading");
  const [code, setCode] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  // Generate code when modal opens
  const generateCode = async () => {
    setStep("loading");
    try {
      const res = await fetch("/api/verify/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, handle }),
      });
      const data = await res.json();
      if (res.ok && data.code) {
        setCode(data.code);
        setExpiresAt(data.expires_at);
        setStep("code");
      } else {
        setErrorMessage(data.error || "Failed to generate verification code");
        setStep("error");
      }
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setStep("error");
    }
  };

  // Trigger code generation on open
  useEffect(() => {
    if (open && step === "loading" && !code) {
      generateCode();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleVerify = async () => {
    setStep("checking");
    try {
      const res = await fetch("/api/verify/social", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, handle, code }),
      });
      const data = await res.json();
      if (data.verified) {
        setStep("success");
        onVerified?.();
      } else {
        setErrorMessage(data.message || "Code not found in your bio");
        setStep("error");
      }
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setStep("error");
    }
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setStep("loading");
    setCode("");
    setErrorMessage("");
    setCopied(false);
    onClose();
  };

  if (!open) return null;

  const platformName = platform === "x" ? "X (Twitter)" : platform.charAt(0).toUpperCase() + platform.slice(1);

  return (
    <div className="fixed inset-0 z-50" style={{ animation: "fadeIn .15s ease-out" }}>
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div
        className="absolute inset-x-0 bottom-0 max-h-[90vh] bg-white rounded-t-2xl shadow-2xl overflow-y-auto sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-md sm:w-full sm:rounded-2xl sm:max-h-[85vh]"
        style={{ animation: "slideUp .2s cubic-bezier(.16,1,.3,1)" }}
      >
        {/* Mobile handle */}
        <div className="pt-3 pb-1 flex justify-center sm:hidden">
          <div className="w-10 h-1 rounded-full bg-neutral-300" />
        </div>

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-100 px-5 py-4 flex items-center justify-between z-10 rounded-t-2xl">
          <h3 className="font-bold text-neutral-900">Verify @{handle}</h3>
          <button onClick={handleClose} className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
          </button>
        </div>

        <div className="p-5">
          {/* Loading */}
          {step === "loading" && (
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin h-6 w-6 text-neutral-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="ml-3 text-sm text-neutral-500">Generating verification code...</span>
            </div>
          )}

          {/* Show Code */}
          {step === "code" && (
            <div className="space-y-6">
              {/* Step 1 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">1</div>
                  <h4 className="text-sm font-semibold text-neutral-900">Add this code to your {platformName} bio</h4>
                </div>
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 flex items-center justify-between gap-3">
                  <code className="text-lg font-mono font-bold text-neutral-900 select-all">{code}</code>
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 text-xs font-semibold bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors shrink-0"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="text-xs text-neutral-400 mt-2">
                  Paste this code anywhere in your {platformName} bio. You can remove it after verification.
                </p>
              </div>

              {/* Step 2 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">2</div>
                  <h4 className="text-sm font-semibold text-neutral-900">Click verify once you have added it</h4>
                </div>
                <button
                  onClick={() => handleVerify()}
                  className="w-full py-3 bg-neutral-900 text-white text-sm font-semibold rounded-xl hover:bg-neutral-800 transition-colors"
                >
                  Verify My Account
                </button>
              </div>

              {expiresAt && (
                <p className="text-xs text-neutral-400 text-center">
                  Code expires {new Date(expiresAt).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Checking */}
          {step === "checking" && (
            <div className="flex flex-col items-center py-12">
              <svg className="animate-spin h-8 w-8 text-neutral-400 mb-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-neutral-500">Checking your {platformName} bio...</p>
              <p className="text-xs text-neutral-400 mt-1">This may take a few seconds</p>
            </div>
          )}

          {/* Success */}
          {step === "success" && (
            <div className="flex flex-col items-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="#10b981">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-1">Verified!</h3>
              <p className="text-sm text-neutral-500 text-center mb-6">
                Your {platformName} account @{handle} is now verified. You can remove the code from your bio.
              </p>
              <button
                onClick={handleClose}
                className="w-full py-3 bg-neutral-900 text-white text-sm font-semibold rounded-xl hover:bg-neutral-800 transition-colors"
              >
                Done
              </button>
            </div>
          )}

          {/* Error */}
          {step === "error" && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" className="shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4m0 4h.01" strokeLinecap="round" />
                  </svg>
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              </div>

              {code && (
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
                  <p className="text-xs text-neutral-500 mb-2">Your verification code:</p>
                  <div className="flex items-center justify-between gap-3">
                    <code className="text-lg font-mono font-bold text-neutral-900">{code}</code>
                    <button
                      onClick={handleCopy}
                      className="px-3 py-1.5 text-xs font-semibold bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors shrink-0"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setErrorMessage(""); setStep(code ? "code" : "loading"); }}
                  className="flex-1 py-3 bg-neutral-900 text-white text-sm font-semibold rounded-xl hover:bg-neutral-800 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={handleClose}
                  className="px-6 py-3 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
