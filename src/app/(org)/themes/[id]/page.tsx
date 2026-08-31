"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";

import { EmptyState } from "@/components/dashboard/section";
import { SignalFeedItem } from "@/components/dashboard/signal-feed-item";
import { ThemeTrendGraph } from "@/components/dashboard/trend-graph";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { provider } from "@/data/provider";
import { THEME_TREND_ICON } from "@/lib/taxonomy";

function BackLink() {
  const t = useTranslations("dashboard.themes");
  return (
    <Link
      href="/themes"
      className="inline-flex w-fit items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-4" strokeWidth={1.5} />
      {t("back")}
    </Link>
  );
}

export default function ThemeDetailPage() {
  const params = useParams<{ id: string }>();
  const t = useTranslations("dashboard.themes");
  const tTrend = useTranslations("enums.themeTrend");
  const format = useFormatter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["theme", params.id],
    queryFn: () => provider.getTheme(params.id),
    retry: false,
  });

  const TrendIcon = data ? THEME_TREND_ICON[data.trend] : null;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <BackLink />

      {isError ? (
        <EmptyState>{t("notFound")}</EmptyState>
      ) : isLoading || !data ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-60 w-full rounded-xl" />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                {data.name}
              </h1>
              {TrendIcon && (
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  <TrendIcon className="size-3.5" strokeWidth={1.5} />
                  {tTrend(data.trend)}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {t("reports", { count: data.reportCount })} ·{" "}
              {format.dateTime(new Date(`${data.period}-01T00:00:00Z`), {
                month: "long",
                year: "numeric",
              })}
            </p>
            {data.summary && (
              <p className="text-sm leading-relaxed text-foreground/90">
                {data.summary}
              </p>
            )}
          </div>

          {data.trendSeries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t("trendLabel")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ThemeTrendGraph series={data.trendSeries} />
              </CardContent>
            </Card>
          )}

          {data.departmentNames.length > 0 && (
            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-medium">
                {t("affectedDepartments")}
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.departmentNames.map((dept) => (
                  <span
                    key={dept}
                    className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {dept}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <h2 className="font-heading text-base font-medium">
              {t("relatedSignals")}
            </h2>
            {data.relatedSignals.length === 0 ? (
              <EmptyState>{t("empty")}</EmptyState>
            ) : (
              <div className="flex flex-col gap-3">
                {data.relatedSignals.map((signal) => (
                  <SignalFeedItem key={signal.id} signal={signal} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
