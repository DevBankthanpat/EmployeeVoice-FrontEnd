"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Top progress stepper for the multi-section Submit form (design direction:
 * "Multi-step form = top stepper, one section per screen"). Completed steps are
 * clickable so the user can jump back to revise; upcoming steps are locked.
 */
export function Stepper({
  steps,
  current,
  onStepClick,
  className,
}: {
  steps: string[];
  current: number;
  onStepClick?: (index: number) => void;
  className?: string;
}) {
  const lastIndex = steps.length - 1;

  return (
    <nav aria-label="progress" className={className}>
      <ol className="flex items-center">
        {steps.map((label, index) => {
          const complete = index < current;
          const isCurrent = index === current;
          const clickable = index <= current && Boolean(onStepClick);
          return (
            <li
              key={label}
              className={cn("flex items-center", index < lastIndex && "flex-1")}
            >
              <button
                type="button"
                disabled={!clickable}
                aria-current={isCurrent ? "step" : undefined}
                onClick={clickable ? () => onStepClick?.(index) : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  clickable && "cursor-pointer",
                )}
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                    complete &&
                      "border-primary bg-primary text-primary-foreground",
                    isCurrent && "border-primary bg-accent text-primary",
                    !complete &&
                      !isCurrent &&
                      "border-border bg-background text-muted-foreground",
                  )}
                >
                  {complete ? (
                    <Check className="size-4" strokeWidth={2.5} />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={cn(
                    "hidden text-sm font-medium sm:inline",
                    isCurrent
                      ? "text-foreground"
                      : complete
                        ? "text-foreground"
                        : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </button>
              {index < lastIndex && (
                <span
                  className={cn(
                    "mx-2 h-px flex-1 sm:mx-3",
                    complete ? "bg-primary/40" : "bg-border",
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
