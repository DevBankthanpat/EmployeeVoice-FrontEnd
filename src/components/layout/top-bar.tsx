"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";

import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const t = useTranslations("common");
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-card/80 px-4 backdrop-blur md:px-8">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
        aria-label={t("openMenu")}
      >
        <Menu className="size-5" strokeWidth={1.5} />
      </Button>
      <div className="flex-1" />
      <LocaleSwitcher />
      <UserMenu />
    </header>
  );
}
