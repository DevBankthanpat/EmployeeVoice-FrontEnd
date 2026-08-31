"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";

import { EmptyState } from "@/components/dashboard/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { provider } from "@/data/provider";
import type { SignalDetail } from "@/data/schemas";
import { IMPACT_LEVEL_BADGE, SIGNAL_TYPE_ICONS } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
      {children}
    </span>
  );
}

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
      <dt className="w-40 shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd className="flex flex-wrap gap-1.5 text-sm">{children}</dd>
    </div>
  );
}

function Detail({ signal }: { signal: SignalDetail }) {
  const t = useTranslations("dashboard.signalDetail");
  const tType = useTranslations("enums.signalType");
  const tLevel = useTranslations("enums.impactLevel");
  const tFreq = useTranslations("enums.frequency");
  const tImpact = useTranslations("enums.impactType");
  const tArea = useTranslations("enums.relatedArea");
  const tStage = useTranslations("enums.workflowStage");
  const format = useFormatter();

  const confidence =
    signal.confidence !== undefined
      ? format.number(signal.confidence, {
          style: "percent",
          maximumFractionDigits: 0,
        })
      : null;

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {signal.title}
          </h1>
          <span
            className={cn(
              "inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-medium",
              IMPACT_LEVEL_BADGE[signal.impactLevel],
            )}
          >
            {tLevel(signal.impactLevel)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {signal.departmentName} ·{" "}
          {format.dateTime(new Date(signal.createdAt), { dateStyle: "medium" })}
        </p>
      </div>

      {/* AI summary — never the raw description (§4.4, dashboard schema). */}
      <Card>
        <CardHeader>
          <CardTitle>{t("summaryTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-foreground/90">
            {signal.summary}
          </p>
          {signal.estimatedImpact && (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {t("estimatedImpact")}
              </p>
              <p className="text-sm text-muted-foreground">
                {signal.estimatedImpact}
              </p>
            </div>
          )}
          {confidence && (
            <p className="text-xs text-muted-foreground">
              {t("confidence")}:{" "}
              <span className="font-medium text-foreground tabular-nums">
                {confidence}
              </span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Classification */}
      <Card>
        <CardHeader>
          <CardTitle>{t("classification")}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="flex flex-col gap-3">
            <MetaRow label={t("department")}>
              <Chip>{signal.departmentName}</Chip>
            </MetaRow>
            <MetaRow label={t("classification")}>
              {signal.signalTypes.map((type) => {
                const Icon = SIGNAL_TYPE_ICONS[type];
                return (
                  <Chip key={type}>
                    <Icon className="size-3" strokeWidth={1.5} />
                    {tType(type)}
                  </Chip>
                );
              })}
            </MetaRow>
            <MetaRow label={t("frequency")}>
              <Chip>{tFreq(signal.frequency)}</Chip>
            </MetaRow>
            <MetaRow label={t("impactTypes")}>
              {signal.impactTypes.map((it) => (
                <Chip key={it}>{tImpact(it)}</Chip>
              ))}
            </MetaRow>
            {signal.relatedAreas && signal.relatedAreas.length > 0 && (
              <MetaRow label={t("relatedAreas")}>
                {signal.relatedAreas.map((area) => (
                  <Chip key={area}>{tArea(area)}</Chip>
                ))}
              </MetaRow>
            )}
            {signal.workflowStage && (
              <MetaRow label={t("workflowStage")}>
                <Chip>{tStage(signal.workflowStage)}</Chip>
              </MetaRow>
            )}
            {signal.incidentAt && (
              <MetaRow label={t("incidentAt")}>
                {format.dateTime(new Date(signal.incidentAt), {
                  dateStyle: "medium",
                })}
              </MetaRow>
            )}
            {signal.keywords.length > 0 && (
              <MetaRow label={t("keywords")}>
                {signal.keywords.map((kw) => (
                  <Chip key={kw}>{kw}</Chip>
                ))}
              </MetaRow>
            )}
            {signal.tags.length > 0 && (
              <MetaRow label={t("tags")}>
                {signal.tags.map((tag) => (
                  <Chip key={tag}>{tag}</Chip>
                ))}
              </MetaRow>
            )}
          </dl>
        </CardContent>
      </Card>

      <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-accent/50 p-3 text-xs text-muted-foreground">
        <ShieldCheck
          className="mt-0.5 size-4 shrink-0 text-primary"
          strokeWidth={1.5}
        />
        {t("privacyNote")}
      </div>
    </>
  );
}

export default function SignalDetailPage() {
  const params = useParams<{ id: string }>();
  const t = useTranslations("dashboard.signalDetail");
  const tSignals = useTranslations("dashboard.signals");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboardSignal", params.id],
    queryFn: () => provider.getDashboardSignal(params.id),
    retry: false,
  });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        href="/signals"
        className="inline-flex w-fit items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" strokeWidth={1.5} />
        {tSignals("back")}
      </Link>

      {isError ? (
        <EmptyState>{t("notFound")}</EmptyState>
      ) : isLoading || !data ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      ) : (
        <Detail signal={data} />
      )}
    </div>
  );
}
