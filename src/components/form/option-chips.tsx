"use client";

import { Check, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ChipOption {
  value: string;
  label: string;
  icon?: LucideIcon;
}

/**
 * Multi-select chip group. Reused for signal types (icon grid), impact types,
 * and related areas (plain wrap). Selecting toggles membership; the whole group
 * is a checkbox group for assistive tech.
 */
export function OptionChips({
  options,
  value,
  onChange,
  layout = "wrap",
  invalid,
  ariaLabel,
}: {
  options: ChipOption[];
  value: string[];
  onChange: (next: string[]) => void;
  layout?: "wrap" | "grid";
  invalid?: boolean;
  ariaLabel?: string;
}) {
  function toggle(optionValue: string) {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "group/chips",
        layout === "grid"
          ? "grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
          : "flex flex-wrap gap-2",
        invalid && "rounded-lg ring-2 ring-destructive/20",
      )}
    >
      {options.map((option) => {
        const selected = value.includes(option.value);
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            role="checkbox"
            aria-checked={selected}
            onClick={() => toggle(option.value)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              layout === "grid" && "w-full",
              selected
                ? "border-primary bg-accent text-accent-foreground"
                : "border-border bg-background text-foreground hover:bg-muted",
            )}
          >
            {Icon && (
              <Icon
                className={cn(
                  "size-4 shrink-0",
                  selected ? "text-primary" : "text-muted-foreground",
                )}
                strokeWidth={1.5}
              />
            )}
            <span className="flex-1">{option.label}</span>
            {selected && (
              <Check
                className="size-4 shrink-0 text-primary"
                strokeWidth={2}
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
