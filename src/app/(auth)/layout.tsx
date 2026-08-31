import { MessageCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { LocaleSwitcher } from "@/components/layout/locale-switcher";

/** Centered, chrome-free layout for the auth screens (no sidebar). */
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("common");
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <MessageCircle className="size-5" strokeWidth={1.5} />
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-base font-semibold tracking-tight">
            {t("appName")}
          </span>
          <span className="text-xs text-muted-foreground">{t("tagline")}</span>
        </div>
      </div>
      <div className="w-full max-w-sm">{children}</div>
      <LocaleSwitcher />
    </main>
  );
}
