"use client";

import { createContext, useContext, useState, useCallback } from "react";

type AuthTab = "login" | "signup";
type AuthRole = "creator" | "brand" | "agent";

interface AuthContextType {
  isOpen: boolean;
  tab: AuthTab;
  defaultRole: AuthRole;
  openLogin: () => void;
  openSignup: (role?: AuthRole) => void;
  close: () => void;
  setTab: (tab: AuthTab) => void;
  setDefaultRole: (role: AuthRole) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<AuthTab>("login");
  const [defaultRole, setDefaultRole] = useState<AuthRole>("creator");

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

  return (
    <AuthContext.Provider
      value={{ isOpen, tab, defaultRole, openLogin, openSignup, close, setTab, setDefaultRole }}
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
