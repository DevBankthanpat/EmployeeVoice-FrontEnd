"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * A compact "type a name → Add" control shared by the Branches (D4a) and
 * Departments & Teams (D4b) screens. Owns its own input; clears it only after
 * the parent's async add resolves, so a failed create keeps the typed value.
 */
export function AddInline({
  placeholder,
  addLabel,
  addingLabel,
  onAdd,
  size = "default",
  className,
}: {
  placeholder: string;
  addLabel: string;
  addingLabel: string;
  onAdd: (name: string) => Promise<void>;
  size?: "default" | "sm";
  className?: string;
}) {
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const name = value.trim();
    if (!name || pending) return;
    setPending(true);
    try {
      await onAdd(name);
      setValue("");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className={cn("flex items-center gap-2", className)}
    >
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={cn("flex-1", size === "sm" && "h-8")}
        disabled={pending}
        aria-label={placeholder}
      />
      <Button
        type="submit"
        size={size === "sm" ? "sm" : "default"}
        disabled={pending || value.trim() === ""}
      >
        <Plus className="size-4" strokeWidth={1.5} />
        {pending ? addingLabel : addLabel}
      </Button>
    </form>
  );
}
