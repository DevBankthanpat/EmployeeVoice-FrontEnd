"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { EmptyState, LoadError } from "@/components/dashboard/section";
import { AddInline } from "@/components/manage/add-inline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { provider } from "@/data/provider";
import type { Department, Team } from "@/data/schemas";

function DepartmentCard({
  department,
  teams,
  onAddTeam,
}: {
  department: Department;
  teams: Team[];
  onAddTeam: (departmentId: string, name: string) => Promise<void>;
}) {
  const t = useTranslations("manage.departments");

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <CardTitle>{department.name}</CardTitle>
        <span className="text-xs text-muted-foreground">
          {t("teamCount", { count: teams.length })}
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {t("teams")}
        </span>
        {teams.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noTeams")}</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {teams.map((team) => (
              <li
                key={team.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-sm"
              >
                <Users
                  className="size-3.5 text-muted-foreground"
                  strokeWidth={1.5}
                />
                {team.name}
              </li>
            ))}
          </ul>
        )}
        <AddInline
          placeholder={t("addTeamPlaceholder")}
          addLabel={t("addTeam")}
          addingLabel={t("adding")}
          size="sm"
          onAdd={(name) => onAddTeam(department.id, name)}
        />
      </CardContent>
    </Card>
  );
}

export default function DepartmentsPage() {
  const t = useTranslations("manage.departments");
  const queryClient = useQueryClient();

  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: () => provider.getDepartments(),
  });
  const teamsQuery = useQuery({
    queryKey: ["teams"],
    queryFn: () => provider.getTeams(),
  });

  const isLoading = departmentsQuery.isLoading || teamsQuery.isLoading;
  const isError = departmentsQuery.isError || teamsQuery.isError;

  async function addDepartment(name: string) {
    await provider.createDepartment({ name });
    await queryClient.invalidateQueries({ queryKey: ["departments"] });
  }

  async function addTeam(departmentId: string, name: string) {
    await provider.createTeam({ departmentId, name });
    await queryClient.invalidateQueries({ queryKey: ["teams"] });
  }

  const departments = departmentsQuery.data;
  const teams = teamsQuery.data ?? [];

  function refetch() {
    departmentsQuery.refetch();
    teamsQuery.refetch();
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground">
          {t("addDepartmentLabel")}
        </label>
        <AddInline
          placeholder={t("addDepartmentPlaceholder")}
          addLabel={t("addDepartment")}
          addingLabel={t("adding")}
          onAdd={addDepartment}
        />
      </div>

      {isError ? (
        <LoadError onRetry={refetch} />
      ) : isLoading || !departments ? (
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : departments.length === 0 ? (
        <EmptyState>{t("empty")}</EmptyState>
      ) : (
        <div className="flex flex-col gap-4">
          {departments.map((department) => (
            <DepartmentCard
              key={department.id}
              department={department}
              teams={teams.filter((tm) => tm.departmentId === department.id)}
              onAddTeam={addTeam}
            />
          ))}
        </div>
      )}
    </div>
  );
}
