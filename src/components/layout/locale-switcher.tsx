"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { locales, LOCALE_COOKIE } from "@/i18n/config";
import { cn } from "@/lib/utils";

// Kept at module scope so the cookie mutation lives outside the component —
// satisfies react-hooks/immutability, which disallows mutating externals
// (like `document`) from within a component's render scope.
function writeLocaleCookie(locale: string) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

/**
 * TH/EN language toggle. Writes the LOCALE cookie and refreshes so the server
 * re-reads it (see src/i18n/request.ts) and re-renders with the new messages.
 */
export function LocaleSwitcher() {
  const active = useLocale();
  const t = useTranslations("locale");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function selectLocale(next: string) {
    if (next === active) return;
    writeLocaleCookie(next);
    startTransition(() => router.refresh());
  }

  return (
    <div
      role="group"
      aria-label={t("label")}
      className="inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1"
    >
      {locales.map((locale) => {
        const isActive = locale === active;
        return (
          <button
            key={locale}
            type="button"
            onClick={() => selectLocale(locale)}
            disabled={isPending}
            aria-pressed={isActive}
            className={cn(
              "rounded-md px-3 py-1 text-sm font-medium transition-colors disabled:opacity-60",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {t(locale)}
          </button>
        );
      })}
    </div>
  );
}
