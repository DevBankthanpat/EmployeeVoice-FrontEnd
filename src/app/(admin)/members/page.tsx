"use client";

import { useQuery } from "@tanstack/react-query";
import { Search, UserPlus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { EmptyState, LoadError } from "@/components/dashboard/section";
import { filterMembers } from "@/components/manage/members.logic";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { provider } from "@/data/provider";
import type { Member } from "@/data/schemas";
import { ROLE_BADGE, USER_STATUS_BADGE } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

function Th({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "px-3 py-2.5 text-left text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      {children}
    </th>
  );
}

function MemberRow({ member }: { member: Member }) {
  const t = useTranslations("manage.members");
  const tRole = useTranslations("roles");
  const tStatus = useTranslations("enums.userStatus");
  const router = useRouter();
  const href = `/members/${member.id}`;

  return (
    <tr
      className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-muted/50"
      onClick={() => router.push(href)}
    >
      <td className="px-3 py-3">
        <div className="flex items-center gap-3">
          <Avatar name={member.name} />
          {/* Real link so the row is keyboard-reachable and screen-reader friendly. */}
          <Link
            href={href}
            className="font-medium hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {member.name}
          </Link>
        </div>
      </td>
      <td className="px-3 py-3 text-sm text-muted-foreground">
        {member.email}
      </td>
      <td className="px-3 py-3">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
            ROLE_BADGE[member.role],
          )}
        >
          {tRole(member.role)}
        </span>
      </td>
      <td className="px-3 py-3 text-sm whitespace-nowrap text-muted-foreground">
        {member.departmentName ?? t("unassigned")}
      </td>
      <td className="px-3 py-3">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
            USER_STATUS_BADGE[member.status],
          )}
        >
          {tStatus(member.status)}
        </span>
      </td>
    </tr>
  );
}

export default function MembersPage() {
  const t = useTranslations("manage.members");
  const [query, setQuery] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["members"],
    queryFn: () => provider.getMembers(),
  });

  const filtered = data ? filterMembers(data, query) : [];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button render={<Link href="/members/invite" />}>
          <UserPlus className="size-4" strokeWidth={1.5} />
          {t("invite")}
        </Button>
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.5}
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="pl-9"
          aria-label={t("searchPlaceholder")}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label={t("clearSearch")}
            className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {isError ? (
        <LoadError onRetry={() => refetch()} />
      ) : isLoading || !data ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState>{t("empty")}</EmptyState>
      ) : filtered.length === 0 ? (
        <EmptyState>{t("noResults")}</EmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          <span className="text-sm text-muted-foreground">
            {t("count", { count: filtered.length })}
          </span>
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full min-w-[44rem] border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <Th>{t("colName")}</Th>
                  <Th>{t("colEmail")}</Th>
                  <Th>{t("colRole")}</Th>
                  <Th>{t("colDepartment")}</Th>
                  <Th>{t("colStatus")}</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((member) => (
                  <MemberRow key={member.id} member={member} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
