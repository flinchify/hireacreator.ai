"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

type AuthTab = "login" | "signup";
type AuthRole = "creator" | "brand" | "business" | "agent";

export interface User {
  id: string;
  email: string;
  name: string;
  slug: string | null;
  avatar: string | null;
  cover: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  role: string;
  category: string | null;
  hourlyRate: number | null;
  currency: string;
  isVerified: boolean;
  isOnline: boolean;
  isPro: boolean;
  subscriptionTier: string;
  websiteUrl: string | null;
  businessName: string | null;
  businessUrl: string | null;
  rating: number;
  reviewCount: number;
  totalProjects: number;
  totalEarnings: number;
  emailVerified: boolean;
  onboardingComplete: boolean;
  stripeAccountId: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isOpen: boolean;
  tab: AuthTab;
  defaultRole: AuthRole;
  openLogin: () => void;
  openSignup: (role?: AuthRole) => void;
  close: () => void;
  setTab: (tab: AuthTab) => void;
  setDefaultRole: (role: AuthRole) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<AuthTab>("login");
  const [defaultRole, setDefaultRole] = useState<AuthRole>("creator");

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Handle claim intent after OAuth redirect (Google OAuth can't read localStorage server-side)
  useEffect(() => {
    if (loading || !user) return;
    try {
      const raw = localStorage.getItem("hac_claim_intent");
      if (!raw) return;
      const intent = JSON.parse(raw) as { platform?: string; handle?: string; slug?: string };
      localStorage.removeItem("hac_claim_intent");
      // Only redirect if we're on a page that indicates fresh login (welcome or root)
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      if (path !== "/" && path !== "/dashboard") return;
      if (path === "/dashboard" && !params.get("welcome")) return;
      // Redirect to claim flow
      if (intent.slug) {
        window.location.href = `/u/${encodeURIComponent(intent.slug)}/claim`;
      } else if (intent.platform && intent.handle) {
        window.location.href = `/dashboard?verify=${encodeURIComponent(intent.platform)}&handle=${encodeURIComponent(intent.handle)}`;
      }
    } catch {}
  }, [loading, user]);

  const openLogin = useCallback(() => {
    setTab("login");
    setIsOpen(true);
  }, []);

  const openSignup = useCallback((role: AuthRole = "creator") => {
    setTab("signup");
    setDefaultRole(role);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isOpen,
        tab,
        defaultRole,
        openLogin,
        openSignup,
        close,
        setTab,
        setDefaultRole,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
