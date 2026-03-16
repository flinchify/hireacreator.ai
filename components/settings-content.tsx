"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./auth-context";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import Link from "next/link";

type Tab = "account" | "security" | "privacy" | "plan";

interface Settings {
  email: string;
  emailVerified: boolean;
  hasPassword: boolean;
  totpEnabled: boolean;
  subscriptionTier: string;
  role: string;
  activeSessions: number;
  privacy: {
    profilePublic: boolean;
    showEmail: boolean;
    showEarnings: boolean;
    showLocation: boolean;
    allowMessages: boolean;
    searchable: boolean;
  };
  createdAt: string;
}

/* ───── Toggle Component ───── */
function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <div className="text-sm font-medium text-neutral-900">{label}</div>
        {desc && <div className="text-xs text-neutral-500 mt-0.5">{desc}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${checked ? "bg-neutral-900" : "bg-neutral-300"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}

/* ───── Account Tab ───── */
function AccountTab({ settings, refresh }: { settings: Settings; refresh: () => void }) {
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  async function sendVerification() {
    setVerifying(true);
    const res = await fetch("/api/settings/email-verify", { method: "POST" });
    const data = await res.json();
    if (data.success) {
      if (data.autoVerified) {
        setVerified(true);
        refresh();
      } else {
        setVerified(true);
      }
    }
    setVerifying(false);
  }

  return (
    <div className="space-y-6">
      <Card className="p-4 sm:p-6">
        <h3 className="font-display font-bold text-neutral-900 mb-4">Email Address</h3>
        <div className="flex items-center gap-3 bg-neutral-50 rounded-xl px-4 py-3 border border-neutral-100">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-neutral-900 truncate">{settings.email}</div>
            {settings.emailVerified ? (
              <div className="flex items-center gap-1 mt-0.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-emerald-500">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="text-xs text-emerald-600 font-medium">Verified</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 mt-0.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-amber-500">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="text-xs text-amber-600 font-medium">Not verified</span>
              </div>
            )}
          </div>
          {!settings.emailVerified && (
            <Button size="sm" variant="outline" onClick={sendVerification} disabled={verifying || verified}>
              {verified ? "Sent!" : verifying ? "Sending..." : "Verify"}
            </Button>
          )}
        </div>
      </Card>

      <Card className="p-4 sm:p-6">
        <h3 className="font-display font-bold text-neutral-900 mb-1">Account Details</h3>
        <p className="text-xs text-neutral-500 mb-4">Information about your account</p>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-neutral-100">
            <span className="text-sm text-neutral-500">Account type</span>
            <span className="text-sm font-medium text-neutral-900 capitalize">{settings.role}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-neutral-100">
            <span className="text-sm text-neutral-500">Member since</span>
            <span className="text-sm font-medium text-neutral-900">
              {settings.createdAt ? new Date(settings.createdAt).toLocaleDateString("en-AU", { month: "long", year: "numeric" }) : "—"}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-neutral-500">Active sessions</span>
            <span className="text-sm font-medium text-neutral-900">{settings.activeSessions}</span>
          </div>
        </div>
      </Card>

      <Card className="p-4 sm:p-6 border-red-100">
        <h3 className="font-display font-bold text-red-600 mb-1">Danger Zone</h3>
        <p className="text-xs text-neutral-500 mb-4">Irreversible actions</p>
        <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
          Delete Account
        </Button>
      </Card>
    </div>
  );
}

/* ───── Security Tab ───── */
function SecurityTab({ settings, refresh }: { settings: Settings; refresh: () => void }) {
  const [showPwForm, setShowPwForm] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  const [show2FA, setShow2FA] = useState(false);
  const [totpSetup, setTotpSetup] = useState<{ secret: string; otpUrl: string } | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [totpError, setTotpError] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [signingOut, setSigningOut] = useState(false);

  async function changePassword() {
    setPwError("");
    if (pwForm.newPw !== pwForm.confirm) { setPwError("Passwords don't match."); return; }
    if (pwForm.newPw.length < 8) { setPwError("Minimum 8 characters."); return; }

    setPwSaving(true);
    const res = await fetch("/api/settings/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: pwForm.current || undefined, newPassword: pwForm.newPw }),
    });
    const data = await res.json();
    if (data.success) {
      setPwSaved(true);
      setShowPwForm(false);
      setPwForm({ current: "", newPw: "", confirm: "" });
      refresh();
      setTimeout(() => setPwSaved(false), 3000);
    } else {
      setPwError(data.message || "Failed to update password.");
    }
    setPwSaving(false);
  }

  async function setup2FA() {
    const res = await fetch("/api/settings/totp", { method: "POST" });
    const data = await res.json();
    if (data.secret) {
      setTotpSetup(data);
      setShow2FA(true);
    }
  }

  async function verify2FA() {
    setTotpError("");
    const res = await fetch("/api/settings/totp", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: totpCode }),
    });
    const data = await res.json();
    if (data.success) {
      setBackupCodes(data.backupCodes);
      refresh();
    } else {
      setTotpError(data.message || "Invalid code.");
    }
  }

  async function disable2FA() {
    const code = prompt("Enter your 2FA code or a backup code to disable:");
    if (!code) return;
    const res = await fetch("/api/settings/totp", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (data.success) {
      setShow2FA(false);
      setTotpSetup(null);
      refresh();
    } else {
      alert(data.message || "Invalid code.");
    }
  }

  async function signOutAllSessions() {
    setSigningOut(true);
    await fetch("/api/settings/sessions", { method: "DELETE" });
    setSigningOut(false);
    refresh();
  }

  return (
    <div className="space-y-6">
      {/* Password */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-neutral-900">Password</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              {settings.hasPassword ? "Password is set. Change it anytime." : "No password set. Add one for email login."}
            </p>
          </div>
          {settings.hasPassword && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-emerald-500">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </div>

        {pwSaved && (
          <div className="mb-4 px-3 py-2 bg-emerald-50 text-emerald-700 text-sm rounded-lg">Password updated successfully.</div>
        )}

        {showPwForm ? (
          <div className="space-y-3">
            {settings.hasPassword && (
              <Input label="Current Password" type="password" value={pwForm.current} onChange={e => setPwForm({ ...pwForm, current: e.target.value })} />
            )}
            <Input label="New Password" type="password" value={pwForm.newPw} onChange={e => setPwForm({ ...pwForm, newPw: e.target.value })} placeholder="Min 8 chars, upper+lower+number" />
            <Input label="Confirm Password" type="password" value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} />
            {pwError && <p className="text-sm text-red-600">{pwError}</p>}
            <div className="flex gap-2">
              <Button onClick={changePassword} disabled={pwSaving} size="sm">{pwSaving ? "Saving..." : "Update Password"}</Button>
              <Button onClick={() => { setShowPwForm(false); setPwError(""); }} variant="outline" size="sm">Cancel</Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => setShowPwForm(true)} variant="outline" size="sm">
            {settings.hasPassword ? "Change Password" : "Set Password"}
          </Button>
        )}
      </Card>

      {/* 2FA */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-neutral-900">Two-Factor Authentication</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              {settings.totpEnabled ? "2FA is enabled. Your account is extra secure." : "Add an extra layer of security with an authenticator app."}
            </p>
          </div>
          {settings.totpEnabled ? (
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase rounded-full">Enabled</span>
          ) : (
            <span className="px-2 py-0.5 bg-neutral-100 text-neutral-500 text-[10px] font-bold uppercase rounded-full">Off</span>
          )}
        </div>

        {backupCodes.length > 0 && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <h4 className="font-bold text-amber-800 text-sm mb-2">Save your backup codes!</h4>
            <p className="text-xs text-amber-700 mb-3">These codes can be used to access your account if you lose your authenticator. Each can only be used once.</p>
            <div className="grid grid-cols-2 gap-1.5">
              {backupCodes.map((code, i) => (
                <div key={i} className="font-mono text-xs bg-white rounded px-2 py-1 text-center border border-amber-100">{code}</div>
              ))}
            </div>
            <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => {
              navigator.clipboard?.writeText(backupCodes.join("\n"));
            }}>
              Copy All Codes
            </Button>
          </div>
        )}

        {settings.totpEnabled ? (
          <Button onClick={disable2FA} variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
            Disable 2FA
          </Button>
        ) : show2FA && totpSetup ? (
          <div className="space-y-4">
            <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
              <p className="text-sm text-neutral-700 mb-2">1. Scan this with your authenticator app (Google Authenticator, Authy, 1Password):</p>
              <div className="bg-white rounded-lg p-4 text-center border border-neutral-200">
                {/* QR code placeholder — use a QR library or Google Charts API */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpSetup.otpUrl)}`}
                  alt="2FA QR Code"
                  className="mx-auto w-48 h-48"
                />
              </div>
              <p className="text-xs text-neutral-500 mt-2">Or enter this code manually:</p>
              <div className="font-mono text-xs bg-white rounded-lg px-3 py-2 border border-neutral-200 mt-1 text-center tracking-widest select-all">
                {totpSetup.secret}
              </div>
            </div>
            <div>
              <p className="text-sm text-neutral-700 mb-2">2. Enter the 6-digit code from your app:</p>
              <div className="flex gap-2">
                <Input
                  value={totpCode}
                  onChange={e => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="font-mono tracking-widest text-center text-lg"
                  maxLength={6}
                />
                <Button onClick={verify2FA} disabled={totpCode.length !== 6} size="sm">Verify</Button>
              </div>
              {totpError && <p className="text-sm text-red-600 mt-1">{totpError}</p>}
            </div>
          </div>
        ) : (
          <Button onClick={setup2FA} variant="outline" size="sm">Enable 2FA</Button>
        )}
      </Card>

      {/* Sessions */}
      <Card className="p-4 sm:p-6">
        <h3 className="font-display font-bold text-neutral-900 mb-1">Active Sessions</h3>
        <p className="text-xs text-neutral-500 mb-4">You have {settings.activeSessions} active session{settings.activeSessions !== 1 ? "s" : ""}.</p>
        <Button onClick={signOutAllSessions} disabled={signingOut} variant="outline" size="sm">
          {signingOut ? "Signing out..." : "Sign Out All Other Devices"}
        </Button>
      </Card>
    </div>
  );
}

/* ───── Privacy Tab ───── */
function PrivacyTab({ settings, refresh }: { settings: Settings; refresh: () => void }) {
  const [privacy, setPrivacy] = useState(settings.privacy);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch("/api/settings/privacy", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profilePublic: privacy.profilePublic,
        showEmail: privacy.showEmail,
        showEarnings: privacy.showEarnings,
        showLocation: privacy.showLocation,
        allowMessages: privacy.allowMessages,
        searchable: privacy.searchable,
      }),
    });
    if (res.ok) {
      setSaved(true);
      refresh();
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <Card className="p-4 sm:p-6">
        <h3 className="font-display font-bold text-neutral-900 mb-1">Profile Visibility</h3>
        <p className="text-xs text-neutral-500 mb-2">Control who can see your profile and what's shown</p>
        <div className="divide-y divide-neutral-100">
          <Toggle
            checked={privacy.profilePublic}
            onChange={v => setPrivacy({ ...privacy, profilePublic: v })}
            label="Public Profile"
            desc="When off, your profile is hidden from browse and search. Only people with a direct link can see it."
          />
          <Toggle
            checked={privacy.searchable}
            onChange={v => setPrivacy({ ...privacy, searchable: v })}
            label="Searchable"
            desc="Appear in search results and the marketplace browse page."
          />
          <Toggle
            checked={privacy.allowMessages}
            onChange={v => setPrivacy({ ...privacy, allowMessages: v })}
            label="Allow Messages"
            desc="Let brands and other creators send you booking inquiries."
          />
        </div>
      </Card>

      <Card className="p-4 sm:p-6">
        <h3 className="font-display font-bold text-neutral-900 mb-1">Information Display</h3>
        <p className="text-xs text-neutral-500 mb-2">Choose what others can see on your profile</p>
        <div className="divide-y divide-neutral-100">
          <Toggle
            checked={privacy.showEmail}
            onChange={v => setPrivacy({ ...privacy, showEmail: v })}
            label="Show Email"
            desc="Display your email address on your public profile."
          />
          <Toggle
            checked={privacy.showLocation}
            onChange={v => setPrivacy({ ...privacy, showLocation: v })}
            label="Show Location"
            desc="Display your city/country on your profile."
          />
          <Toggle
            checked={privacy.showEarnings}
            onChange={v => setPrivacy({ ...privacy, showEarnings: v })}
            label="Show Earnings"
            desc="Show total earnings on your profile. Most creators keep this private."
          />
        </div>
      </Card>

      <Button onClick={save} disabled={saving} className="w-full">
        {saved ? "Saved!" : saving ? "Saving..." : "Save Privacy Settings"}
      </Button>
    </div>
  );
}

/* ───── Plan Tab ───── */
function PlanTab({ settings }: { settings: Settings }) {
  const tiers: Record<string, { name: string; price: string; features: string[] }> = {
    free: {
      name: "Free",
      price: "$0/mo",
      features: [
        "Up to 3 services",
        "Basic profile",
        "0% platform fees",
        "Marketplace listing",
        "Social links",
      ],
    },
    pro: {
      name: "Creator Pro",
      price: "$19/mo",
      features: [
        "Unlimited services",
        "Custom domain",
        "Priority search ranking",
        "Advanced analytics",
        "Premium templates",
        "Verified badge priority",
        "Boosted visibility",
      ],
    },
    business: {
      name: "Creator Business",
      price: "$49/mo",
      features: [
        "Everything in Pro",
        "Team collaboration",
        "White-label profiles",
        "Priority support",
        "Custom integrations",
      ],
    },
    brand_analytics: {
      name: "Brand Analytics",
      price: "$199/mo",
      features: [
        "Creator discovery",
        "Campaign analytics",
        "ROI tracking",
        "Bulk outreach",
        "10% marketplace fee",
      ],
    },
    brand_enterprise: {
      name: "Brand Enterprise",
      price: "$999/mo",
      features: [
        "Everything in Analytics",
        "Dedicated account manager",
        "Custom API access",
        "5% marketplace fee",
        "SLA guarantees",
      ],
    },
  };

  const current = tiers[settings.subscriptionTier] || tiers.free;

  return (
    <div className="space-y-6">
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-neutral-900">Current Plan</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Your active subscription</p>
          </div>
          {settings.subscriptionTier !== "free" && (
            <span className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
              {current.name}
            </span>
          )}
        </div>

        <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-100">
          <div className="flex items-baseline gap-2 mb-4">
            <span className="font-display text-3xl font-bold text-neutral-900">{current.price}</span>
            {settings.subscriptionTier === "free" && <span className="text-sm text-neutral-500">forever</span>}
          </div>
          <ul className="space-y-2">
            {current.features.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-emerald-500 shrink-0">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {settings.subscriptionTier === "free" && (
        <Card className="p-4 sm:p-6 border-amber-200/50 bg-gradient-to-r from-amber-50 to-orange-50">
          <h3 className="font-display font-bold text-neutral-900 mb-2">Ready to grow?</h3>
          <p className="text-sm text-neutral-600 mb-4">
            Upgrade to Pro for unlimited services, analytics, custom domain, and priority search placement.
          </p>
          <Link href="/pricing"><Button>View All Plans</Button></Link>
        </Card>
      )}

      {settings.subscriptionTier !== "free" && (
        <Card className="p-4 sm:p-6">
          <h3 className="font-display font-bold text-neutral-900 mb-2">Manage Subscription</h3>
          <p className="text-xs text-neutral-500 mb-4">Update payment method, cancel, or change plan.</p>
          <div className="flex gap-2">
            <Link href="/pricing"><Button variant="outline" size="sm">Change Plan</Button></Link>
            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">Cancel Plan</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ───── Main Settings ───── */
export function SettingsContent() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("account");
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  function loadSettings() {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => {
        if (!data.error) setSettings(data);
        setLoadingSettings(false);
      })
      .catch(() => setLoadingSettings(false));
  }

  useEffect(() => {
    if (user) loadSettings();
  }, [user]);

  if (loading || loadingSettings) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !settings) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="font-display text-xl font-bold text-neutral-900 mb-3">Sign in to continue</h2>
          <Link href="/"><Button>Go Home</Button></Link>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    {
      key: "account",
      label: "Account",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    },
    {
      key: "security",
      label: "Security",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>,
    },
    {
      key: "privacy",
      label: "Privacy",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
    },
    {
      key: "plan",
      label: "Plan",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
    },
  ];

  return (
    <div className="pt-24 sm:pt-28 pb-20 min-h-screen bg-neutral-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-neutral-400 hover:text-neutral-600 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-neutral-900">Settings</h1>
          </div>
          <p className="text-sm text-neutral-500 ml-5">Manage your account, security, and preferences</p>
        </div>

        {/* Tab bar — horizontal scroll on mobile */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl whitespace-nowrap transition-all active:scale-95 ${
                tab === t.key
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === "account" && <AccountTab settings={settings} refresh={loadSettings} />}
        {tab === "security" && <SecurityTab settings={settings} refresh={loadSettings} />}
        {tab === "privacy" && <PrivacyTab settings={settings} refresh={loadSettings} />}
        {tab === "plan" && <PlanTab settings={settings} />}
      </div>
    </div>
  );
}
