"use client";

import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import type { Theme } from "@/data/schemas";
import { THEME_TREND_ICON } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

import { Sparkline } from "./sparkline";

/**
 * Top Organizational Themes card (C1) — also the unit of the Themes list (C2
 * grid). Shows name, report count, a trend sparkline, and department chips. The
 * whole card links to the theme detail. `reportCount` is a k-anon-safe aggregate
 * (≥ MIN_GROUP upstream); department chips may include the "Other" bucket.
 */
export function ThemeCard({ theme }: { theme: Theme }) {
  const t = useTranslations("dashboard.themes");
  const tTrend = useTranslations("enums.themeTrend");
  const format = useFormatter();
  const TrendIcon = THEME_TREND_ICON[theme.trend];

  return (
    <Link
      href={`/themes/${theme.id}`}
      className="group/theme block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card
        size="sm"
        className="h-full ring-foreground/10 transition-all group-hover/theme:ring-primary/30 group-focus-visible/theme:ring-primary/40"
      >
        <CardContent className="flex h-full flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-heading text-sm leading-snug font-medium">
              {theme.name}
            </h3>
            <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
              <TrendIcon className="size-3.5" strokeWidth={1.5} />
              {tTrend(theme.trend)}
            </span>
          </div>

          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-2xl font-semibold tracking-tight tabular-nums">
                {format.number(theme.reportCount)}
              </span>
              <span className="text-xs text-muted-foreground">
                {t("reports", { count: theme.reportCount })}
              </span>
            </div>
            {theme.sparkline && theme.sparkline.length > 1 && (
              <Sparkline data={theme.sparkline} className="h-8 w-24" />
            )}
          </div>

          {theme.departmentNames.length > 0 && (
            <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
              {theme.departmentNames.map((dept) => (
                <span
                  key={dept}
                  className={cn(
                    "inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground",
                  )}
                >
                  {dept}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
