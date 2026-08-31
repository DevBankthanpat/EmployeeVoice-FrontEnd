import { ProtectedShell } from "@/components/layout/protected-shell";
import { EMPLOYEE_ROLES } from "@/lib/auth";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedShell allow={EMPLOYEE_ROLES}>{children}</ProtectedShell>;
}
