"use client";

import { useQuery } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";

import { EmptyState, LoadError } from "@/components/dashboard/section";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { provider } from "@/data/provider";
import type { AuditEntry } from "@/data/schemas";

function AuditRow({ entry }: { entry: AuditEntry }) {
  const t = useTranslations("manage.audit");
  const tRole = useTranslations("roles");
  const format = useFormatter();

  // Known actions get a friendly label; anything else falls back to the raw
  // key humanised, so a new backend action never renders as a blank cell.
  const actionKey = `actions.${entry.action}`;
  const actionLabel = t.has(actionKey)
    ? t(actionKey)
    : entry.action.replace(/_/g, " ");

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-3 py-3">
        <div className="flex items-center gap-3">
          <Avatar name={entry.actorName} />
          <div className="flex flex-col">
            <span className="text-sm font-medium">{entry.actorName}</span>
            {entry.actorRole && (
              <span className="text-xs text-muted-foreground">
                {tRole(entry.actorRole)}
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-sm whitespace-nowrap">{actionLabel}</td>
      <td className="px-3 py-3 text-sm text-muted-foreground">
        {entry.target ?? "—"}
      </td>
      <td className="px-3 py-3 text-sm whitespace-nowrap text-muted-foreground">
        {format.dateTime(new Date(entry.createdAt), {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </td>
    </tr>
  );
}

export default function AuditLogPage() {
  const t = useTranslations("manage.audit");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["auditLog"],
    queryFn: () => provider.getAuditLog(),
  });

  const entries = data
    ? [...data].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : [];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {isError ? (
        <LoadError onRetry={() => refetch()} />
      ) : isLoading || !data ? (
        <div className="flex flex-col gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <EmptyState>{t("empty")}</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[42rem] border-collapse">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-3 py-2.5 text-xs font-medium text-muted-foreground">
                  {t("colActor")}
                </th>
                <th className="px-3 py-2.5 text-xs font-medium text-muted-foreground">
                  {t("colAction")}
                </th>
                <th className="px-3 py-2.5 text-xs font-medium text-muted-foreground">
                  {t("colTarget")}
                </th>
                <th className="px-3 py-2.5 text-xs font-medium text-muted-foreground">
                  {t("colTime")}
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <AuditRow key={entry.id} entry={entry} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
