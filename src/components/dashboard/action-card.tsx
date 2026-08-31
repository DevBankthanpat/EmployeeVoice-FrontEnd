"use client";

import { Check, Eye, RotateCcw } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Action, ActionStatus } from "@/data/schemas";
import { ACTION_PRIORITY_BADGE } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

/**
 * One AI Suggested Action (C1 widget + C5 board). Presentational: pass
 * `onStatusChange` to render the review controls on the Actions Board; omit it
 * for the read-only overview widget. The board owns the mock mutation.
 */
export function ActionCard({
  action,
  onStatusChange,
  pending = false,
}: {
  action: Action;
  onStatusChange?: (status: ActionStatus) => void;
  pending?: boolean;
}) {
  const t = useTranslations("dashboard.actions");
  const tPriority = useTranslations("enums.actionPriority");
  const format = useFormatter();

  const percent = format.number(action.confidence, {
    style: "percent",
    maximumFractionDigits: 0,
  });

  return (
    <Card size="sm" className="h-full">
      <CardContent className="flex h-full flex-col gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
              ACTION_PRIORITY_BADGE[action.priority],
            )}
          >
            {tPriority(action.priority)}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {t("confidence", { percent })}
          </span>
        </div>

        <h3 className="leading-snug font-medium">{action.title}</h3>
        <p className="text-sm text-muted-foreground">{action.description}</p>

        {action.relatedThemeId && action.relatedThemeName && (
          <Link
            href={`/themes/${action.relatedThemeId}`}
            className="w-fit text-xs font-medium text-primary hover:underline"
          >
            {t("relatedTheme")}: {action.relatedThemeName}
          </Link>
        )}

        {onStatusChange && (
          <div className="mt-auto flex flex-wrap gap-2 pt-1">
            {action.status !== "reviewed" && action.status !== "done" && (
              <Button
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => onStatusChange("reviewed")}
              >
                <Eye className="size-3.5" strokeWidth={1.5} />
                {t("markReviewed")}
              </Button>
            )}
            {action.status !== "done" && (
              <Button
                size="sm"
                disabled={pending}
                onClick={() => onStatusChange("done")}
              >
                <Check className="size-3.5" strokeWidth={1.5} />
                {t("markDone")}
              </Button>
            )}
            {action.status !== "new" && (
              <Button
                size="sm"
                variant="ghost"
                disabled={pending}
                onClick={() =>
                  onStatusChange(action.status === "done" ? "reviewed" : "new")
                }
              >
                <RotateCcw className="size-3.5" strokeWidth={1.5} />
                {t("reopen")}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
