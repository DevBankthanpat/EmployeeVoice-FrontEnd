"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { LoadError } from "@/components/dashboard/section";
import { Field } from "@/components/form/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { provider } from "@/data/provider";
import type { OrgSettings, UpdateOrgSettingsInput } from "@/data/schemas";
import { UpdateOrgSettingsInputSchema } from "@/data/schemas";

function SettingsForm({ settings }: { settings: OrgSettings }) {
  const t = useTranslations("manage.settings");
  const queryClient = useQueryClient();

  const [name, setName] = useState(settings.name);
  const [logo, setLogo] = useState(settings.logoUrl ?? "");
  const [minGroup, setMinGroup] = useState(String(settings.minGroupThreshold));
  const [consent, setConsent] = useState(settings.consentPolicyText);
  const [errors, setErrors] = useState<{
    name?: string;
    logo?: string;
    minGroup?: string;
  }>({});

  const mutation = useMutation({
    mutationFn: (patch: UpdateOrgSettingsInput) =>
      provider.updateOrgSettings(patch),
    onSuccess: (updated) => {
      queryClient.setQueryData(["orgSettings"], updated);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};

    const trimmedName = name.trim();
    if (trimmedName === "") next.name = t("nameError");

    const trimmedLogo = logo.trim();
    const logoUrl = trimmedLogo === "" ? null : trimmedLogo;
    if (
      logoUrl !== null &&
      !UpdateOrgSettingsInputSchema.shape.logoUrl.safeParse(logoUrl).success
    ) {
      next.logo = t("logoError");
    }

    const parsedMin = Number(minGroup);
    if (!Number.isInteger(parsedMin) || parsedMin < 1) {
      next.minGroup = t("minGroupError");
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    mutation.mutate({
      name: trimmedName,
      logoUrl,
      minGroupThreshold: parsedMin,
      consentPolicyText: consent,
    });
  }

  function clearSaved() {
    if (mutation.isSuccess) mutation.reset();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6"
    >
      <Field
        label={t("nameLabel")}
        htmlFor="org-name"
        required
        error={errors.name}
      >
        <Input
          id="org-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            clearSaved();
          }}
          placeholder={t("namePlaceholder")}
          aria-invalid={!!errors.name || undefined}
        />
      </Field>

      <Field
        label={t("logoLabel")}
        htmlFor="org-logo"
        description={t("logoHelp")}
        error={errors.logo}
      >
        <Input
          id="org-logo"
          value={logo}
          onChange={(e) => {
            setLogo(e.target.value);
            clearSaved();
          }}
          placeholder={t("logoPlaceholder")}
          aria-invalid={!!errors.logo || undefined}
          inputMode="url"
        />
      </Field>

      <Field
        label={t("minGroupLabel")}
        htmlFor="org-min-group"
        description={t("minGroupHelp")}
        error={errors.minGroup}
      >
        <Input
          id="org-min-group"
          type="number"
          min={1}
          step={1}
          value={minGroup}
          onChange={(e) => {
            setMinGroup(e.target.value);
            clearSaved();
          }}
          aria-invalid={!!errors.minGroup || undefined}
          className="max-w-32"
        />
      </Field>

      <Field
        label={t("consentLabel")}
        htmlFor="org-consent"
        description={t("consentHelp")}
      >
        <Textarea
          id="org-consent"
          value={consent}
          onChange={(e) => {
            setConsent(e.target.value);
            clearSaved();
          }}
          className="min-h-28"
        />
      </Field>

      {mutation.isError && (
        <p role="alert" className="text-sm text-destructive">
          {t("error")}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? t("saving") : t("save")}
        </Button>
        {mutation.isSuccess && !mutation.isPending && (
          <span className="text-sm text-positive">{t("saved")}</span>
        )}
      </div>
    </form>
  );
}

export default function OrgSettingsPage() {
  const t = useTranslations("manage.settings");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["orgSettings"],
    queryFn: () => provider.getOrgSettings(),
  });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {isError ? (
        <LoadError onRetry={() => refetch()} />
      ) : isLoading || !data ? (
        <Skeleton className="h-96 w-full rounded-xl" />
      ) : (
        <SettingsForm settings={data} />
      )}
    </div>
  );
}
