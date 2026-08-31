"use client";

import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";
import { navForRole } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function SidebarBrand() {
  const t = useTranslations("common");
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 px-5 py-4"
      aria-label={t("appName")}
    >
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <MessageCircle className="size-5" strokeWidth={1.5} />
      </span>
      <span className="text-sm font-semibold tracking-tight">
        {t("appName")}
      </span>
    </Link>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const tNav = useTranslations("nav");

  if (!user) return null;
  const sections = navForRole(user.role);

  return (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-2">
      {sections.map((section) => (
        <div key={section.titleKey} className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {tNav(section.titleKey)}
          </p>
          {section.items.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" strokeWidth={1.5} />
                {tNav(item.labelKey)}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
