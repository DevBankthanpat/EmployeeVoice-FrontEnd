"use client";

import { useQuery } from "@tanstack/react-query";
import { Inbox, Lock, Send } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";

import { AnonymityBadge } from "@/components/form/anonymity-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { provider } from "@/data/provider";
import type { MySubmissionItem } from "@/data/schemas";
import { IMPACT_LEVEL_BADGE, SUBMISSION_STATUS_BADGE } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

function Chip({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}

function SubmissionRow({ item }: { item: MySubmissionItem }) {
  const t = useTranslations("mySubmissions");
  const tType = useTranslations("enums.signalType");
  const tLevel = useTranslations("enums.impactLevel");
  const tStatus = useTranslations("enums.submissionStatus");
  const format = useFormatter();

  const shownTypes = item.signalTypes.slice(0, 2);
  const extraTypes = item.signalTypes.length - shownTypes.length;

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{item.title}</span>
          {item.isAnonymous && (
            <Chip className="border-border bg-muted text-muted-foreground">
              <Lock className="size-3" strokeWidth={1.5} />
              {t("anonymous")}
            </Chip>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {shownTypes.map((type) => (
            <span key={type}>{tType(type)}</span>
          ))}
          {extraTypes > 0 && (
            <span>{t("typeMore", { count: extraTypes })}</span>
          )}
          <span aria-hidden="true">·</span>
          <span>
            {format.dateTime(new Date(item.createdAt), { dateStyle: "medium" })}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Chip className={IMPACT_LEVEL_BADGE[item.impactLevel]}>
          {tLevel(item.impactLevel)}
        </Chip>
        <Chip className={SUBMISSION_STATUS_BADGE[item.status]}>
          {tStatus(item.status)}
        </Chip>
      </div>
    </li>
  );
}

export default function MySubmissionsPage() {
  const t = useTranslations("mySubmissions");
  const tCommon = useTranslations("common");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["mySubmissions"],
    queryFn: () => provider.getMySubmissions(),
  });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <AnonymityBadge />
        </div>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {isLoading && (
        <ul className="flex flex-col gap-3">
          {[0, 1, 2].map((row) => (
            <li
              key={row}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
            >
              <div className="flex flex-col gap-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-5 w-20" />
            </li>
          ))}
        </ul>
      )}

      {isError && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              {tCommon("loadError")}
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              {tCommon("retry")}
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && data && data.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Inbox className="size-6" strokeWidth={1.5} />
            </span>
            <p className="text-sm text-muted-foreground">{t("empty")}</p>
            <Button render={<Link href="/submit" />}>
              <Send className="size-4" strokeWidth={1.5} />
              {t("emptyCta")}
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <ul className="flex flex-col gap-3">
          {data.map((item) => (
            <SubmissionRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}
