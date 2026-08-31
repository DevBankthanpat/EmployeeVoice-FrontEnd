"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * Small shared chrome for the org dashboard: a widget/section header with an
 * optional "view all" link, and a compact inline error+retry used by every
 * widget so loading/empty/error states stay consistent (CLAUDE.md §Conventions).
 */
export function WidgetHeader({
  title,
  href,
}: {
  title: string;
  href?: string;
}) {
  const t = useTranslations("dashboard.overview");
  return (
    <div className="flex items-center justify-between gap-2">
      <h2 className="font-heading text-base font-medium">{title}</h2>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {t("viewAll")}
          <ArrowRight className="size-4" strokeWidth={1.5} />
        </Link>
      )}
    </div>
  );
}

export function LoadError({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("common");
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card py-10 text-center">
      <p className="text-sm text-muted-foreground">{t("loadError")}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        {t("retry")}
      </Button>
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
