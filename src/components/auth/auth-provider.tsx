"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

import { provider } from "@/data/provider";
import type { Profile } from "@/data/schemas";
import { clearStoredUser, loadStoredUser, storeUser } from "@/lib/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface Session {
  status: AuthStatus;
  user: Profile | null;
}

/**
 * The mock session lives in a tiny external store read via
 * `useSyncExternalStore`. localStorage is an external system, so this is the
 * idiomatic way to surface it into React: the server (and first client render)
 * see a stable `loading` snapshot — avoiding a hydration mismatch — then the
 * store hydrates on subscribe. Real JWT auth replaces this in Phase 9.
 */
const LOADING: Session = { status: "loading", user: null };

let snapshot: Session = LOADING;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function setSession(next: Session) {
  snapshot = next;
  emit();
}

function sessionFor(user: Profile | null): Session {
  return user
    ? { status: "authenticated", user }
    : { status: "unauthenticated", user: null };
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Hydrate from localStorage once, after the first subscription (client only).
  if (!hydrated) {
    hydrated = true;
    setSession(sessionFor(loadStoredUser()));
  }
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Session {
  return snapshot;
}

function getServerSnapshot(): Session {
  return LOADING;
}

/** Persist + broadcast a session change. Only ever called client-side. */
function persistSession(user: Profile | null) {
  if (user) storeUser(user);
  else clearStoredUser();
  setSession(sessionFor(user));
}

interface AuthContextValue {
  status: AuthStatus;
  user: Profile | null;
  login: (email: string, password: string) => Promise<Profile>;
  logout: () => void;
  /** Update the signed-in user locally (e.g. after editing the profile). */
  setUser: (user: Profile) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const session = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const login = useCallback(async (email: string, password: string) => {
    const result = await provider.login({ email, password });
    persistSession(result.user);
    return result.user;
  }, []);

  const logout = useCallback(() => {
    persistSession(null);
  }, []);

  const setUser = useCallback((next: Profile) => {
    persistSession(next);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status: session.status,
      user: session.user,
      login,
      logout,
      setUser,
    }),
    [session, login, logout, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
