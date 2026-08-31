"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { ActionCard } from "@/components/dashboard/action-card";
import { EmptyState, LoadError } from "@/components/dashboard/section";
import { Skeleton } from "@/components/ui/skeleton";
import { provider } from "@/data/provider";
import type { Action, ActionStatus } from "@/data/schemas";
import { cn } from "@/lib/utils";

const COLUMNS: { status: ActionStatus; labelKey: string; dot: string }[] = [
  { status: "new", labelKey: "colNew", dot: "bg-primary" },
  { status: "reviewed", labelKey: "colReviewed", dot: "bg-medium" },
  { status: "done", labelKey: "colDone", dot: "bg-positive" },
];

function Column({
  labelKey,
  dot,
  actions,
  onStatusChange,
  pendingId,
}: {
  labelKey: string;
  dot: string;
  actions: Action[];
  onStatusChange: (id: string, status: ActionStatus) => void;
  pendingId: string | null;
}) {
  const t = useTranslations("dashboard.actions");
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className={cn("size-2 rounded-full", dot)} />
        <h2 className="font-heading text-sm font-medium">{t(labelKey)}</h2>
        <span className="text-xs text-muted-foreground tabular-nums">
          {actions.length}
        </span>
      </div>
      {actions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-xs text-muted-foreground">
          —
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {actions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              pending={pendingId === action.id}
              onStatusChange={(status) => onStatusChange(action.id, status)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ActionsPage() {
  const t = useTranslations("dashboard.actions");
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["actions"],
    queryFn: () => provider.getActions(),
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ActionStatus }) =>
      provider.updateActionStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["actions"] }),
  });

  const pendingId = mutation.isPending
    ? (mutation.variables?.id ?? null)
    : null;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {isError ? (
        <LoadError onRetry={() => refetch()} />
      ) : isLoading || !data ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {[0, 1, 2].map((col) => (
            <div key={col} className="flex flex-col gap-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState>{t("empty")}</EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {COLUMNS.map((col) => (
            <Column
              key={col.status}
              labelKey={col.labelKey}
              dot={col.dot}
              actions={data.filter((a) => a.status === col.status)}
              pendingId={pendingId}
              onStatusChange={(id, status) => mutation.mutate({ id, status })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
