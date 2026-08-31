"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";

import { Field } from "@/components/form/field";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, type SelectOption } from "@/components/ui/select";
import { provider } from "@/data/provider";
import { InviteMemberInputSchema, type Role, RoleSchema } from "@/data/schemas";
import { ROLES } from "@/lib/taxonomy";

const NO_DEPARTMENT = "__none__";

export default function InviteMemberPage() {
  const t = useTranslations("manage.invite");
  const tRole = useTranslations("roles");
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("employee");
  const [departmentId, setDepartmentId] = useState<string>(NO_DEPARTMENT);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [invitedEmail, setInvitedEmail] = useState<string | null>(null);

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: () => provider.getDepartments(),
  });

  const mutation = useMutation({
    mutationFn: () =>
      provider.inviteMember({
        email: email.trim(),
        name: name.trim() || undefined,
        role,
        departmentId: departmentId === NO_DEPARTMENT ? undefined : departmentId,
      }),
    onSuccess: (member) => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      setInvitedEmail(member.email);
    },
  });

  function resetForm() {
    setEmail("");
    setName("");
    setRole("employee");
    setDepartmentId(NO_DEPARTMENT);
    setEmailError(null);
    setInvitedEmail(null);
    mutation.reset();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = InviteMemberInputSchema.shape.email.safeParse(email.trim());
    if (!parsed.success) {
      setEmailError(t("emailError"));
      return;
    }
    setEmailError(null);
    mutation.mutate();
  }

  const roleOptions: SelectOption[] = ROLES.map((r) => ({
    value: r,
    label: tRole(r),
  }));
  const departmentOptions: SelectOption[] = [
    { value: NO_DEPARTMENT, label: t("departmentPlaceholder") },
    ...(departments ?? []).map((d) => ({ value: d.id, label: d.name })),
  ];

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <Link
        href="/members"
        className="inline-flex w-fit items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" strokeWidth={1.5} />
        {t("back")}
      </Link>

      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {invitedEmail ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-positive/10 text-positive">
              <CheckCircle2 className="size-6" strokeWidth={1.5} />
            </span>
            <p className="text-sm text-muted-foreground">
              {t("success", { email: invitedEmail })}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="outline" onClick={resetForm}>
                <UserPlus className="size-4" strokeWidth={1.5} />
                {t("inviteAnother")}
              </Button>
              <Button render={<Link href="/members" />}>
                {t("backToList")}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6"
        >
          <Field
            label={t("emailLabel")}
            htmlFor="invite-email"
            required
            error={emailError ?? undefined}
          >
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              aria-invalid={!!emailError || undefined}
              autoComplete="off"
            />
          </Field>

          <Field label={t("nameLabel")} htmlFor="invite-name">
            <Input
              id="invite-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
              autoComplete="off"
            />
          </Field>

          <Field label={t("roleLabel")} htmlFor="invite-role">
            <Select
              id="invite-role"
              value={role}
              options={roleOptions}
              onValueChange={(v) =>
                setRole((RoleSchema.safeParse(v).data ?? "employee") as Role)
              }
              ariaLabel={t("roleLabel")}
            />
          </Field>

          <Field label={t("departmentLabel")} htmlFor="invite-department">
            <Select
              id="invite-department"
              value={departmentId}
              options={departmentOptions}
              onValueChange={(v) => setDepartmentId(v ?? NO_DEPARTMENT)}
              ariaLabel={t("departmentLabel")}
            />
          </Field>

          {mutation.isError && (
            <p role="alert" className="text-sm text-destructive">
              {t("error")}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              render={<Link href="/members" />}
            >
              {t("back")}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? t("submitting") : t("submit")}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
