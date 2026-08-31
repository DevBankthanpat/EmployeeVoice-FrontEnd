"use client";

import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";

import {
  countActiveFilters,
  signalFilterOptions,
} from "@/components/dashboard/dashboard.logic";
import { EmptyState, LoadError } from "@/components/dashboard/section";
import { SignalFeedItem } from "@/components/dashboard/signal-feed-item";
import { Button } from "@/components/ui/button";
import { Select, type SelectOption } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { provider } from "@/data/provider";
import type {
  ImpactLevel,
  SignalFeedFilters,
  SignalType,
} from "@/data/schemas";
import { IMPACT_LEVELS, SIGNAL_TYPES } from "@/lib/taxonomy";

const ALL = "__all__";

/** Map a Select value (with the "all" sentinel) to a filter field value. */
function toField(value: string | null): string | undefined {
  return !value || value === ALL ? undefined : value;
}

function FilterField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string | null) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Select value={value} options={options} onValueChange={onChange} />
    </label>
  );
}

export default function SignalsPage() {
  const t = useTranslations("dashboard.signals");
  const tAnon = useTranslations("dashboard");
  const tType = useTranslations("enums.signalType");
  const tLevel = useTranslations("enums.impactLevel");
  const format = useFormatter();

  const [filters, setFilters] = useState<SignalFeedFilters>({});

  // Options come from the FULL feed so a filter never removes its own choices.
  const { data: allSignals } = useQuery({
    queryKey: ["dashboardSignals", "all"],
    queryFn: () => provider.getDashboardSignals(),
  });
  const options = signalFilterOptions(allSignals ?? []);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboardSignals", filters],
    queryFn: () => provider.getDashboardSignals(filters),
  });

  const activeCount = countActiveFilters(filters);

  const periodLabel = (period: string) =>
    format.dateTime(new Date(`${period}-01T00:00:00Z`), {
      month: "short",
      year: "numeric",
    });

  const allOpt: SelectOption = { value: ALL, label: t("all") };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        <p className="text-xs text-muted-foreground">
          {tAnon("anonymityNote")}
        </p>
      </div>

      {/* Filter bar (C3): department, signal type, impact level, period. */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FilterField
            label={t("department")}
            value={filters.departmentName ?? ALL}
            options={[
              allOpt,
              ...options.departments.map((d) => ({ value: d, label: d })),
            ]}
            onChange={(v) =>
              setFilters((f) => ({ ...f, departmentName: toField(v) }))
            }
          />
          <FilterField
            label={t("type")}
            value={filters.signalType ?? ALL}
            options={[
              allOpt,
              ...SIGNAL_TYPES.map((s) => ({ value: s, label: tType(s) })),
            ]}
            onChange={(v) =>
              setFilters((f) => ({
                ...f,
                signalType: toField(v) as SignalType | undefined,
              }))
            }
          />
          <FilterField
            label={t("impact")}
            value={filters.impactLevel ?? ALL}
            options={[
              allOpt,
              ...IMPACT_LEVELS.map((l) => ({ value: l, label: tLevel(l) })),
            ]}
            onChange={(v) =>
              setFilters((f) => ({
                ...f,
                impactLevel: toField(v) as ImpactLevel | undefined,
              }))
            }
          />
          <FilterField
            label={t("period")}
            value={filters.period ?? ALL}
            options={[
              allOpt,
              ...options.periods.map((p) => ({
                value: p,
                label: periodLabel(p),
              })),
            ]}
            onChange={(v) => setFilters((f) => ({ ...f, period: toField(v) }))}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            {t("resultCount", { count: data?.length ?? 0 })}
          </span>
          {activeCount > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setFilters({})}>
              <X className="size-3.5" strokeWidth={1.5} />
              {t("clear")}
            </Button>
          )}
        </div>
      </div>

      {isError ? (
        <LoadError onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : data && data.length === 0 ? (
        <EmptyState>{t("empty")}</EmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          {data?.map((signal) => (
            <SignalFeedItem key={signal.id} signal={signal} />
          ))}
        </div>
      )}
    </div>
  );
}
