"use client";

import { cn } from "@/lib/utils";

export interface SegmentOption {
  value: string;
  label: string;
}

/**
 * Single-select segmented control. Used for impact level (Low/Medium/High/
 * Severe) — a compact, always-visible choice where a dropdown would be overkill.
 */
export function SegmentedControl({
  options,
  value,
  onChange,
  invalid,
  ariaLabel,
}: {
  options: SegmentOption[];
  value: string | null;
  onChange: (value: string) => void;
  invalid?: boolean;
  ariaLabel?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      aria-invalid={invalid || undefined}
      className={cn(
        "flex w-full gap-1 rounded-lg border border-input bg-background p-1",
        invalid && "border-destructive ring-3 ring-destructive/20",
      )}
    >
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              selected
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
