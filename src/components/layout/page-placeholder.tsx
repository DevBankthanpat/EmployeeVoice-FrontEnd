"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";

/**
 * Stand-in for screens whose full build lands in a later phase. Renders inside
 * the real shell so navigation + role routing can be verified now.
 */
export function PagePlaceholder({
  navKey,
  phase,
}: {
  navKey: string;
  phase: number;
}) {
  const tNav = useTranslations("nav");
  const t = useTranslations("placeholder");
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {tNav(navKey)}
        </h1>
        <Badge variant="secondary">{t("badge")}</Badge>
      </div>
      <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
        {t("body", { phase })}
      </div>
    </div>
  );
}
