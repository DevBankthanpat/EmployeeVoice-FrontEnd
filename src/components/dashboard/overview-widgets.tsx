"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  Inbox,
  Sparkles,
  ThumbsUp,
  TriangleAlert,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { provider } from "@/data/provider";
import type { Stats } from "@/data/schemas";

import { ActionCard } from "./action-card";
import { sortSignalsByNewest } from "./dashboard.logic";
import { EmptyState, LoadError, WidgetHeader } from "./section";
import { SignalFeedItem } from "./signal-feed-item";
import { StatCard } from "./stat-card";
import { ThemeCard } from "./theme-card";

const STAT_ORDER: { key: keyof Stats; icon: typeof Inbox }[] = [
  { key: "totalSignals", icon: Inbox },
  { key: "highImpact", icon: TriangleAlert },
  { key: "positive", icon: ThumbsUp },
  { key: "departmentsAffected", icon: Building2 },
  { key: "newThisWeek", icon: Sparkles },
];

// ── Signal Statistics ───────────────────────────────────────────────────────
export function StatsWidget() {
  const t = useTranslations("dashboard.stats");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: () => provider.getDashboardStats(),
  });

  if (isError) return <LoadError onRetry={() => refetch()} />;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {isLoading || !data
        ? STAT_ORDER.map((s) => (
            <Skeleton key={s.key} className="h-[6.5rem] w-full rounded-xl" />
          ))
        : STAT_ORDER.map(({ key, icon }) => (
            <StatCard key={key} label={t(key)} stat={data[key]} icon={icon} />
          ))}
    </div>
  );
}

// ── AI Executive Summary ────────────────────────────────────────────────────
export function ExecSummaryWidget() {
  const t = useTranslations("dashboard.overview");
  const format = useFormatter();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboardSummary"],
    queryFn: () => provider.getDashboardSummary(),
  });

  if (isError) return <LoadError onRetry={() => refetch()} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("summaryTitle")}</CardTitle>
        {!isLoading && data?.generatedAt && (
          <CardDescription>
            {t("updatedAt", {
              date: format.dateTime(new Date(data.generatedAt), {
                dateStyle: "medium",
              }),
            })}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading || !data ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ) : (
          <>
            <p className="text-sm leading-relaxed text-foreground/90">
              {data.content}
            </p>
            {data.highlights && data.highlights.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {t("highlightsTitle")}
                </p>
                <ul className="flex flex-col gap-1.5">
                  {data.highlights.map((item) => (
                    <li
                      key={item}
                      className="flex gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ── Top Organizational Themes ───────────────────────────────────────────────
export function TopThemesWidget() {
  const t = useTranslations("dashboard.overview");
  const tThemes = useTranslations("dashboard.themes");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["themes"],
    queryFn: () => provider.getThemes(),
  });

  const top = [...(data ?? [])]
    .sort((a, b) => b.reportCount - a.reportCount)
    .slice(0, 4);

  return (
    <section className="flex flex-col gap-3">
      <WidgetHeader title={t("themesTitle")} href="/themes" />
      {isError ? (
        <LoadError onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : top.length === 0 ? (
        <EmptyState>{tThemes("empty")}</EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {top.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} />
          ))}
        </div>
      )}
    </section>
  );
}

// ── Recent Signals Feed ─────────────────────────────────────────────────────
export function RecentSignalsWidget() {
  const t = useTranslations("dashboard.overview");
  const tSignals = useTranslations("dashboard.signals");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboardSignals", "recent"],
    queryFn: () => provider.getDashboardSignals(),
  });

  const recent = sortSignalsByNewest(data ?? []).slice(0, 5);

  return (
    <section className="flex flex-col gap-3">
      <WidgetHeader title={t("signalsTitle")} href="/signals" />
      {isError ? (
        <LoadError onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : recent.length === 0 ? (
        <EmptyState>{tSignals("empty")}</EmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          {recent.map((signal) => (
            <SignalFeedItem key={signal.id} signal={signal} />
          ))}
        </div>
      )}
    </section>
  );
}

// ── AI Suggested Actions ────────────────────────────────────────────────────
export function SuggestedActionsWidget() {
  const t = useTranslations("dashboard.overview");
  const tActions = useTranslations("dashboard.actions");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["actions"],
    queryFn: () => provider.getActions(),
  });

  const top = (data ?? []).slice(0, 4);

  return (
    <section className="flex flex-col gap-3">
      <WidgetHeader title={t("actionsTitle")} href="/actions" />
      {isError ? (
        <LoadError onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : top.length === 0 ? (
        <EmptyState>{tActions("empty")}</EmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          {top.map((action) => (
            <ActionCard key={action.id} action={action} />
          ))}
        </div>
      )}
    </section>
  );
}
