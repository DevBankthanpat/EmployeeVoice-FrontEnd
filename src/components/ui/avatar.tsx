import { cn } from "@/lib/utils";

/** Simple initials avatar. Deterministic from the name — no image dependency. */
function Avatar({ name, className }: { name: string; className?: string }) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  return (
    <span
      data-slot="avatar"
      aria-hidden
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground",
        className,
      )}
    >
      {initials}
    </span>
  );
}

export { Avatar };
