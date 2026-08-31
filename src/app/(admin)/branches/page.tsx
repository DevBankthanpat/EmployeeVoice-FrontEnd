"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Check, Pencil, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { EmptyState, LoadError } from "@/components/dashboard/section";
import { AddInline } from "@/components/manage/add-inline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { provider } from "@/data/provider";
import type { Branch } from "@/data/schemas";

function BranchRow({ branch }: { branch: Branch }) {
  const t = useTranslations("manage.branches");
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(branch.name);

  const mutation = useMutation({
    mutationFn: (name: string) => provider.updateBranch(branch.id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      setEditing(false);
    },
  });

  function save() {
    const name = value.trim();
    if (!name || mutation.isPending) return;
    if (name === branch.name) {
      setEditing(false);
      return;
    }
    mutation.mutate(name);
  }

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <Building2
        className="size-4 shrink-0 text-muted-foreground"
        strokeWidth={1.5}
      />
      {editing ? (
        <>
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                save();
              }
              if (e.key === "Escape") {
                setValue(branch.name);
                setEditing(false);
              }
            }}
            className="h-8 flex-1"
            autoFocus
            aria-label={t("rename")}
          />
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={save}
            disabled={mutation.isPending || value.trim() === ""}
            aria-label={t("save")}
          >
            <Check className="size-4" strokeWidth={1.5} />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => {
              setValue(branch.name);
              setEditing(false);
            }}
            aria-label={t("cancel")}
          >
            <X className="size-4" strokeWidth={1.5} />
          </Button>
        </>
      ) : (
        <>
          <span className="flex-1 text-sm font-medium">{branch.name}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setValue(branch.name);
              setEditing(true);
            }}
          >
            <Pencil className="size-3.5" strokeWidth={1.5} />
            {t("rename")}
          </Button>
        </>
      )}
    </li>
  );
}

export default function BranchesPage() {
  const t = useTranslations("manage.branches");
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["branches"],
    queryFn: () => provider.getBranches(),
  });

  async function addBranch(name: string) {
    await provider.createBranch({ name });
    await queryClient.invalidateQueries({ queryKey: ["branches"] });
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground">
          {t("addLabel")}
        </label>
        <AddInline
          placeholder={t("addPlaceholder")}
          addLabel={t("add")}
          addingLabel={t("adding")}
          onAdd={addBranch}
        />
      </div>

      {isError ? (
        <LoadError onRetry={() => refetch()} />
      ) : isLoading || !data ? (
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState>{t("empty")}</EmptyState>
      ) : (
        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">
            {t("count", { count: data.length })}
          </span>
          <ul className="divide-y divide-border rounded-xl border border-border bg-card">
            {data.map((branch) => (
              <BranchRow key={branch.id} branch={branch} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
