"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { FullPageSpinner } from "@/components/layout/full-page-spinner";
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
import { homePathForRole } from "@/lib/auth";

const DEMO_ACCOUNTS = [
  { email: "somchai.wattana@meridian.co.th", roleKey: "employee" },
  { email: "preeya.wong@meridian.co.th", roleKey: "org_viewer" },
  { email: "kanya.sirichai@meridian.co.th", roleKey: "org_admin" },
] as const;

export default function LoginPage() {
  const { status, user, login } = useAuth();
  const router = useRouter();
  const t = useTranslations("auth");
  const tRoles = useTranslations("roles");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already signed in → bounce to the role home.
  useEffect(() => {
    if (status === "authenticated" && user) {
      router.replace(homePathForRole(user.role));
    }
  }, [status, user, router]);

  if (status === "loading" || (status === "authenticated" && user)) {
    return <FullPageSpinner />;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const signedIn = await login(email.trim(), password);
      router.replace(homePathForRole(signedIn.role));
    } catch {
      setError(t("login.invalidCredentials"));
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("login.title")}</CardTitle>
        <CardDescription>{t("login.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
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
              aria-invalid={error ? true : undefined}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t("passwordLabel")}</Label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-primary hover:underline"
              >
                {t("login.forgotLink")}
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t("passwordPlaceholder")}
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
            disabled={submitting || !email || !password}
          >
            {submitting ? t("login.submitting") : t("login.submit")}
          </Button>
        </form>

        <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">{t("login.demoTitle")}</p>
          <p className="mt-1">{t("login.demoHint")}</p>
          <ul className="mt-2 flex flex-col gap-1">
            {DEMO_ACCOUNTS.map((account) => (
              <li key={account.email} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword("demo");
                    setError(null);
                  }}
                  className="font-mono hover:text-foreground hover:underline"
                >
                  {account.email}
                </button>
                <span>· {tRoles(account.roleKey)}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
