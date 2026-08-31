"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { EmptyState, LoadError } from "@/components/dashboard/section";
import { ThemeCard } from "@/components/dashboard/theme-card";
import { Skeleton } from "@/components/ui/skeleton";
import { provider } from "@/data/provider";

/**
 * Organizational Themes list (C2). Grid of theme cards; each links to the theme
 * detail. Every card's `reportCount` is a k-anon-safe aggregate (≥ MIN_GROUP
 * upstream), so no small group is ever surfaced here.
 */
export default function ThemesPage() {
  const t = useTranslations("dashboard.themes");
  const tAnon = useTranslations("dashboard");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["themes"],
    queryFn: () => provider.getThemes(),
  });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        <p className="text-xs text-muted-foreground">
          {tAnon("anonymityNote")}
        </p>
      </div>

      {isError ? (
        <LoadError onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      ) : data && data.length === 0 ? (
        <EmptyState>{t("empty")}</EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} />
          ))}
        </div>
      )}
    </div>
  );
}
