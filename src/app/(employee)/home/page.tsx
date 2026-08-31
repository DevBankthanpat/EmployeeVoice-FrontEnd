"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { useAuth } from "@/components/auth/auth-provider";
import { AnonymityBadge } from "@/components/form/anonymity-badge";
import { FullPageSpinner } from "@/components/layout/full-page-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { provider } from "@/data/provider";
import type { Profile } from "@/data/schemas";

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  const t = useTranslations("profile");
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value || t("notSet")}</dd>
    </div>
  );
}

function SubmissionCount() {
  const t = useTranslations("home");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["mySubmissions"],
    queryFn: () => provider.getMySubmissions(),
  });

  return (
    <Card className="justify-between">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {t("countTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isLoading ? (
          <Skeleton className="h-9 w-16" />
        ) : (
          <p className="text-3xl font-semibold tracking-tight">
            {isError ? "—" : (data?.length ?? 0)}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          {t("submissionCount", { count: isError ? 0 : (data?.length ?? 0) })}
        </p>
        <Link
          href="/my-submissions"
          className="inline-flex w-fit items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {t("viewAll")}
          <ArrowRight className="size-4" strokeWidth={1.5} />
        </Link>
      </CardContent>
    </Card>
  );
}

function EmployeeHome({ user }: { user: Profile }) {
  const t = useTranslations("home");
  const tEnum = useTranslations("enums");
  const tProfile = useTranslations("profile");

  const workFormat = user.workFormat
    ? tEnum(`workFormat.${user.workFormat}`)
    : null;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("greeting", { name: user.name })}
          </h1>
          <AnonymityBadge />
        </div>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.6fr_1fr]">
        {/* Primary CTA */}
        <Card className="border-primary/20 bg-accent/40">
          <CardContent className="flex h-full flex-col justify-between gap-6 py-2">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold tracking-tight">
                {t("ctaTitle")}
              </h2>
              <p className="text-sm text-muted-foreground">{t("ctaBody")}</p>
            </div>
            <Button
              size="lg"
              className="w-fit"
              render={<Link href="/submit" />}
            >
              <Send className="size-4" strokeWidth={1.5} />
              {t("ctaButton")}
            </Button>
          </CardContent>
        </Card>

        <SubmissionCount />
      </div>

      {/* Profile context — read-only self-view (ARCHITECTURE.md §5.1 note) */}
      <Card>
        <CardHeader>
          <CardTitle>{t("profileTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-xs text-muted-foreground">{t("profileNote")}</p>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ReadOnlyField label={tProfile("branch")} value={user.branchName} />
            <ReadOnlyField
              label={tProfile("department")}
              value={user.departmentName}
            />
            <ReadOnlyField label={tProfile("team")} value={user.teamName} />
            <ReadOnlyField label={tProfile("position")} value={user.position} />
            <ReadOnlyField label={tProfile("workFormat")} value={workFormat} />
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

export default function EmployeeHomePage() {
  const { user } = useAuth();
  // RoleGuard guarantees a user; this is a defensive fallback.
  if (!user) return <FullPageSpinner />;
  return <EmployeeHome user={user} />;
}
