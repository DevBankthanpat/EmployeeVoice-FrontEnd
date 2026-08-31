import { type Profile, ProfileSchema, type Role } from "@/data/schemas";

/**
 * Client-side session helpers for the mock auth flow (Phase 2). Real JWT auth
 * replaces the storage bits in Phase 9; the role/route helpers stay.
 *
 * NOTE: this is a POC convenience only. It does NOT enforce anonymity or any
 * server-side authorization — the backend RBAC guard (Phase 6+) is the real
 * boundary. See CLAUDE.md Hard Rule #7.
 */

export const AUTH_STORAGE_KEY = "ev.auth.user";

/** Role sets per area — the single source both guards and nav agree on. */
export const EMPLOYEE_ROLES = ["employee"] as const satisfies readonly Role[];
export const ORG_ROLES = [
  "org_viewer",
  "org_admin",
] as const satisfies readonly Role[];
export const ADMIN_ROLES = ["org_admin"] as const satisfies readonly Role[];
export const ALL_ROLES = [
  "employee",
  "org_viewer",
  "org_admin",
] as const satisfies readonly Role[];

/** Where each role lands after login / when hitting the app root. */
export function homePathForRole(role: Role): string {
  return role === "employee" ? "/home" : "/dashboard";
}

export function canAccess(role: Role, allow: readonly Role[]): boolean {
  return allow.includes(role);
}

// ── localStorage persistence (client only) ──────────────────────────────────

export function loadStoredUser(): Profile | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = ProfileSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function storeUser(user: Profile): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
