"use client";

import { CheckCircle2 } from "lucide-react";
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

export default function AcceptInvitePage() {
  const t = useTranslations("auth");
  const [name, setName] = useState("");
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
          <CardTitle className="text-lg">{t("invite.successTitle")}</CardTitle>
          <CardDescription>{t("invite.successBody")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button size="lg" className="w-full" render={<Link href="/login" />}>
            {t("invite.goToLogin")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirm) {
      setError(t("invite.mismatch"));
      return;
    }
    setError(null);
    setDone(true);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("invite.title")}</CardTitle>
        <CardDescription>{t("invite.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">{t("invite.nameLabel")}</Label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("invite.namePlaceholder")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">{t("invite.newPassword")}</Label>
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
            <Label htmlFor="confirm">{t("invite.confirmPassword")}</Label>
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
            disabled={!name || !password || !confirm}
          >
            {t("invite.submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
