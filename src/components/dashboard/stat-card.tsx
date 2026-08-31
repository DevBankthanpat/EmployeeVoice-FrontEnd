"use client";

import { ArrowDown, ArrowUp, type LucideIcon, Minus } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { Card, CardContent } from "@/components/ui/card";
import type { StatValue } from "@/data/schemas";

/**
 * One Signal-Statistics tile (C1): big number + small label + a period-over-
 * period trend arrow (design direction: "Stat card = big number + small label +
 * trend arrow ▲▼"). The delta arrow is intentionally neutral in colour — more
 * signals is not inherently good or bad — so semantic colour stays reserved for
 * true impact indicators (CLAUDE.md §Design direction).
 */
export function StatCard({
  label,
  stat,
  icon: Icon,
}: {
  label: string;
  stat: StatValue;
  icon?: LucideIcon;
}) {
  const t = useTranslations("dashboard.stats");
  const format = useFormatter();
  const { value, delta } = stat;

  const DeltaIcon =
    delta === undefined || delta === 0
      ? Minus
      : delta > 0
        ? ArrowUp
        : ArrowDown;

  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {label}
          </span>
          {Icon && (
            <Icon
              className="size-4 shrink-0 text-muted-foreground"
              strokeWidth={1.5}
            />
          )}
        </div>
        <span className="text-2xl font-semibold tracking-tight tabular-nums">
          {format.number(value)}
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <DeltaIcon className="size-3" strokeWidth={2} />
          {delta === undefined || delta === 0 ? (
            t("noChange")
          ) : (
            <>
              <span className="tabular-nums">
                {delta > 0 ? "+" : "−"}
                {format.number(Math.abs(delta))}
              </span>
              <span>{t("sinceLast")}</span>
            </>
          )}
        </span>
      </CardContent>
    </Card>
  );
}
