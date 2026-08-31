"use client";

import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <Card>
        <CardHeader>
          <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <CheckCircle2 className="size-5" strokeWidth={1.5} />
          </span>
          <CardTitle className="text-lg">{t("reset.successTitle")}</CardTitle>
          <CardDescription>{t("reset.successBody")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button size="lg" className="w-full" render={<Link href="/login" />}>
            {t("reset.backToLogin")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirm) {
      setError(t("reset.mismatch"));
      return;
    }
    setError(null);
    setDone(true);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("reset.title")}</CardTitle>
        <CardDescription>{t("reset.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">{t("reset.newPassword")}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t("passwordPlaceholder")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm">{t("reset.confirmPassword")}</Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              placeholder={t("passwordPlaceholder")}
              aria-invalid={error ? true : undefined}
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={!password || !confirm}
          >
            {t("reset.submit")}
          </Button>
        </form>
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} />
          {t("reset.backToLogin")}
        </Link>
      </CardContent>
    </Card>
  );
}
