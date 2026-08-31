import { ProtectedShell } from "@/components/layout/protected-shell";
import { ORG_ROLES } from "@/lib/auth";

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedShell allow={ORG_ROLES}>{children}</ProtectedShell>;
}
