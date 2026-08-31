"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { EmptyState } from "@/components/dashboard/section";
import { Field } from "@/components/form/field";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, type SelectOption } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { provider } from "@/data/provider";
import type {
  Branch,
  Department,
  Member,
  Role,
  Team,
  UpdateMemberInput,
  UserStatus,
  WorkFormat,
} from "@/data/schemas";
import { RoleSchema, UserStatusSchema } from "@/data/schemas";
import { ROLES, USER_STATUSES, WORK_FORMATS } from "@/lib/taxonomy";

const NONE = "__none__";

/** Prepend an "Unassigned" option and map entities to select options. */
function withNone(
  none: string,
  items: { id: string; name: string }[],
): SelectOption[] {
  return [
    { value: NONE, label: none },
    ...items.map((i) => ({ value: i.id, label: i.name })),
  ];
}

function EditForm({
  member,
  branches,
  departments,
  teams,
}: {
  member: Member;
  branches: Branch[];
  departments: Department[];
  teams: Team[];
}) {
  const t = useTranslations("manage.memberDetail");
  const tRole = useTranslations("roles");
  const tStatus = useTranslations("enums.userStatus");
  const tWork = useTranslations("enums.workFormat");
  const format = useFormatter();
  const queryClient = useQueryClient();

  const [role, setRole] = useState<Role>(member.role);
  const [status, setStatus] = useState<UserStatus>(member.status);
  const [branchId, setBranchId] = useState<string>(member.branchId ?? NONE);
  const [departmentId, setDepartmentId] = useState<string>(
    member.departmentId ?? NONE,
  );
  const [teamId, setTeamId] = useState<string>(member.teamId ?? NONE);
  const [position, setPosition] = useState(member.position ?? "");
  const [workFormat, setWorkFormat] = useState<string>(
    member.workFormat ?? NONE,
  );

  const mutation = useMutation({
    mutationFn: (patch: UpdateMemberInput) =>
      provider.updateMember(member.id, patch),
    onSuccess: (updated) => {
      queryClient.setQueryData(["member", member.id], updated);
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });

  // Teams belong to a department (§5); only offer teams under the chosen one.
  const teamsForDept =
    departmentId === NONE
      ? []
      : teams.filter((tm) => tm.departmentId === departmentId);

  function handleDepartmentChange(next: string | null) {
    const dept = next ?? NONE;
    setDepartmentId(dept);
    // A team from another department is no longer valid — clear it.
    if (
      dept === NONE ||
      !teams.some((tm) => tm.id === teamId && tm.departmentId === dept)
    ) {
      setTeamId(NONE);
    }
    mutation.reset();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate({
      role,
      status,
      branchId: branchId === NONE ? null : branchId,
      departmentId: departmentId === NONE ? null : departmentId,
      teamId: teamId === NONE ? null : teamId,
      position: position.trim() === "" ? null : position.trim(),
      workFormat: workFormat === NONE ? null : (workFormat as WorkFormat),
    });
  }

  const roleOptions: SelectOption[] = ROLES.map((r) => ({
    value: r,
    label: tRole(r),
  }));
  const statusOptions: SelectOption[] = USER_STATUSES.map((s) => ({
    value: s,
    label: tStatus(s),
  }));
  const workFormatOptions: SelectOption[] = [
    { value: NONE, label: t("unassigned") },
    ...WORK_FORMATS.map((w) => ({ value: w, label: tWork(w) })),
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Identity — read-only */}
      <Card>
        <CardHeader>
          <CardTitle>{t("identitySection")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Avatar name={member.name} className="size-11 text-sm" />
            <div className="flex flex-col">
              <span className="text-lg font-semibold">{member.name}</span>
              <span className="text-sm text-muted-foreground">
                {member.email}
              </span>
            </div>
          </div>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">
                {t("emailLabel")}
              </dt>
              <dd className="text-sm">{member.email}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">
                {t("createdLabel")}
              </dt>
              <dd className="text-sm">
                {format.dateTime(new Date(member.createdAt), {
                  dateStyle: "medium",
                })}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Role & status — editable */}
      <Card>
        <CardHeader>
          <CardTitle>{t("accessSection")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label={t("roleLabel")} htmlFor="member-role">
            <Select
              id="member-role"
              value={role}
              options={roleOptions}
              onValueChange={(v) => {
                setRole((RoleSchema.safeParse(v).data ?? role) as Role);
                mutation.reset();
              }}
              ariaLabel={t("roleLabel")}
            />
          </Field>
          <Field label={t("statusLabel")} htmlFor="member-status">
            <Select
              id="member-status"
              value={status}
              options={statusOptions}
              onValueChange={(v) => {
                setStatus(
                  (UserStatusSchema.safeParse(v).data ?? status) as UserStatus,
                );
                mutation.reset();
              }}
              ariaLabel={t("statusLabel")}
            />
          </Field>
        </CardContent>
      </Card>

      {/* Organization context — admin-managed, editable */}
      <Card>
        <CardHeader>
          <CardTitle>{t("orgContextSection")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <p className="text-xs text-muted-foreground">{t("orgContextNote")}</p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label={t("branchLabel")} htmlFor="member-branch">
              <Select
                id="member-branch"
                value={branchId}
                options={withNone(t("unassigned"), branches)}
                onValueChange={(v) => {
                  setBranchId(v ?? NONE);
                  mutation.reset();
                }}
                ariaLabel={t("branchLabel")}
              />
            </Field>
            <Field label={t("departmentLabel")} htmlFor="member-department">
              <Select
                id="member-department"
                value={departmentId}
                options={withNone(t("unassigned"), departments)}
                onValueChange={handleDepartmentChange}
                ariaLabel={t("departmentLabel")}
              />
            </Field>
            <Field label={t("teamLabel")} htmlFor="member-team">
              <Select
                id="member-team"
                value={teamId}
                options={withNone(t("unassigned"), teamsForDept)}
                onValueChange={(v) => {
                  setTeamId(v ?? NONE);
                  mutation.reset();
                }}
                disabled={departmentId === NONE}
                ariaLabel={t("teamLabel")}
              />
            </Field>
            <Field label={t("positionLabel")} htmlFor="member-position">
              <Input
                id="member-position"
                value={position}
                onChange={(e) => {
                  setPosition(e.target.value);
                  mutation.reset();
                }}
                placeholder={t("positionPlaceholder")}
              />
            </Field>
            <Field label={t("workFormatLabel")} htmlFor="member-work-format">
              <Select
                id="member-work-format"
                value={workFormat}
                options={workFormatOptions}
                onValueChange={(v) => {
                  setWorkFormat(v ?? NONE);
                  mutation.reset();
                }}
                ariaLabel={t("workFormatLabel")}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* Privacy guarantee: no link to submitted signals (Hard Rule #7). */}
      <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-accent/50 p-3 text-xs text-muted-foreground">
        <ShieldCheck
          className="mt-0.5 size-4 shrink-0 text-primary"
          strokeWidth={1.5}
        />
        {t("privacyNote")}
      </div>

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

export default function MemberDetailPage() {
  const params = useParams<{ id: string }>();
  const t = useTranslations("manage.memberDetail");

  const memberQuery = useQuery({
    queryKey: ["member", params.id],
    queryFn: () => provider.getMember(params.id),
    retry: false,
  });
  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: () => provider.getBranches(),
  });
  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: () => provider.getDepartments(),
  });
  const { data: teams } = useQuery({
    queryKey: ["teams"],
    queryFn: () => provider.getTeams(),
  });

  const ready =
    memberQuery.data && branches && departments && teams ? true : false;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link
        href="/members"
        className="inline-flex w-fit items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" strokeWidth={1.5} />
        {t("back")}
      </Link>

      {memberQuery.isError ? (
        <EmptyState>{t("notFound")}</EmptyState>
      ) : !ready ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      ) : (
        <EditForm
          member={memberQuery.data!}
          branches={branches!}
          departments={departments!}
          teams={teams!}
        />
      )}
    </div>
  );
}
