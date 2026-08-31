import { ProtectedShell } from "@/components/layout/protected-shell";
import { ADMIN_ROLES } from "@/lib/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedShell allow={ADMIN_ROLES}>{children}</ProtectedShell>;
}
