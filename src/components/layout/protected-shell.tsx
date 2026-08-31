"use client";

import { AppShell } from "@/components/layout/app-shell";
import { RoleGuard } from "@/components/layout/role-guard";
import type { Role } from "@/data/schemas";

/**
 * One wrapper used by every authenticated route group: enforce the role, then
 * render the shared app shell. Route-group layouts pass the allowed roles.
 */
export function ProtectedShell({
  allow,
  children,
}: {
  allow: readonly Role[];
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allow={allow}>
      <AppShell>{children}</AppShell>
    </RoleGuard>
  );
}
