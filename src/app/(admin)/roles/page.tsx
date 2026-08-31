"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, Minus, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import { LoadError } from "@/components/dashboard/section";
import { Skeleton } from "@/components/ui/skeleton";
import { provider } from "@/data/provider";
import type { Role, RolePermission } from "@/data/schemas";
import { ROLES } from "@/lib/taxonomy";

/** Capability columns, in the order they appear on RolePermission. */
const CAPS = [
  "canSubmitSignals",
  "canViewOwnSubmissions",
  "canViewDashboard",
  "canManageMembers",
  "canManageOrgSettings",
  "canRunAnalysis",
  "canViewAuditLog",
] as const satisfies readonly (keyof RolePermission)[];

function Cell({ on }: { on: boolean }) {
  const t = useTranslations("manage.roles");
  return (
    <span className="inline-flex items-center justify-center">
      {on ? (
        <Check className="size-4 text-positive" strokeWidth={2} />
      ) : (
        <Minus className="size-4 text-muted-foreground/50" strokeWidth={1.5} />
      )}
      <span className="sr-only">{on ? t("yes") : t("no")}</span>
    </span>
  );
}

export default function RolesPage() {
  const t = useTranslations("manage.roles");
  const tRole = useTranslations("roles");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["roles"],
    queryFn: () => provider.getRoles(),
  });

  const byRole = new Map<Role, RolePermission>(
    (data ?? []).map((r) => [r.role, r]),
  );
  // Fixed column order (employee → viewer → admin), independent of API order.
  const columns = ROLES.filter((r) => byRole.has(r));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {isError ? (
        <LoadError onRetry={() => refetch()} />
      ) : isLoading || !data ? (
        <Skeleton className="h-72 w-full rounded-xl" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[36rem] border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  {t("colCapability")}
                </th>
                {columns.map((role) => (
                  <th
                    key={role}
                    className="px-4 py-3 text-center text-xs font-medium text-muted-foreground"
                  >
                    {tRole(role)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CAPS.map((cap) => (
                <tr key={cap} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-sm font-medium">
                    {t(`caps.${cap}`)}
                  </td>
                  {columns.map((role) => (
                    <td key={role} className="px-4 py-3 text-center">
                      <Cell on={byRole.get(role)![cap]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-accent/50 p-3 text-xs text-muted-foreground">
        <ShieldCheck
          className="mt-0.5 size-4 shrink-0 text-primary"
          strokeWidth={1.5}
        />
        {t("note")}
      </div>
    </div>
  );
}
