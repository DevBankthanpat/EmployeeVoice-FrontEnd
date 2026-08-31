"use client";

import { Compass } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { homePathForRole } from "@/lib/auth";

export default function NotFound() {
  const t = useTranslations("notFound");
  const { user } = useAuth();
  const router = useRouter();

  return (
    <main className="flex min-h-svh flex-col items-center justify-center p-6 text-center">
      <div className="flex max-w-md flex-col items-center gap-4">
        <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Compass className="size-6" strokeWidth={1.5} />
        </span>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("body")}</p>
        </div>
        <Button
          onClick={() =>
            router.replace(user ? homePathForRole(user.role) : "/login")
          }
        >
          {t("cta")}
        </Button>
      </div>
    </main>
  );
}
