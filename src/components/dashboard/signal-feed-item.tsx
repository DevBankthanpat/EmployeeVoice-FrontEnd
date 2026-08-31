"use client";

import { useFormatter, useNow, useTranslations } from "next-intl";
import Link from "next/link";

import type { SignalFeedItem as SignalFeedItemType } from "@/data/schemas";
import { IMPACT_LEVEL_BADGE, SIGNAL_TYPE_ICONS } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

/**
 * One row of the Recent Signals feed (C1) and the full Signals Feed (C3); also
 * used for a theme's related signals (C2). Renders the AI `summary`, department
 * (the ONLY unit shown — §4.5), signal types, impact, and tags. There is no
 * identity field here by construction: the item is a department-only projection
 * (see dashboard schema + provider.test.ts forbidden-keys check).
 */
export function SignalFeedItem({ signal }: { signal: SignalFeedItemType }) {
  const tType = useTranslations("enums.signalType");
  const tLevel = useTranslations("enums.impactLevel");
  const format = useFormatter();
  // Explicit reference time for relativeTime (avoids next-intl's
  // ENVIRONMENT_FALLBACK); resolves to the provider's configured `now`.
  const now = useNow();

  const PrimaryIcon = SIGNAL_TYPE_ICONS[signal.signalTypes[0]!];

  return (
    <Link
      href={`/signals/${signal.id}`}
      className="group/signal block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-colors group-hover/signal:border-primary/30 group-focus-visible/signal:border-primary/40">
        <div className="flex items-start justify-between gap-3">
          <h3 className="leading-snug font-medium">{signal.title}</h3>
          <span
            className={cn(
              "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium",
              IMPACT_LEVEL_BADGE[signal.impactLevel],
            )}
          >
            {tLevel(signal.impactLevel)}
          </span>
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {signal.summary}
        </p>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 font-medium text-foreground">
            {PrimaryIcon && (
              <PrimaryIcon className="size-3.5" strokeWidth={1.5} />
            )}
            {signal.departmentName}
          </span>
          <span aria-hidden="true">·</span>
          <span>{tType(signal.signalTypes[0]!)}</span>
          {signal.signalTypes.length > 1 && (
            <span>+{signal.signalTypes.length - 1}</span>
          )}
          <span aria-hidden="true">·</span>
          <span>{format.relativeTime(new Date(signal.createdAt), now)}</span>
        </div>

        {signal.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {signal.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
