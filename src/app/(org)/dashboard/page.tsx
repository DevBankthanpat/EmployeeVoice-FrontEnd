"use client";

import { useQuery } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";

import {
  ExecSummaryWidget,
  RecentSignalsWidget,
  StatsWidget,
  SuggestedActionsWidget,
  TopThemesWidget,
} from "@/components/dashboard/overview-widgets";
import { provider } from "@/data/provider";

/**
 * Dashboard Overview (C1) — composes the five org-side widgets, each of which
 * fetches and renders its own loading/empty/error state. Everything shown here
 * is aggregate or AI-derived and department-only: no screen on this path can
 * reach a submitter's identity (ARCHITECTURE.md §4, provider.test.ts).
 */
export default function DashboardPage() {
  const t = useTranslations("dashboard.overview");
  const tAnon = useTranslations("dashboard");
  const format = useFormatter();

  const { data: summary } = useQuery({
    queryKey: ["dashboardSummary"],
    queryFn: () => provider.getDashboardSummary(),
  });

  const periodLabel = summary
    ? format.dateTime(new Date(`${summary.period}-01T00:00:00Z`), {
        month: "long",
        year: "numeric",
      })
    : "…";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("subtitle", { period: periodLabel })}
        </p>
        <p className="text-xs text-muted-foreground">
          {tAnon("anonymityNote")}
        </p>
      </div>

      <StatsWidget />
      <ExecSummaryWidget />
      <TopThemesWidget />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentSignalsWidget />
        <SuggestedActionsWidget />
      </div>
    </div>
  );
}
