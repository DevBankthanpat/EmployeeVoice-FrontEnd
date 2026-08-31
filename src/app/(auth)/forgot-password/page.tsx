"use client";

import { ArrowLeft, MailCheck } from "lucide-react";
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

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <Card>
        <CardHeader>
          <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <MailCheck className="size-5" strokeWidth={1.5} />
          </span>
          <CardTitle className="text-lg">{t("forgot.successTitle")}</CardTitle>
          <CardDescription>
            {t("forgot.successBody", { email })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            render={<Link href="/login" />}
          >
            <ArrowLeft strokeWidth={1.5} />
            {t("forgot.backToLogin")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("forgot.title")}</CardTitle>
        <CardDescription>{t("forgot.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(true);
          }}
          className="flex flex-col gap-4"
          noValidate
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t("emailLabel")}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t("emailPlaceholder")}
            />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={!email}>
            {t("forgot.submit")}
          </Button>
        </form>
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} />
          {t("forgot.backToLogin")}
        </Link>
      </CardContent>
    </Card>
  );
}
