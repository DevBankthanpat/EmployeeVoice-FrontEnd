"use client";

import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

/**
 * Reusable privacy-reassurance marker, shown wherever anonymity is relevant
 * (Employee Home, Submit form, Success). Structural anonymity is the product's
 * core promise (CLAUDE.md Hard Rule #1) — this keeps the reassurance consistent.
 *
 * - `inline` — a compact pill for headers and cards.
 * - `panel`  — a fuller callout with the guarantee spelled out.
 */
export function AnonymityBadge({
  variant = "inline",
  className,
}: {
  variant?: "inline" | "panel";
  className?: string;
}) {
  const t = useTranslations("anonymity");

  if (variant === "panel") {
    return (
      <div
        className={cn(
          "flex items-start gap-3 rounded-xl border border-primary/20 bg-accent/60 p-4",
          className,
        )}
      >
        <ShieldCheck
          className="mt-0.5 size-5 shrink-0 text-primary"
          strokeWidth={1.5}
        />
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-accent-foreground">
            {t("title")}
          </p>
          <p className="text-sm text-muted-foreground">{t("body")}</p>
        </div>
      </div>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/20 bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground",
        className,
      )}
    >
      <ShieldCheck className="size-3.5" strokeWidth={1.5} />
      {t("short")}
    </span>
  );
}
