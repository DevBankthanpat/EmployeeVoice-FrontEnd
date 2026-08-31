"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { FullPageSpinner } from "@/components/layout/full-page-spinner";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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

function ProfileForm({ user }: { user: Profile }) {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const tRoles = useTranslations("roles");
  const tEnum = useTranslations("enums");
  const { setUser } = useAuth();

  const [name, setName] = useState(user.name);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function onSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await provider.updateMe({ name: name.trim() });
      // Keep the signed-in identity; apply only the edited fields.
      setUser({ ...user, name: name.trim() });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  const workFormat = user.workFormat
    ? tEnum(`workFormat.${user.workFormat}`)
    : null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("accountSection")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <form onSubmit={onSave} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">{t("nameLabel")}</Label>
              <Input
                id="name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setSaved(false);
                }}
                required
              />
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="submit"
                disabled={saving || name.trim().length === 0}
              >
                {saving ? tCommon("saving") : tCommon("save")}
              </Button>
              {saved && (
                <span className="text-sm text-positive">{t("saved")}</span>
              )}
            </div>
          </form>

          <Separator />

          <dl className="flex flex-col gap-4">
            <ReadOnlyField label={t("emailLabel")} value={user.email} />
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">
                {t("roleLabel")}
              </dt>
              <dd>
                <Badge variant="secondary">{tRoles(user.role)}</Badge>
              </dd>
            </div>
            <div className="flex flex-col gap-1.5">
              <dt className="text-xs text-muted-foreground">
                {t("localeLabel")}
              </dt>
              <dd>
                <LocaleSwitcher />
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("orgContextSection")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-xs text-muted-foreground">{t("orgContextNote")}</p>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ReadOnlyField label={t("branch")} value={user.branchName} />
            <ReadOnlyField
              label={t("department")}
              value={user.departmentName}
            />
            <ReadOnlyField label={t("team")} value={user.teamName} />
            <ReadOnlyField label={t("position")} value={user.position} />
            <ReadOnlyField label={t("workFormat")} value={workFormat} />
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  // RoleGuard guarantees a user here; this is a defensive fallback.
  if (!user) return <FullPageSpinner />;
  return <ProfileForm user={user} />;
}
