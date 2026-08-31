"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { FullPageSpinner } from "@/components/layout/full-page-spinner";
import type { Role } from "@/data/schemas";
import { canAccess } from "@/lib/auth";

/**
 * Client-side route protection (mock). Renders children only for an
 * authenticated user whose role is allowed; otherwise redirects
 * (unauthenticated → /login, wrong role → /no-access). Shows a spinner until
 * authorization is decided, so protected content never flashes.
 *
 * This is a UX guard, not a security boundary — real enforcement is the backend
 * RBAC guard in Phase 6+ (CLAUDE.md Hard Rule #7).
 */
export function RoleGuard({
  allow,
  children,
}: {
  allow: readonly Role[];
  children: React.ReactNode;
}) {
  const { status, user } = useAuth();
  const router = useRouter();

  const authorized =
    status === "authenticated" && user !== null && canAccess(user.role, allow);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated" || user === null) {
      router.replace("/login");
      return;
    }
    if (!canAccess(user.role, allow)) {
      router.replace("/no-access");
    }
  }, [status, user, allow, router]);

  if (!authorized) return <FullPageSpinner />;
  return <>{children}</>;
}
