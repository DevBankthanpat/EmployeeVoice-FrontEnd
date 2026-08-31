import { ProtectedShell } from "@/components/layout/protected-shell";
import { ALL_ROLES } from "@/lib/auth";

/** Profile is available to any signed-in user, whatever their role. */
export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedShell allow={ALL_ROLES}>{children}</ProtectedShell>;
}
