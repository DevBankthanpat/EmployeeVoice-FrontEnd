"use client";

import {
  CheckCircle2,
  ListChecks,
  Lock,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SubmitSignalResult } from "@/data/schemas";

/**
 * Submission Success screen (B3). The reassurance copy switches on
 * `isAnonymous`: an anonymous submission is told no identity was recorded at
 * all (§4.2), an identified one that identity is stored separately and never
 * shown on the dashboard (Hard Rule #1).
 */
export function SubmissionSuccess({
  result,
  onSubmitAnother,
}: {
  result: SubmitSignalResult;
  onSubmitAnother: () => void;
}) {
  const t = useTranslations("submitSuccess");

  const anon = result.isAnonymous;
  const Icon = anon ? Lock : ShieldCheck;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col items-center gap-5 py-8 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-positive/10 text-positive">
            <CheckCircle2 className="size-8" strokeWidth={1.5} />
          </span>
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("title")}
            </h1>
            <p className="text-sm text-muted-foreground">{t("body")}</p>
          </div>

          <div className="flex w-full items-start gap-3 rounded-xl border border-primary/20 bg-accent/60 p-4 text-left">
            <Icon
              className="mt-0.5 size-5 shrink-0 text-primary"
              strokeWidth={1.5}
            />
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium text-accent-foreground">
                {anon ? t("anonTitle") : t("identifiedTitle")}
              </p>
              <p className="text-sm text-muted-foreground">
                {anon ? t("anonBody") : t("identifiedBody")}
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            {t("refId")}:{" "}
            <span className="font-mono text-foreground">{result.id}</span>
          </p>

          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
            <Button type="button" onClick={onSubmitAnother}>
              <Plus className="size-4" strokeWidth={1.5} />
              {t("submitAnother")}
            </Button>
            <Button variant="outline" render={<Link href="/my-submissions" />}>
              <ListChecks className="size-4" strokeWidth={1.5} />
              {t("viewSubmissions")}
            </Button>
            <Button variant="ghost" render={<Link href="/home" />}>
              {t("backHome")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
