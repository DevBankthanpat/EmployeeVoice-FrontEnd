"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Play } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { useAuth } from "@/components/auth/auth-provider";
import { EmptyState, LoadError } from "@/components/dashboard/section";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { provider } from "@/data/provider";
import type { AnalysisRun } from "@/data/schemas";
import { ANALYSIS_RUN_STATUS_BADGE } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

function RunRow({ run }: { run: AnalysisRun }) {
  const tStatus = useTranslations("enums.runStatus");
  const tTrigger = useTranslations("enums.runTrigger");
  const t = useTranslations("dashboard.analysis");
  const format = useFormatter();

  const dt = (value?: string | null) =>
    value
      ? format.dateTime(new Date(value), {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : t("notFinished");

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-3 py-3 text-sm font-medium whitespace-nowrap">
        {run.period}
      </td>
      <td className="px-3 py-3 text-sm whitespace-nowrap text-muted-foreground">
        {tTrigger(run.triggeredBy)}
      </td>
      <td className="px-3 py-3">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
            ANALYSIS_RUN_STATUS_BADGE[run.status],
          )}
        >
          {tStatus(run.status)}
        </span>
      </td>
      <td className="px-3 py-3 text-sm whitespace-nowrap text-muted-foreground">
        {dt(run.startedAt)}
      </td>
      <td className="px-3 py-3 text-sm whitespace-nowrap text-muted-foreground">
        {dt(run.finishedAt)}
      </td>
      <td className="px-3 py-3 text-right text-sm whitespace-nowrap text-muted-foreground tabular-nums">
        {run.signalsProcessed ?? t("notFinished")}
      </td>
    </tr>
  );
}

export default function AnalysisRunsPage() {
  const t = useTranslations("dashboard.analysis");
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const canRun = user?.role === "org_admin";

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["analysisRuns"],
    queryFn: () => provider.getAnalysisRuns(),
  });

  const mutation = useMutation({
    mutationFn: () => provider.runAnalysis(),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["analysisRuns"] }),
  });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        {canRun && (
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            <Play className="size-4" strokeWidth={1.5} />
            {mutation.isPending ? t("running") : t("runNow")}
          </Button>
        )}
      </div>

      {mutation.isSuccess && (
        <div className="rounded-xl border border-primary/20 bg-accent/50 px-4 py-3 text-sm text-accent-foreground">
          {t("queued")}
        </div>
      )}

      {isError ? (
        <LoadError onRetry={() => refetch()} />
      ) : isLoading || !data ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState>{t("empty")}</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[40rem] border-collapse">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-3 py-2.5 text-xs font-medium text-muted-foreground">
                  {t("colPeriod")}
                </th>
                <th className="px-3 py-2.5 text-xs font-medium text-muted-foreground">
                  {t("colTrigger")}
                </th>
                <th className="px-3 py-2.5 text-xs font-medium text-muted-foreground">
                  {t("colStatus")}
                </th>
                <th className="px-3 py-2.5 text-xs font-medium text-muted-foreground">
                  {t("colStarted")}
                </th>
                <th className="px-3 py-2.5 text-xs font-medium text-muted-foreground">
                  {t("colFinished")}
                </th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">
                  {t("colSignals")}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((run) => (
                <RunRow key={run.id} run={run} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
