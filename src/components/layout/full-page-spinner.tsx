import { Loader2 } from "lucide-react";

/** Full-viewport centered spinner, used while auth state resolves. */
export function FullPageSpinner() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <Loader2
        className="size-6 animate-spin text-muted-foreground"
        strokeWidth={1.5}
        aria-label="Loading"
      />
    </div>
  );
}
