import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Label + optional description + inline error wrapper. One consistent field
 * shell for the Submit form so every control gets the same spacing, required
 * marker, and error affordance (CLAUDE.md §Conventions: every screen needs
 * clear states).
 */
export function Field({
  label,
  htmlFor,
  required,
  hint,
  description,
  error,
  className,
  children,
}: {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  description?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <div className="flex items-baseline justify-between gap-2">
          <Label htmlFor={htmlFor}>
            {label}
            {required && (
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
            )}
          </Label>
          {hint && (
            <span className="text-xs font-normal text-muted-foreground">
              {hint}
            </span>
          )}
        </div>
      )}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {children}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
